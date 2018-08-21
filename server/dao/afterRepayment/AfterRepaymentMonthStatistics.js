/*
 * @Author zhangjunjie
 * @File AfterRepaymentMonthStatistics.js
 * @Created Date 2018-05-17 14-46
 * @Last Modified: 2018-05-17 14-47
 * @Modified By: zhangjunjie
 */

/*
 * @Author zhangjunjie
 * @File AfterRepaymentDayStatistics.js
 * @Created Date 2018-05-17 14-45
 * @Last Modified: 2018-05-17 14-48
 * @Modified By: zhangjunjie
 */

const Model = require('../super');

class AfterRepaymentMonthStatistics extends Model {
  query(params ={}) {
    const attributes = [
      'asset_org_code',
      'fund_org_code',
      'statistics_month',
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
    this.queryParamsStringSetupBuilder(params, where, 'statistics_month');

    return this.dao.findAll({
      attributes,
      where,
    });

  }
}

module.exports = (info, accessList = []) => new AfterRepaymentMonthStatistics('t_after_repayment_month_statistics', info, accessList);
