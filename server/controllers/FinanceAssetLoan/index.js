/**
 * @author robin
 * @file index
 * @date 2018-07-02 16:50
 */
const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  search: searchService,
  matcher,
  createNewDetail:createNewDetailService,
  changeStatus:changeStatusService
} = require('../../services').business.financeAssetLoan;
const {createTableExportingLog, parsingStream, pagingSpawningService} = require('../../services').business.common;
const {getMySQLFieldValue, logger, removefileIfExist, promisify, userDiffer} = require('../../util');


const search = async (req, res, next) => {
  let {pageIndex,loanStartDate, loanEndDate} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex,
      loan_date_start: loanStartDate && (loanStartDate + " 00:00:00") || '',
      loan_date_end: loanEndDate && (loanEndDate + " 23:59:59") || '',
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code})
  let result = await searchService(params, req)
  res.json({success: true, ...result})
};

const matchDetail = async (req, res, next) => {
  let param = [req.session.profile.org_code], {mapper} = req.body
  if (mapper) {param.push(mapper)}
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/financeAssetLoanMatcher.js`), param, req.files)
  res.json({success: true,...resultData})
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
  createNewDetail,
  changeStatus
};
