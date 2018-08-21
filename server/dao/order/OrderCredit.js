/*
 * File: OrderCredit.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const Model = require('../super');

// "orderCredit": "select * from t_order_credit where 1=1 and order_no=:?order_no",

class OrderCredit extends Model {
  query(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    return this.dao.findAll({
      where,
    });
  }
}

module.exports = (info, accessList = []) => new OrderCredit('t_order_credit', info, accessList);
