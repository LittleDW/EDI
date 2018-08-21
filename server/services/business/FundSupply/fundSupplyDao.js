/**
 * @Author zhangjunjie
 * @Date 2018/4/17 14:07
 * @Description: 供需计划 fundSupply Business Dao
 */

const { date: DateDao } = require('../../../dao').Common.WeekAndDate;
const { Deadline: DeadlineDao } = require('../../../dao').Common;
const Super = require('../super');

class FsDao extends Super {
  getDateRange(params) {
    return DateDao(this.info).queryDateRange(params);
  }
  fundSupplyWeekly(params) {
    return DeadlineDao(this.info).fundSupplyWeekly(params);
  }
  fundSupplyDaily(params) {
    return DeadlineDao(this.info).fundSupplyDaily(params);
  }
  fundSupplyAsset(params) {
    return DeadlineDao(this.info).fundSupplyAsset(params);
  }
  fundSupplyFund(params) {
    return DeadlineDao(this.info).fundSupplyFund(params);
  }
}

module.exports = req => new FsDao(req);
