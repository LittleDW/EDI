/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-26 09-52
 */

const _ = require('lodash');
const Dao = require('./profileDao');

// FIXME
const updateSubUser = async function(req, params = {}) {
  const dao = Dao(req);
  let [userInstance, subUserInstance] = await Promise.all([
    dao.userQuery(params),
    dao.subUserQuery(params),
  ]);
  if (_.isEmpty(subUserInstance)) {
    throw new Error('查无此子用户');
  }
  if (_.isEmpty(userInstance)) {
    throw new Error('查无此主用户');
  }

  // FIXME
  const {
    user_name,
    tel,
    mobile,
    email,
    linkman,
    password,
    new_password,
    old_password,
    confirm_password,
  } = params;
  if (!_.isEmpty(new_password) && new_password !== confirm_password) {
    throw new Error('两次密码不匹配，更新失败');
  }
  if (!_.isEmpty(old_password) && subUserInstance.password !== old_password) {
    throw new Error('旧密码不正确，更新失败');
  }

  const values = {
    user_name,
    tel,
    mobile,
    email,
    linkman,
  };
  if (password) {
    values.password = password;
  }
  const updateSubUserInstance = await subUserInstance.update(values);
  return Object.assign(
    {},
    req.session.profile,
    { sub_account: updateSubUserInstance.dataValues },
    userInstance.dataValues
  );
};

const updateUser = async (req, params) => {
  const dao = Dao(req);
  const userInstance = await dao.userQuery(params);
  if (_.isEmpty(userInstance)) {
    throw new Error('查无此用户');
  }
  const {
    user_name,
    tel,
    mobile,
    email,
    linkman,
    new_password,
    password,
    old_password,
    confirm_password,
  } = params;
  if (!_.isEmpty(new_password) && new_password !== confirm_password) {
    throw new Error('两次密码不匹配，更新失败');
  }
  if (!_.isEmpty(old_password) && userInstance.password !== old_password) {
    throw new Error('旧密码不正确，更新失败');
  }
  const values = {
    user_name,
    tel,
    mobile,
    email,
    linkman,
  };
  if (password) {
    values.password = password;
  }
  const updatedUserInstance = await userInstance.update(values);
  return Object.assign({}, req.session.profile, updatedUserInstance.dataValues);
};
// WIP
const changeUserPassword = async (req, params) => {
  const dao = Dao(req);
  const { new_password, old_password, confirm_password } = params;
  if (!_.isEmpty(new_password) && new_password !== confirm_password) {
    throw new Error('两次密码不匹配，更新失败');
  }
  const userInstance = await dao.userQuery(params);
  if (!_.isEmpty(old_password) && userInstance.password !== old_password) {
    throw new Error('旧密码不正确，更新失败');
  }
  await userInstance.update({
    password: new_password,
  });
};
// WIP
const changSubUserPassword = async (req, params) => {
  const dao = Dao(req);
  const {
    new_password = '',
    old_password = '',
    confirm_password = '',
  } = params;
  if (!_.isEmpty(new_password) && new_password !== confirm_password) {
    throw new Error('两次密码不匹配，更新失败');
  }
  const subUserInstance = await dao.subUserQuery(params);
  if (subUserInstance.password !== old_password) {
    throw new Error('旧密码不正确，更新失败');
  }
  await subUserInstance.update({
    password: new_password,
  });
};
module.exports = {
  updateUser,
  updateSubUser,
  changeUserPassword,
  changSubUserPassword,
};
