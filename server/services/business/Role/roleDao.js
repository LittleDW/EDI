/**
 * @author robin
 * @file roleDao
 * @date 2018-04-26 11:35
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Role, User, Common } = dao;

class RoleDao extends Super {
  pagingQuery(params = {}) {
    const { role_name, page_index } = params;
    return Role.Role(this.info).pagingQuery({ role_name }, page_index);
  }

  countRoleName(params = {}) {
    const { role_id, role_name } = params;
    return Role.Role(this.info).countRoleName({ role_name , role_id});
  }

  countRoleID(params = {}) {
    const { role_id } = params;
    return Role.Role(this.info).nativeCount({ where: { role_id } });
  }

  update(params = {}) {
    const {
      role_id, remark, role_name, role_type, sys_yn,
    } = params;
    return Role.Role(this.info).nativeUpdate(
      {
        remark, role_name, role_type, sys_yn,
      },
      { where: { role_id } },
    );
  }
  find(params = {}) {
    const { role_id } = params;
    return Role.Role(this.info).nativeQuerySingle({ where: { role_id } });
  }
  create(params = {}) {
    const {
      role_id, role_name, role_type, remark, create_user_id, sub_user_yn,
    } = params;
    return Role.Role(this.info).add({
      role_id, role_name, role_type, remark, create_user_id, sub_user_yn,
    });
  }
  delete(params = {}) {
    const { role_id } = params;
    return Promise.all([
      Role.Role(this.info).delete({role_id}),
      Role.RoleUser(this.info).delete({role_id}),
      Role.RoleFunc(this.info).delete({role_id}),
    ]);
  }
  funcMainSearch(params = {}) {
    const { role_id, role_type } = params;
    return Role.Func(this.info).mainSearch({ role_id, role_type });
  }
  funcSubSearch(params = {}) {
    const { role_id } = params;
    return Role.Func(this.info).subSearch({ role_id });
  }
  funcDelete(params = {}) {
    const { role_id } = params;
    return Role.RoleFunc(this.info).delete({ role_id });
  }
  funcCreate(params = {}) {
    const {
      id, role_id, func_id, use_yn, create_user_id,
    } = params;
    return Role.RoleFunc(this.info).add({
      id, role_id, func_id, use_yn, create_user_id,
    });
  }
  userCreate(params = {}) {
    const {
      id, role_id, user_id, create_user_id,
    } = params;
    return Role.RoleUser(this.info).add({
      id, role_id, user_id, create_user_id,
    });
  }
  roleUserSearch(params = {}) {
    const { role_id, user_account } = params;
    return Role.RoleUser(this.info).search({ role_id, user_account });
  }
  userSearch(params = {}) {
    const { role_id, user_account } = params;
    return User.User(this.info).roleUserAddSearch({ role_id, user_account });
  }
  userDelete(params = {}) {
    const { role_id, user_id } = params;
    return Role.RoleUser(this.info).delete({ role_id, user_id });
  }
  /* count(params = {}) {
    const {repayment_date_start,repayment_date_end,fund_org_code,asset_org_code,repayment_status} = params;
    return Common
      .Repayment(this.info)
      .count({repayment_date_start,repayment_date_end,fund_org_code,asset_org_code,repayment_status});
  }

  update(params = {}) {
    const {repayment_status,fund_org_code,asset_org_code,repayment_date} = params;
    return Common
      .Repayment(this.info)
      .update({repayment_status},{fund_org_code,asset_org_code,repayment_date});
  }

  query(params = {}) {
    const {fund_org_code,asset_org_code,repayment_date} = params;
    return Common
      .Repayment(this.info)
      .query({fund_org_code,asset_org_code,repayment_date});
  } */
}

module.exports = req => new RoleDao(req);
