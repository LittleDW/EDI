/*
 * File: OrderService.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Shiqifeng
 */

const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');

class OrderService extends Model {
  service(params = {}) {
    const attributes = [
      'order_no',
      [s.literal("DATE_FORMAT( service_date, '%Y-%m-%d' )"), 'service_date'],
      [s.literal('format(service_fee/100, 2)'), 'service_fee'],
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    return this.dao.findAll({
      attributes,
      where,
    });
  }
}
module.exports = (info, accessList = []) => new OrderService('t_order_service', info, accessList);
