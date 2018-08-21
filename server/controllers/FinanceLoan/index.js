/**
 * @author robin
 * @file index
 * @date 2018-04-24 12:41
 */
const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  search: searchService,
  matcher,
  createHistoricalDetail:createHistoricalDetailService,
  createNewDetail:createNewDetailService,
  changeStatus:changeStatusService
} = require('../../services').business.financeLoan;
const {createTableExportingLog, parsingStream, pagingSpawningService} = require('../../services').business.common;
const {getMySQLFieldValue, logger, removefileIfExist, promisify, userDiffer} = require('../../util');


const search = async (req, res, next) => {
  let {pageIndex,accountStartDate, accountEndDate} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex,
      account_date_start: accountStartDate && (accountStartDate + " 00:00:00") || '',
      account_date_end: accountEndDate && (accountEndDate + " 23:59:59") || '',
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code})
  let result = await searchService(params, req)
  res.json({success: true, ...result})
};

const matchDetail = async (req, res, next) => {
  let param = [req.session.profile.org_code], {mapper} = req.body
  if (mapper) {param.push(mapper)}
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/financeLoanMatcher.js`), param, req.files)
  res.json({success: true,...resultData})
};

const createHistoricalDetail = async (req, res, next) => {
  let [result] = await parsingStream(createHistoricalDetailService, req)
  res.json({success: true, ...result})
};

const createNewDetail = async (req, res, next) => {
  let [result] = await parsingStream(createNewDetailService, req)
  res.json({success: true, ...result})
};
const changeStatus = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await changeStatusService(params, req)
  res.json({success: true, ...result})
};

module.exports = {
  search,
  matchDetail,
  createHistoricalDetail,
  createNewDetail,
  changeStatus
};
