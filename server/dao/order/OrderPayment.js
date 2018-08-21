/*
 * File: OrderPayment.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');

// "orderPayment": "select order_no, DATE_FORMAT(payment_date, '%Y-%m-%d') as payment_date, format(payment_fee/100,2) as payment_fee, payment_channel, payment_serial_no,payment_certificate_url from t_order_payment where 1=1 and order_no=:?order_no",
// "corpOrderPayment": "select order_no, DATE_FORMAT(payment_date, '%Y-%m-%d') as payment_date, format(payment_fee/100,2) as payment_fee, payment_channel, payment_serial_no,payment_certificate_url from t_order_payment where 1=1 and order_no=:?order_no",

class OrderPayment extends Model {
  query(params = {}) {
    const attributes = [
      'order_no',
      [s.fn('DATE_FORMAT', s.col('payment_date'), '%Y-%m-%d'), 'payment_date'],
      [s.literal('FORMAT(`payment_fee`/100, 2)'), 'payment_fee'],
      'payment_channel',
      'payment_serial_no',
      'payment_certificate_url',
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
    return this.corpOrder(params).bind(this);
  }
}

// const orderPayment = new OrderPayment('t_order_payment');
module.exports = (info, accessList = []) => new OrderPayment('t_order_payment', info, accessList);
