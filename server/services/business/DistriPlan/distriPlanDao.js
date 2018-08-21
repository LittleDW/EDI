/**
 * @Author zhangjunjie
 * @Date 08/04/2018 16:25
 * @Description: CollectionPlan Business Dao
 */
const _ = require('lodash');
const dao = require('../../../dao');

const { WeekAndDate: wdDao } = dao.Common;
const { AssetFund: assetFundDao } = dao.Combination;
const { User: userDao } = dao.User;
const {
  FunWeekPlan: fundWeekPlanDao,
  FundDayPlan: fundDayPlanDao,
  FundDeadlineDayPlan: fundDeadlinePlanDao,
} = dao.Fund;
const {
  AssetWeekPlan: assetWeekPlanDao,
  AssetDayPlan: assetDayPlanDao,
  AssetDeadlineDayPlan: assetDeadlinePlanDao,
} = dao.Asset;
const sequelize = require('sequelize');

const { Op } = sequelize;
const Super = require('../super');

class CollPlan extends Super {
  getNextWeek() {
    return wdDao.date(this.info).queryNextWeek();
  }
  search(params, user_type) {
    if (user_type === 1) {
      return assetFundDao(this.info).reqGetData(params);
    }
    return assetFundDao(this.info).colGetData(params);
  }
  searchDeadline(params, user_type) {
    if (user_type === 1) {
      return userDao(this.info).reqDeadlineGetData(params);
    }
    return userDao(this.info).colDeadlineGetData(params);
  }
  searchDeadlineFavor(params, user_type) {
    if (user_type === 1) {
      return userDao(this.info).distriPlanAssetDeadlineDataHasFavor(params);
    }
    return userDao(this.info).distriPlanFundDeadlineDataHasFavor(params);
  }
  searchHistory(params, page_index, user_type) {
    if (user_type === 1) {
      return assetWeekPlanDao(this.info).reqHisList(params, page_index);
    }
    return fundWeekPlanDao(this.info).colHisList(params, page_index);
  }
  searchHistoryCount(params, user_type) {
    if (user_type === 1) {
      return assetWeekPlanDao(this.info).reqHisListCount(params);
    }
    return fundWeekPlanDao(this.info).colHisListCount(params);
  }
  distriPlanDel(params = {}, t = null, user_type) {
    const {
      asset_org_code, fund_org_code, start_date, end_date,
    } = params;
    if (
      (user_type === 1 && _.isEmpty(asset_org_code)) ||
      (user_type === 2 && _.isEmpty(fund_org_code)) ||
      _.isEmpty(start_date) ||
      _.isEmpty(end_date)
    ) {
      throw new Error('计划维护失败：参数不正确');
    }
    const dayPlanDao = user_type === 1 ? assetDayPlanDao : fundDayPlanDao;
    const where = {
      plan_date: {
        [Op.between]: [start_date, end_date],
      },
    };
    if (user_type === 1) {
      where.asset_org_code = asset_org_code;
    } else {
      where.fund_org_code = fund_org_code;
    }
    return dayPlanDao(this.info)
      .nativeDelete({
        where,
        transaction: t,
      })
      .catch((e) => {
        throw new Error(e.message || '计划维护失败');
      });
  }
  distriPlanInsert(params = {}, t = null, user_type) {
    let {
      asset_org_code, fund_org_code, plan_date, plan_fee,
    } = params;
    if (_.isEmpty(asset_org_code) || _.isEmpty(fund_org_code) || _.isEmpty(plan_date)) {
      throw new Error('计划维护失败：参数不正确');
    }
    if (plan_fee === null) {
      plan_fee = 0;
    } else if (_.isNaN(parseFloat(plan_fee))) {
      throw new Error('计划维护失败：参数不正确');
    } else if (!_.isNumber(plan_fee)) {
      plan_fee = parseFloat(plan_fee);
    }
    const dayPlanDao = user_type === 1 ? assetDayPlanDao : fundDayPlanDao;
    return dayPlanDao(this.info)
      .nativeCreate(
        {
          asset_org_code,
          fund_org_code,
          plan_date,
          plan_fee: plan_fee || 0,
        },
        {
          transaction: t,
        },
      )
      .catch((e) => {
        throw new Error(e.message || '计划维护失败');
      });
  }
  distriDeadlinePlanDel(params = {}, t = null, user_type) {
    const {
      asset_org_code, fund_org_code, start_date, end_date,
    } = params;
    if (
      (user_type === 1 && _.isEmpty(asset_org_code)) ||
      (user_type === 2 && _.isEmpty(fund_org_code)) ||
      _.isEmpty(start_date) ||
      _.isEmpty(end_date)
    ) {
      throw new Error('计划维护失败：参数不正确');
    }
    const deadlinePlanDao = user_type === 1 ? assetDeadlinePlanDao : fundDeadlinePlanDao;
    const where = {
      plan_date: {
        [Op.between]: [start_date, end_date],
      },
    };
    if (user_type === 1) {
      where.asset_org_code = asset_org_code;
    } else {
      where.fund_org_code = fund_org_code;
    }
    return deadlinePlanDao(this.info)
      .nativeDelete({
        where,
        transaction: t,
      })
      .catch((e) => {
        throw new Error(e.message || '计划维护失败');
      });
  }
  distriDeadlinePlanInsert(params = {}, t = null, user_type) {
    let {
      asset_org_code, fund_org_code, deadline_id, plan_date, plan_fee,
    } = params;
    if (
      (user_type === 1 && _.isEmpty(asset_org_code)) ||
      (user_type === 2 && _.isEmpty(fund_org_code)) ||
      _.isEmpty(deadline_id) ||
      _.isEmpty(plan_date)
    ) {
      throw new Error('计划维护失败：参数不正确');
    }
    if (plan_fee === null) {
      plan_fee = 0;
    } else if (_.isNaN(parseFloat(plan_fee))) {
      throw new Error('计划维护失败：参数不正确');
    } else if (!_.isNumber(plan_fee)) {
      plan_fee = parseFloat(plan_fee);
    }
    const deadlinePlanDao = user_type === 1 ? assetDeadlinePlanDao : fundDeadlinePlanDao;
    return deadlinePlanDao(this.info)
      .nativeCreate(
        {
          asset_org_code,
          fund_org_code,
          plan_date,
          deadline_id,
          plan_fee: plan_fee || 0,
        },
        {
          transaction: t,
        },
      )
      .catch((e) => {
        throw new Error(e.message || '计划维护失败');
      });
  }
}

module.exports = req => new CollPlan(req);
