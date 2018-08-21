/**
 * @Author zhangjunjie
 * @Date 2018/4/12 15:10
 * @Description: 业务报表fundStatistics business dao
 */

const dao = require('../../../dao');

const { DayMatch: fsDao } = dao.Combination;
const { EdiReport: ediReportDao } = dao.Edi;
const Super = require('../super');
const _ = require('lodash')

class FundStatistics extends Super {
  assetTotal(params) {
    return fsDao(this.info).fundStatisticsAssetTotal(params);
  }
  fundTotal(params) {
    return fsDao(this.info).fundStatisticsFundTotal(params);
  }
  assetStatis(params) {
    return fsDao(this.info).fundStatisticsAsset(params);
  }
  fundStatis(params) {
    return fsDao(this.info).fundStatisticsFund(params);
  }
  assetDeadline(params) {
    return fsDao(this.info).fundStatisticsAssetDeadline(params);
  }
  fundDeadline(params) {
    return fsDao(this.info).fundStatisticsFundDeadline(params);
  }
  adminStatisticsPlatformScale(params) {
    const {start_date, end_date} = params
    if (!_.isDate(start_date) || !_.isDate(end_date)) {
      throw new Error('查询失败，请重新选择时间')
    }
    return ediReportDao().queryScale(params);
  }
  adminStatisticsPlatformCollect(params) {
    const {start_date, end_date} = params
    if (!_.isDate(start_date) || !_.isDate(end_date)) {
      throw new Error('查询失败，请重新选择时间')
    }
    return ediReportDao().queryCollect(params);
  }
}

module.exports = req => new FundStatistics(req);
