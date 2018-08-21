/*
 * @Author zhangjunjie
 * @File index.js
 * @Created Date 2018-05-10 16-37
 * @Last Modified: 2018-05-10 16-37
 * @Modified By: zhangjunjie
 */

const _ = require('lodash');
const userMDao = require('./userManagementDao');
const commonDao = require('../Common/commonDao');
const commonService = require('../BusinessCommon');
const { sequelizeDB } = require('../../../schema');
const { getMySQLFieldValue, uuidv4 } = require('../../../util');
const {bridgeService} = require('../Common');

const search = async (req) => {
  const {
    userType, orgCode, userAccount, userName, pageIndex,
  } = req.body;
  const myPageIndex = isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    userType,
    orgCode,
    userAccount,
    userName,
    pageIndex: myPageIndex,
  });
  const { rows, count: total } = await userMDao(req).search(params);
  return { rows, total };
};

const update = async (req) => {
  const {
    user_type,
    org_code,
    user_account,
    user_name,
    user_full_name,
    user_id,
    rop_user_id,
    new_password,
    confirm_password,
    linkman,
    tel,
    mobile,
    email
  } = req.body;
  if (!user_type) {
    throw new Error('用户类型不能为空');
  }
  if (!org_code) {
    throw new Error('机构编码不能为空');
  } else if (!user_account) {
    throw new Error('用户账号不能为空');
  } else if (!user_name) {
    throw new Error('机构名不能为空');
  } else if (!user_full_name) {
    throw new Error('机构名全称不能为空');
  } else if (new_password && new_password !== confirm_password) {
    throw new Error('两次密码输入不一致');
  } else if (
    org_code &&
    !/^(F1502\d{3}||A1501\d{3}||O1503\d{3}||X1504\d{3}||F1506\d{3}||A1505\d{3})$/.test(org_code)
  ) {
    throw new Error('非法的机构编码');
  } else if (
    rop_user_id &&
    !/^[0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12}$/.test(rop_user_id)
  ) {
    throw new Error('非法的ROP用户编码');
  }
  const params = getMySQLFieldValue({
    user_type,
    org_code,
    user_account,
    user_name,
    user_full_name,
    user_id,
    rop_user_id,
    password: (new_password && new_password.md5()) || null,
    linkman,
    tel,
    mobile,
    email,
  });

  const preUser = await userMDao(req).findUserById(params);
  if (_.isEmpty(preUser)) {
    throw new Error('查无此用户');
  }
  params.org_code = preUser.org_code
  const similarUserCount = await userMDao(req).findSimilarUserCount(params);
  if (similarUserCount > 0) {
    throw new Error('用户已存在，请改变账号名或者ROP用户编码');
  }
  const [userInDictionary] = await userMDao(req).findUserFromDictionary(preUser.dataValues);
  if (_.isEmpty(userInDictionary)) {
    throw new Error('未在字典中查到该用户');
  }
  const t = await sequelizeDB.transaction();
  try {
    const [
      [affectedCount, affectedRow],
      [dictionaryCount],
    ] = await Promise.all([
      userMDao(req).updateUser(params, t),
      userInDictionary.para_key !== org_code ||
      userInDictionary.para_value !== user_name
        ? userMDao(req).updateDictionary(params, userInDictionary.dataValues, t)
        : Promise.resolve([]),
    ]);
    if (affectedCount === 0) {
      throw new Error('用户修改失败');
    }
    if (dictionaryCount === 0) {
      throw new Error('字典修改失败');
    }
    await t.commit();
    return affectedRow;
  } catch (error) {
    await t.rollback();
    throw new Error(error.message || '更新失败，请重试');
  }
};

const create = async (req) => {
  const {
    org_code,
    user_account,
    new_password,
    confirm_password,
    user_name,
    user_full_name,
    rop_user_id,
    user_type,
    tel,
    linkman,
    mobile,
    email
  } = req.body;
  const user_id = uuidv4();
  if (!user_type) {
    throw new Error('用户类型不能为空');
  }
  if (!org_code) {
    throw new Error('机构编码不能为空');
  } else if (!user_account) {
    throw new Error('用户账号不能为空');
  } else if (!user_name) {
    throw new Error('机构名不能为空');
  } else if (!user_full_name) {
    throw new Error('机构名全称不能为空');
  } else if (!new_password || !new_password.md5()) {
    throw new Error('新密码不能为空');
  } else if (new_password !== confirm_password) {
    throw new Error('两次密码输入不一致');
  } else if (org_code && !/^(F1502\d{3}||A1501\d{3}||O1503\d{3}||X1504\d{3})$/.test(org_code)) {
    throw new Error('非法的机构编码');
  } else if (
    rop_user_id &&
    !/^[0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12}$/.test(rop_user_id)
  ) {
    throw new Error('非法的ROP用户编码');
  }
  const params = getMySQLFieldValue({
    org_code,
    user_account,
    user_name,
    user_full_name,
    rop_user_id,
    user_type,
    user_id,
    password: new_password.md5(),
    tel,
    linkman,
    mobile,
    email
  });
  const t = await sequelizeDB.transaction();
  try {
    const similarUserCount = await userMDao(req).findSimilarUserCount(params);
    if (similarUserCount > 0) {
      throw new Error('用户已存在，请改变账号名，机构编码或者ROP用户编码');
    }
    const [result, dicResults] = await Promise.all([
      userMDao(req).createUser(params, t),
      userMDao(req).createDictionaryUser(params, t),
    ]);
    if (_.isEmpty(result) || _.isEmpty(dicResults)) {
      throw new Error('创建用户失败，请重试');
    }
    const roleResult = await userMDao(req).systemRoleQuery(params);
    if (roleResult) {
      await userMDao(req).roleManageUserAdd(
        {
          id: uuidv4(),
          role_id: roleResult.role_id,
          user_id,
          create_user_id: req.session.profile.user_id,
        },
        t,
      );
      await userMDao(req).userAttributeAdd(t);
    }
    t.commit();
    return result;
  } catch (error) {
    t.rollback();
    throw new Error(error.message || '创建用户失败，请重试');
  }
};

