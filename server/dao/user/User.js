/*
 * File: User.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Mon Jun 25 2018
 * Modified By: zhangjunjie
 */

const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

// Query
// "login": "select user_id, user_type, user_from, org_code, user_status, user_account, user_name, user_full_name, rop_user_id, linkman, tel, mobile, email from t_user where 1=1 and user_account=:?user_account and password=:?password",
// "ediFeePatternCount": "SELECT count(*) as total FROM t_user AS a INNER JOIN t_user_attribute AS b ON a.user_id=b.user_id where 1=1 and a.user_type = :?user_type and a.org_code = :?org_code and (a.user_type='1' or a.user_type='2')",
// "ediFeePatternQuery": "SELECT a.user_id, a.user_type, a.user_name, b.platform_pay_mode, Round(b.platform_use_rate*100,3) as platform_use_rate, Round(b.adjust_platform_use_rate*100,3) as adjust_platform_use_rate, b.adjust_effect_month, b.platform_pay_scope FROM t_user AS a INNER JOIN t_user_attribute AS b ON a.user_id=b.user_id where 1=1 and a.user_type = :?user_type and a.org_code = :?org_code and (a.user_type='1' or a.user_type='2') ORDER BY a.user_type, a.org_code limit :?page_index,10",
// "userQuery": "select * from t_user where 1=1 and user_id=:?user_id",
// "userManageCount": "select count(*) as total from t_user where 1=1 and user_type=:?user_type and org_code=:?org_code and user_account like :?user_account and user_name like :?user_name",
// "userManageQuery": "select user_id, user_type, user_from, org_code, user_status, user_account, password, user_name, user_full_name, rop_user_id, linkman, tel, mobile, email, rx_insertTime, rx_updateTime from t_user where 1=1 and user_type=:?user_type and org_code=:?org_code and user_account like :?user_account and user_name like :?user_name order by user_type asc, org_code asc limit :?page_index,10",
// "userManagePreCount": "select count(*) as total from t_user where 1=1 and ( 1=2 or org_code=:?org_code or user_account=:?user_account or rop_user_id=:?rop_user_id )",
// "userManageUpdatePreCount": "select count(*) as total from t_user where 1=1 and user_id<>:?user_id and ( 1=2 or org_code=:?org_code or user_account=:?user_account or rop_user_id=:?rop_user_id )",
// "assetUserQuery": "select * from t_user where 1=1 and user_type=1",
// "reqDeadlineData":"SELECT a.org_code as asset_org_code , c.deadline_id , c.deadline_name , b.week_name , b.date AS plan_date , d.plan_fee FROM t_user AS a INNER JOIN t_date AS b ON 1 = 1 INNER JOIN t_deadline AS c ON 1 = 1 LEFT JOIN t_asset_deadline_day_plan AS d ON a.org_code = d.asset_org_code and b.date = d.plan_date and c.deadline_id = d.deadline_id where 1=1 and a.org_code =:?asset_org_code and b.`year` =:?year and b.`week` = :?week ORDER BY a.org_code , c.deadline_id , b.date;",
// "distriPlanAssetDeadlineDataHasFavor": "SELECT a.org_code AS asset_org_code, c.deadline_id, c.deadline_name, b.week_name, b.date AS plan_date, d.plan_fee FROM t_user AS a INNER JOIN t_date AS b ON 1 = 1 INNER JOIN ( SELECT '100' AS deadline_id, '无偏好' AS deadline_name ) AS c ON 1 = 1 LEFT JOIN t_asset_deadline_day_plan AS d ON a.org_code = d.asset_org_code AND b.date = d.plan_date AND c.deadline_id = d.deadline_id WHERE 1 = 1 AND a.org_code = :?asset_org_code AND b.`year` = :?year AND b.`week` = :?week ORDER BY a.org_code, c.deadline_id, b.date;",
// "distriPlanFundDeadlineDataHasFavor": "SELECT a.org_code AS fund_org_code, c.deadline_id, c.deadline_name, b.week_name, b.date AS plan_date, d.plan_fee FROM t_user AS a INNER JOIN t_date AS b ON 1 = 1 INNER JOIN (select '100' as deadline_id , '无偏好' as deadline_name)  AS c ON 1 = 1 LEFT JOIN t_fund_deadline_day_plan AS d ON a.org_code = d.fund_org_code AND b.date = d.plan_date AND c.deadline_id = d.deadline_id WHERE 1 = 1 AND a.org_code = :?fund_org_code AND b.`year` = :?year AND b.`week` = :?week ORDER BY a.org_code, c.deadline_id, b.date;",
// "colDeadlineGetData": "SELECT a.org_code as fund_org_code , c.deadline_id , c.deadline_name , b.week_name , b.date AS plan_date , d.plan_fee FROM t_user AS a INNER JOIN t_date AS b ON 1 = 1 INNER JOIN t_deadline AS c ON 1 = 1 LEFT JOIN t_fund_deadline_day_plan AS d ON a.org_code = d.fund_org_code and b.date = d.plan_date and c.deadline_id = d.deadline_id where 1=1 and a.org_code = :?fund_org_code and b.`year` = :?year and b.`week` = :?week ORDER BY a.org_code , c.deadline_id , b.date;",
// "roleManageUserAddSearch": "SELECT a.user_id,a.user_account,a.user_name,a.org_code,DATE_FORMAT(a.rx_insertTime,'%Y-%m-%d %H:%i:%S') as rx_insertTime from t_user a where 1=1 and a.user_id NOT IN ( SELECT user_id  from t_role_user where role_id=:?role_id ) and a.user_type in ( SELECT  role_type  from t_role where role_id=:?role_id) and a.user_account like :?user_account ORDER BY a.rx_insertTime",

