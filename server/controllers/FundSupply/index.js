/**
 * @Author zhangjunjie
 * @Date 2018/4/17 11:22
 * @Description: 供需计划 fundSupply Controller
 */
const { fundSupply } = require('../../services').business;

const weekly = async (req, res) => {
  const { weekList } = await fundSupply.weekly(req);
  return res.json({
    success: true,
    weekList,
  });
};

const daily = async (req, res) => {
  const { dailyList } = await fundSupply.daily(req);
  return res.json({
    success: true,
    dailyList,
  });
};

const requirePlan = async (req, res) => {
  const { deadlineData } = await fundSupply.requirePlan(req);
  return res.json({
    success: true,
    deadlineData,
  });
};

const collectPlan = async (req, res) => {
  const { deadlineData } = await fundSupply.collectPlan(req);
  return res.json({
    success: true,
    deadlineData,
  });
};

module.exports = {
  weekly,
  daily,
  requirePlan,
  collectPlan,
};
