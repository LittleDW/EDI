/*
 * File: OrderRepayment.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');

// "orderRepayment": "select order_no, DATE_FORMAT(repayment_date, '%Y-%m-%d') as repayment_date, repayment_card_no, repayment_bank, repayment_name, format(repayment_original_fee/100,2) as repayment_original_fee, format(repayment_interest_fee/100,2) as repayment_interest_fee, DATE_FORMAT(repayment_end_date, '%Y-%m-%d') as repayment_end_date from t_order_repayment where 1=1 and order_no=:?order_no",
// "corpOrderRepayment": "select order_no, DATE_FORMAT(repayment_date, '%Y-%m-%d') as repayment_date, repayment_card_no, repayment_bank, repayment_name, format(repayment_original_fee/100,2) as repayment_original_fee, format(repayment_interest_fee/100,2) as repayment_interest_fee, DATE_FORMAT(repayment_end_date, '%Y-%m-%d') as repayment_end_date from t_order_repayment where 1=1 and order_no=:?order_no",

class OrderRepayment extends Model {
  query(params = {}) {
    const attributes = [
      'order_no',
      [
        s.fn('DATE_FORMAT', s.col('repayment_date'), '%Y-%m-%d'),
        'repayment_date',
      ],
      'repayment_card_no',
      'repayment_bank',
      'repayment_name',
      [
        s.literal('FORMAT(`repayment_original_fee`/100, 2)'),
        'repayment_original_fee',
      ],
      [
        s.literal('FORMAT(`repayment_interest_fee`/100, 2)'),
        'repayment_interest_fee',
      ],
      [
        s.fn('DATE_FORMAT', s.col('repayment_end_date'), '%Y-%m-%d'),
        'repayment_end_date',
      ],
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    return this.dao.findAll({
      attributes,
      where,
    });
  }
  // FIXME
  corpOrder(params = {}) {
    return this.query(params).bind(this);
  }
}

// const orderRepayment = new OrderRepayment('t_order_repayment');
module.exports = (info, accessList = []) => new OrderRepayment('t_order_repayment', info, accessList);
