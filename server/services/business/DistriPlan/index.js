/**
 * @Author zhangjunjie
 * @Date 08/04/2018 16:04
 * @Description: DistriPlan Service
 */

const moment = require('moment');
const Dao = require('./distriPlanDao');
const { sequelizeDB } = require('../../../schema');
const { getMySQLFieldValue } = require('../../../util');
const _ = require('lodash');

const search = async (req) => {
  const { week, year } = req.body;
  let params = getMySQLFieldValue({
    week,
    year,
  });
  const [tarWeek] = await Dao(req).getNextWeek(params);
  const readOnly =
    Number(params.year) < Number(tarWeek.year) ||
    (Number(params.year) === Number(tarWeek.year) &&
      Number(params.week) < Number(tarWeek.week));

  const { user_type } = req.session.profile;
  params = {
    ...params,
    asset_org_code: user_type === 1 ? req.session.profile.org_code : '',
    fund_org_code: user_type === 2 ? req.session.profile.org_code : '',
  };
  let [data, deadlineData, deadlineDataFavor] = await Promise.all([
    Dao(req).search(params, user_type),
    Dao(req).searchDeadline(params, user_type),
    Dao(req).searchDeadlineFavor(params, user_type),
  ]);
  deadlineData = [...deadlineData, ...deadlineDataFavor];
  if (!deadlineData || deadlineData.some((item) => !item.deadline_id)) {
    deadlineData = [];
  }
  return {
    readOnly,
    data,
    deadlineData,
  };
};

const searchHis = async (req) => {
  const { year, week, pageIndex } = req.body;
  const page_index =
    isNaN(pageIndex) || pageIndex < 1 ? 0 : 70 * (pageIndex - 1);
  const end_date = `${year}${week}`;
  const { user_type } = req.session.profile;
  const params = {
    end_date,
    asset_org_code: user_type === 1 ? req.session.profile.org_code : '',
    fund_org_code: user_type === 2 ? req.session.profile.org_code : '',
  };
  const [[[{ count }]], [hisList]] = await Promise.all([
    Dao(req).searchHistoryCount(params, user_type),
    Dao(req).searchHistory(params, page_index, user_type),
  ]);
  return {
    total: count,
    hisList,
  };
};

const update = async (req) => {
  const {
    startDate,
    endDate,
    data,
    deadlineData,
    hasFavor,
    preferedDeadline,
  } = req.body;
  if (
    _.isEmpty(startDate) ||
    _.isEmpty(endDate) ||
    moment(startDate).day() !== 1 ||
    moment(endDate).day() !== 0 ||
    moment(startDate).diff(moment(), 'hours') <= 0
  ) {
    throw new Error('请选择合法的周进行设置');
  } else if (moment(startDate).diff(moment(), 'hours') < 55) {
    throw new Error('周五17:00之后不可更改下周计划');
  }
  const { org_code, user_type } = req.session.profile;
  const params = {
    fund_org_code: user_type === 2 ? org_code : '',
    asset_org_code: user_type === 1 ? org_code : '',
    start_date: startDate,
    end_date: endDate,
  };
  const t = await sequelizeDB.transaction();
  try {
    // 资金需求计划 / 资产募集计划
    await Dao(req).distriPlanDel(params, t, user_type);
    const insertQ = [];
    data.forEach((item) => {
      let { asset_org_code, fund_org_code, plan_date, plan_fee } = item;
      // plan_fee 若是undefined 或者 null ,则存入0
      if (_.isNil(plan_fee)) {
        plan_fee = 0;
      }
      insertQ.push(
        Dao(req).distriPlanInsert(
          { asset_org_code, fund_org_code, plan_date, plan_fee },
          t,
          user_type,
        ),
      );
    });
    await Promise.all(insertQ);
    // 产品期限计划
    await Dao(req).distriDeadlinePlanDel(params, t, user_type);
    const insertDeadlineQ = [];
    deadlineData.forEach((item) => {
      let {
        asset_org_code,
        fund_org_code,
        deadline_id,
        plan_date,
        plan_fee,
      } = item;
      if (!hasFavor && deadline_id !== '100') {
        plan_fee = 0;
      } else if (hasFavor && !preferedDeadline.includes(deadline_id)) {
        plan_fee = 0;
      }
      // plan_fee 若是undefined 或者 null ,则存入0
      if (_.isNil(plan_fee)) {
        plan_fee = 0;
      }
      insertDeadlineQ.push(
        Dao(req).distriDeadlinePlanInsert(
          { asset_org_code, fund_org_code, deadline_id, plan_date, plan_fee },
          t,
          user_type,
        ),
      );
    });
    await Promise.all(insertDeadlineQ);
    await t.commit();
    return { success: true };
  } catch (e) {
    await t.rollback();
    throw new Error(e.message || '更新错误');
  }
};
module.exports = {
  search,
  searchHis,
  update,
};
