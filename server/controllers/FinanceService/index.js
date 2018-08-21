/**
 * @author robin
 * @file index
 * @date 2018-04-25 16:33
 */
const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  search: searchService,
  matcher,
  createHistoricalDetail:createHistoricalDetailService,
  createNewDetail:createNewDetailService,
  changeStatus:changeStatusService,
  changeStatusUpload:changeStatusUploadService
} = require('../../services').business.financeService;
const {createTableExportingLog, parsingStream, pagingSpawningService} = require('../../services').business.common;
const {getMySQLFieldValue, logger, removefileIfExist, promisify, userDiffer} = require('../../util');


const search = async (req, res, next) => {
  let {pageIndex,repaymentStartDate, repaymentEndDate} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex,
      repayment_date_start: repaymentStartDate && (repaymentStartDate + " 00:00:00") || '',
      repayment_date_end: repaymentEndDate && (repaymentEndDate + " 23:59:59") || '',
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code})
  let result = await searchService(params, req)
  res.json({success: true, ...result})
};

const matchDetail = async (req, res, next) => {
  let param = [req.session.profile.org_code], {mapper} = req.body
  if (mapper) {param.push(mapper)}
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/financeServiceSettlementMatcher.js`), param, req.files)
  res.json({success: true,...resultData})
};

const createNewDetail = async (req, res, next) => {
  let [result] = await parsingStream(createNewDetailService, req)
  res.json({success: true, ...result})
};
const changeStatus = async (req, res, next) => {
  let result
  if (req.headers["content-type"] === 'application/json') {
    let params = getMySQLFieldValue(req.body)
    result = await changeStatusService(params, req)
  } else {
    [result] = await parsingStream(changeStatusUploadService, req)
  }
  res.json({success: true, ...result})
};

module.exports = {
  search,
  matchDetail,
  createNewDetail,
  changeStatus
};
