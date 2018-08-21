/**
 * @author robin
 * @file enterpriseOrderDao
 * @date 2018-04-12 12:58
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order, Enterprise, Common } = dao;

class EnterpriseOrderDao extends Super {
  count(params = {}) {
    const {
      asset_order_no,
      order_no,
      fund_org_code,
      asset_org_code,
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      order_status,
    } = params;
    return Enterprise.EnterpriseOrder(this.info,['asset','fund','admin']).corpOrdersCount({
      asset_order_no,
      order_no,
      fund_org_code,
      asset_org_code,
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      order_status,
    });
  }

  query(params = {}) {
    const {
      asset_order_no,
      order_no,
      fund_org_code,
      asset_org_code,
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      order_status,
      page_index,
    } = params;
    return Enterprise.EnterpriseOrder(this.info,['asset','fund','admin']).corpOrders(
      {
        asset_order_no,
        order_no,
        fund_org_code,
        asset_org_code,
        borrow_date_start,
        borrow_date_end,
        create_time_start,
        create_time_end,
        order_status,
      },
      page_index,
    );
  }

  deadline(params = {}) {
    return Common.Dealine(this.info).query();
  }

  filterOrderVoucher(params = {}) {
    const {
      asset_order_no,
      order_no,
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      order_status,
      page_index,
      admin_org_code,
      fund_org_code,
      asset_org_code,
    } = params;
    return Enterprise.EnterpriseOrder(this.info,['asset','fund','admin']).filter(
      {
        asset_order_no,
        order_no,
        borrow_date_start,
        borrow_date_end,
        create_time_start,
        create_time_end,
        order_status,
        admin_org_code,
        fund_org_code,
        asset_org_code,
      },
      page_index,
    );
  }

  orderRepayment(params = {}) {
    const { order_no } = params;
    return Order.OrderRepayment(this.info).query({ order_no });
  }

  orderVoucher(params = {}) {
    const { order_no } = params;
    return Order.OrderVoucher(this.info).query({ order_no });
  }

  orderContract(params = {}) {
    const { order_no } = params;
    return Order.OrderContract(this.info).query({ order_no });
  }

  orderPayment(params = {}) {
    const { order_no } = params;
    return Order.OrderPayment(this.info).query({ order_no });
  }

  orderAdvance(params = {}) {
    const { order_no } = params;
    return Order.OrderAdvance(this.info).query({ order_no });
  }

  orderAccount(params = {}) {
    const { order_no } = params;
    return Order.OrderAccount(this.info).query({ order_no });
  }
  orderCredit(params = {}) {
    const { order_no } = params;
    return Order.OrderCredit(this.info).query({ order_no });
  }
  orderService(params = {}) {
    const { order_no } = params;
    return Order.OrderService(this.info).service({ order_no });
  }
}

module.exports = req => new EnterpriseOrderDao(req);
