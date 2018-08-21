/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-30 09-56
 * @Last Modified: 2018-05-30 09-56
 * @Modified By: Osborn
 */

const _ = require('lodash');
const moment = require('moment');

const withDrawService = require('../../services').business.withdraw;
const commonService = require('../../services').business.businessCommon;
const {
  getMySQLFieldValue,
  logger,
  removefileIfExist,
  promisify,
  userDiffer,
} = require('../../util');

const search = async (req, res, next) => {
  const { pageIndex } = req.body;
  const myPageIndex =
    _.isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    ...req.body,
    pageIndex: myPageIndex,
    [userDiffer(req.session.profile.user_type, [
      'admin_org_code',
      'fund_org_code',
      'asset_org_code',
    ])]: req.session.profile.org_code,
  });
  const result = await withDrawService.search(params, req);
  return res.json({ success: true, ...result });
};

const update = async (req, res, next) => {
  const {
    asset_org_code,
    fund_org_code,
    match_date,
    priority,
    is_check_stock,
    stock_day_count,
    // tarAssetCode,
    // tarFundCode,
  } = req.body;
  // if (req.session.profile.user_type === 1) {
  //   asset_org_code = req.session.profile.org_code;
  //   // tarAssetCode = asset_org_code;
  //   // tarFundCode = '';
  // } else if (req.session.profile.user_type === 2) {
  //   fund_org_code = req.session.profile.org_code;
  //   // tarAssetCode = '';
  //   // tarFundCode = fund_org_code;
  // }
  const params = {
    asset_org_code,
    fund_org_code,
    match_date,
    priority,
    is_check_stock,
    stock_day_count,
  };
  try {
    const effectRows = await withDrawService.update(req, params);
    if (effectRows === 0) {
      throw new Error('更新失败');
    }
    return res.json({
      success: true,
    });
  } catch (e) {
    res.json({
      success: false,
      message: e.message || '保存失败',
    });
  }
};

const exportCtrl = async (req, res) => {
  const params = getMySQLFieldValue({
    ...req.query,
    withdrawStatus: req.query.withdrawStatus && req.query.withdrawStatus.split(',') || '',
    [userDiffer(req.session.profile.user_type, [
      'admin_org_code',
      'fund_org_code',
      'asset_org_code',
    ])]: req.session.profile.org_code,
  });
  const Download = promisify(res.download).bind(res);
  const { xslx, total } = await withDrawService.orderExport(params, req);
  try {
    await Download(xslx, '订单提现导出.xlsx');
    removefileIfExist(xslx);
  } catch (e) {
    if (res.headersSent) {
      logger.error(e.message);
    } else {
      res.status(404).send(e.message);
    }
    return;
  }
  const oper_log = `导出提现订单 ${total}条, 导出参数 ${JSON.stringify(
    params,
  )}`;
  commonService.manualTableLog(req, {
    action_type: '导出',
    from_table: 't_order',
    org_code: req.session.profile.org_code,
    user_id: req.session.profile.user_id,
    sub_user_id: req.session.profile.sub_user_id || '',
    oper_log,
  });
};

module.exports = {
  search,
  update,
  exportCtrl,
};
