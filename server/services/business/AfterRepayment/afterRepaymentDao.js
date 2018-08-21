/**
 * @author robin
 * @file afterRepaymentDao
 * @date 2018-05-17 16:57
 */
const Super = require('../super');
const dao = require('../../../dao');
const {Order, AfterRepayment, Common} = dao;

class FinanceRepaymentDao extends Super {
  pagingQuery(params = {}) {
    const {asset_org_code,after_repayment_order_status,after_repayment_order_no ,page_index} = params;
    return AfterRepayment
      .AfterRepaymentOrder(this.info, ['asset','admin'])
      .pagingSearch({asset_org_code,after_repayment_order_status,after_repayment_order_no },page_index);
  }
  restrictedSearch(params = {}) {
    const {asset_org_code,fund_org_code,after_repayment_order_status,after_repayment_order_no ,page_index} = params;
    return AfterRepayment
      .AfterRepaymentOrder(this.info, ['fund'])
      .restrictedSearch({asset_org_code,fund_org_code,after_repayment_order_status,after_repayment_order_no },page_index);
  }
  /*restrictedCount(params = {}) {
    const {asset_org_code,fund_org_code,after_repayment_order_status,after_repayment_order_no} = params;
    return AfterRepayment
      .AfterRepaymentOrder(this.info, ['fund'])
      .restrictedCount({asset_org_code,fund_org_code,after_repayment_order_status,after_repayment_order_no });
  }*/
}

module.exports = req => new FinanceRepaymentDao(req);
