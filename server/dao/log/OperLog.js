const _ = require('lodash');
const sequelize = require('sequelize');
const Model = require('../super');
const { db, sequelizeDB } = require('../../schema/index');

// "operLog": "select DATE_FORMAT(o.oper_time, '%Y-%m-%d %H:%i:%s') as oper_time, dic.para_value as org_code, u.user_name as user_name, o.oper_log FROM t_oper_log as o left join t_user as u on o.create_user_id=u.user_id LEFT JOIN t_sys_para_info AS dic ON o.from_org_code=dic.para_key where 1=1 and from_table_key=:?product_no ORDER BY o.oper_time DESC limit :?page_index,10",
// "operLogCount": "select count(*) as total from t_oper_log where 1=1 and from_table_key=:?product_no",
// "operLogUpdate": "INSERT INTO t_oper_log set from_table=:?from_table, from_table_key=:?from_table_key, from_org_code=:?from_org_code, create_user_id=:?create_user_id, sub_user_id=:?sub_user_id, action_type=:?action_type, oper_log=:?oper_log, oper_time=now(), rx_insertTime=now(), rx_updateTime=now()",
// "operLogSearch": "select DATE_FORMAT(o.oper_time, '%Y-%m-%d %H:%i:%s') as oper_time, dic.para_value as org_code, u.user_name as user_name, o.oper_log, o.action_type FROM t_oper_log as o left join t_user as u on o.create_user_id=u.user_id LEFT JOIN t_sys_para_info AS dic ON o.from_org_code=dic.para_key where 1=1 and from_table=:?from_table and from_table_key=:?from_table_key ORDER BY o.oper_time DESC ",
// "matchFee": "select match_date,format(match_fee/100,2) as match_fee, DATE_FORMAT(rx_insertTime, '%Y-%m-%d %H:%i:%s') as rx_insertTime,DATE_FORMAT(rx_updateTime, '%Y-%m-%d %H:%i:%s') as rx_updateTime FROM t_fund_match_fee where 1=1 and product_no=:?product_no ORDER BY match_date DESC limit :?page_index,10",
// "matchFeeCount": "select count(*) as total from t_fund_match_fee where 1=1 and product_no=:?product_no",

class OperLog extends Model {
  // query(params = {}, page_index = 0) {
  //   const attributes = [
  //     [
  //       s.fn('DATE_FORMAT', s.col('oper_time'), '%Y-%m-%d %H:%i:%s'),
  //       'oper_time',
  //     ],
  //     [s.col('t_sys_para_info.para_value'), 'org_code'],
  //     [s.col('t_user.user_name'), 'user_name'],
  //     'oper_log',
  //   ];
  //   const where = {};
  //   this.queryParamsStringSetupBuilder(
  //     params,
  //     where,
  //     'from_table_key',
  //     'product_no'
  //   );
  //   return this.dao.findAll({
  //     include: [
  //       { model: db.t_user, required: true, attributes: [] },
  //       { model: db.t_sys_para_info, required: true, attributes: [] },
  //     ],
  //     attributes,
  //     where,
  //     order: [['oper_time', 'DESC']],
  //     limit: 10,
  //     offset: page_index,
  //   });
  // }
  query(params = {}, page_index = 0) {
    return sequelizeDB.query(`
    SELECT
      DATE_FORMAT( o.oper_time, '%Y-%m-%d %H:%i:%s' ) AS oper_time,
      dic.para_value AS org_code,
      u.user_name AS user_name,
      o.oper_log
    FROM
      t_oper_log AS o
      LEFT JOIN t_user AS u ON o.create_user_id = u.user_id
      LEFT JOIN t_sys_para_info AS dic ON o.from_org_code = dic.para_key
    WHERE
      1 = 1
      ${_.isEmpty(params.product_no) ? '' : `AND from_table_key = '${product_no}' `}

    ORDER BY
      o.oper_time DESC
      LIMIT ${page_index},
      10
    `);
  }

  search(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      DATE_FORMAT( o.oper_time, '%Y-%m-%d %H:%i:%s' ) AS oper_time,
      dic.para_value AS org_code,
      u.user_name AS user_name,
      o.oper_log,
      o.action_type
    FROM
      t_oper_log AS o
      LEFT JOIN t_user AS u ON o.create_user_id = u.user_id
      LEFT JOIN t_sys_para_info AS dic ON o.from_org_code = dic.para_key
    WHERE
      1 = 1
      ${_.isEmpty(params.from_table) ? '' : `AND from_table ='${params.from_table}'`}
      ${_.isEmpty(params.from_table_key) ? '' : `AND from_table_key = '${params.from_table_key}'`}
    ORDER BY
      o.oper_time DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  operLogModalCount(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'from_table');
    this.queryParamsStringSetupBuilder(params, where, 'from_table_key');
    return this.nativeQuery({
      attributes: [[sequelize.literal('count(*)'), 'total']],
      where,
    });
  }

  operLogModalQuery(params = {}, page_index = 0) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'from_table');
    this.queryParamsStringSetupBuilder(params, where, 'from_table_key');
    this.queryParamsStringSetupBuilder(params, where, 'action_type');

    const attributes = [
      [
        sequelize.fn(
          'ifnull',
          sequelize.col('sub_user.user_name'),
          sequelize.col('t_user.user_name'),
        ),
        'user_name',
      ],
      ['oper_log', 'oper_log'],
      [
        sequelize.literal("DATE_FORMAT( t_oper_log.rx_insertTime, '%Y-%m-%d %H:%i:%S' )"),
        'oper_time',
      ],
    ];
    return this.dao.findAndCountAll({
      raw: true,
      attributes,
      include: [
        {
          attributes: [],
          model: db.t_user,
        },
        {
          attributes: [],
          model: db.t_user,
          as: 'sub_user',
        },
      ],
      where,
      order: [[sequelize.col('t_oper_log.rx_insertTime'), 'DESC']],
      offset: page_index,
      limit: 10,
    });
  }

  operLogModalCombinedQuery(params = [], page_index = 0) {
    const query = (param)=>{
      const where = {};
      this.queryParamsStringSetupBuilder(param, where, 'from_table', "table_name");
      this.queryParamsStringSetupBuilder(param, where, 'from_table_key', "table_key");
      this.queryParamsStringSetupBuilder(param, where, 'action_type');
      const attributes = [
        [
          sequelize.fn(
            'ifnull',
            sequelize.col('sub_user.user_name'),
            sequelize.col('t_user.user_name'),
          ),
          'user_name',
        ],
        ['oper_log', 'oper_log'],
        [
          sequelize.literal("DATE_FORMAT( t_oper_log.rx_insertTime, '%Y-%m-%d %H:%i:%S' )"),
          'oper_time',
        ],

      ];
      return this.dao.findAndCountAll({
        raw: true,
        attributes,
        include: [
          {
            attributes: [],
            model: db.t_user,
          },
          {
            attributes: [],
            model: db.t_user,
            as: 'sub_user',
          },
        ],
        where,
        order: [[sequelize.col('t_oper_log.rx_insertTime'), 'DESC']],
      });
    }

    return Promise.all(params.map(r=>query(r))).then((results)=>{
      var result =  {
        rows: [].concat.apply([],results.map(s=>s.rows)).sort((a,b)=>(new Date(b.oper_time) - new Date(a.oper_time))).splice(page_index,10),
        count: results.reduce((total, r)=>{
          return (total.count + r.count)
        })
      }
      return result
    })
  }
}

// const operLog = new OperLog('t_oper_log');
module.exports = (info, accessList = []) => new OperLog('t_oper_log', info, accessList);
