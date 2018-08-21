const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { db, sequelizeDB } = require('../../schema/index');

// "roleManageFuncMainSearch": "SELECT f.func_id ,f.func_name,f.f_func_id,f.func_level,f.func_img, case ifnull((select func_id from t_role_func where func_id = f.func_id and role_id = :?role_id),'') when '' then '0' else '1' end as func_check FROM t_func f where 1=1 and f.func_level=0 and f.func_role_type=:?role_type order by f.sort_id",
// "roleManageFuncSubSearch": "SELECT f.func_id ,f.func_name,f.f_func_id,f.func_level,case ifnull((select  func_id from t_role_func where func_id = f.func_id and role_id = :?role_id),'') when '' then '0' else '1' end as func_check FROM t_func f where 1=1 and f.func_level != 0 order by f.sort_id",
class Func extends Model {
  mainSearch(param = {}) {
    return sequelizeDB.query(
      `
    SELECT
      f.func_id ,
      f.func_name,
      f.f_func_id,
      f.func_level,
      f.func_img,
      case ifnull((select func_id from t_role_func where func_id = f.func_id ${
  _.isEmpty(param.role_id) ? '' : `AND role_id = '${param.role_id}'`
}),'') when '' then '0' else '1' end as func_check
      FROM
        t_func f
      WHERE
        1=1 and f.func_level=0 ${
  _.isEmpty(param.role_type) && isNaN(param.role_type)
    ? ''
    : `AND f.func_role_type =  '${param.role_type}'`
}
    ORDER BY
      f.sort_id
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }
  subSearch(param = {}) {
    return sequelizeDB.query(
      `
    SELECT
      f.func_id ,
      f.func_name,
      f.f_func_id,
      f.func_level,
      case ifnull((select func_id from t_role_func where func_id = f.func_id ${
  _.isEmpty(param.role_id) ? '' : `AND role_id = '${param.role_id}'`
}),'') when '' then '0' else '1' end as func_check
      FROM t_func f
      WHERE f.func_level != 0
      ORDER BY f.sort_id
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  queryAllMenu() {
    return this.dao.findAll({
      order: ['func_level', 'sort_id'],
    });
  }
  queryMaxMenu(params = {}) {
    const { f_func_id } = params;
    const where = f_func_id ? { f_func_id } : {};
    const attributes = [[sequelize.fn('max', sequelize.col('sort_id')), 'max_sort_id']];

    return this.dao.find({
      attributes,
      where,
    });
  }

  queryChildMenu(params = {}) {
    const { func_id } = params;
    const where = func_id ? { f_func_id: func_id } : {};
    return this.dao.findAll({
      where,
      order: ['func_level', 'sort_id'],
    });
  }

  queryClosestUpMenu(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'f_func_id');
    if (_.isNumber(params.sort_id)) {
      where.sort_id = {
        [sequelize.Op.lt]: params.sort_id,
      };
    }
    return this.dao.find({
      where,
      order: [[['sort_id', 'DESC']]],
    });
  }
  queryClosestDownMenu(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'f_func_id');
    if (_.isNumber(params.sort_id)) {
      where.sort_id = {
        [sequelize.Op.gt]: params.sort_id,
      };
    }
    return this.dao.find({
      where,
      order: [[['sort_id', 'ASC']]],
    });
  }
}

module.exports = (info, accessList = []) => new Func('t_func', info, accessList);
