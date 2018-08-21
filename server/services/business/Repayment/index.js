/**
 * @author robin
 * @file index
 * @date 2018-04-26 09:53
 */
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const {bridgeService, service:{spawningService, pagingSpawningService}} = require('../Common');
const { sequelizeDB } = require('../../../schema');
const Dao = require('./repaymentDao');
const CommonDao = require('../Common/commonDao');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const ropAPI = require('../../../ropAPI');
const {promisifyInterval, promisifyPipingTempFile, thunkifyEvent, logger, userDiffer, getMySQLFieldValue} = require('../../../util');

const search = async (params, req) => {
  const dao = Dao(req)
  let {rows, count:total} = await dao.pagingQuery(params)
  return {rows, total}
};

const repaymentExport = async (params, req)=>{
  const dao = Dao(req);
  let total = await dao.count(params)
  if (!total) {
    throw new Error("无记录")
  }
  let pages = Math.ceil(total / configure.exportLimit);
  if (total > configure.exportMaxRows) {
    throw new Error(`导出量已超过上线 ${configure.exportMaxRows} 条`)
  }
  let { fund_org_code, asset_org_code,repayment_date_start,repayment_date_end,repayment_status} = params
  let xslx = await pagingSpawningService(
    path.resolve(`${__dirname}/../../../spawn/repaymentAssist.js`),
    [
      req.session.profile.user_type,
      (req.session.profile.user_type == 2) ? req.session.profile.org_code : fund_org_code,
      (req.session.profile.user_type == 1) ? req.session.profile.org_code : asset_org_code,
      repayment_date_start, repayment_date_end, Array.isArray(repayment_status)?repayment_status.join(","):''
    ],
    pages
  )
  return {xslx, total}
}

const update = async (body, req) => {
  const dao = Dao(req)
  let params = {...getMySQLFieldValue(req.body),[userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}
  let rows = await dao.query(params)
  if (!rows || rows.length === 0) {
    throw new Error('没查到要操作的兑付单记录')
  }

  let [affectedCount] =  await dao.update(params)

  if (!affectedCount) {
    throw new Error('未成功更新该兑付单状态')
  }
  let [data] = await dao.query(params)
  return data
};

module.exports = bridgeService({
  search,
  repaymentExport,
  update,

}, Dao);

