const _ = require('lodash');
const sequelize = require('sequelize');

const Model = require('../super');
const {db, sequelizeDB} = require('../../schema/index');

// "userFuncQuery": "select func_id from t_user_func where 1=1 and user_id=:?user_id",
// "userFuncDelete": "delete from t_user_func where 1=1 and user_id=:?user_id",
// "userFuncCreate": "insert into t_user_func set id=:?id, user_id=:?user_id, func_id=:?func_id, func_flag=:?func_flag, use_yn=:?use_yn, create_user_id=:?create_user_id, rx_insertTime=now(), rx_updateTime=now()",

class UserFunc extends Model {
  mainUserMenusSearch(params = {}){
    const {user_id} = params
    return sequelizeDB.query(`
      SELECT DISTINCT
        *
      FROM
        (
        SELECT
          a.func_id,
          b.func_name,
          b.f_func_id,
          b.func_level,
          b.sort_id 
        FROM
          t_user_func a
          LEFT JOIN t_func b ON a.func_id = b.func_id 
          ${_.isEmpty(user_id) ? "" : ` WHERE a.user_id ='${user_id}' `}
        UNION
        SELECT
          a.func_id,
          b.func_name,
          b.f_func_id,
          b.func_level,
          b.sort_id 
        FROM
          t_role_func as a
          LEFT JOIN t_func b ON a.func_id = b.func_id
          LEFT JOIN t_role_user c ON a.role_id = c.role_id 
          ${_.isEmpty(user_id) ? "" : ` WHERE c.user_id ='${user_id}' `}
        ) AS aa
      ORDER BY
        aa.func_level,
        aa.sort_id
    `,{ type: sequelize.QueryTypes.SELECT})
  }
}

module.exports = (info, accessList = []) => new UserFunc('t_user_func', info, accessList);
