const _ = require('lodash');
const sequelize = require('sequelize');

const {Op} = sequelize;
const Model = require('../super');
const {db, sequelizeDB} = require('../../schema/index');

//"roleManageFuncDelete": "delete from t_role_func where 1=1 and role_id=:?role_id",
//"roleManageFuncCreate": "insert into t_role_func set id=:?id, role_id=:?role_id, func_id=:?func_id, create_user_id=:?create_user_id, rx_insertTime=now(), rx_updateTime=now()",
class RoleFunc extends Model {
  delete(param={}){
    return this.nativeDelete({where:param})
  }
  add(param={}){
    return this.dao.create(param)
  }
}

//const user = new User('t_user');
module.exports = (info, accessList = []) => new RoleFunc('t_role_func', info, accessList);
