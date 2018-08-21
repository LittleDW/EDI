/*
 * File: SubUser.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: 2018-05-24 Thursday, 03:07:48
 * Modified By: zhangjunjie (zhangjunjie@rongcapital.cn>)
 */

const sequelize = require("sequelize");
const _ = require("lodash");
const {db} = require("../../schema/index");
const Model = require('../super');

// Query
//   "subuserLogin": "select * from t_sub_user where user_id=:?user_id and user_account=:?user_account and password=:?password",

// Update
// "subUserUpdate": "update t_sub_user set user_name=:?user_name, tel=:!tel, mobile=:!mobile, email=:!email, password=:?password, rx_updateTime=now() where 1=1 and sub_user_id=:?sub_user_id and password=:?old_password",

class SubUser extends Model {
  login({user_id, user_account, password}) {
    if (!user_id || !user_account || !password) {
      return this.error('');
    }
    return this.dao.find({
      where: {
        user_id,
        user_account,
        password,
      },
    });
  }

  querySubuser(params={}) {
    const {page_index, org_code} = params
    const attributes = [
      [sequelize.col('t_sub_user.sub_user_id'), 'sub_user_id'],
      ['user_id', 'user_id'],
      ['user_account', 'user_account'],
      ['PASSWORD', 'PASSWORD'],
      ['user_name', 'user_name'],
      ['company', 'company'],
      ['department', 'department'],
      ['tel', 'tel'],
      ['mobile', 'mobile'],
      ['email', 'email'],
      ['qq', 'qq'],
      ['use_yn', 'use_yn'],
      ['remark', 'remark'],
      ['create_user_id', 'create_user_id'],
      ['rx_insertTime', 'rx_insertTime'],
      ['rx_updateTime', 'rx_updateTime'],
      [sequelize.col('t_user.user_account'), 'main_user_account'],
      [sequelize.col('t_user.user_type'), 'user_type'],
      [sequelize.col('t_user.org_code'), 'org_code'],
    ]
    const where = {}
    const subWhere = {}
    this.queryParamsStringSetupBuilder(params, where, 'user_id')
    this.queryParamsStringSetupBuilder(params, subWhere, 'org_code')
    this.queryParamsStringSetupBuilder(params, subWhere, 'user_type')
    this.queryParamsLikeSetupBuilder(params, where, 'user_account')
    this.queryParamsLikeSetupBuilder(params, where, 'user_name')
    return this.dao.findAndCountAll({
      attributes,
      include: [
        {
          attributes: [],
          model: db.t_user,
          where: subWhere
        }
      ],
      where,
      order: [
        [sequelize.col('t_user.user_type'), 'ASC'],
        [sequelize.col('t_user.org_code'), 'ASC'],
        [sequelize.col('t_sub_user.rx_updateTime'), 'DESC'],
        [sequelize.col('t_sub_user.rx_insertTime'), 'DESC'],
      ],
      offset: page_index,
      limit: 10
    })
  }
}

// const subUser = new SubUser("t_sub_user");
module.exports = (info, accessList = []) => new SubUser('t_sub_user', info, accessList);
