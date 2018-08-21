/**
 * @author robin
 * @file financeServiceDao
 * @date 2018-04-25 16:38
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order, Finance, Common } = dao;

class FinanceServiceDao extends Super {
  pagingQuery(params = {}) {
    const {
      settlement_code,
      fund_org_code,
      asset_org_code,
      settlement_status,
      settlement_mode,
      year,
      month,
      page_index,
    } = params;
    return Finance.FinanceServiceSettlement(this.info, ['asset', 'fund', 'admin']).pagingSearch(
      {
        settlement_code,
        fund_org_code,
        asset_org_code,
        settlement_status,
        settlement_mode,
        year,
        month,
      },
      page_index,
    );
  }

  update(params = {}) {
    const {
      settlement_status,
      repayment_voucher_url,
      real_gathering_name,
      real_gathering_bank,
      real_gathering_card_no,
      repayment_name,
      repayment_bank,
      repayment_card_no,
      settlement_code,
      action_type
    } = params;
    return Finance.FinanceServiceSettlement(this.info).update({
      settlement_status,
      repayment_voucher_url,
      real_gathering_name,
      real_gathering_bank,
      real_gathering_card_no,
      repayment_name,
      repayment_bank,
      repayment_card_no,
      settlement_code,
      action_type
    });
  }
  query(params = {}) {
    const { settlement_code } = params;
    return Finance.FinanceServiceSettlement(this.info, ['asset', 'fund', 'admin']).nativeQuerySingle({
      where: { settlement_code },
    });
  }
  confirmInvoke(params = {}) {
    const { settlement_code } = params;
    return Finance.FinanceServiceSettlement(this.info).confirmInvoke({ settlement_code });
  }
}

module.exports = req => new FinanceServiceDao(req);
