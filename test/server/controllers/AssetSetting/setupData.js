const { DataMaintain, sequelizeDB } = require('../dataMaintain');
const faker = require('faker');

const orgDeadlineFeeDao = new DataMaintain('t_asset_fund_deadline_fee');
const orgFeeDao = new DataMaintain('t_asset_fund_fee');
const orgDao = new DataMaintain('t_asset_fund');

const ASSET_LIST = ['A1501001', 'A1501002'];
const FUND_LIST = ['F1502001', 'F1502002'];
const DEADLINE_LIST = ['000', '001', '002', '003', '004', '005', '006', '007'];
const MATCH_DATE = '2018-06-13';
const MIN_FEE = 5000;
const MAX_FEE = 10000000;

const { orgDeadlineFeeData, orgFeeData, orgData } = generateTestData();

const RAW_DATA = {
  ASSET_LIST,
  FUND_LIST,
  DEADLINE_LIST,
  MATCH_DATE,
  orgDeadlineFeeData,
  orgFeeData,
  orgData,
  orgDeadlineFeeDao,
  orgFeeDao,
  orgDao,
};

async function initializeOrg() {
  const transaction = await sequelizeDB.transaction();
  try {
    await orgDao.nativeDelete({
      transaction,
    });

    const qList = [];
    orgData.forEach((row) => {
      qList.push(
        orgDao.nativeCreate(row, {
          transaction,
        }),
      );
    });
    await Promise.all(qList);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function initializeOrgFee() {
  const transaction = await sequelizeDB.transaction();
  try {
    await orgFeeDao.nativeDelete({
      transaction,
    });

    const qList = [];
    orgFeeData.forEach((row) => {
      qList.push(
        orgFeeDao.nativeCreate(row, {
          transaction,
        }),
      );
    });
    await Promise.all(qList);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function initializeOrgDeadlineFee() {
  const transaction = await sequelizeDB.transaction();
  try {
    await orgDeadlineFeeDao.nativeDelete({
      transaction,
    });

    const qList = [];
    orgDeadlineFeeData.forEach((row) => {
      qList.push(
        orgDeadlineFeeDao.nativeCreate(row, {
          transaction,
        }),
      );
    });
    await Promise.all(qList);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

function generateTestData() {
  const orgDeadlineFeeData = [];
  const orgFeeData = [];
  const orgData = [];
  FUND_LIST.forEach((fund_org_code) => {
    ASSET_LIST.forEach((asset_org_code) => {
      let sumAsset = 0;
      let sumFund = 0;
      let sumMax = 0;
      let sumMin = 0;
      let sumFinish = 0;
      DEADLINE_LIST.forEach((deadline_id) => {
        const asset_fee = mockNum(MIN_FEE, MAX_FEE, 100);
        const fund_fee = mockNum(MIN_FEE, MAX_FEE, 100);
        const max_fee = Math.min(asset_fee, fund_fee);
        const min_fee = max_fee / 2;
        const finish_max_fee = mockNum(MIN_FEE, max_fee);

        sumAsset += asset_fee;
        sumFund += fund_fee;
        sumMax += max_fee;
        sumMin += min_fee;
        sumFinish += finish_max_fee;
        const obj = {
          fund_org_code,
          asset_org_code,
          deadline_id,
          match_date: MATCH_DATE,
          asset_fee,
          fund_fee,
          max_fee,
          min_fee,
          finish_max_fee,
          asset_data_from: 'B',
          fund_data_from: 'B',
        };
        orgDeadlineFeeData.push(obj);
      });
      orgData.push({
        fund_org_code,
        asset_org_code,
        priority: mockNum(0, 100),
        is_check_stock: mockNum(0, 1),
        stock_day_count: mockNum(1, 12),
        fund_stock_fee: mockNum(MIN_FEE, MAX_FEE, 100),
        fund_day_raise_fee: 0,
        total_rate: 0,
        use_yn: 1,
      });
      orgFeeData.push({
        fund_org_code,
        asset_org_code,
        match_date: MATCH_DATE,
        asset_fee: sumAsset,
        fund_fee: sumFund,
        max_fee: sumMax,
        min_fee: sumMin,
        finish_max_fee: sumFinish,
        asset_data_from: 'B',
        fund_data_from: 'B',
      });
    });
  });

  return { orgDeadlineFeeData, orgFeeData, orgData };
}

function mockNum(min = 0, max = 1000000, precision = 1) {
  return faker.random.number({
    min,
    max,
    precision,
  });
}

module.exports = {
  initializeOrgDeadlineFee,
  initializeOrgFee,
  initializeOrg,
  RAW_DATA,
};
