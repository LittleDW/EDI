/*
 * File: index.js
 * File Created: Friday, 23rd March 2018 4:25:57 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Tue Apr 03 2018
 * Modified By: Osborn
 */
const _ = require('lodash');
const profileService = require('../../services').business.profile;
const { getMySQLFieldValue } = require('../../util');

const update = async (req, res, next) => {
  const { user_id, sub_account } = req.session.profile;
  const sub_user_id = (sub_account && sub_account.sub_user_id) || '';
  const params = getMySQLFieldValue({
    ...req.body,
    user_id,
    sub_user_id,
    password: req.body.new_password ? req.body.new_password.md5() : '',
    oldPassword:
      (req.body.new_password &&
        (req.body.old_password ? req.body.old_password.md5() : '')) ||
      (sub_account && sub_account.password) ||
      req.session.profile.password,
  });
  if (_.isEmpty(params.linkman)) {
    throw new Error('联系人不能为空');
  }
  if (_.isEmpty(params.mobile)) {
    throw new Error('联系人手机不能为空');
  }
  if (_.isEmpty(params.email)) {
    throw new Error('联系人email不能为空');
  }

  let session = null;
  if (sub_user_id) {
    session = await profileService.updateSubUser(req, params);
  } else {
    session = await profileService.updateUser(req, params);
  }
  req.session.profile = session;
  return res.json({ success: true, data: session });
};

// const changePassword = async (req, res, next) => {
//   const { user_id, sub_account } = req.session.profile;
//   const sub_user_id = (sub_account && sub_account.sub_user_id) || '';
//   const params = getMySQLFieldValue({
//     user_id,
//     sub_user_id,
//     password: req.body.new_password ? req.body.new_password.md5() : '',
//     oldPassword:
//       (req.body.new_password &&
//         (req.body.old_password ? req.body.old_password.md5() : '')) ||
//       (sub_account && sub_account.password) ||
//       req.session.profile.password,
//   });
//   if (sub_user_id) {
//     return await profileService.changSubUserPassword(req, params);
//   } else {
//     return await profileService.changUserPassword(req, params);
//   }
// };
const profile = {
  update,
  // changePassword,
};
module.exports = profile;