// Update
// "userUpdate": "update t_user set user_name=:?user_name, tel=:!tel, mobile=:!mobile, email=:!email, password=:?password, linkman=:!linkman, rx_updateTime=now() where 1=1 and user_id=:?user_id and password=:?old_password",
// "userManageUpdate": "update t_user set user_type=:?user_type, org_code=:?org_code, user_account=:?user_account, password=:?password, user_name=:?user_name, user_full_name=:?user_full_name, rop_user_id=:?rop_user_id, linkman=:!linkman, tel=:!tel, mobile=:!mobile, email=:!email, rx_updateTime=now() where 1=1 and user_id=:?user_id",

// Crete
// "userManageCreate": "INSERT INTO t_user set user_id = :?user_id, user_type=:?user_type, user_from=:?user_from, org_code=:?org_code, user_status=1, user_account=:?user_account, password=:?password, user_name=:?user_name, user_full_name=:?user_full_name, rop_user_id=:?rop_user_id, linkman=:?linkman, tel=:?tel, mobile=:?mobile, email=:?email, rx_insertTime=now(), rx_updateTime=now()",

// Delete
// "userManageDelete": "DELETE FROM t_user where 1=1 and user_id=:?user_id",

class User extends Model {
  manageQueryBuilder(params, where) {
    if (_.isNumber(params.user_type)) {
      _.assign(where, {
        user_type: params.user_type,
      });
    }
    if (!_.isEmpty(params.org_code)) {
      _.assign(where, {
        org_code: params.org_code,
      });
    }
    if (!_.isEmpty(params.user_account)) {
      _.assign(where, {
        user_account: { [Op.like]: `%${params.user_account}%` },
      });
    }
    if (!_.isEmpty(params.user_name)) {
      _.assign(where, {
        user_name: { [Op.like]: `%${params.user_name}%` },
      });
    }
    return where;
  }

  login(params = {}) {
    let where = {};
    this.queryParamsStringSetupBuilder(params, where, 'user_account');
    this.queryParamsStringSetupBuilder(params, where, 'password');
    const attributes = [
      'user_id',
      'user_type',
      'user_from',
      'org_code',
      'user_status',
      'user_account',
      'user_name',
      'user_full_name',
      'rop_user_id',
      'linkman',
      'tel',
      'mobile',
      'email',
    ];
    return this.dao.find({
      attributes,
      where,
    });
  }

