/**
 * @author robin
 * @file index
 * @date 2018-04-26 16:36
 */
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const commonService = require('../../services').business.businessCommon;

const {
  search: searchService,
  matcher,
  create: createService,
  searchAll: searchAllService
} = require('../../services').business.personalPublicity;
const {createTableExportingLog, parsingStream, pagingSpawningService} = require('../../services').business.common;
const {getMySQLFieldValue, logger, removefileIfExist, hasDuplicate, userDiffer} = require('../../util');


const search = async (req, res, next) => {
  let {pageIndex, orgCode} = req.body, profile = req.session.profile,
    myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1)
  switch (profile.user_type) {
    case 1:
      orgCode = profile.org_code
      break;
    case 2:
      orgCode = profile.org_code
      break;
    case 3:
      break;
    default:
      throw new Error('只允许资产方、资金方和资产管理员查询数据')
  }
  let params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex, orgCode})

  let result = await searchService(params, req)
  res.json({success: true, ...result})
};

const match = async (req, res, next) => {
  let resultData = await matcher(path.resolve(`${__dirname}/../../spawn/personalPublicityMatcher.js`),
    [JSON.stringify({[userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code})], req.files)
  res.json({success: true, ...resultData})
};

const create = async (req, res, next) => {
  let {task_name, data} = req.body, param = {task_name, org_code: req.session.profile.org_code},
    userDif = {[userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code}

  if (!Array.isArray(data) || !data.length) {
    throw new Error("无数据")
  } else {
    let asset_order_nos = data.filter(r => r.asset_order_no).map(r => r.asset_order_no),
      borrow_certificate_nos = data.filter(r => r.borrow_certificate_no).map(r => r.borrow_certificate_no),
      order_no = data.filter(r => r.order_no).map(r => r.order_no)
    if (hasDuplicate(asset_order_nos) || hasDuplicate(borrow_certificate_nos) || hasDuplicate(order_no)) {
      throw new Error("数据有重复")
    }
  }
  let result = await createService({data, param, userDif}, req)
  res.json({success: true, ...result})
};

const exportCtrl = async (req, res, next) => {
  let {orgCode} = req.body, {profile} = req.session
  switch (profile.user_type) {
    case 1:
      orgCode = profile.org_code
      break;
    case 2:
      orgCode = profile.org_code
      break;
    case 3:
      break;
    default:
      throw new Error('只允许资产方、资金方和资产管理员查询数据')
  }
  let params = getMySQLFieldValue({...req.body, orgCode})

  let result = await searchAllService(params, req)
  // log
  const oper_log = `动作：导出个人征信数据 ${result.rows.length}条, 导出参数 ${JSON.stringify(params)}`;
  await commonService.manualTableLog(req, {
    action_type: '导出',
    from_table: 't_task_person_pi_craw',
    org_code: params.org_code,
    user_id: profile.user_id,
    sub_user_id: profile.sub_user_id || "",
    oper_log
  });
  res.json({success: true, ...result})
};

module.exports = {
  search,
  match,
  create,
  exportCtrl
};
