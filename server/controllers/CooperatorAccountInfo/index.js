/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-04-17 10-47
 */

const _ = require('lodash');

const ropAPI = require('../../services/rop/ropAPI');
const { getMySQLFieldValue, uuidv4 } = require('../../util');
const ROP_API_NAME = 'ruixue.edi.asset.account.info.get';
const accountInfo = async (req, res, next) => {
  let {
    borrow_type,
    borrow_certificate_no,
    asset_org_code,
    fund_org_code,
    page_index,
  } = getMySQLFieldValue(req.body);
  const { user_type, org_code: myOrgCode } = req.session.profile;
  if (_.isNaN(page_index)) {
    page_index = 1;
  }
  if (user_type === 1) {
    asset_org_code = myOrgCode;
  } else if (user_type === 2) {
    fund_org_code = myOrgCode;
  } else if (user_type === 4) {
    return res.json({ success: false, message: '系统管理员无权操作' });
  }
  const param = {
    borrow_type,
    borrow_certificate_no,
    fund_org_code,
    asset_org_code,
  };
  const result = await ropAPI(ROP_API_NAME, param, null, true);
  if (result.success) {
    const { borrowaccountinfo } = result.data.borrowaccountinfos;
    let total = 0;
    let rows = [];

    if (_.isArray(borrowaccountinfo)) {
      total = borrowaccountinfo.length;
      rows = borrowaccountinfo
        .splice((page_index - 1) * 10, 10)
        .map(r => ({ ...param, ...r }));
    }
    res.json({ success: true, total, rows });
  } else {
    res.json({
      success: false,
      message: (result.data && result.data._reason) || '接口发生错误',
    });
  }
};

module.exports = {
  accountInfo,
}