  freePatternCount(param = {}) {
    return this.dao.count({
      include: [
        {
          model: this.db.t_user_attribute,
          required: true,
        },
      ],
      where: {
        ...param,
        [Op.and]: {
          user_type: {
            [Op.or]: [1, 2],
          },
        },
      },
      // subQuery: true,
    });
  }

  freePatternQuery(param = {}, page_index = 0) {
    const attributes = ['user_id', 'user_type', 'user_name', 'org_code'];
    const includingAttributes = [
      'platform_use_rate',
      'adjust_platform_use_rate',
      'adjust_effect_month',
      'platform_pay_scope',
    ];
    return this.dao.findAll({
      attributes,
      include: [
        {
          model: this.db.t_user_attribute,
          attributes: includingAttributes,
          required: true,
        },
      ],
      where: {
        ...param,
        [Op.and]: {
          user_type: {
            [Op.or]: [1, 2],
          },
        },
      },
      order: ['user_type', 'org_code'],
      offset: page_index,
      limit: 10,
      // subQuery: true,
    });
  }

  manageCount(params = {}) {
    const where = {};
    _.assign(where, this.manageQueryBuilder(params, where));
    return this.dao.count({
      where,
    });
  }

  manageQuery(params = {}, page_index = 0) {
    const where = {};
    _.assign(where, this.manageQueryBuilder(params, where));
    return this.dao.findAndCountAll({
      where,
      order: [['user_type', 'ASC'], ['org_code', 'ASC']],
      offset: page_index,
      limit: 10,
    });
  }

  managePreCount(params = {}) {
    const where = {};
    const or = [];
    if (!_.isEmpty(params.org_code)) {
      or.push({ org_code: params.org_code });
    }
    if (!_.isEmpty(params.user_account)) {
      or.push({ user_account: params.user_account });
    }
    if (!_.isEmpty(params.rop_user_id)) {
      or.push({ rop_user_id: params.rop_user_id });
    }
    if (!_.isEmpty(params.user_id)) {
      _.assign(where, {
        user_id: { [Op.ne]: params.user_id },
      });
    }
    or.length > 1 ? (where[Op.or] = or) : or.map((o) => _.assign(where, o));
    return this.dao.count({
      where,
    });
  }

  manageUpdate(values = {}, condition = {}) {
    return this.dao.update(values, {
      where: {
        user_id: condition.user_id,
        password: condition.old_password,
      },
    });
  }

