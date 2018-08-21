/**
 * @author robin
 * @file index
 * @date 2018-04-13 16:19
 */
const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  search: searchService,
  detail: detailService,
  creditDetail: creditDetailService,
  matcher,
  create: createService,
  supplement: supplementService,
  authResultCreate: authResultCreateService,
  enterpriseCreditExport: enterpriseCreditExportService,
  voucher: voucherService,
  filterCorpAuthVoucher: filterCorpAuthVoucherService,
} = require('../../services').business.enterpriseCredit;
const commonService = require('../../services').business.businessCommon;
const {
  createTableExportingLog,
  parsingStream,
  pagingSpawningService,
} = require('../../services').business.common;
const smsAPI = require('../../services').common.sms;
const {
  getMySQLFieldValue,
  logger,
  removefileIfExist,
  promisify,
  userDiffer,
} = require('../../util');

const search = async (req, res, next) => {
  let { pageIndex, min_fee, max_fee } = req.body,
    myPageIndex = isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1),
    myMinFee = _.isEmpty(min_fee) ? undefined : Number(min_fee) * 100,
    myMaxFee = _.isEmpty(max_fee) ? undefined : Number(max_fee) * 100,
    params = getMySQLFieldValue({
      ...req.body,
      pageIndex: myPageIndex,
      min_fee: myMinFee,
      max_fee: myMaxFee,
      type: req.session.profile.user_type,
      [userDiffer(req.session.profile.user_type, [
        'admin_org_code',
        'fund_org_code',
        'asset_org_code',
      ])]: req.session.profile.org_code,
    });
  const result = await searchService(params, req);
  res.json({ success: true, ...result });
};

const detail = async (req, res, next) => {
  const params = getMySQLFieldValue({
    ...req.body,
    [userDiffer(req.session.profile.user_type, [
      'admin_org_code',
      'fund_org_code',
      'asset_org_code',
    ])]: req.session.profile.org_code,
  });
  const rows = await detailService(params, req);
  res.json({ success: true, rows });
};

const creditDetail = async (req, res, next) => {
  const params = getMySQLFieldValue({
    ...req.body,
    [userDiffer(req.session.profile.user_type, [
      'admin_org_code',
      'fund_org_code',
      'asset_org_code',
    ])]: req.session.profile.org_code,
  });
  const rows = await creditDetailService(params, req);
  res.json({ success: true, rows });
};

const match = async (req, res, next) => {
  const resultData = await matcher(
    path.resolve(`${__dirname}/../../spawn/corpCreditMatcher.js`),
    null,
    req.files,
  );
  res.json({ success: true, ...resultData });
};

const create = async (req, res, next) => {
  const [result] = await parsingStream(createService, req);
  res.json({ success: true, ...result });
};

const matchSupplement = async (req, res, next) => {
  const resultData = await matcher(
    path.resolve(`${__dirname}/../../spawn/supplementCorpCreditMatcher.js`),
    null,
    req.files,
  );
  res.json({ success: true, ...resultData });
};

const supplement = async (req, res, next) => {
  const [result] = await parsingStream(supplementService, req);
  res.json({ success: true, ...result });
};
const authResultMatch = async (req, res, next) => {
  let { mapper } = req.body,
    param = [req.session.profile.org_code];
  if (mapper) {
    param.push(mapper);
  }
  const resultData = await matcher(
    path.resolve(`${__dirname}/../../spawn/corpAuthAuthResultMatcher.js`),
    param,
    req.files,
  );
  res.json({ success: true, ...resultData });
};
const authResultCreate = async (req, res, next) => {
  const [result] = await parsingStream(authResultCreateService, req);
  res.json({ success: true, ...result });
};

const exportCtrl = async (req, res, next) => {
  const { fund_credit_status, asset_credit_status } = req.query;
  let params = getMySQLFieldValue({
      ...req.query,
      fund_credit_status: fund_credit_status && fund_credit_status.split(",")||null,
      asset_credit_status: asset_credit_status && asset_credit_status.split(",")||null,
      [userDiffer(req.session.profile.user_type, [
        'admin_org_code',
        'fund_org_code',
        'asset_org_code',
      ])]: req.session.profile.org_code,
    }),
    Download = promisify(res.download).bind(res),
    { xslx, total } = await enterpriseCreditExportService(params, req);
  try {
    await Download(xslx, '企业授信导出.xlsx');
    removefileIfExist(xslx);
  } catch (e) {
    if (res.headersSent) {
      logger.error(e.message);
    } else {
      res.status(404).send(e.message);
    }
    return;
  }
  const oper_log = `导出企业授信 ${total}条, 导出参数 ${JSON.stringify(params)}`;
  commonService.manualTableLog(req, {
    action_type: '导出',
    from_table: 't_enterprise_asset_credit',
    org_code: req.session.profile.org_code,
    user_id: req.session.profile.user_id,
    sub_user_id: req.session.profile.sub_user_id || "",
    oper_log
  });
};
const voucher = async (req, res, next) => {
  const params = getMySQLFieldValue({
    ...req.body,
    [userDiffer(req.session.profile.user_type, [
      'admin_org_code',
      'fund_org_code',
      'asset_org_code',
    ])]: req.session.profile.org_code,
  });
  const result = await voucherService(params, req);
  res.json({ success: true, rows:result });
};
const filterCorpAuthVoucher = async (req, res, next) => {
  let { pageIndex, fund_credit_status, asset_credit_status } = req.body,
    myPageIndex = isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    ...req.body,
    page_index: myPageIndex,
    [userDiffer(req.session.profile.user_type, [
      'admin_org_code',
      'fund_org_code',
      'asset_org_code',
    ])]: req.session.profile.org_code,
  });
  const rows = await filterCorpAuthVoucherService(params, req);
  const oper_log = `导出企业授信资料 ${rows.length}条, 导出参数 ${JSON.stringify(params)}`;
  commonService.manualTableLog(req, {
    action_type: '导出',
    from_table: 't_order_voucher',
    org_code: req.session.profile.org_code,
    user_id: req.session.profile.user_id,
    sub_user_id: req.session.profile.sub_user_id || "",
    oper_log
  });
  return res.json({ success: true, rows });
};

module.exports = {
  search,
  detail,
  creditDetail,
  match,
  create,
  matchSupplement,
  supplement,
  authResultMatch,
  authResultCreate,
  exportCtrl,
  voucher,
  filterCorpAuthVoucher,
};
