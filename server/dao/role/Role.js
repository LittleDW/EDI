const _ = require('lodash');
const sequelize = require('sequelize');

const {Op} = sequelize;
const Model = require('../super');
const {db, sequelizeDB} = require('../../schema/index');

// "roleManageQuery": "select role_id,role_name,role_type,sys_yn,remark,DATE_FORMAT(rx_insertTime,'%Y-%m-%d %H:%i:%S') as rx_insertTime from t_role where 1=1 and role_name like :?role_name order by sys_yn,rx_insertTime  limit :?page_index,10",
class Role extends Model {
  add(params = {}) {
    return this.dao.create(params);
  }

  pagingQuery(param = {}, page_index) {
    const attributes = ["role_id", "role_name", "role_type", "sys_yn", "sub_user_yn","remark", "rx_insertTime"]
    let cloneParam = _.cloneDeep(param), where = {}
    this.queryParamsLikeSetupBuilder(cloneParam, where, "role_name")
    return this.dao.findAndCountAll({
      attributes, where, offset: page_index, limit: 10,
      order: ['role_name'],
    });
  }

  countRoleName(param={}){
    let cloneParam = _.cloneDeep(param), where = {}
    this.queryParamsStringSetupBuilder(cloneParam, where, "role_name")
    this.queryParamsStringNESetupBuilder(cloneParam, where, "role_id")
    return this.dao.count({where})
  }

  countRoleNameAndIDRange(param={}){
    let cloneParam = _.cloneDeep(param), where = {}
    this.queryParamsStringSetupBuilder(cloneParam, where, "role_name")
    this.queryParamsInSetupBuilder(cloneParam, where, "role_id")
    return this.dao.count({where})
  }

  update(param={}){
    let cloneParam = _.cloneDeep(param), where = {}, value={}
    this.queryParamsStringSetupBuilder(cloneParam, where, "role_id")
    this.queryParamsStringSetupBuilder(cloneParam, value, "role_name")
    this.queryParamsStringSetupBuilder(cloneParam, value, "role_type")
    this.queryParamsStringSetupBuilder(cloneParam, value, "remark")
    return this.dao.update(value,{where})
  }
  delete(param={}){
    return this.nativeDelete({where:param})
  }

  // "systemRoleQuery": "select * from t_role where 1=1 and role_type=:?role_type and sys_yn='Y'",
  getRole(param = {}) {
    let cloneParam = _.cloneDeep(param), where = {sys_yn:'Y'}
    this.queryParamsLikeSetupBuilder(cloneParam, where, "role_type")
    return this.dao.findOne({where});
  }

  subUserRoleManageQuery(param ={}) {
    let cloneParam = _.cloneDeep(param), where = {sub_user_yn:'Y'}
    this.queryParamsNumberSetupBuilder(cloneParam, where, "role_type")
    const attributes = [
      'role_id',
      'role_name',
      'role_type',
      'sub_user_yn',
      'sys_yn',
      'remark',
      [sequelize.literal("DATE_FORMAT( rx_insertTime, '%Y-%m-%d %H:%i:%S' )"), 'rx_insertTime']
    ]
    return this.dao.findAndCountAll({
      attributes,
      where,
      order: [
        'sys_yn',
        'rx_insertTime'
      ]
    })
  }
}

//const user = new User('t_user');
module.exports = (info, accessList = []) => new Role('t_role', info, accessList);
