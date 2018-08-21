/*
 * File index.js
 * File Created: 2018-05-22 Tuesday, 03:52:59
 * Author: zhangjunjie (zhangjunjie@rongcapital.cn)
 * -----
 * Last Modified: 2018-05-24 Thursday, 05:58:27
 * Modified By: zhangjunjie (zhangjunjie@rongcapital.cn>)
 * -----
 */

const _ = require('lodash');
const subuserMDao = require('./subuserManagementDao');
const userMDao = require('../UserManagement/userManagementDao');
const commonService = require('../BusinessCommon');
const { sequelizeDB } = require('../../../schema');
const { getMySQLFieldValue, uuidv4 } = require('../../../util');

const search = async req => {
  const { userType, orgCode, userAccount, userName, pageIndex } = req.body;
  const myPageIndex =
    isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const user_id =
    req.session.profile.user_type == 4 ? '' : req.session.profile.user_id;
  const params = getMySQLFieldValue({
    user_id,
    userType,
    orgCode,
    userAccount,
    userName,
    pageIndex: myPageIndex
  });
  const { rows, count: total } = await subuserMDao(req).search(params);
  return { rows, total };
};

const getRestriction = async req => {
  const { userType: user_type, sub_user_id } = req.body;
  if (!sub_user_id) {
    throw new Error('查询失败，请传入正确的子用户id');
  }
  const [rows, [isDataFuncRows]] = await Promise.all([
    subuserMDao(req).subUserDataFuncQuery({ user_type, sub_user_id }),
    subuserMDao(req).subUserQuery({ sub_user_id })
  ]);
  if (!isDataFuncRows || isDataFuncRows.is_data_func === undefined) {
    throw new Error('未查询到该子用户信息，请重试');
  }
  return { rows, restrictionFlag: isDataFuncRows.is_data_func };
};

const updateRestriction = async req => {
  const { data, sub_user_id, is_data_func } = req.body;
  if (!Array.isArray(data)) {
    throw new Error('更新数据不完整');
  }
  const t = await sequelizeDB.transaction();
  try {
    await Promise.all([
      subuserMDao(req).subUserDataFuncDelete({ sub_user_id }, t),
      subuserMDao(req).subUserUpdate({ sub_user_id, is_data_func }, t)
    ]);
    await Promise.all([
      ...data.map(item =>
        subuserMDao(req).subUserDateFuncAdd({ ...item, sub_user_id }, t)
      )
    ]);
    t.commit();
    // 严格检查 非主键 user_type也检查
    const results = await Promise.all([
      ...data.map(item =>
        subuserMDao(req).subUserDataFuncQuery({ ...item, sub_user_id })
      )
    ]);
    results.forEach(item => {
      if (!item || !item[0]) {
        throw new Error('已更新但未查到相关记录');
      }
    });
    return { results };
  } catch (error) {
    t.rollback();
    throw new Error(error.message || '更新失败');
  }
};

const create = async req => {
  const { user_account, user_name, new_password, confirm_password } = req.body;
  const sub_user_id = uuidv4();
  const { user_id } = req.session.profile;
  if (!user_account) {
    throw new Error('用户账号不能为空');
  } else if (!user_name) {
    throw new Error('用户名不能为空');
  } else if (!new_password || !new_password.md5()) {
    throw new Error('用户密码不能为空');
  } else if (new_password !== confirm_password) {
    throw new Error('用户两次密码输入不一致，请重新输入');
  }
  const params = {
    ...req.body,
    sub_user_id,
    user_id,
    password: new_password.md5(),
    use_yn: 'Y',
    create_user_id: user_id
  };
  const userCount = await subuserMDao(req).subUserCount({
    user_account,
    user_id
  });
  if (userCount > 0) {
    throw new Error(`账号名[${user_account}]已存在，请使用其他账号名称`);
  }
  const t = await sequelizeDB.transaction();
  try {
    const addResult = await subuserMDao(req).subUserCreate(params, t);
    if (_.isEmpty(addResult)) {
      throw new Error('用户添加失败');
    }
    t.commit();
  } catch (error) {
    t.rollback();
    throw new Error(error.message || '更新失败');
  }
};

