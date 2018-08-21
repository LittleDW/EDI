/**
 * @author robin
 * @file FinanceFundMonthStatistics
 * @date 2018-03-26 16:45
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

class FinanceFundMonthStatistics extends Model {
  // "balanceFundStatisticsMonth": "SELECT asset_org_code, fund_org_code, statistics_month, Round(loan_fee/100,2) as loan_fee, Round(repayment_fee/100,2) as repayment_fee FROM t_finance_fund_month_statistics where 1 = 1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and statistics_month >= :?start_date and statistics_month <= :?end_date order by statistics_month desc",
  query(param={}){
    const attributes = [
      "asset_org_code", "fund_org_code", "statistics_month",
      [sequelize.literal('ROUND(`t_finance_fund_month_statistics`.`loan_fee`/100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(`t_finance_fund_month_statistics`.`repayment_fee`/100,2)'), 'repayment_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_month", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      order: [
        ['statistics_month',"desc"],
        ['loan_fee',"desc"],
        ['repayment_fee',"desc"],
      ],
      // subQuery: true,
    });
  }
  queryForAdmin(param={}){
    const attributes = [
      "fund_org_code", "statistics_month",
      [sequelize.literal('ROUND(sum(`t_finance_fund_month_statistics`.`loan_fee`)/100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(sum(`t_finance_fund_month_statistics`.`repayment_fee`)/100,2)'), 'repayment_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_month", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      group: ['statistics_month', 'fund_org_code'],
      order: [
        [sequelize.col('statistics_month'), 'desc'],
        [sequelize.col('loan_fee'),'desc'],
        [sequelize.col('repayment_fee'),'desc']
      ],
      // subQuery: true,
    });
  }
}


module.exports = (info, accessList = []) => new FinanceFundMonthStatistics('t_finance_fund_month_statistics', info, accessList);
