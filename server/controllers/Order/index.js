/**
 * @author robin
 * @file index
 * @date 2018-04-02 16:14
 */

const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  search: searchService,
  filterOrderVoucher:filterOrderVoucherService,
  orderRepayment:orderRepaymentService,
  orderVoucher:orderVoucherService,
  orderContract:orderContractService,
  orderPayment:orderPaymentService,
  orderAdvance:orderAdvanceService,
  orderAccount:orderAccountService,
  orderService:orderServiceService,
  create:createService,
  matcher,
  orderExportService,
  checkResultCreate: checkResultCreateService,
  accountDetailCreate:accountDetailCreateService,
  orderCredit:orderCreditService,
  supplement:supplementService,
  contractSupplymentCreate:contractSupplymentCreateService,
} = require('../../services').business.order;
const commonService = require('../../services').business.businessCommon;
const {createTableExportingLog, parsingStream, pagingSpawningService} = require('../../services').business.common;
const smsAPI = require('../../services').common.sms;
const {getMySQLFieldValue, logger, removefileIfExist, promisify, userDiffer} = require('../../util');


const search = async (req, res, next) => {
  let {pageIndex} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({
      ...req.body, pageIndex: myPageIndex,
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code})
  let result = await searchService(params, req)
  res.json({success: true, ...result})
};
const filterOrderVoucher = async (req, res, next) => {
  let {pageIndex} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({
      ...req.body, pageIndex: myPageIndex,
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code})
  let rows = await filterOrderVoucherService(params, req);
  // log
  const oper_log = `导出个人订单资料 ${rows.length}条, 导出参数 ${JSON.stringify(params)}`;
  commonService.manualTableLog(req, {
    action_type: '导出',
    from_table: 't_order_voucher',
    org_code: req.session.profile.org_code,
    user_id: req.session.profile.user_id,
    sub_user_id: req.session.profile.sub_user_id || "",
    oper_log
  });
  return res.json({success: true, rows})
};
const orderRepayment = async (req, res, next) => {
  let rows = await orderRepaymentService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows, total:0})
};
const orderVoucher = async (req, res, next) => {
  let rows = await orderVoucherService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows})
};
const orderContract = async (req, res, next) => {
  let rows = await orderContractService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows})
};
const orderPayment = async (req, res, next) => {
  let rows = await orderPaymentService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows, total:0})
};
const orderAdvance = async (req, res, next) => {
  let rows = await orderAdvanceService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows, total:0})
};
const orderAccount = async (req, res, next) => {
  let rows = await orderAccountService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows, total:0})
};
const orderCredit = async (req, res, next) => {
  let rows = await orderCreditService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows, total:0})
};
const orderService = async (req, res, next) => {
  let rows = await orderServiceService(getMySQLFieldValue(req.body), req)
  res.json({success: true, rows})
};
const match = async (req, res, next) => {
  // TODO 石奇峰：采用IO而不是IPC以降低大数据下阻塞应用的可能
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/assetOrderMatcher.js`), null, req.files)
  res.json({success: true,...resultData})
};
const create = async (req, res, next) => {
  let [result] = await parsingStream(createService, req)
  res.json({success: true, ...result})
};
const matchSupplement = async (req, res, next) => {
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/supplementAssetOrderMatcher.js`), null, req.files)
  res.json({success: true,...resultData})
};
const matchSupplementFundContract = async (req, res, next) => {
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/supplementFundContractMatcher.js`), null, req.files)
  res.json({success: true,...resultData})
};
const supplement = async (req, res, next) => {
  let [result] = await parsingStream(supplementService, req)
  res.json({success: true, ...result})
};
const exportCtrl = async (req, res, next) => {
  let params = getMySQLFieldValue({...req.query, orderStatus: req.query.orderStatus && req.query.orderStatus.split(",")||null,
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}),
    Download = promisify(res.download).bind(res), {xslx, total} = await orderExportService(params, req)
  try{
    await Download(xslx, '个人订单导出.xlsx');
    removefileIfExist(xslx);
  }catch(e){
    if (res.headersSent) {
      logger.error(e.message)
    } else {
      res.status(404).send(e.message);
    }
    return
  }

  const oper_log = `导出个人订单 ${total}条, 导出参数 ${JSON.stringify(params)}`;
  commonService.manualTableLog(req, {
    action_type: '导出',
    from_table: 't_order',
    org_code: req.session.profile.org_code,
    user_id: req.session.profile.user_id,
    sub_user_id: req.session.profile.sub_user_id || "",
    oper_log
  });
};
const checkResultMatch = async (req, res, next) => {
  let {mapper} = req.body,param = [req.session.profile.org_code];
  if(mapper){
    param.push(mapper)
  }
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/orderCheckResultMatcher.js`), param, req.files);
  if (Array.isArray(resultData.unmatched) && resultData.unmatched.length > 0 ) {
    res.json(resultData)
  } else {
    res.json({hiddleResult: true, ...resultData})
  }
  //res.json({success: true,...resultData})
};
const checkResultCreate = async (req, res, next) => {
  let [result] = await parsingStream(checkResultCreateService, req)
  res.json({success: true, ...result})
};
const accountDetailMatch = async (req, res, next) => {
  let {mapper} = req.body,param = [req.session.profile.org_code];
  if(mapper){
    param.push(mapper)
  }
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/orderAccountDetailMatcher.js`), param, req.files);
  if (Array.isArray(resultData.unmatched) && resultData.unmatched.length > 0 ) {
    res.json(resultData)
  } else {
    res.json({hiddleResult: true, ...resultData})
  }
  //res.json({success: true,...resultData})
};
const contractSupplymentMatch = async (req, res, next) => {
  let {mapper} = req.body,param = [req.session.profile.org_code];
  if(mapper){
    param.push(mapper)
  }
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/orderContractSupplymentMatcher.js`), param, req.files);
  if (Array.isArray(resultData.unmatched) && resultData.unmatched.length > 0 ) {
    res.json(resultData)
  } else {
    res.json({hiddleResult: true, ...resultData})
  }
  //res.json({success: true,...resultData})
};
const accountDetailCreate = async (req, res, next) => {
  let [result] = await parsingStream(accountDetailCreateService, req)
  res.json({success: true, ...result})
};
const contractSupplymentCreate = async (req, res, next) => {
  let [result] = await parsingStream(contractSupplymentCreateService, req)
  res.json({success: true, ...result})
};

module.exports = {
  search,
  filterOrderVoucher,
  orderRepayment,
  orderVoucher,
  orderContract,
  orderPayment,
  orderAdvance,
  orderAccount,
  orderCredit,
  orderService,
  create,
  match,
  matchSupplement,
  matchSupplementFundContract,
  supplement,
  exportCtrl,
  checkResultMatch,
  checkResultCreate,
  accountDetailMatch,
  contractSupplymentMatch,
  accountDetailCreate,
  contractSupplymentCreate,
};
