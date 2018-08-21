/**
 * @author robin
 * @file FinanceFundDayStatistics
 * @date 2018-03-27 09:39
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

class FinanceFundDayStatistics extends Model {
  //"balanceFundStatisticsDay": "SELECT asset_org_code, fund_org_code, statistics_date, Round(loan_fee/100,2) as loan_fee, Round(repayment_fee/100,2) as repayment_fee FROM t_finance_fund_day_statistics where 1 = 1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and statistics_date >= :?start_date and statistics_date <= :?end_date order by statistics_date desc",
  query(param={}){
    const attributes = [
      "asset_org_code", "fund_org_code", "statistics_date",
      [sequelize.literal('ROUND(`t_finance_fund_day_statistics`.`loan_fee` /100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(`t_finance_fund_day_statistics`.`repayment_fee` /100,2)'), 'repayment_fee'],
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
      "fund_org_code", "statistics_date",
      [sequelize.literal('ROUND(sum(`t_finance_fund_day_statistics`.`loan_fee`)/100,2)'), 'loan_fee'],
      [sequelize.literal('ROUND(sum(`t_finance_fund_day_statistics`.`repayment_fee`)/100,2)'), 'repayment_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      group: ['statistics_date', 'fund_org_code'],
      order: [
        [sequelize.col('statistics_date'), 'desc'],
        [sequelize.col('loan_fee'),'desc'],
        [sequelize.col('repayment_fee'),'desc']
      ],
    });
  }
  queryBalance(param={}){
    const attributes = [
      "asset_org_code", "fund_org_code", "statistics_date",
      [sequelize.literal('ROUND(`t_finance_fund_day_statistics`.`balance_fee`/100,2)'), 'balance_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      order: [
        [sequelize.col('statistics_date'), 'desc'],
        [sequelize.col('balance_fee'),'desc'],
      ],
      // subQuery: true,
    });
  }
  queryBalanceForAdmin(param={}){
    const attributes = [
      "fund_org_code", "statistics_date",
      [sequelize.literal('ROUND(sum(`t_finance_fund_day_statistics`.`balance_fee`)/100,2)'), 'balance_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.QueryParamsOfIntervalEnhancer(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes,
      where,
      group: ['statistics_date', 'fund_org_code'],
      order: [
        [sequelize.col('statistics_date'), 'desc'],
        [sequelize.col('balance_fee'),'desc'],
      ],
      // subQuery: true,
    });
  }

  queryBalanceForAdminInTab4(params = {}) {
    const query = `
    SELECT
      a.asset_org_code,
      b.fund_org_code,
      Round( ifnull( c.balance_fee, 0 ) / 100, 2 ) AS balance_fee 
    FROM
      ( SELECT org_code AS asset_org_code FROM t_user WHERE user_type IN ( 1, 5 ) ${_.isEmpty(params.assetList) ? '' : `AND org_code IN (${params.assetList})`} ) AS a
      INNER JOIN ( SELECT org_code AS fund_org_code FROM t_user WHERE user_type IN ( 2, 6 ) ${_.isEmpty(params.fundList) ? '' : `AND org_code IN (${params.fundList})`} ) AS b ON 1 = 1
      LEFT JOIN t_finance_asset_day_statistics AS c ON c.asset_org_code = a.asset_org_code 
      AND c.fund_org_code = b.fund_org_code 
      AND c.statistics_date = date_format( date_add( now( ), INTERVAL - 1 DAY ), '%Y-%m-%d' )
    ORDER BY
      c.balance_fee DESC,
      a.asset_org_code,
      b.fund_org_code
    `;
    return sequelizeDB.query(query, { type: sequelize.QueryTypes.SELECT });
  }
}


module.exports = (info, accessList = []) => new FinanceFundDayStatistics('t_finance_fund_day_statistics', info, accessList);
