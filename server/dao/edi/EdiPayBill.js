const sequelize = require('sequelize');
const { Op } = require('sequelize');
const Model = require('../super');
const { db } = require('../../schema/index');
const _ = require('lodash');
const { sequelizeDB } = require('../../schema/index');

// "ediPayBillCount": "SELECT count(*) as total FROM t_edi_pay_bill AS a INNER JOIN t_user AS b ON a.org_code=b.org_code where 1=1 and a.month like :?month and a.platform_pay_mode = :?platform_pay_mode and b.user_type = :?user_type and b.org_code = :?org_code",
// "ediPayBillQuery": "SELECT b.user_type, b.user_name, a.org_code, a.month, a.platform_pay_mode, Round(a.platform_use_rate*100,3) as platform_use_rate, Round(a.person_order_fee/100,0) as person_order_fee, Round(a.enterprise_order_fee/100,0) as enterprise_order_fee, Round(a.order_reduce_fee/100,0) as order_reduce_fee, Round((a.person_order_fee+a.enterprise_order_fee-a.order_reduce_fee)*a.platform_use_rate/100,0) as platform_use_fee, Round(a.finish_pay_fee/100,0) as finish_pay_fee, Round(a.last_balance_fee/100,0) as last_balance_fee, Round((a.finish_pay_fee + a.last_balance_fee)/100,0) as balance_fee, (Round((a.person_order_fee+a.enterprise_order_fee-a.order_reduce_fee)*a.platform_use_rate/100, 0) - Round((a.finish_pay_fee + a.last_balance_fee)/100, 0)) as need_pay_fee, a.comment, date_add(CONCAT(a.month,'-10'), interval 1 month) AS pay_deadline_date, a.rx_insertTime, a.rx_updateTime FROM t_edi_pay_bill AS a INNER JOIN t_user AS b ON a.org_code=b.org_code where 1=1 and a.month like :?month and a.platform_pay_mode = :?platform_pay_mode and b.user_type = :?user_type and b.org_code = :?org_code ORDER BY a.month DESC, b.user_type, b.org_code limit :?page_index,10",
// "ediPayBillStatistics": "SELECT Round(sum(a.person_order_fee+a.enterprise_order_fee)/100,0) as order_fee_total, Round(sum((a.person_order_fee+a.enterprise_order_fee-a.order_reduce_fee)*a.platform_use_rate)/100,0) as platform_use_fee_total, Round(sum(a.finish_pay_fee)/100,0) as finish_pay_fee_total FROM t_edi_pay_bill AS a INNER JOIN t_user AS b ON a.org_code=b.org_code where 1=1 and a.month like :?month and a.platform_pay_mode = :?platform_pay_mode and b.user_type = :?user_type and b.org_code = :?org_code",
// "ediPayBillReducePreMonth": "update t_edi_pay_bill set rx_updateTime=now(), last_balance_fee=last_balance_fee + (:?reduce_val *platform_use_rate) where 1=1 and org_code =:?org_code and month >:?month",
// "ediPayBillPayFeeUpdate": "update t_edi_pay_bill a, (select max(month) as max_month from t_edi_pay_bill where org_code =:?org_code) b set rx_updateTime=now(), a.finish_pay_fee=a.finish_pay_fee+ :?pay_fee where 1=1 and org_code =:?org_code and a.month = b.max_month",
// "ediPayBillQueryByKey": "SELECT a.org_code, a.month, a.platform_pay_mode, Round(a.platform_use_rate*100,3) as platform_use_rate, Round(a.person_order_fee/100,0) as person_order_fee, Round(a.enterprise_order_fee/100,0) as enterprise_order_fee, Round(a.order_reduce_fee/100,0) as order_reduce_fee, Round((a.person_order_fee+a.enterprise_order_fee-a.order_reduce_fee)*a.platform_use_rate/100,0) as platform_use_fee, Round(a.finish_pay_fee/100,0) as finish_pay_fee, Round(a.last_balance_fee/100,0) as last_balance_fee, Round((a.finish_pay_fee + a.last_balance_fee)/100,0) as balance_fee, (Round((a.person_order_fee+a.enterprise_order_fee-a.order_reduce_fee)*a.platform_use_rate/100, 0) - Round((a.finish_pay_fee + a.last_balance_fee)/100, 0)) as need_pay_fee, a.comment, date_add(CONCAT(a.month,'-10'), interval 1 month) AS pay_deadline_date, a.rx_insertTime, a.rx_updateTime from t_edi_pay_bill a where 1=1 and a.org_code =:!org_code and a.month =:!month",
// "ediPayBillExport": "SELECT b.user_type as 合作方类型, b.user_name as 合作方名称, a.month as 账单月份, a.platform_pay_mode as 费用缴纳方式, CONCAT(Round(a.platform_use_rate*100,3),'%') as 平台使用费率, Round(a.person_order_fee/100,0) as 本月平台个人订单金额（元）, Round(a.enterprise_order_fee/100,0) as 本月平台企业订单金额（元）, Round(a.order_reduce_fee/100,0) as 本月减免平台订单金额（元）, Round((a.person_order_fee+a.enterprise_order_fee-a.order_reduce_fee)*a.platform_use_rate/100,0) as 本月平台使用费（元）, Round(a.finish_pay_fee/100,0) as 本月缴费金额（元）, Round(a.last_balance_fee/100,0) as 上月账户余额（元）, Round((a.finish_pay_fee + a.last_balance_fee)/100,0) as 本月账户余额（元）, (Round((a.person_order_fee+a.enterprise_order_fee-a.order_reduce_fee)*a.platform_use_rate/100, 0) - Round((a.finish_pay_fee + a.last_balance_fee)/100, 0)) as 本月应付总额（元）, date_add(CONCAT(a.month,'-10'), interval 1 month) as 结算截止日 FROM t_edi_pay_bill AS a INNER JOIN t_user AS b ON a.org_code=b.org_code where 1=1 and a.month like :?month and a.platform_pay_mode = :?platform_pay_mode and b.user_type = :?user_type and b.org_code = :?org_code ORDER BY a.month DESC, b.user_type, b.org_code",
// "ediPayBillUpdate": "update t_edi_pay_bill set rx_updateTime=now(), order_reduce_fee=:?order_reduce_fee where 1=1 and org_code =:?org_code and month =:?month",
class EdiPayBill extends Model {
  count(param = {}) {
    const where = {};
    const subWhere = {};
    this.queryParamsLikeSetupBuilder(param, where, 'month');
    this.queryParamsStringSetupBuilder(param, where, 'platform_pay_mode');
    this.queryParamsStringSetupBuilder(param, subWhere, 'user_type');
    this.queryParamsStringSetupBuilder(param, subWhere, 'org_code');
    return this.dao.count({
      include: [
        {
          model: this.db.t_user,
          required: true,
          where: subWhere,
        },
      ],
      where,
      subQuery: false,
    });
  }

