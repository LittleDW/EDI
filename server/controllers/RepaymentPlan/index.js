/**
 * @Author zhangjunjie
 * @Date 2018/4/13 15:48
 * @Description: 还款计划表 repaymentPlan Controller
*/
const {repaymentPlan} = require('../../services/').business
const search = async (req, res) => {
  const {rows} = await repaymentPlan.search(req)
  return res.json({success: true, rows})
}

module.exports = {
  search,
}
