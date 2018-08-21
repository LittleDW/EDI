/*
 * @Author zhangjunjie
 * @File afterRepaymentStatisticsDao.js
 * @Created Date 2018-05-17 15-18
 * @Last Modified: 2018-05-17 15-23
 * @Modified By: zhangjunjie
 */

const _ = require("lodash");

const Super = require("../super");

const dao = require("../../../dao");

const { AfterRepayment: afterRSDao } = dao;

class AfterRepaymentStatisticsClass extends Super {
  monthSearch(params = {}) {
    const { asset_org_code, fund_org_code, year, month } = params;
    const statistics_month = `${year}-${month}`;
    return afterRSDao
      .AfterRepaymentMonthStatistics(this.info, ['asset', 'fund', 'admin'])
      .query({ asset_org_code, fund_org_code, statistics_month });
  }
  daySearch(params = {}) {
    const { asset_org_code, fund_org_code, year, month } = params;
    const start_date = `${year}-${month}-01`;
    const end_date = `${year}-${month}-31`;
    return afterRSDao
      .AfterRepaymentDayStatistics(this.info, ['asset', 'fund', 'admin'])
      .query({ asset_org_code, fund_org_code, start_date, end_date });
  }
}

module.exports = req => new AfterRepaymentStatisticsClass(req);
