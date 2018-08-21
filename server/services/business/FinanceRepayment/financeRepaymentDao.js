/**
 * @author robin
 * @file financeRepaymentDao
 * @date 2018-04-25 10:10
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order, Finance, Common } = dao;

class FinanceRepaymentDao extends Super {
  pagingQuery(params = {}) {
    const {
      repayment_code,
      fund_org_code,
      asset_org_code,
      partner_name,
      repayment_status,
      repayment_date_start,
      repayment_date_end,
      page_index,
    } = params;
    return Finance.FinanceRepayment(this.info, ['asset', 'fund', 'admin']).pagingSearch(
      {
        repayment_code,
        fund_org_code,
        asset_org_code,
        partner_name,
        repayment_status,
        repayment_date_start,
        repayment_date_end,
      },
      page_index,
    );
  }

  update(params = {}) {
    const {
      repayment_status,
      repayment_voucher_url,
      real_gathering_name,
      real_gathering_bank,
      real_gathering_card_no,
      repayment_name,
      repayment_bank,
      repayment_card_no,
      repayment_code,
      action_type
    } = params;
    return Finance.FinanceRepayment(this.info).update({
      repayment_status,
      repayment_voucher_url,
      real_gathering_name,
      real_gathering_bank,
      real_gathering_card_no,
      repayment_name,
      repayment_bank,
      repayment_card_no,
      repayment_code,
      action_type
    });
  }
  query(params = {}) {
    const { repayment_code } = params;
    return Finance.FinanceRepayment(this.info, ['asset', 'fund', 'admin']).nativeQuerySingle({ where: { repayment_code } });
  }

  confirmInvoke(params = {}) {
    const { repayment_code } = params;
    return Finance.FinanceRepayment(this.info).confirmInvoke({ repayment_code });
  }
}

module.exports = req => new FinanceRepaymentDao(req);
