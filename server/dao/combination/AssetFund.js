/*
 * File: AssetFund.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Thu Jun 07 2018
 * Modified By: Osborn
 */

const _ = require('lodash');
const sequelize = require('sequelize');
const Model = require('../super');
const { db, sequelizeDB } = require('../../schema/index');

// "relatedOrgs": "select distinct a.asset_org_code, a.borrow_agreements_url, a.cooperative_agreements_url, a.due_diligence_url, a.fund_day_raise_fee, a.fund_org_code, a.fund_stock_fee, a.guarantee_url, a.interest_mode, a.is_check_stock, a.match_desc, a.other_agreements_url, a.priority, a.rx_insertTime, a.rx_updateTime, a.service_mode, a.stock_day_count, a.total_rate, b.user_from asset_user_from, c.user_from fund_user_from from t_asset_fund a left join t_user b on b.org_code=a.asset_org_code left join t_user c on c.org_code=a.fund_org_code where 1=1 and a.asset_org_code=:?org_code or a.fund_org_code=:?org_code",
// "reqGetData": "SELECT a.asset_org_code , a.fund_org_code , b.week_name , b.date AS plan_date , c.plan_fee FROM t_asset_fund AS a INNER JOIN t_date AS b ON 1 = 1 LEFT JOIN t_asset_day_plan AS c ON a.asset_org_code = c.asset_org_code and a.fund_org_code = c.fund_org_code and b.date = c.plan_date where 1=1 and a.asset_org_code =:?asset_org_code and b.`year` =:?year and b.`week` =:?week ORDER BY a.asset_org_code , a.fund_org_code , b.date;",
// "colGetData": "SELECT a.fund_org_code , a.asset_org_code , b.week_name , b.date AS plan_date , c.plan_fee FROM t_asset_fund AS a INNER JOIN t_date AS b ON 1 = 1 LEFT JOIN t_fund_day_plan AS c ON a.asset_org_code = c.asset_org_code and a.fund_org_code = c.fund_org_code and b.date = c.plan_date where 1=1 and a.fund_org_code = :?fund_org_code and b.`year` = :?year and b.`week` = :?week ORDER BY a.fund_org_code , a.asset_org_code , b.date;",
// "cooperatorInfoSupplyment":"call p_asset_fund_data_init();",

class AssetFund extends Model {
  relatedOrgs(params = {}) {
    const query = `
    SELECT DISTINCT
      a.asset_org_code,
      a.borrow_agreements_url,
      a.cooperative_agreements_url,
      a.due_diligence_url,
      a.fund_day_raise_fee,
      a.fund_org_code,
      a.fund_stock_fee,
      a.guarantee_url,
      a.interest_mode,
      a.is_check_stock,
      a.match_desc,
      a.other_agreements_url,
      a.priority,
      a.rx_insertTime,
      a.rx_updateTime,
      a.service_mode,
      a.stock_day_count,
      a.total_rate,
      b.user_from asset_user_from,
      c.user_from fund_user_from
    FROM
      t_asset_fund a
      LEFT JOIN t_user b ON b.org_code = a.asset_org_code
      LEFT JOIN t_user c ON c.org_code = a.fund_org_code
    ${
  _.isEmpty(params.org_code)
    ? ''
    : `
    WHERE
      a.asset_org_code = '${params.org_code}'
      OR a.fund_org_code = '${params.org_code}'
      `
}
    `;
    return sequelizeDB.query(query, { type: sequelize.QueryTypes.SELECT });
  }
  reqGetData(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      a.asset_org_code,
      a.fund_org_code,
      b.week_name,
      b.date AS plan_date,
      c.plan_fee
    FROM
      t_asset_fund AS a
      INNER JOIN t_user AS u ON u.org_code = a.fund_org_code
      INNER JOIN t_date AS b ON 1 = 1
      LEFT JOIN t_asset_day_plan AS c ON a.asset_org_code = c.asset_org_code
      AND a.fund_org_code = c.fund_org_code
      AND b.date = c.plan_date
    WHERE
      1 = 1
      ${_.isEmpty(params.asset_org_code) ? '' : `AND a.asset_org_code ='${params.asset_org_code}'`}
      ${_.isEmpty(params.year) ? '' : `AND b.year = '${params.year}'`}
      ${_.isEmpty(params.week) ? '' : `AND b.week = '${params.week}'`}
      AND u.user_from = '1'
    ORDER BY
      a.asset_org_code,
      a.fund_org_code,
      b.date;
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }
  colGetData(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      a.fund_org_code,
      a.asset_org_code,
      b.week_name,
      b.date AS plan_date,
      c.plan_fee
    FROM
      t_asset_fund AS a
      INNER JOIN t_user AS u ON u.org_code = a.asset_org_code
      INNER JOIN t_date AS b ON 1 = 1
      LEFT JOIN t_fund_day_plan AS c ON a.asset_org_code = c.asset_org_code
      AND a.fund_org_code = c.fund_org_code
      AND b.date = c.plan_date
    WHERE
      1 = 1
      ${_.isEmpty(params.fund_org_code) ? '' : `AND a.fund_org_code = '${params.fund_org_code}'`}
      ${_.isEmpty(params.year) ? '' : `AND b.year = '${params.year}'`}
      ${_.isEmpty(params.week) ? '' : `AND b.week = '${params.week}'`}
      AND u.user_from = '1'
    ORDER BY
      a.fund_org_code,
      a.asset_org_code,
      b.date;
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }
  // FIXME
  // reqInsertData(values = {}, options = {}){
  //   // logic bubble
  // }

