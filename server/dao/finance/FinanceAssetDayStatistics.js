/**
 * @author robin
 * @file FinanceAssetDayStatistics.js
 * @date 2018-03-26 16:47
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

class FinanceAssetDayStatistics extends Model {
  //"balanceAssetStatisticsDay": "SELECT asset_org_code, fund_org_code, statistics_date, Round(loan_fee/100,2) as loan_fee, Round(repayment_fee/100,2) as repayment_fee FROM t_finance_asset_day_statistics where 1 = 1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and statistics_date >= :?start_date and statistics_date <= :?end_date order by statistics_date desc",
  query(param={}){
    const attributes = [
      "asset_org_code", "fund_org_code", "statistics_date",
      [sequelize.literal('ROUND(`t_finance_asset_day_statistics`.`loan_fee`/100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(`t_finance_asset_day_statistics`.`repayment_fee`/100,2)'), 'repayment_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      order: [
        ['statistics_date',"desc"],
        ['loan_fee',"desc"],
        ['repayment_fee',"desc"],
      ],
      // subQuery: true,
    });
  }

  queryForAdmin(param={}){
    const attributes = [
      "asset_org_code", "statistics_date",
      [sequelize.literal('ROUND(sum(`t_finance_asset_day_statistics`.`loan_fee`)/100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(sum(`t_finance_asset_day_statistics`.`repayment_fee`)/100,2)'), 'repayment_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, 
      where,
      group: ['statistics_date', 'asset_org_code'],
      order: [
        [sequelize.col('statistics_date'), 'desc'],
        [sequelize.col('loan_fee'),'desc'],
        [sequelize.col('repayment_fee'),'desc']
      ],
      // subQuery: true,
    });
  }

  queryBalance(param={}){
    const attributes = [
      "asset_org_code", "fund_org_code", "statistics_date",
      [sequelize.literal('ROUND(`t_finance_asset_day_statistics`.`balance_fee`/100,2)'), 'balance_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      order: [
        ['statistics_date',"desc"],
        ['balance_fee',"desc"],
      ],
    });
  }
  queryBalanceForAdmin(param={}){
    const attributes = [
      "asset_org_code", "statistics_date",
      [sequelize.literal('ROUND(sum(`t_finance_asset_day_statistics`.`balance_fee`)/100,2)'), 'balance_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, 
      where,
      group: ['statistics_date', 'asset_org_code'],
      order: [
        [sequelize.col('statistics_date'), 'desc'],
        [sequelize.col('balance_fee'),'desc'],
      ],
    });
  }
}


module.exports = (info, accessList = []) => new FinanceAssetDayStatistics('t_finance_asset_day_statistics', info, accessList);
