/*
 * @Author Osborn
 * @File OrderWithdraw.js
 * @Created Date 2018-05-29 10-53
 * @Last Modified: 2018-05-29 10-53
 * @Modified By: Osborn
 */

const _ = require('lodash');
const { db, sequelizeDB } = require('../../schema/index');
const Model = require('../super');
const sequelize = require('sequelize');

class OrderWithdraw extends Model {
  query(params = {}, page_index = 0) {
    const attributes = [
      'order_no',
      'order_status',
      'asset_org_code',
      'asset_order_no',
      [sequelize.fn('DATE_FORMAT', sequelize.col('borrow_date'), '%Y-%m-%d'), 'borrow_date'],
      'borrow_type',
      'borrow_name',
      'borrow_certificate_type',
      'borrow_certificate_no',
      'borrow_phone',
      'borrow_mail',
      'borrow_bank',
      'borrow_card_type',
      'borrow_card_no',
      'borrow_area',
      'borrow_work_address',
      'borrow_family_address',
      'borrow_census_address',
      'borrow_pay_mode',
      'borrow_purpose',
      [sequelize.literal('FORMAT(`borrow_fee`/100, 2)'), 'borrow_fee'],
      // [sequelize.fn('format', sequelize.col('borrow_fee'), '/ 100, 2'), 'borrow_fee'],
      'borrow_period',
      'borrow_deadline',
      [sequelize.literal('FORMAT(`borrow_credit_fee`/100, 2)'), 'borrow_credit_fee'],
      // [sequelize.fn('format', sequelize.col('borrow_credit_fee'), '/ 100, 2'), 'borrow_credit_fee'],
      'borrow_credit_report',
      'borrow_income_report',
      'gathering_name',
      'gathering_bank',
      'gathering_card_no',
      'fund_org_code',
      'fund_order_no',
      'refuse_type',
      'refuse_reason',
      'business_type',
      'repayment_mode',
      'bank_loan_contract_no',
      'occupation',
      'repayment_from',
      'credit_org',
      'credit_score',
      'data_from',
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('t_order.rx_insertTime'), '%Y-%m-%d %H:%i:%s'),
        'order_rx_insertTime',
      ],
    ];
    const apiAttributes = [
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('t_order_payment.payment_date'), '%Y-%m-%d'),
        'payment_date',
      ],
    ];
    const where = {};
    const orderWhere = {};
    const paymentWhere = {};
    const withdrawWhere = {};

    this.queryParamsInSetupBuilder(params, where, 'withdraw_status');

    this.durationGenerator(
      params,
      orderWhere,
      'borrow_date',
      'borrow_start_date',
      'borrow_end_date',
    );
    this.queryParamsStringSetupBuilder(params, orderWhere, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, orderWhere, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, orderWhere, 'asset_order_no');
    this.queryParamsLikeSetupBuilder(params, orderWhere, 'order_no');
    this.queryParamsLikeSetupBuilder(params, orderWhere, 'borrow_certificate_no');

    this.durationGenerator(
      params,
      paymentWhere,
      'payment_date',
      'payment_start_date',
      'payment_end_date',
    );

    return this.dao.findPlainAll({
      include: [
        {
          model: db.t_order,
          require: false,
          attributes,
          where: orderWhere,
          include: [
            {
              model: db.t_fund_api,
              require: false,
              where: { api_type: '04' },
            },
          ],
        },
        {
          model: db.t_order_payment,
          attributes: apiAttributes,
          where: paymentWhere,
          require: false,
        },
      ],
      where,
      order: [[sequelize.col('t_order_payment.payment_date'), 'DESC']],
      offset: page_index,
      limit: 10,
    });
  }
  // count(params = {}) {
  //   const attributes = [
  //     [sequelize.fn('COUNT', '*'), 'total'],
  //     [sequelize.literal('FORMAT(sum(t_order.borrow_fee)/100,2)'), 'fee'],
  //   ];
  //   const where = {};
  //   this.durationGenerator(params, where, 'borrow_date', 'borrow_date_start', 'borrow_date_end');
  //   this.durationGenerator(params, where, 'rx_insertTime', 'create_time_start', 'create_time_end');
  //   this.queryParamsInSetupBuilder(
  //     params,
  //     where,
  //     'borrow_daycount',
  //     'deadline_from',
  //     'deadline_to',
  //   );
  //   this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
  //   this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
  //   this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
  //   this.queryParamsStringSetupBuilder(params, where, 'order_no');
  //   this.queryParamsLikeSetupBuilder(params, where, 'borrow_certificate_no');
  //   this.queryParamsInSetupBuilder(params, where, 'order_status');
  //   return this.dao.count({
  //     include: [
  //       {
  //         attributes: [],
  //         model: db.t_order,
  //         where,
  //         required: false,
  //       },
  //     ],
  //     // attributes,
  //   });
  // }
  countRaw(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      COUNT('*') AS 'total',
      FORMAT(
        sum(t_order.borrow_fee) / 100,2) AS 'fee'
    FROM
      t_order_withdraw AS t_order_withdraw
    INNER JOIN t_order AS t_order ON t_order_withdraw.order_no = t_order.order_no
      ${
  _.isEmpty(params.borrow_start_date)
    ? ''
    : `AND borrow_date >= '${params.borrow_start_date}'`
}
      ${_.isEmpty(params.borrow_end_date) ? '' : `AND borrow_date <= '${params.borrow_end_date}'`}
      ${
  _.isEmpty(params.fund_org_code)
    ? ''
    : _.isArray(params.fund_org_code)
      ? `AND fund_org_code IN (${params.fund_org_code.map(item => `'${item}'`).join(',')})`
      : `AND fund_org_code = '${params.fund_org_code}'`
}
      ${
  _.isEmpty(params.asset_org_code)
    ? ''
    : _.isArray(params.asset_org_code)
      ? `AND asset_org_code IN (${params.asset_org_code.map(item => `'${item}'`).join(',')})`
      : `AND asset_org_code = '${params.asset_org_code}'`
}
      ${_.isEmpty(params.asset_order_no) ? '' : `AND asset_order_no = '${params.asset_order_no}'`}
      ${_.isEmpty(params.order_no) ? '' : `AND t_order.order_no LIKE '%${params.order_no}%'`}
      ${
  _.isEmpty(params.borrow_certificate_no)
    ? ''
    : `AND borrow_certificate_no LIKE '%${params.borrow_certificate_no}%'`
}

  INNER JOIN t_order_payment ON t_order_payment.order_no = t_order_withdraw.order_no
  ${
  _.isEmpty(params.payment_start_date) ? '' : `AND payment_date >= '${params.payment_start_date}'`
}
${_.isEmpty(params.payment_end_date) ? '' : `AND payment_date <= '${params.payment_end_date}'`}

  WHERE
    1 =1
    ${
  _.isEmpty(params.withdraw_status)
    ? ''
    : `AND withdraw_status IN (${[...params.withdraw_status].join(',')})`
}

    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }
}

module.exports = (info, accessList = []) => new OrderWithdraw('t_order_withdraw', info, accessList);
