/* eslint-disable */
process.env.NODE_ENV = 'test';
const request = require('supertest');
const express = require('express');
const _ = require('lodash');
const envConfig = require('dotenv').config();
const routers = require('../../../../server/routers-new');
const moment = require('moment')
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
  orgDeadlineFeeDao,
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

describe('admin captcha', () => {
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

  test('admin captcha without params', () => {
    return request(app)
      .post('/assetSetting/captcha')
      .set('Cookie', COOKIES)
      .set('Accept', 'application/json')
      .then((res) => {
        const { success, message } = res.body;
        expect(success).not.toBeTruthy();
        expect(message).not.toBeUndefined();
      });
  });
  test('admin captcha with all params', async () => {
    const now = moment()
    // 清空该条数据已有的验证码信息
    await orgDeadlineFeeDao.nativeUpdate({
      verification_code: null,
      verification_valid_time: null
    }, {
      where: {
        asset_org_code: ASSET_LIST[0],
        fund_org_code: FUND_LIST[0],
        match_date: MATCH_DATE,
        deadline_id: DEADLINE_LIST[0],
      },
    }, true);
    const res = await request(app)
      .post('/assetSetting/captcha')
      .set('Cookie', COOKIES)
      .send({
        asset_org_code: ASSET_LIST[0],
        fund_org_code: FUND_LIST[0],
        deadline_id: DEADLINE_LIST[0],
        deadline_name: '0-15天(含)',
        match_date: MATCH_DATE,
      })
      .set('Accept', 'application/json');
    const { success } = res.body;
    const result = await orgDeadlineFeeDao.nativeQuerySingle({
      where: {
        asset_org_code: ASSET_LIST[0],
        fund_org_code: FUND_LIST[0],
        match_date: MATCH_DATE,
        deadline_id: DEADLINE_LIST[0],
      },
    });
    expect(success).toBeTruthy();
    expect(result).not.toBeUndefined();
    expect(result.verification_valid_time).not.toBeUndefined();
    expect(result.verification_code).toMatch(/^\d{6}$/);
    expect(now.isAfter(result.verification_valid_time)).toBeTruthy()
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
