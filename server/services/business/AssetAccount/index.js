/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-26 15-13
 */

const _ = require('lodash');
const Dao = require('./assetAccountDao');
const { AccessControl } = require('../../../common/accessControl');

const search = async (req, params = {}) => {
  const dao = Dao(req);
  const fund_org_code = AccessControl.accessControlParamsFilter(
    req,
    'fund_org_code',
    params.fund_org_code,
  );
  const asset_org_code = AccessControl.accessControlParamsFilter(
    req,
    'asset_org_code',
    params.asset_org_code,
  );
  const [assetRows, fundRows, allRows] = await Promise.all([
    dao.assetAccountQuery(params),
    dao.fundAccountQuery(params),
    dao.assetFundAccountQuery({ fund_org_code, asset_org_code }),
  ]);
  return {
    assetRows,
    fundRows,
    allRows,
  };
};

const assetUpdate = async (req, params) => {
  const dao = Dao(req);
  const accountInstance = await dao.assetAccountCheck(params);
  if (_.isEmpty(accountInstance)) {
    throw new Error('查无此字段');
  }

  const updatedAccountInstance = await accountInstance.update(params);
  return updatedAccountInstance.dataValues;
};
const fundUpdate = async (req, params) => {
  const dao = Dao(req);
  const accountInstance = await dao.fundAccountCheck(params);
  if (_.isEmpty(accountInstance)) {
    throw new Error('查无此字段');
  }
  const updatedAccountInstance = await accountInstance.update(params);
  // if(_.isEmpty(updatedAccountInstance.get())){
  //   throw new Error('已更新但查无记录');
  // }
  return updatedAccountInstance.dataValues;
};

module.exports = {
  search,
  assetUpdate,
  fundUpdate,
};
