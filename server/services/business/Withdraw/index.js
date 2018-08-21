/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-30 09-59
 * @Last Modified: 2018-05-30 09-59
 * @Modified By: Osborn
 */
const _ = require('lodash');
const path = require('path');

const { Op } = require('sequelize');
const Dao = require('./withdrawDao');
const {
  bridgeService,
  service: { spawningService, pagingSpawningService },
} = require('../Common');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const { AccessControl } = require('../../../common/accessControl');

const search = async (params, req) => {
  const dao = Dao(req);
  params.asset_org_code = AccessControl.accessControlParamsFilter(
    req,
    'asset_org_code',
    params.asset_org_code,
  );
  params.fund_org_code = AccessControl.accessControlParamsFilter(
    req,
    'fund_org_code',
    params.fund_org_code,
  );
  const [countRows, rows] = await Promise.all([
    dao.count(params),
    dao.query(params),
  ]);
  // const flattenRows = rows.map((r) => (_.clone({
  //   ..._.at(r, 'dataValues')[0],
  //   ..._.at(r, 'dataValues.t_order.dataValues')[0],
  //   ..._.at(r, 'dataValues.t_order.dataValues.t_fund_api.dataValues')[0],
  //   ..._.at(r, 'dataValues.t_order_payment.dataValues')[0],
  // })));
  if (!countRows || !countRows[0]) {
    throw new Error('无记录');
  }
  return {
    rows,
    total: countRows[0].total || 0,
    fee: countRows[0].fee || 0,
  };
};

const orderExport = async (params, req) => {
  const dao = Dao(req);
  let countRows = await dao.count(params);
  if (!countRows || !countRows[0]) {
    throw new Error('无记录');
  }
  let total = countRows[0].total,
    pages = Math.ceil(total / configure.exportLimit);
  if (total > configure.exportMaxRows) {
    throw new Error(`导出量已超过上线 ${configure.exportMaxRows} 条`);
  }
  const { subUserDataRestriction } = req.session;
  let assetDataRestriction =
    (subUserDataRestriction && subUserDataRestriction.assetDataRestriction) ||
    null;
  let fundDataRestriction =
    (subUserDataRestriction && subUserDataRestriction.fundDataRestriction) ||
    null;

  let {
    asset_order_no,
    order_no,
    borrow_start_date,
    borrow_end_date,
    payment_start_date,
    payment_end_date,
    withdraw_status,
    fund_org_code,
    asset_org_code,
    borrow_certificate_no,
  } = params;
  let xslx = await pagingSpawningService(
    path.resolve(`${__dirname}/../../../spawn/withdrawOrderExport.js`),
    [
      req.session.profile.user_type,
      asset_order_no,
      order_no,
      borrow_start_date,
      borrow_end_date,
      payment_start_date,
      payment_end_date,
      fund_org_code,
      asset_org_code,
      borrow_certificate_no,
      Array.isArray(withdraw_status) ? withdraw_status.join(',') : '',
      Array.isArray(assetDataRestriction) ? assetDataRestriction.join(',') : '',
      Array.isArray(fundDataRestriction) ? fundDataRestriction.join(',') : '',
    ],
    pages,
  );
  return { xslx, total };
};

module.exports = {
  search,
  orderExport,
};
