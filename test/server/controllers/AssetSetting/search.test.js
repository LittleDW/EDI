/* eslint-disable */
process.env.NODE_ENV = 'test';
const request = require('supertest');
const express = require('express');
const _ = require('lodash');
const envConfig = require('dotenv').config()
const routers = require('../../../../server/routers-new');
const {
  initializeOrgDeadlineFee,
  initializeOrgFee,
  initializeOrg,
  RAW_DATA,
} = require('./setupData');

const {
  ASSET_LIST,
  FUND_LIST,
  DEADLINE_LIST,
  MATCH_DATE,
  orgDeadlineFeeData,
  orgFeeData,
  orgData,
} = RAW_DATA;

const DlFeeComparisonColumn = [
  'fund_org_code',
  'asset_org_code',
  'deadline_id',
  'match_date',
  'asset_fee',
  'fund_fee',
  'max_fee',
  'min_fee',
  'finish_max_fee',
];

const OrgFeeComparisonColumn = [
  'fund_org_code',
  'asset_org_code',
  'match_date',
  'asset_fee',
  'fund_fee',
  'max_fee',
  'min_fee',
  'finish_max_fee',
];

const OrgComparisonColumn = [
  'fund_org_code',
  'asset_org_code',
  'priority',
  'is_check_stock',
  'stock_day_count',
];

const router = express.Router();
const app = express();
app.use(routers(router));

// Initialize Mock Data
beforeAll(async () => {
  await Promise.all([
    initializeOrgDeadlineFee(),
    initializeOrgFee(),
    initializeOrg(),
  ]);
});

