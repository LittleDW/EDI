/**
 * @author robin
 * @file FinanceAssetMonthStatistics
 * @date 2018-03-26 16:14
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

class FinanceAssetMonthStatistics extends Model {
  //"balanceAssetStatisticsMonth": "SELECT asset_org_code, fund_org_code, statistics_month, Round(loan_fee/100,2) as loan_fee, Round(repayment_fee/100,2) as repayment_fee FROM t_finance_asset_month_statistics where 1 = 1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and statistics_month >= :?start_date and statistics_month <= :?end_date order by statistics_month desc",
  query(param={}){
    const attributes = [
      "asset_org_code", "fund_org_code", "statistics_month",
      [sequelize.literal('ROUND(`t_finance_asset_month_statistics`.`loan_fee`/100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(`t_finance_asset_month_statistics`.`repayment_fee`/100,2)'), 'repayment_fee'],
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
    });
  }
  queryForAdmin(param={}){
    const attributes = [
      "asset_org_code", "statistics_month",
      [sequelize.literal('ROUND(sum(`t_finance_asset_month_statistics`.`loan_fee`)/100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(sum(`t_finance_asset_month_statistics`.`repayment_fee`)/100,2)'), 'repayment_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_month", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      group: ['statistics_month', 'asset_org_code'],
      order: [
        [sequelize.col('statistics_month'), 'desc'],
        [sequelize.col('loan_fee'),'desc'],
        [sequelize.col('repayment_fee'),'desc']
      ],
    });
  }
}


module.exports = (info, accessList = []) => new FinanceAssetMonthStatistics('t_finance_asset_month_statistics', info, accessList);
