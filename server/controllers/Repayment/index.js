/**
 * @author robin
 * @file index
 * @date 2018-04-26 09:42
 */
const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  search: searchService,
  repaymentExport:repaymentExportService,
  update:updateService
} = require('../../services').business.repayment;
const commonService = require('../../services').business.businessCommon;
const {createTableExportingLog, parsingStream, pagingSpawningService} = require('../../services').business.common;
const {getMySQLFieldValue, logger, removefileIfExist, promisify, userDiffer} = require('../../util');


const search = async (req, res, next) => {
  let {pageIndex} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex,
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code})
  let result = await searchService(params, req)
  res.json({success: true, ...result})
};
const exportCtrl = async (req, res, next) => {
  let params = getMySQLFieldValue({...req.query, repaymentStatus: req.query.repaymentStatus && req.query.repaymentStatus.split(",") || null,
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}),
    Download = promisify(res.download).bind(res), {xslx, total} = await repaymentExportService(params, req)
  try{
    await Download(xslx, '兑付单导出.xlsx');
    removefileIfExist(xslx);
  }catch(e){
    if (res.headersSent) {
      logger.error(e.message)
    } else {
      res.status(404).send(e.message);
    }
    return
  }

  const oper_log = `动作：导出兑付单 ${total}条, 导出参数 ${JSON.stringify(params)}`;
  commonService.manualTableLog(req, {
    action_type: '导出',
    from_table: 't_repayment',
    org_code: req.session.profile.org_code,
    user_id: req.session.profile.user_id,
    sub_user_id: req.session.profile.sub_user_id || "",
    oper_log
  });
};
const update = async (req, res, next) => {
  let data = await updateService(getMySQLFieldValue(req.body), req)
  res.json({success: true, data, total:0})
};
module.exports = {
  search,
  exportCtrl,
  update
};
