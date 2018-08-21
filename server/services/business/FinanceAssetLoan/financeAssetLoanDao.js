/**
 * @author robin
 * @file financeLoanDao
 * @date 2018-04-24 12:51
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order, Finance, Common } = dao;

class FinanceAssetLoanDao extends Super {
  pagingQuery(params = {}) {
    const {
      loan_code,
      real_gathering_name,
      loan_status,
      fund_user_from,
      account_date_start,
      account_date_end,
      data_from,
      fund_org_code,
      asset_org_code,
      page_index,
    } = params;
    return Finance.FinanceLoan(this.info, ['asset', 'fund', 'admin']).pagingSearch(
      {
        loan_code,
        real_gathering_name,
        loan_status,
        fund_user_from,
        account_date_start,
        account_date_end,
        data_from,
        fund_org_code,
        asset_org_code,
      },
      page_index,
    );
  }

  query(params = {}) {
    const { loan_code } = params;
    return Finance.FinanceLoan(this.info).nativeQuerySingle({ where: { loan_code } });
  }

  update(params = {}) {
    const { loan_status, loan_code, action_type } = params;
    return Finance.FinanceLoan(this.info).update({ loan_status, loan_code ,action_type});
  }

  confirmInvoke(params = {}) {
    const { loan_code } = params;
    return Finance.FinanceLoan(this.info).confirmInvoke({ loan_code });
  }
}

module.exports = req => new FinanceAssetLoanDao(req);
