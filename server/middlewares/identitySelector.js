/*
 * @Author Osborn
 * @File identitySelector
 * @Date 2018-03-29 15-51
 */

module.exports = () => (req, res, next) => {
  if (!req.session || !req.session.profile) {
    return res.json({ success: false, message: '内部错误' });
  }
  if (req.session.profile.user_type === 1) {
    req.body.asset_org_code = req.body.assetOrgCode = req.session.profile.org_code;
  } else if (req.session.profile.user_type === 2) {
    req.body.fund_org_code =req.body.fundOrgCode = req.session.profile.org_code;
  }
  next();
};
