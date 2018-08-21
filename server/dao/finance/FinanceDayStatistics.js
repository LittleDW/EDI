/**
 * @author robin
 * @file FinanceDayStatistics
 * @date 2018-03-27 09:44
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

class FinanceDayStatistics extends Model {
  // "balanceStatisticsBalance"
  balanceStatisticsBalanceSearch(param={}){
    const attributes = [
      "asset_org_code", "fund_org_code", "statistics_date",
      [sequelize.literal('ROUND(`t_finance_day_statistics`.`balance_fee`/100,2)'), 'balance_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.durationGenerator(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      order: [['statistics_date',"DESC"]],
      // subQuery: true,
    });
  }

  // "balanceStatisticsDayAdmin"
  balanceStatisticsDayAdminSearch(param={}){
    const {start_date, end_date, org_type} = param
    const attributes = [
      org_type,
      "statistics_date",
      [sequelize.literal('Round( sum(`t_finance_day_statistics`.`loan_fee`) / 100, 2 )'), 'loan_fee'],
      [sequelize.literal('Round( sum(`t_finance_day_statistics`.`repayment_fee`) / 100, 2 )'), 'repayment_fee'],
    ]
    return this.dao.findAll({
      attributes,
      where: {
        statistics_date: {
          [Op.between]: [
            start_date,
            end_date
          ]
        }
      },
      group: ['statistics_date', org_type],
      order: [
        ['statistics_date',"desc"],
        ['loan_fee',"desc"],
        ['repayment_fee',"desc"],
      ],
    });
  }

  // "balanceStatisticsBalanceAdmin"
  balanceStatisticsBalanceAdminSearch(param={}){
    const {org_type} = param
    const attributes = [
      org_type, "statistics_date",
      [sequelize.literal('Round( sum(`t_finance_day_statistics`.`balance_fee`) / 100, 2 )'), 'balance_fee'],
    ]
    let clonedParam = _.cloneDeep(param), where={}
    this.durationGenerator(clonedParam, where, "statistics_date", "start_date", 'end_date')
    return this.dao.findAll({
      attributes, where,
      group: ['statistics_date', org_type],
      order: [['statistics_date',"desc"]],
      // subQuery: true,
    });
  }
}


module.exports = (info, accessList = []) => new FinanceDayStatistics('t_finance_day_statistics', info, accessList);
