/**
 * @author robin
 * @file repaymentDao
 * @date 2018-04-26 09:53
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order } = dao;

class RepaymentDao extends Super {
  pagingQuery(params = {}) {
    const {
      repayment_date_start,
      repayment_date_end,
      fund_org_code,
      asset_org_code,
      repayment_status,
      page_index,
    } = params;
    return Order.Repayment(this.info).repayment(
      {
        repayment_date_start, repayment_date_end, fund_org_code, asset_org_code, repayment_status,
      },
      page_index,
    );
  }

  count(params = {}) {
    const {
      repayment_date_start,
      repayment_date_end,
      fund_org_code,
      asset_org_code,
      repayment_status,
    } = params;
    return Order.Repayment(this.info).count({
      repayment_date_start,
      repayment_date_end,
      fund_org_code,
      asset_org_code,
      repayment_status,
    });
  }

  update(params = {}) {
    const {
      repayment_status, fund_org_code, asset_org_code, repayment_date,
    } = params;
    return Order.Repayment(this.info).update(
      { repayment_status },
      { fund_org_code, asset_org_code, repayment_date },
    );
  }

  query(params = {}) {
    const { fund_org_code, asset_org_code, repayment_date } = params;
    return Order.Repayment(this.info).query({ fund_org_code, asset_org_code, repayment_date });
  }
}

module.exports = req => new RepaymentDao(req);