describe('admin search', () => {
  let COOKIES;

  beforeAll(async () => {
    await request(app)
      .post('/login')
      .set('Accept', 'application/json')
      .send({ userAccount: 'admin', password: 'admin123' })
      .then((res) => {
        COOKIES = res.headers['set-cookie'].pop();
      });

    const req = request(app);
    req.cookies = COOKIES;
    await request(app)
      .post('/dictionary')
      .set('Accept', 'application/json')
      .set('Cookie', COOKIES)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
      });
  });

  test('admin search without params', () => {
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(ASSET_LIST.length * FUND_LIST.length);
        expect(deadlineList).toHaveLength(
          ASSET_LIST.length * FUND_LIST.length * DEADLINE_LIST.length,
        );

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
        );

        const orgResult = deepCompare(assetList, orgData, OrgComparisonColumn);

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('admin search with [match_date]', () => {
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: '',
        fundOrgCode: '',
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(ASSET_LIST.length * FUND_LIST.length);
        expect(deadlineList).toHaveLength(
          ASSET_LIST.length * FUND_LIST.length * DEADLINE_LIST.length,
        );

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
        );

        const orgResult = deepCompare(assetList, orgData, OrgComparisonColumn);

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('admin search with [asset_org_code, match_date]', () => {
    const asset_org_code = ASSET_LIST[0];
    const filterOption = { asset_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: asset_org_code,
        fundOrgCode: '',
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(FUND_LIST.length);
        expect(deadlineList).toHaveLength(
          FUND_LIST.length * DEADLINE_LIST.length,
        );
        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('admin search with [asset_org_code, fund_org_code, match_date]', () => {
    const asset_org_code = ASSET_LIST[0];
    const fund_org_code = FUND_LIST[0];
    const filterOption = { asset_org_code, fund_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: asset_org_code,
        fundOrgCode: fund_org_code,
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(1);
        expect(deadlineList).toHaveLength(DEADLINE_LIST.length);

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });
});

describe('asset search', () => {
  let COOKIES;

  beforeAll(async () => {
    await request(app)
      .post('/login')
      .set('Accept', 'application/json')
      .send({ userAccount: 'jg', password: 'jg123456' })
      .then((res) => {
        COOKIES = res.headers['set-cookie'].pop();
      });

    const req = request(app);
    req.cookies = COOKIES;
    await request(app)
      .post('/dictionary')
      .set('Accept', 'application/json')
      .set('Cookie', COOKIES)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
      });
  });

  test('asset search without params', () => {
    const asset_org_code = ASSET_LIST[0];
    const filterOption = { asset_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(FUND_LIST.length);
        expect(deadlineList).toHaveLength(
          FUND_LIST.length * DEADLINE_LIST.length,
        );

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('asset search with [match_date]', () => {
    const asset_org_code = ASSET_LIST[0];
    const filterOption = { asset_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: '',
        fundOrgCode: '',
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(FUND_LIST.length);
        expect(deadlineList).toHaveLength(
          FUND_LIST.length * DEADLINE_LIST.length,
        );

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('asset search with [wrong asset_org_code, match_date]', () => {
    const asset_org_code = ASSET_LIST[0];
    const filterOption = { asset_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: ASSET_LIST[1],
        fundOrgCode: '',
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(FUND_LIST.length);
        expect(deadlineList).toHaveLength(
          FUND_LIST.length * DEADLINE_LIST.length,
        );
        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });
  test('asset search with [right asset_org_code, match_date]', () => {
    const asset_org_code = ASSET_LIST[0];
    const filterOption = { asset_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: asset_org_code,
        fundOrgCode: '',
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(FUND_LIST.length);
        expect(deadlineList).toHaveLength(
          FUND_LIST.length * DEADLINE_LIST.length,
        );
        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('asset search with [asset_org_code, fund_org_code, match_date]', () => {
    const asset_org_code = ASSET_LIST[0];
    const fund_org_code = FUND_LIST[0];
    const filterOption = { asset_org_code, fund_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: asset_org_code,
        fundOrgCode: fund_org_code,
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(1);
        expect(deadlineList).toHaveLength(DEADLINE_LIST.length);

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });
});

describe('fund search', () => {
  let COOKIES;

  beforeAll(async () => {
    await request(app)
      .post('/login')
      .set('Accept', 'application/json')
      .send({ userAccount: 'jrd', password: 'jrd123456' })
      .then((res) => {
        COOKIES = res.headers['set-cookie'].pop();
      });

    const req = request(app);
    req.cookies = COOKIES;
    await request(app)
      .post('/dictionary')
      .set('Accept', 'application/json')
      .set('Cookie', COOKIES)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
      });
  });

  test('fund search without params', () => {
    const fund_org_code = FUND_LIST[0];
    const filterOption = { fund_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(ASSET_LIST.length);
        expect(deadlineList).toHaveLength(
          ASSET_LIST.length * DEADLINE_LIST.length,
        );

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('fund search with [match_date]', () => {
    const fund_org_code = FUND_LIST[0];
    const filterOption = { fund_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: '',
        fundOrgCode: '',
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(ASSET_LIST.length);
        expect(deadlineList).toHaveLength(
          ASSET_LIST.length * DEADLINE_LIST.length,
        );

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('fund search with [wrong fund_org_code, match_date]', () => {
    const fund_org_code = FUND_LIST[0];
    const filterOption = { fund_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: '',
        fundOrgCode: FUND_LIST[1],
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(ASSET_LIST.length);
        expect(deadlineList).toHaveLength(
          ASSET_LIST.length * DEADLINE_LIST.length,
        );
        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });
  test('fund search with [right fund_org_code, match_date]', () => {
    const fund_org_code = FUND_LIST[0];
    const filterOption = { fund_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: '',
        fundOrgCode: fund_org_code,
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(ASSET_LIST.length);
        expect(deadlineList).toHaveLength(
          ASSET_LIST.length * DEADLINE_LIST.length,
        );
        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });

  test('fund search with [asset_org_code, fund_org_code, match_date]', () => {
    const asset_org_code = ASSET_LIST[0];
    const fund_org_code = FUND_LIST[0];
    const filterOption = { asset_org_code, fund_org_code };
    return request(app)
      .post('/assetSetting/search')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .send({
        assetOrgCode: asset_org_code,
        fundOrgCode: fund_org_code,
        match_date: MATCH_DATE,
      })
      .then((res) => {
        const { assetList, deadlineList, success, enableCaptcha } = res.body;
        expect(success).toBeTruthy();
        expect(enableCaptcha).toBe(process.env.CAPTCHA === 'true');
        expect(assetList).not.toBeUndefined();
        expect(deadlineList).not.toBeUndefined();
        expect(assetList).toHaveLength(1);
        expect(deadlineList).toHaveLength(DEADLINE_LIST.length);

        const deadlineResult = deepCompare(
          deadlineList,
          orgDeadlineFeeData,
          DlFeeComparisonColumn,
          filterOption,
        );
        const orgFeeResult = deepCompare(
          assetList,
          orgFeeData,
          OrgFeeComparisonColumn,
          filterOption,
        );

        const orgResult = deepCompare(
          assetList,
          orgData,
          OrgComparisonColumn,
          filterOption,
        );

        expect(deadlineResult).toBeTruthy();
        expect(orgFeeResult).toBeTruthy();
        expect(orgResult).toBeTruthy();
      });
  });
});

function deepCompare(objList, standardList, columns, filterOption = {}) {
  const _objList = handleListForCompare(objList, columns, filterOption);
  const _standardList = handleListForCompare(
    standardList,
    columns,
    filterOption,
  );
  return _.isEqual(_objList, _standardList);
}

function handleListForCompare(list, columns, filterOption) {
  return _.sortBy(
    _.filter(list.map((item) => _.pick(item, columns)), filterOption),
    _.take(columns, 3),
  );
}
