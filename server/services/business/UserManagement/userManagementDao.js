/*
 * @Author zhangjunjie
 * @File userManagementDao.js
 * @Created Date 2018-05-10 16-52
 * @Last Modified: 2018-05-10 16-52
 * @Modified By: zhangjunjie
 */

const _ = require("lodash");
const Super = require("../super");
const {
  User: userDao,
  UserAttribute: userAttrDao,
  UserFunc: userFuncDao
} = require("../../../dao").User;

const { SysParaInfo: sysParamInfoDao } = require("../../../dao").Common;
const { Role: roleDao, Func: funcDao } = require("../../../dao").Role;
const { RoleUser: roleUserDao } = require("../../../dao").Role;

class UserManagementDao extends Super {
  search(params = {}) {
    const { user_type, org_code, user_account, user_name, page_index } = params;
    return userDao(this.info).manageQuery(
      { user_type, org_code, user_account, user_name },
      page_index
    );
  }
  findUserById(params = {}) {
    const { user_id } = params;
    if (_.isEmpty(user_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userDao(this.info).nativeQuerySingle({
      where: { user_id }
    });
  }
  findSimilarUserCount(params = {}) {
    const { org_code, user_account, rop_user_id, user_id } = params;
    return userDao(this.info).managePreCount({
      org_code,
      user_account,
      rop_user_id,
      user_id
    });
  }

  updateUser(params = {}, transaction = null) {
    const {
      user_type,
      org_code,
      user_account,
      password,
      user_name,
      user_full_name,
      rop_user_id,
      linkman,
      tel,
      mobile,
      email,
      user_id
    } = params;
    if (
      !user_type ||
      !org_code ||
      !user_account ||
      !user_name ||
      !user_full_name ||
      !user_id
    ) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userDao(this.info).nativeUpdate(
      {
        user_type: _.toNumber(user_type),
        org_code,
        user_account,
        password,
        user_name,
        user_full_name,
        rop_user_id,
        linkman,
        tel,
        mobile,
        email
      },
      {
        where: { user_id },
        transaction,
        action_type: 'user',
      }
    );
  }

  updateUserAttrForOrgCode(params = {}, transaction = null) {
    const { user_id, org_code } = params;
    if (_.isEmpty(org_code) || _.isEmpty(user_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userAttrDao(this.info).nativeUpdate(
      { org_code },
      {
        where: { user_id },
        transaction,
        action_type: 'user',
      }
    );
  }

  findUserFromDictionary(params = {}) {
    const { org_code, user_name } = params;
    if (_.isEmpty(org_code)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return sysParamInfoDao(this.info).nativeQuery({
      where: {
        table_name: "t_user",
        col_name: "org_code",
        para_key: org_code
      }
    });
  }

  updateDictionary(params = {}, options = {}, transaction = null) {
    const { org_code, user_name } = params;
    const { para_key, para_value } = options;
    if (
      _.isEmpty(org_code) ||
      _.isEmpty(user_name) ||
      _.isEmpty(para_key) ||
      _.isEmpty(para_value)
    ) {
      throw new Error("操作失败，缺少关键参数");
    }
    return sysParamInfoDao(this.info).nativeUpdate(
      {
        table_name: "t_user",
        col_name: "org_code",
        para_key: org_code,
        para_value: user_name
      },
      {
        where: {
          table_name: "t_user",
          col_name: "org_code",
          para_key,
          para_value
        },
        transaction
      }
    );
  }

  createUser(params = {}, transaction = null) {
    const {
      user_id,
      user_type,
      org_code,
      user_account,
      password,
      user_name,
      user_full_name,
      rop_user_id,
      linkman,
      tel,
      mobile,
      email
    } = params;
    if (
      !user_id ||
      !user_type ||
      !org_code ||
      !user_account ||
      !password ||
      !user_name ||
      !user_full_name
    ) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userDao(this.info).nativeCreate(
      {
        user_id,
        user_type,
        org_code,
        user_account,
        user_status: 1,
        password,
        user_name,
        user_full_name,
        rop_user_id,
        linkman,
        tel,
        mobile,
        email
      },
      {
        transaction,
        action_type: 'user',
      }
    );
  }

  createDictionaryUser(params = {}, transaction = null) {
    const { org_code, user_name } = params;
    if (!org_code || !user_name) {
      throw new Error("操作失败，缺少关键参数");
    }
    return sysParamInfoDao(this.info).nativeCreate(
      {
        table_name: "t_user",
        col_name: "org_code",
        para_key: org_code,
        para_value: user_name
      },
      {
        transaction
      }
    );
  }

  systemRoleQuery(params = {}) {
    const { user_type } = params;
    if (!user_type) {
      throw new Error("操作失败，缺少关键参数");
    }
    return roleDao(this.info).getRole({ role_type: user_type });
  }

  roleManageUserAdd(params = {}, transaction = null) {
    const { id, role_id, user_id, create_user_id } = params;
    if (!role_id || !user_id || !create_user_id || !id) {
      throw new Error("操作失败，缺少关键参数");
    }
    return roleUserDao(this.info).nativeCreate(
      {
        id,
        role_id,
        user_id: user_id,
        create_user_id
      },
      {
        transaction
      }
    );
  }

  userAttributeAdd(transaction = null) {
    return userAttrDao(this.info).userAttributeAdd(transaction);
  }

  userDelete(params = {}, transaction = null) {
    const { user_id } = params;
    if (_.isEmpty(user_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userDao(this.info).nativeDelete({
      where: {
        user_id
      },
      transaction,
      action_type: 'user',
    });
  }

  userAttributeFind(params = {}) {
    const { user_id } = params;
    if (_.isEmpty(user_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userAttrDao(this.info).findUserAttribute({user_id},);
  }

  userAttriDelete(params = {}, transaction = null) {
    const { user_id } = params;
    if (_.isEmpty(user_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userAttrDao(this.info).nativeDelete({
      where: {
        user_id
      },
      transaction
    });
  }
  userAttributeUpdate(params = {}) {
    return userAttrDao(this.info).update(params);
  }

  dicDelete(params = {}, transaction = null) {
    const { table_name, col_name, para_key, para_value } = params;
    if (
      _.isEmpty(table_name) ||
      _.isEmpty(col_name) ||
      _.isEmpty(para_key) ||
      _.isEmpty(para_value)
    ) {
      throw new Error("操作失败，缺少关键参数");
    }
    return sysParamInfoDao(this.info).nativeDelete({
      where: { table_name, col_name, para_key, para_value },
      transaction
    });
  }

  roleManageFuncMainSearch(params = {}) {
    const { role_id, role_type } = params;
    if (_.isEmpty(role_id) || !role_type) {
      throw new Error("操作失败，缺少关键参数");
    }
    return funcDao(this.info).mainSearch({ role_id, role_type });
  }
  roleManageFuncSubSearch(params = {}) {
    const { role_id } = params;
    if (_.isEmpty(role_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return funcDao(this.info).subSearch({ role_id });
  }
  userFuncQuery(params = {}) {
    const { user_id } = params;
    if (_.isEmpty(user_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userFuncDao(this.info).nativeQuery({
      where: { user_id }
    });
  }

  userFuncDelete(params = {}, transaction = null) {
    const { user_id } = params;
    if (_.isEmpty(user_id)) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userFuncDao(this.info).nativeDelete({
      where: { user_id },
      transaction
    });
  }

  userFuncCreate(params = {}, transaction = null) {
    const { id, user_id, func_id, use_yn, create_user_id } = params;
    if (
      !_.isString(id) ||
      !_.isString(func_id) ||
      !_.isString(user_id) ||
      !_.isString(use_yn) ||
      !_.isString(create_user_id)
    ) {
      throw new Error("操作失败，缺少关键参数");
    }
    return userFuncDao(this.info).nativeCreate(
      { id, user_id, func_id, use_yn, create_user_id },
      {
        transaction
      }
    );
  }
}

module.exports = req => new UserManagementDao(req);