  // "settleMethodSearch":"select  a.asset_org_code, a.fund_org_code, b.user_full_name as fund_user_full_name, b.user_from as fund_user_from, c.user_full_name as asset_user_full_name, c.user_from as asset_user_from, total_rate, interest_mode, service_mode, due_diligence_url, cooperative_agreements_url, guarantee_url, borrow_agreements_url, other_agreements_url from t_asset_fund as a inner join t_user as b on a.fund_org_code = b.org_code inner join t_user as c on a.asset_org_code = c.org_code where 1=1 and a.fund_org_code = :?fund_org_code and a.asset_org_code = :?asset_org_code;",
  settleMethodSearch(param = {}) {
    const attributes = [
      'asset_org_code',
      'fund_org_code',
      [sequelize.col('fund_user.user_full_name'), 'fund_user_full_name'],
      [sequelize.col('fund_user.user_from'), 'fund_user_from'],
      [sequelize.col('asset_user.user_full_name'), 'asset_user_full_name'],
      [sequelize.col('asset_user.user_from'), 'asset_user_from'],
      'total_rate',
      'interest_mode',
      'service_mode',
      'due_diligence_url',
      'cooperative_agreements_url',
      'guarantee_url',
      'borrow_agreements_url',
      'other_agreements_url',
    ];

    let clonedParam = _.cloneDeep(param),
      where = {};
    this.queryParamsStringSetupBuilder(clonedParam, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(clonedParam, where, 'asset_org_code');
    return this.dao.findAll({
      attributes,
      include: [
        {
          model: this.db.t_user,
          as: 'fund_user',
          attributes: [],
          required: true,
        },
        {
          model: this.db.t_user,
          as: 'asset_user',
          attributes: [],
          required: true,
        },
      ],
      where,
      // subQuery: true,
    });
  }

  settleMethodFindOne(param = {}) {
    const attributes = [
      'asset_org_code',
      'fund_org_code',
      [sequelize.col('fund_user.user_full_name'), 'fund_user_full_name'],
      [sequelize.col('fund_user.user_from'), 'fund_user_from'],
      [sequelize.col('asset_user.user_full_name'), 'asset_user_full_name'],
      [sequelize.col('asset_user.user_from'), 'asset_user_from'],
      'total_rate',
      'interest_mode',
      'service_mode',
      'due_diligence_url',
      'cooperative_agreements_url',
      'guarantee_url',
      'borrow_agreements_url',
      'other_agreements_url',
    ];

    let clonedParam = _.cloneDeep(param),
      where = {};
    this.queryParamsStringSetupBuilder(clonedParam, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(clonedParam, where, 'asset_org_code');
    return this.dao.find({
      attributes,
      include: [
        {
          model: this.db.t_user,
          as: 'fund_user',
          attributes: [],
          required: true,
        },
        {
          model: this.db.t_user,
          as: 'asset_user',
          attributes: [],
          required: true,
        },
      ],
      where,
      // subQuery: true,
    });
  }

  // "settleMethodUpdate":"update t_asset_fund set total_rate = :?total_rate, interest_mode = :?interest_mode, service_mode = :?service_mode, due_diligence_url = :?due_diligence_url, cooperative_agreements_url = :?cooperative_agreements_url, guarantee_url = :?guarantee_url, borrow_agreements_url = :?borrow_agreements_url, other_agreements_url = :?other_agreements_url, rx_updateTime = now() where 1=1 and fund_org_code =:?fund_org_code and asset_org_code = :?asset_org_code;",
  settleMethodUpdate(params = {}, condition = {}) {
    let clonedCondition = _.cloneDeep(condition),
      where = {};
    this.queryParamsStringSetupBuilder(clonedCondition, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(clonedCondition, where, 'asset_org_code');
    return this.dao.update(params, { where });
  }

  queryAndCountAllInfo(params = {}, pageIndex = 0) {
    const { order_column } = params;
    const attributes = [
      ['asset_org_code', 'asset_org_code'],
      ['fund_org_code', 'fund_org_code'],
      [sequelize.col('fund_user.user_id'), 'fund_user_id'],
      [sequelize.col('asset_user.user_id'), 'asset_user_id'],
      [sequelize.col('fund_user.user_name'), 'fund_user_name'],
      [sequelize.col('fund_user.user_full_name'), 'fund_user_full_name'],
      [sequelize.col('fund_user.user_from'), 'fund_user_from'],
      [sequelize.col('fund_user.linkman'), 'fund_linkman'],
      [sequelize.col('fund_user.mobile'), 'fund_mobile'],
      [sequelize.col('fund_user.email'), 'fund_email'],
      [sequelize.col('asset_user.user_name'), 'asset_user_name'],
      [sequelize.col('asset_user.user_full_name'), 'asset_user_full_name'],
      [sequelize.col('asset_user.user_from'), 'asset_user_from'],
      [sequelize.col('asset_user.linkman'), 'asset_linkman'],
      [sequelize.col('asset_user.mobile'), 'asset_mobile'],
      [sequelize.col('asset_user.email'), 'asset_email'],
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    const order = [];
    if (order_column) {
      order.push(order_column);
    }
    return this.dao.findAndCountAll({
      attributes,
      include: [
        {
          model: db.t_user,
          attributes: [],
          as: 'fund_user',
          required: true,
        },
        {
          model: db.t_user,
          attributes: [],
          as: 'asset_user',
          required: true,
        },
      ],
      where,
      order,
      offset: pageIndex,
      limit: 10,
    });
  }
  queryInfo(params = {}) {
    const { page_index, order_column } = params;
    const attributes = [
      ['asset_org_code', 'asset_org_code'],
      ['fund_org_code', 'fund_org_code'],
      [sequelize.col('fund_user.user_id'), 'user_id'],
      [sequelize.col('fund_user.user_name'), 'fund_user_name'],
      [sequelize.col('fund_user.user_full_name'), 'fund_user_full_name'],
      [sequelize.col('fund_user.user_from'), 'fund_user_from'],
      [sequelize.col('fund_user.linkman'), 'fund_linkman'],
      [sequelize.col('fund_user.mobile'), 'fund_mobile'],
      [sequelize.col('fund_user.email'), 'fund_email'],
      [sequelize.col('asset_user.user_name'), 'asset_user_name'],
      [sequelize.col('asset_user.user_full_name'), 'asset_user_full_name'],
      [sequelize.col('asset_user.user_from'), 'asset_user_from'],
      [sequelize.col('asset_user.linkman'), 'asset_linkman'],
      [sequelize.col('asset_user.mobile'), 'asset_mobile'],
      [sequelize.col('asset_user.email'), 'asset_email'],
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    const order = [];
    if (order_column) {
      order.push(order_column);
    }
    return this.dao.findAll({
      attributes,
      include: [
        {
          model: db.t_user,
          attributes: [],
          as: 'fund_user',
          required: true,
        },
        {
          model: db.t_user,
          attributes: [],
          as: 'asset_user',
          required: true,
        },
      ],
      where,
      order,
      offset: page_index,
      limit: 10,
    });
  }

  querySingleInfo(params = {}) {
    const attributes = [
      ['asset_org_code', 'asset_org_code'],
      ['fund_org_code', 'fund_org_code'],
      [sequelize.col('fund_user.user_id'), 'user_id'],
      [sequelize.col('fund_user.user_name'), 'fund_user_name'],
      [sequelize.col('fund_user.user_full_name'), 'fund_user_full_name'],
      [sequelize.col('fund_user.user_from'), 'fund_user_from'],
      [sequelize.col('fund_user.linkman'), 'fund_linkman'],
      [sequelize.col('fund_user.mobile'), 'fund_mobile'],
      [sequelize.col('fund_user.email'), 'fund_email'],
      [sequelize.col('asset_user.user_name'), 'asset_user_name'],
      [sequelize.col('asset_user.user_full_name'), 'asset_user_full_name'],
      [sequelize.col('asset_user.user_from'), 'asset_user_from'],
      [sequelize.col('asset_user.linkman'), 'asset_linkman'],
      [sequelize.col('asset_user.mobile'), 'asset_mobile'],
      [sequelize.col('asset_user.email'), 'asset_email'],
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    return this.dao.find({
      attributes,
      include: [
        {
          model: db.t_user,
          attributes: [],
          as: 'fund_user',
          required: true,
        },
        {
          model: db.t_user,
          attributes: [],
          as: 'asset_user',
          required: true,
        },
      ],
      where,
    });
  }

  queryInfoPreCount(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    return this.dao.findAndCountAll({
      where,
    });
  }
  cooperatorInfoSupplement() {
    return sequelizeDB.query('call p_asset_fund_data_init()');
  }
}

// const assetFund = new AssetFund('t_asset_fund');
module.exports = (info, accessList = []) => new AssetFund('t_asset_fund', info, accessList);