  query(param = {}) {
    const attributes = [
      'org_code',
      'month',
      'platform_pay_mode',
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`platform_use_rate`*100,3)'),
        'platform_use_rate',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`person_order_fee`/100,0)'),
        'person_order_fee',
      ],
      [
        sequelize.literal(
          'Round(`t_edi_pay_bill`.`enterprise_order_fee`/100,0)',
        ),
        'enterprise_order_fee',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`order_reduce_fee`/100,0)'),
        'order_reduce_fee',
      ],
      [
        sequelize.literal(
          'Round((`t_edi_pay_bill`.`person_order_fee`+`t_edi_pay_bill`.`enterprise_order_fee`-`t_edi_pay_bill`.`order_reduce_fee`)*`t_edi_pay_bill`.`platform_use_rate`/100,0)',
        ),
        'platform_use_fee',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`finish_pay_fee`/100,0)'),
        'finish_pay_fee',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`last_balance_fee`/100,0)'),
        'last_balance_fee',
      ],
      [
        sequelize.literal(
          'Round((`t_edi_pay_bill`.`finish_pay_fee` + `t_edi_pay_bill`.`last_balance_fee`)/100,0)',
        ),
        'balance_fee',
      ],
      [
        sequelize.literal(
          '(Round((`t_edi_pay_bill`.`person_order_fee`+`t_edi_pay_bill`.`enterprise_order_fee`-`t_edi_pay_bill`.`order_reduce_fee`)*`t_edi_pay_bill`.`platform_use_rate`/100, 0) - Round((`t_edi_pay_bill`.`finish_pay_fee` + `t_edi_pay_bill`.`last_balance_fee`)/100, 0))',
        ),
        'need_pay_fee',
      ],
      'comment',
      [
        sequelize.literal(
          'date_add(CONCAT(`t_edi_pay_bill`.`month`,"-10"), interval 1 month)',
        ),
        'pay_deadline_date',
      ],
      [sequelize.col('`t_users`.`user_type`'), 'user_type'],
      [sequelize.col('`t_users`.`user_name`'), 'user_name'],
      'rx_insertTime',
    ];
    const where = {};
    const subWhere = {};
    this.queryParamsLikeSetupBuilder(param, where, 'month');
    this.queryParamsStringSetupBuilder(param, where, 'platform_pay_mode');
    this.queryParamsStringSetupBuilder(param, subWhere, 'user_type');
    this.queryParamsStringSetupBuilder(param, subWhere, 'org_code');
    return this.dao.findAll({
      attributes,
      include: [
        {
          model: this.db.t_user,
          attributes: [],
          required: true,
          where: subWhere,
        },
      ],
      where,
      order: [
        ['month', 'DESC'],
        [{ model: this.db.t_user }, 'user_type'],
        [{ model: this.db.t_user }, 'org_code'],
      ],
      offset: param.page_index,
      limit: 10,
      subQuery: false,
    });
  }
  exportQuery(param = {}, page_index = 0) {
    const attributes = [
      ['month', '账单月份'],
      ['platform_pay_mode', '费用缴纳方式'],
      [
        sequelize.literal(
          'CONCAT(Round(`t_edi_pay_bill`.`platform_use_rate`*100,3),"%")',
        ),
        '平台使用费率',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`person_order_fee`/100,0)'),
        '本月平台个人订单金额（元）',
      ],
      [
        sequelize.literal(
          'Round(`t_edi_pay_bill`.`enterprise_order_fee`/100,0)',
        ),
        '本月平台企业订单金额（元）',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`order_reduce_fee`/100,0)'),
        '本月减免平台订单金额（元）',
      ],
      [
        sequelize.literal(
          'Round((`t_edi_pay_bill`.`person_order_fee`+`t_edi_pay_bill`.`enterprise_order_fee`-`t_edi_pay_bill`.`order_reduce_fee`)*`t_edi_pay_bill`.`platform_use_rate`/100,0)',
        ),
        '本月平台使用费（元）',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`finish_pay_fee`/100,0)'),
        '本月缴费金额（元）',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`last_balance_fee`/100,0)'),
        '上月账户余额（元）',
      ],
      [
        sequelize.literal(
          'Round((`t_edi_pay_bill`.`finish_pay_fee` + `t_edi_pay_bill`.`last_balance_fee`)/100,0)',
        ),
        '本月账户余额（元）',
      ],
      [
        sequelize.literal(
          '(Round((`t_edi_pay_bill`.`person_order_fee`+`t_edi_pay_bill`.`enterprise_order_fee`-`t_edi_pay_bill`.`order_reduce_fee`)*`t_edi_pay_bill`.`platform_use_rate`/100, 0) - Round((`t_edi_pay_bill`.`finish_pay_fee` + `t_edi_pay_bill`.`last_balance_fee`)/100, 0))',
        ),
        '本月应付总额（元）',
      ],
      [
        sequelize.literal(
          "date_add(CONCAT(`t_edi_pay_bill`.`month`,'-10'), interval 1 month)",
        ),
        '结算截止日',
      ],
    ];
    ``;
    const includingAttributes = [
      ['user_type', '合作方类型'],
      ['user_name', '合作方名称'],
    ];
    const { month, platform_pay_mode, user_type, org_code } = param;
    let whereClause = {},
      includingWhere = {};
    if (!_.isEmpty(month)) {
      whereClause.month = {
        [Op.like]: `%${month}%`,
      };
    }

    if (!_.isEmpty(platform_pay_mode)) {
      whereClause.platform_pay_mode = platform_pay_mode;
    }

    if (!_.isEmpty(user_type)) {
      includingWhere.user_type$ = user_type;
    }

    if (!_.isEmpty(org_code)) {
      includingWhere.org_code = org_code;
    }
    return this.dao.findAll({
      attributes,
      include: [
        {
          model: this.db.t_user,
          attributes: includingAttributes,
          where: includingWhere,
          required: true,
        },
      ],
      where: whereClause,
      order: [
        ['month', 'DESC'],
        [{ model: this.db.t_user }, 'user_type'],
        [{ model: this.db.t_user }, 'org_code'],
      ],
      subQuery: false,
    });
  }
  queryByKey(param = {}) {
    const attributes = [
      'org_code',
      'month',
      'platform_pay_mode',
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`platform_use_rate`*100,3)'),
        'platform_use_rate',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`person_order_fee`/100,3)'),
        'person_order_fee',
      ],
      [
        sequelize.literal(
          'Round(`t_edi_pay_bill`.`enterprise_order_fee`/100,3)',
        ),
        'enterprise_order_fee',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`order_reduce_fee`/100,0)'),
        'order_reduce_fee',
      ],
      [
        sequelize.literal(
          'Round((`t_edi_pay_bill`.`person_order_fee`+`t_edi_pay_bill`.`enterprise_order_fee`-`t_edi_pay_bill`.`order_reduce_fee`)*`t_edi_pay_bill`.`platform_use_rate`/100,0)',
        ),
        'platform_use_fee',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`finish_pay_fee`/100,0)'),
        'finish_pay_fee',
      ],
      [
        sequelize.literal('Round(`t_edi_pay_bill`.`last_balance_fee`/100,0)'),
        'last_balance_fee',
      ],
      [
        sequelize.literal(
          'Round((`t_edi_pay_bill`.`finish_pay_fee` + `t_edi_pay_bill`.`last_balance_fee`)/100,0)',
        ),
        'balance_fee',
      ],
      [
        sequelize.literal(
          '(Round((`t_edi_pay_bill`.`person_order_fee`+`t_edi_pay_bill`.`enterprise_order_fee`-`t_edi_pay_bill`.`order_reduce_fee`)*`t_edi_pay_bill`.`platform_use_rate`/100, 0) - Round((`t_edi_pay_bill`.`finish_pay_fee` + `t_edi_pay_bill`.`last_balance_fee`)/100, 0))',
        ),
        'need_pay_fee',
      ],
      'comment',
      [
        sequelize.literal(
          "date_add(CONCAT(`t_edi_pay_bill`.`month`,'-10'), interval 1 month)",
        ),
        'pay_deadline_date',
      ],
      'rx_insertTime',
      'rx_updateTime',
    ];
    const where = {}
    this.queryParamsStringSetupBuilder(param, where, 'org_code')
    this.queryParamsStringSetupBuilder(param, where, 'month')
    return this.dao.findAll({
      attributes,
      where,
    });
  }

  ediPayBillReducePreMonth(params = {}, transcation = null) {
    return sequelizeDB.query(
      `
      UPDATE t_edi_pay_bill 
      SET rx_updateTime = now(),
      last_balance_fee = last_balance_fee + ( ${params.reduce_val} * platform_use_rate )
      WHERE
        1 = 1 
        AND org_code = '${params.org_code}'
        AND month > '${params.month}'
      `,
      {
        transcation
      }
    )
  }

  statistics(params = {}) {
    return sequelizeDB.query(
      `
      SELECT
        Round( sum( a.person_order_fee + a.enterprise_order_fee ) / 100, 0 ) AS order_fee_total,
        Round( sum( ( a.person_order_fee + a.enterprise_order_fee - a.order_reduce_fee ) * a.platform_use_rate ) / 100, 0 ) AS platform_use_fee_total,
        Round( sum( a.finish_pay_fee ) / 100, 0 ) AS finish_pay_fee_total 
      FROM
        t_edi_pay_bill AS a
        INNER JOIN t_user AS b ON a.org_code = b.org_code 
      WHERE
        1 = 1 
        ${_.isEmpty(params.month) ? '' : ` AND a.month like '%${params.month}%'`}
        ${_.isEmpty(params.platform_pay_mode) ? '' : ` AND a.platform_pay_mode = '${params.platform_pay_mode}'`}
        ${_.isEmpty(params.user_type) ? '' : ` AND b.user_type = '${params.user_type}'`}
        ${_.isEmpty(params.org_code) ? '' : ` AND b.org_code = '${params.org_code}'`}
        ${_.isEmpty(params.org_code) ? '' : ` AND b.org_code = '${params.org_code}'`}
        ${_.isEmpty(params.restriction) ? '' : ` AND a.org_code in (${params.restriction.map(item => `"${item}"`).join(',')})`}
      `
    )
  }

  updateReducePreMonth(param = {}) {
    let clonedParam = _.cloneDeep(param);
    const { reduce_val } = clonedParam;
    delete clonedParam.reduce_val;
    if (!_.isEmpty(clonedParam.month)) {
      clonedParam.month = {
        [Op.gt]: clonedParam.month,
      };
    }
    return this.dao.update(
      {
        last_balance_fee: sequelize.literal(
          `last_balance_fee + ('${reduce_val}' *platform_use_rate)`,
        ),
      },
      {
        where: clonedParam,
      },
    );
  }

  updateFee(param = {}, transaction = null) {
    const { org_code, pay_fee } = param;
    return sequelizeDB.query(
      `UPDATE t_edi_pay_bill a,
        (select max(month) as max_month from t_edi_pay_bill
        ${_.isEmpty(org_code) ? '' : `WHERE org_code = '${org_code}'`}) b
      SET rx_updateTime=now(),
        ${
          _.isNaN(pay_fee) ? '' : `a.finish_pay_fee=a.finish_pay_fee+${pay_fee}`
        }
      WHERE
        ${_.isEmpty(org_code) ? '' : `org_code ='${org_code}'`}
        AND a.month = b.max_month
       `,
      { type: sequelize.QueryTypes.UPDATE, transaction },
    );
  }

  update(param = {}) {
    let clonedParam = _.cloneDeep(param);
    const { order_reduce_fee } = clonedParam;
    delete clonedParam.order_reduce_fee;
    return this.dao.update(
      { order_reduce_fee },
      {
        where: clonedParam,
        individualHooks: true,
      },
    );
  }
}

module.exports = (info, accessList = []) =>
  new EdiPayBill('t_edi_pay_bill', info, accessList);
