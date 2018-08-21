/*
 * @Author zhangjunjie
 * @File AfterRepaymentDayStatistics.js
 * @Created Date 2018-05-17 14-45
 * @Last Modified: 2018-05-17 14-48
 * @Modified By: zhangjunjie
 */

const Model = require('../super');
const sequelize = require('sequelize')
const _ = require('lodash');

class AfterRepaymentDayStatistics extends Model {
  query(params ={}) {
    const attributes = [
      'asset_org_code',
      'fund_org_code',
      'statistics_date',
      'due_order_count',
      'due_fee',
      'paid_up_order_count',
      'paid_up_fee',
      'compensatory_order_count',
      'compensatory_fee',
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');

    return this.dao.findAll({
      attributes,
      where: {
        ...where,
        statistics_date: {
          [sequelize.Op.between]: [params.start_date || '', params.end_date || '']
        }
      },
      order: [['statistics_date', 'DESC']]
    });

  }
}

module.exports = (info, accessList = []) => new AfterRepaymentDayStatistics('t_after_repayment_day_statistics', info, accessList);