const update = async req => {
  const {
    user_account,
    user_name,
    sub_user_id,
    new_password,
    confirm_password,
    company,
    tel,
    mobile,
    email,
    qq,
    is_data_func
  } = req.body;
  const { user_id } = req.session.profile;
  if (!user_account) {
    throw new Error('用户账号不能为空');
  } else if (!user_name) {
    throw new Error('用户名不能为空');
  } else if (new_password !== confirm_password) {
    throw new Error('用户两次密码输入不一致，请重新输入');
  }

  const params = {
    sub_user_id,
    user_id,
    password: (new_password && new_password.md5()) || null,
    user_account,
    user_name,
    company,
    tel,
    mobile,
    email,
    qq,
    is_data_func
  };
  const subuser = await subuserMDao(req).subUserQuery({ user_id, sub_user_id });
  if (_.isEmpty(subuser)) {
    throw new Error('未查询到该子用户，请重新选择');
  }
  const t = await sequelizeDB.transaction();
  try {
    const [affectedCount, [affectedRow]] = await subuserMDao(req).subUserUpdate(
      params,
      t
    );
    if (_.isEmpty(affectedRow)) {
      throw new Error('用户更新失败');
    }
    t.commit();
    return { data: affectedRow };
  } catch (error) {
    t.rollback();
    throw new Error(error.message || '更新失败');
  }
};

const deleteFun = async req => {
  const { sub_user_id } = req.body;
  const { user_id } = req.session.profile;
  const params = {
    user_id,
    sub_user_id
  };
  if (!sub_user_id) {
    throw new Error('子账号不能为空');
  }
  const t = await sequelizeDB.transaction();
  try {
    const result = await subuserMDao(req).subUserDelete(params, t);
    if (!result) {
      throw new Error('子用户不存在，请重新核对');
    }
    t.commit();
    return result;
  } catch (error) {
    t.rollback();
    throw new Error(error.message || '更新失败');
  }
};

const authSearch = async req => {
  const { sub_user_id } = req.body;
  const { user_id } = req.session.profile;
  const [mainUserMenu, subUserMenu] = await Promise.all([
    subuserMDao(req).mainUserMenusSearch({ user_id }),
    userMDao(req).userFuncQuery({ user_id: sub_user_id })
  ]);
  if (_.isEmpty(mainUserMenu)) {
    throw new Error('无记录');
  }
  const menus = new Array();
  const checked = new Array();
  const expanded = new Set();

  const menuMap = new Map();
  for (const row of mainUserMenu) {
    const funcId = row.func_id;
    const funcName = row.func_name;
    const fFuncId = row.f_func_id;
    const leaf = new Object();
    leaf.value = funcId;
    leaf.label = funcName;
    leaf.children = [];

    menuMap.set(funcId, leaf);
    expanded.add(funcId);

    if (fFuncId != null && fFuncId != undefined && fFuncId.length > 0) {
      const fNode = menuMap.get(fFuncId);
      fNode.children.push(leaf);
    } else {
      menus.push(leaf);
    }
  }

  for (const row of subUserMenu) {
    if (expanded.has(row.func_id)) {
      checked.push(row.func_id);
    }
  }

  return { menus, checked, expanded: Array.from(expanded) };
};

const auth = async req => {
  const { user_id: sub_user_id, checked } = req.body;
  const { user_id } = req.session.profile;
  if (!sub_user_id) {
    throw new Error('子账号不能为空');
  } else if (_.isEmpty(checked)) {
    throw new Error('子账号权限不能为空');
  }
  const t = await sequelizeDB.transaction();
  try {
    await userMDao(req).userFuncDelete({ user_id: sub_user_id }, t);
    await Promise.all([
      ..._.map(checked, funcId =>
        userMDao(req).userFuncCreate(
          {
            id: uuidv4(),
            user_id: sub_user_id,
            func_id: funcId,
            use_yn: 'Y',
            create_user_id: user_id
          },
          t
        )
      )
    ]);
    t.commit();
    await commonService.manualLog(req, {
      from_table: 't_user_func',
      from_table_key: sub_user_id,
      oper_log: `修改用户菜单权限表 修改内容：变更子用户菜单权限：${sub_user_id}`
    });
    return {};
  } catch (error) {
    t.rollback();
    throw new Error(error.message || '更新失败');
  }
};

const roleSearch = async req => {
  const role_type = req.session.profile.user_type;
  const { rows, count: total } = await subuserMDao(req).subUserRoleManageQuery({
    role_type
  });
  if (_.isEmpty(rows)) {
    throw new Error('无记录');
  }
  return { rows, total };
};

module.exports = {
  search,
  getRestriction,
  updateRestriction,
  create,
  update,
  deleteFun,
  authSearch,
  auth,
  roleSearch
};
