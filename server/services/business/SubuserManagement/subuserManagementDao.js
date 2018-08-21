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
  SubUser: subuserDao,
  UserAttribute: userAttrDao,
  UserFunc: userFuncDao,
  SubUserDataFunc: subuserDataFuncDao,
} = require("../../../dao").User;

const { SysParaInfo: sysParamInfoDao } = require("../../../dao").Common;
const { Role: roleDao, Func: funcDao } = require("../../../dao").Role;
const { RoleUser: roleUserDao } = require("../../../dao").Role;

class SubuserManagementDao extends Super {
  search(params = {}) {
    const {
      user_id,
      user_type,
      org_code,
      user_account,
      user_name,
      page_index
    } = params;
    return subuserDao(this.info).querySubuser({
      user_id,
      user_type,
      org_code,
      user_account,
      user_name,
      page_index
    });
  }
  subUserDataFuncQuery(params = {}) {
    const { user_type, sub_user_id, partner_org_code } = params;
    return subuserDataFuncDao(this.info).nativeQuery({
      where: {
        sub_user_id,
        partner_org_code,
        user_type
      }
    });
  }
  subUserDataFuncDelete(params = {}, transcation = null) {
    const { sub_user_id } = params;
    return subuserDataFuncDao(this.info).nativeDelete({
      where: {
        sub_user_id
      },
      transcation
    });
  }

  subUserDateFuncAdd(params = {}, transcation = null) {
    const { partner_org_code, sub_user_id, user_type } = params;
    if (!partner_org_code || !sub_user_id || !user_type) {
      throw new Error("添加失败，缺少重要参数");
    }
    return subuserDataFuncDao(this.info).nativeCreate(
      { partner_org_code, sub_user_id, user_type },
      {
        transcation
      }
    );
  }
  subUserQuery(params = {}) {
    const { user_id, sub_user_id } = params;
    return subuserDao(this.info).nativeQuery({
      where: {
        user_id,
        sub_user_id
      }
    });
  }
  subUserCount(params = {}) {
    const { user_account, user_id } = params;
    return subuserDao(this.info).nativeCount({
      where: {
        user_id,
        user_account
      }
    });
  }
  subUserCreate(params = {}) {
    const {
      user_id,
      sub_user_id,
      user_account,
      password,
      user_name,
      company,
      department,
      tel,
      mobile,
      email,
      qq,
      use_yn,
      remark,
      create_user_id
    } = params;
    if (
      !user_id ||
      !sub_user_id ||
      !user_account ||
      !password ||
      !user_name ||
      !use_yn
    ) {
      throw new Error("添加用户失败，缺少关键参数");
    }
    return subuserDao(this.info).nativeCreate({
      user_id,
      sub_user_id,
      user_account,
      password,
      user_name,
      company,
      department,
      tel,
      mobile,
      email,
      qq,
      use_yn,
      remark,
      create_user_id
    });
  }
  subUserUpdate(params = {}, transcation = null) {
    const {
      user_account,
      password,
      user_name,
      company,
      tel,
      mobile,
      email,
      qq,
      is_data_func,
      sub_user_id
    } = params;
    if (!sub_user_id) {
      throw new Error("更新失败，缺少关键参数");
    }
    return subuserDao(this.info).nativeUpdate(
      {
        user_account,
        password,
        user_name,
        company,
        tel,
        mobile,
        email,
        qq,
        is_data_func,
        sub_user_id
      },
      {
        where: {
          sub_user_id
        },
        transcation
      }
    );
  }
  subUserDelete(params = {}, transcation = null) {
    const {user_id, sub_user_id} = params
    if (!user_id || !sub_user_id) {
      throw new Error('删除失败，缺少关键参数')
    }
    return subuserDao(this.info).nativeDelete({
      where: {
        user_id,
        sub_user_id
      },
      transcation
    })
  }
  mainUserMenusSearch(params ={}) {
    const {user_id} = params
    return userFuncDao(this.info).mainUserMenusSearch({user_id})
  }
  subUserRoleManageQuery(params ={}) {
    const {role_type} = params
    return roleDao(this.info).subUserRoleManageQuery({role_type})
  }
}

module.exports = req => new SubuserManagementDao(req);
