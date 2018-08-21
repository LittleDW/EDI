/**
 * @author robin
 * @file FinanceMonthStatistics.js
 * @date 2018-03-27 09:45
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

class FinanceMonthStatistics extends Model {
  // "balanceStatisticsMonthAdmin": "SELECT org_type, statistics_month, Round( sum(loan_fee) / 100, 2 ) AS loan_fee, Round( sum(repayment_fee) / 100, 2 ) AS repayment_fee FROM t_finance_month_statistics WHERE 1 = 1 and statistics_month >= :?start_date and statistics_month <= :?end_date GROUP BY statistics_month, org_type ORDER BY statistics_month desc",
  query(param={}){
    const {start_date, end_date, org_type} = param
    const attributes = [
      org_type, "statistics_month",
      [sequelize.literal('Round( sum(`t_finance_month_statistics`.`loan_fee`) / 100, 2 )'), 'loan_fee'],
      [sequelize.literal('Round( sum(`t_finance_month_statistics`.`repayment_fee`) / 100, 2 )'), 'repayment_fee'],
    ]
    return this.dao.findAll({
      attributes,
      where: {
        statistics_month: {
          [Op.between]: [
            start_date,
            end_date
          ]
        }
      },
      group: ['statistics_month', org_type],
      order: [
        ['statistics_month',"desc"],
        ['loan_fee',"desc"],
        ['repayment_fee',"desc"],
      ],
    });
  }

}

module.exports = (info, accessList = []) => new FinanceMonthStatistics('t_finance_month_statistics', info, accessList);
