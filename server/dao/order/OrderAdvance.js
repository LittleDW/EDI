/*
 * File: OrderAdvance.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */


const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');

// "orderAdvance": "select order_no, DATE_FORMAT(advance_date, '%Y-%m-%d') as advance_date, format(advance_fee/100,2) as advance_fee, advance_channel, advance_serial_no from t_order_advance where 1=1 and order_no=:?order_no",
// "corpOrderAdvance": "select order_no, DATE_FORMAT(advance_date, '%Y-%m-%d') as advance_date, format(advance_fee/100,2) as advance_fee, advance_channel, advance_serial_no from t_order_advance where 1=1 and order_no=:?order_no",

class OrderAdvance extends Model {
  query(params = {}) {
    const attributes = [
      'order_no',
      [s.fn('DATE_FORMAT', s.col('advance_date'), '%Y-%m-%d'), 'advance_date'],
      [
        s.literal('FORMAT(`advance_fee`/100, 2)'), 'advance_fee'],
      'advance_channel',
      'advance_serial_no',
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

// const orderAdvance = new OrderAdvance('t_order_advance');
module.exports = (info, accessList = []) => new OrderAdvance('t_order_advance', info, accessList);
