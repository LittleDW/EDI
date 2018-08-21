/**
 * @Author zhangjunjie
 * @Date 2018/4/17 11:31
 * @Description: 供需计划 fundSupply Service
 */
const fsDao = require('./fundSupplyDao');

const weekly = async (req) => {
  const params = {
    week: req.body.week,
    year: req.body.year,
  };
  const [dateRange] = await fsDao(req).getDateRange(params);
  const [weekList] = await fsDao(req).fundSupplyWeekly(dateRange);
  // TODO sequelize无法支持返回数字,需要手动转化
  weekList.forEach((item) => {
    item.asset_fee = parseInt(item.asset_fee);
    item.fund_fee = parseInt(item.fund_fee);
    item.result_fee = parseInt(item.result_fee);
  });
  return { weekList };
};

const daily = async (req) => {
  const params = {
    week: req.body.week,
    year: req.body.year,
    week_name: req.body.week_name,
  };
  const [dailyList] = await fsDao(req).fundSupplyDaily(params);
  // TODO sequelize无法支持返回数字,需要手动转化
  dailyList.forEach((item) => {
    item.asset_fee = parseInt(item.asset_fee);
    item.fund_fee = parseInt(item.fund_fee);
    item.result_fee = parseInt(item.result_fee);
  });
  return { dailyList };
};

const requirePlan = async (req) => {
  const params = {
    week: req.body.week,
    year: req.body.year,
    asset_org_code: req.body.asset_org_code,
  };
  const [deadlineData] = await fsDao(req).fundSupplyAsset(params);
  deadlineData.forEach((item) => {
    item.plan_fee = parseInt(item.plan_fee);
  });
  return { deadlineData };
};

const collectPlan = async (req) => {
  const params = {
    week: req.body.week,
    year: req.body.year,
    fund_org_code: req.body.fund_org_code,
  };
  const [deadlineData] = await fsDao(req).fundSupplyFund(params);
  deadlineData.forEach((item) => {
    item.plan_fee = parseInt(item.plan_fee);
  });
  return { deadlineData };
};

module.exports = {
  weekly,
  daily,
  requirePlan,
  collectPlan,
};