const deleteFun = async (req) => {
  const { user_id } = req.body;
  if (_.isEmpty(user_id)) {
    throw new Error('用户ID不能为空');
  }
  const params = {
    user_id,
  };
  const userModel = await userMDao(req).findUserById(params);
  const user = userModel.get();
  if (_.isEmpty(user)) {
    throw new Error('用户已不存在，请重新核对');
  }
  const { org_code } = user;
  const relatedOrgs = await commonDao(req).relatedOrgs(getMySQLFieldValue({ org_code }));

  if (Array.isArray(relatedOrgs) && relatedOrgs.length) {
    throw new Error('用户有合作关系，无法删除');
  }
  const dicParams = {
    table_name: 't_user',
    col_name: 'org_code',
    para_key: user.org_code,
    para_value: user.user_name,
  };
  const t = await sequelizeDB.transaction();
  try {
    const [userResult, userAttrResult, dicResult] = await Promise.all([
      userMDao(req).userDelete(params, t),
      userMDao(req).userAttriDelete(params, t),
      userMDao(req).dicDelete(dicParams, t),
    ]);
    if (userResult < 1) {
      throw new Error('用户删除失败');
    }
    if (userAttrResult < 1) {
      throw new Error('用户平台属性删除失败');
    }
    if (dicResult < 1) {
      throw new Error('字典删除失败');
    }

    await t.commit();
    return { success: true };
  } catch (error) {
    await t.rollback();
    throw new Error(e.message || '更新失败');
  }
};

const authSearch = async (req) => {
  const { user_id, user_type } = req.body;
  if (_.isEmpty(user_id) || !user_type) {
    throw new Error('操作失败，缺少关键参数');
  }
  const roleResult = await userMDao(req).systemRoleQuery({ user_type });
  if (_.isEmpty(roleResult)) {
    throw new Error('没有对应系统角色');
  }
  const { role_id } = roleResult;
  if (_.isEmpty(role_id)) {
    throw new Error('查询到的数据不正确，请重试');
  }
  const [roleFuncMain, roleFuncSub, userFunc] = await Promise.all([
    userMDao(req).roleManageFuncMainSearch({
      role_id,
      role_type: user_type,
    }),
    userMDao(req).roleManageFuncSubSearch({ role_id }),
    userMDao(req).userFuncQuery({ user_id }),
  ]);

  if (_.isEmpty(roleFuncMain)) {
    throw new Error('无记录');
  }

  const menus = new Array();
  const checked = new Array();
  const expanded = new Set();

  for (const row of roleFuncMain) {
    const leaf = new Object();
    leaf.value = row.func_id;
    leaf.label = row.func_name;
    leaf.icon = row.func_img;
    leaf.children = [];
    expanded.add(row.func_id);
    const rows_two = roleFuncSub.filter(r => r.func_level == '1' && r.f_func_id == row.func_id);

    for (const row_two of rows_two) {
      const leaf_two = new Object();
      leaf_two.value = row_two.func_id;
      leaf_two.label = row_two.func_name;
      leaf_two.children = [];
      expanded.add(row_two.func_id);

      const rows_three = roleFuncSub.filter(r => r.func_level == '2' && r.f_func_id == row_two.func_id);

      for (const row_three of rows_three) {
        const leaf_three = new Object();
        leaf_three.value = row_three.func_id;
        leaf_three.label = row_three.func_name;
        leaf_three.children = [];
        expanded.add(row_three.func_id);
        leaf_two.children.push(leaf_three);
      }
      leaf.children.push(leaf_two);
    }

    menus.push(leaf);
  }

  for (const row of userFunc) {
    if (expanded.has(row.func_id)) {
      checked.push(row.func_id);
    }
  }

  return { menus, checked, expanded: [...expanded] };
};

const auth = async (req) => {
  const { user_id, checked } = req.body;
  const create_user_id = req.session.profile.user_id;
  if (!user_id) {
    throw new Error('用户ID不能为空');
  } else if (!checked) {
    throw new Error('用户权限不能为空');
  }
  const t = await sequelizeDB.transaction();
  try {
    await userMDao(req).userFuncDelete({ user_id }, t);
    await Promise.all([
      ..._.map(checked, funcId =>
        userMDao(req).userFuncCreate(
          {
            id: uuidv4(),
            user_id,
            func_id: funcId,
            use_yn: 'Y',
            create_user_id,
          },
          t,
        )),
    ]);
    await commonService.manualLog(req, {
      from_table: 't_user_func',
      from_table_key: user_id,
      oper_log: `修改用户菜单权限表 修改内容：变更用户菜单权限：${user_id}`,
    });
    return t.commit();
  } catch (error) {
    t.rollback();
    throw new Error('功能权限保存失败，请重试！');
  }
};

module.exports = bridgeService({
  search,
  update,
  create,
  delete: deleteFun,
  authSearch,
  auth,
}, userMDao);
