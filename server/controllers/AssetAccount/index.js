/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-26 15-12
 */

const assetAccountService = require('../../services').business.assetAccount;
const { getMySQLFieldValue } = require('../../util');

const search = async (req, res, next) => {
  const { fundOrgCode, assetOrgCode } = req.body;
  const params = getMySQLFieldValue({
    assetOrgCode,
    fundOrgCode,
  });
  const { assetRows, fundRows, allRows } = await assetAccountService.search(req, params);
  return res.json({
    success: true, assetRows, fundRows, allRows,
  });
};

const update = async (req, res, next) => {
  const params = getMySQLFieldValue(req.body);
  const { user_type } = req.session.profile;
  let result = null;
  if (user_type === 1) {
    result = await assetAccountService.assetUpdate(req, params);
  } else {
    result = await assetAccountService.fundUpdate(req, params);
  }

  return res.json({
    success: true,
    data: result,
    user_type,
  });
};

module.exports = {
  search,
  update,
};
