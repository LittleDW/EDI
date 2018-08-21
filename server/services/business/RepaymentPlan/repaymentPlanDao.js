/**
 * @Author zhangjunjie
 * @Date 2018/4/13 15:55
 * @Description: 还款计划表 repaymentPlan Bussiness Dao
 */

const dao = require('../../../dao');

const { FinanceAssetRepaymentPlan: assetDao, FinanceFundRepaymentPlan: fundDao } = dao.Finance;
const Super = require('../super');

class RepaymentPlan extends Super {
  assetSearch(params) {
    const {start_date, end_date} = params
    if (!start_date || !end_date ) {
      throw new Error('请选择正确的起始和结束时间')
    }
    return assetDao(this.info, ['asset', 'fund']).search(params);
  }
  fundSearch(params) {
    const {start_date, end_date} = params
    if (!start_date || !end_date ) {
      throw new Error('请选择正确的起始和结束时间')
    }
    return fundDao(this.info, ['asset', 'fund']).search(params);
  }
}

module.exports = req => new RepaymentPlan(req);
