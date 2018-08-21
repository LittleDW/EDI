/**
 * @Author zhangjunjie
 * @Date 2018/4/13 15:55
 * @Description: 还款计划表 repaymentPlan Service
 */
const planDao = require("./repaymentPlanDao");
const { getMySQLFieldValue } = require("../../../util");

const search = async req => {
  let { userType, startDate, endDate } = req.body
  let params = getMySQLFieldValue({
      org_code: req.session.profile.user_type == "3" ? "" : req.session.profile.org_code,
      startDate, 
      endDate
    });
  let rows
  const {user_type} = req.session.profile
  if (user_type == '1' || (user_type == '3' && userType=='fund_org_code')) {
    rows = await planDao(req).assetSearch(params)
  } else if (user_type == '2' || (user_type == '3' && userType !='fund_org_code')) {
    rows = await planDao(req).fundSearch(params)
  }
  rows.forEach(item => {
    item.all_fee = parseFloat(item.all_fee)
    item.interest_fee = parseFloat(item.interest_fee)
    item.principal_fee = parseFloat(item.principal_fee)
    item.service_fee = parseFloat(item.service_fee)
  })
  return { rows };
};

module.exports = {
  search
};
