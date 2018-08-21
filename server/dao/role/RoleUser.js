const _ = require('lodash');
const sequelize = require('sequelize');

const {Op} = sequelize;
const Model = require('../super');
const {db, sequelizeDB} = require('../../schema/index');

// "roleManageUserSearch": "SELECT b.user_id,b.user_account,b.user_name,b.org_code,DATE_FORMAT(b.rx_insertTime,'%Y-%m-%d %H:%i:%S') as rx_insertTime from t_role_user a inner join t_user b on a.user_id=b.user_id where 1=1 and a.role_id=:?role_id  and b.user_account like :?user_account ORDER BY b.rx_insertTime",
// "roleManageUserAdd": "insert into t_role_user set id=:?id, role_id=:?role_id, user_id=:?user_id, create_user_id=:?create_user_id, rx_insertTime=now(), rx_updateTime=now()",
// "roleManageUserDelete": "delete from t_role_user where 1=1 and role_id=:?role_id and user_id=:?user_id",
// "userMenu":"select distinct * from (select c.func_id,c.f_func_id,c.func_name, c.func_img, c.func_level,c.func_path,c.page_id,c.sort_id from t_role_user a inner join t_role_func b on a.role_id=b.role_id inner join t_func c on b.func_id=c.func_id where a.user_id=:?user_id union all select c.func_id,c.f_func_id,c.func_name,c.func_img,c.func_level,c.func_path,c.page_id,c.sort_id from t_user_func a inner join t_func c on a.func_id=c.func_id where a.user_id=:?user_id) as t1 order by func_level,sort_id",
class RoleUser extends Model {
  userMenu(params = {}){
    return sequelizeDB.query(`
      SELECT DISTINCT
        *
      FROM
        (
        SELECT
          c.func_id,
          c.f_func_id,
          c.func_name,
          c.func_img,
          c.func_level,
          c.func_path,
          c.page_id,
          c.sort_id
        FROM
          t_role_user a
          INNER JOIN t_role_func b ON a.role_id = b.role_id
          INNER JOIN t_func c ON b.func_id = c.func_id
        ${_.isEmpty(params.user_id) ? "" : ` WHERE a.user_id ='${params.user_id}'`}
        UNION ALL
        SELECT
          c.func_id,
          c.f_func_id,
          c.func_name,
          c.func_img,
          c.func_level,
          c.func_path,
          c.page_id,
          c.sort_id
        FROM
          t_user_func a
          INNER JOIN t_func c ON a.func_id = c.func_id
        ${_.isEmpty(params.user_id) ? "" : ` WHERE a.user_id ='${params.user_id}' `}
        ) AS t1
      ORDER BY
        func_level,
        sort_id
    `,{ type: sequelize.QueryTypes.SELECT})
  }

  subuserMenu(params = {}){
    return sequelizeDB.query(`
      select 			
        x.func_id ,
        x.f_func_id ,
        x.func_name ,
        x.func_img ,
        x.func_level ,
        x.func_path ,
        x.page_id ,
        x.sort_id
      from t_sub_user as m
      inner join t_user_func as n 
      on m.sub_user_id = n.user_id
      inner join t_func as x
      on x.func_id = n.func_id
      inner join  (
          select c.func_id , a.user_id
          from t_role_user a
          inner join t_role_func b on a.role_id = b.role_id
          inner join t_func c on b.func_id = c.func_id
      
          union 
      
          select a.func_id  , a.user_id
          from  t_user_func a
                  ) as z 
      on m.user_id = z.user_id and n.func_id = z.func_id
      where
      ${_.isEmpty(params.sub_user_id)? " 1=2 ": ` m.sub_user_id = '${params.sub_user_id}'`}
      order by x.func_level ,
          x.sort_id ;
`,{ type: sequelize.QueryTypes.SELECT})
  }

  search(param = {}){
    const subAttributes = [
      "user_id","user_account","user_name","org_code",
    ]
    let cloneParam = _.cloneDeep(param), where = {}, includingWhere = {}
    this.queryParamsStringSetupBuilder(cloneParam, where, "role_id")
    this.queryParamsStringSetupBuilder(cloneParam, includingWhere, "user_account")
    return this.dao.findPlainAll({
      attributes:["rx_insertTime"],
      include: [
        {
          as:"t_user",
          model: this.db.t_user,
          attributes: subAttributes,
          where: includingWhere,
          required: true,
        },
      ],
      where
    });
  }

  add(param={}){
    return this.dao.create(param)
  }

  delete(param={}){
    return this.nativeDelete({where:param})
  }
}

//const user = new User('t_user');
module.exports = (info, accessList = []) => new RoleUser('t_role_user', info, accessList);