  manageDelete(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'user_id');
    return this.dao.destroy({
      where,
    });
  }

  // FIXME
  // merge with managePreCount
  manageUpdatePreCount(params = {}, condition = {}) {
    return this.manageCount(params, condition);
  }

  assetUserQuery() {
    return this.dao.findAll({
      where: {
        user_type: 1,
      },
    });
  }

  reqDeadlineGetData(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      a.org_code AS asset_org_code,
      c.deadline_id,
      c.deadline_name,
      b.week_name,
      b.date AS plan_date,
      d.plan_fee
    FROM
      t_user AS a
      INNER JOIN t_date AS b ON 1 = 1
      INNER JOIN t_deadline AS c ON 1 = 1
      LEFT JOIN t_asset_deadline_day_plan AS d ON a.org_code = d.asset_org_code
      AND b.date = d.plan_date
      AND c.deadline_id = d.deadline_id
    WHERE
      1 = 1
      ${
        _.isEmpty(params.asset_org_code)
          ? ''
          : `AND a.org_code = '${params.asset_org_code}'`
      }
      ${_.isEmpty(params.year) ? '' : `AND b.year = '${params.year}'`}
      ${_.isEmpty(params.week) ? '' : `AND b.week = '${params.week}'`}
    ORDER BY
      a.org_code,
      c.deadline_id,
      b.date;
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  distriPlanAssetDeadlineDataHasFavor(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      a.org_code AS asset_org_code,
      c.deadline_id,
      c.deadline_name,
      b.week_name,
      b.date AS plan_date,
      d.plan_fee
    FROM
      t_user AS a
      INNER JOIN t_date AS b ON 1 = 1
      INNER JOIN ( SELECT '100' AS deadline_id, '无偏好' AS deadline_name ) AS c ON 1 = 1
      LEFT JOIN t_asset_deadline_day_plan AS d ON a.org_code = d.asset_org_code
      AND b.date = d.plan_date
      AND c.deadline_id = d.deadline_id
    WHERE
      1 = 1
      ${
        _.isEmpty(params.asset_org_code)
          ? ''
          : `AND a.org_code = '${params.asset_org_code}'`
      }
      ${_.isEmpty(params.year) ? '' : `AND b.year = '${params.year}'`}
      ${_.isEmpty(params.week) ? '' : `AND b.week = '${params.week}'`}
    ORDER BY
      a.org_code,
      c.deadline_id,
      b.date;
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  distriPlanFundDeadlineDataHasFavor(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      a.org_code AS fund_org_code,
      c.deadline_id,
      c.deadline_name,
      b.week_name,
      b.date AS plan_date,
      d.plan_fee
    FROM
      t_user AS a
      INNER JOIN t_date AS b ON 1 = 1
      INNER JOIN ( SELECT '100' AS deadline_id, '无偏好' AS deadline_name ) AS c ON 1 = 1
      LEFT JOIN t_fund_deadline_day_plan AS d ON a.org_code = d.fund_org_code
      AND b.date = d.plan_date
      AND c.deadline_id = d.deadline_id
    WHERE
      1 = 1
      ${
        _.isEmpty(params.fund_org_code)
          ? ''
          : `AND a.org_code =  '${params.fund_org_code}'`
      }
      ${_.isEmpty(params.year) ? '' : `AND b.year =  '${params.year}'`}
      ${_.isEmpty(params.week) ? '' : `AND b.week =  '${params.week}'`}
    ORDER BY
      a.org_code,
      c.deadline_id,
      b.date;

    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  colDeadlineGetData(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      a.org_code AS fund_org_code,
      c.deadline_id,
      c.deadline_name,
      b.week_name,
      b.date AS plan_date,
      d.plan_fee
    FROM
      t_user AS a
      INNER JOIN t_date AS b ON 1 = 1
      INNER JOIN t_deadline AS c ON 1 = 1
      LEFT JOIN t_fund_deadline_day_plan AS d ON a.org_code = d.fund_org_code
      AND b.date = d.plan_date
      AND c.deadline_id = d.deadline_id
    WHERE
      1 = 1
      ${
        _.isEmpty(params.fund_org_code)
          ? ''
          : `AND a.org_code =  '${params.fund_org_code}'`
      }
      ${_.isEmpty(params.year) ? '' : `AND b.year = '${params.year}'`}
      ${_.isEmpty(params.week) ? '' : `AND b.week = '${params.week}'`}
    ORDER BY
      a.org_code,
      c.deadline_id,
      b.date;
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  roleUserAddSearch(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      a.user_id,
      a.user_account,
      a.user_name,
      a.org_code,
      DATE_FORMAT(a.rx_insertTime,'%Y-%m-%d %H:%i:%S') as rx_insertTime
    FROM
      t_user a
    WHERE
      a.user_id NOT IN ( SELECT user_id  from t_role_user ${
        _.isEmpty(params.role_id) ? '' : `where role_id='${params.role_id}'`
      })
      AND a.user_type in ( SELECT  role_type  from t_role ${
        _.isEmpty(params.role_id) ? '' : `where role_id='${params.role_id}'`
      })
      ${
        _.isEmpty(params.user_account)
          ? ''
          : `AND a.user_account like '%${params.user_account}%'`
      }
    ORDER BY
      a.rx_insertTime
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  userSearchByUserFullName(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'user_full_name');
    this.queryParamsNumberSetupBuilder(params, where, 'user_type');
    return this.nativeQuerySingle({
      where: {
        ...where,
        user_from: 2,
      },
    });
  }
  maxOrgCodeSearchByUserType(params = {}) {
    const attributes = [
      [sequelize.fn('max', sequelize.col('org_code')), 'max_org_code'],
    ];
    const where = {};
    this.queryParamsNumberSetupBuilder(params, where, 'user_type');
    return this.nativeQuerySingle({
      attributes,
      where: {
        ...where,
        user_from: 2,
      },
    });
  }

  notAddRelationAssetOrgQuery(params = {}) {
    const { org_code } = params;
    return sequelizeDB.query(
      `
      SELECT
        *
      FROM
        t_user
      WHERE
        1 = 1
        AND user_type = 1
        AND org_code NOT IN ( SELECT asset_org_code FROM t_asset_fund WHERE 1 = 1 ${
          org_code ? `AND fund_org_code = '${org_code}'` : ''
        })
      ORDER BY
        org_code
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  notAddRelationFundOrgQuery(params = {}) {
    const { org_code } = params;
    return sequelizeDB.query(
      `
      SELECT
        *
      FROM
        t_user
      WHERE
        1 = 1
        AND user_type = 2
        AND org_code NOT IN ( SELECT fund_org_code FROM t_asset_fund WHERE 1 = 1 ${
          org_code ? `AND asset_org_code = '${org_code}'` : ''
        } )
      ORDER BY
        org_code
      `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  addedRelationAssetOrgQuery(params = {}) {
    const { org_code } = params;
    return sequelizeDB.query(
      `
      SELECT
        *
      FROM
        t_user
      WHERE
        1 = 1
        AND user_type = 1
        AND org_code IN ( SELECT asset_org_code FROM t_asset_fund WHERE 1 = 1 ${
          org_code ? `AND fund_org_code = '${org_code}'` : ''
        } )
      ORDER BY
        org_code
	      `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  addedRelationFundOrgQuery(params = {}) {
    const { org_code } = params;
    return sequelizeDB.query(
      `
      SELECT
        *
      FROM
        t_user
      WHERE
        1 = 1
        AND user_type = 2
        AND org_code IN ( SELECT fund_org_code FROM t_asset_fund WHERE 1 = 1 ${
          org_code ? `AND asset_org_code = '${org_code}'` : ''
        } )
      ORDER BY
        org_code
      `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  ediFeePatternCount(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'user_type');
    this.queryParamsStringSetupBuilder(params, where, 'org_code');
    where[Op.or] = [{ user_type: '1' }, { user_type: '2' }];
    return this.dao.count({
      attributes: [],
      where,
      include: {
        attributes: [],
        model: this.db.t_user_attribute,
        required: true
      }
    })
  }
  ediFeePatternQuery(params = {}) {
    const attributes = [
      'user_id',
      'user_type',
      'user_name',
      [sequelize.col('`t_user_attribute`.`platform_pay_mode`'), 'platform_pay_mode'],
      [sequelize.col('`t_user_attribute`.`adjust_effect_month`'), 'adjust_effect_month'],
      [sequelize.col('`t_user_attribute`.`platform_pay_scope`'), 'platform_pay_scope'],
      [sequelize.literal('Round( `t_user_attribute`.`platform_use_rate` * 100, 3 )'), 'platform_use_rate'],
      [sequelize.literal('Round( `t_user_attribute`.`adjust_platform_use_rate` * 100, 3 )'), 'adjust_platform_use_rate']
    ]
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'user_type');
    this.queryParamsStringSetupBuilder(params, where, 'org_code');
    where[Op.or] = [{ user_type: '1' }, { user_type: '2' }];
    return this.dao.findAll({
      attributes,
      where,
      include: {
        attributes: [],
        model: this.db.t_user_attribute,
        as: 't_user_attribute',
        required: true
      },
      order: [
        'user_type',
        'org_code'
      ],
      offset: params.page_index || 0,
      limit: 10,
      raw: true
    })
  }
}

// const user = new User('t_user');
module.exports = (info, accessList = []) =>
  new User('t_user', info, accessList);
