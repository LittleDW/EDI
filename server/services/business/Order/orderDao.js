/**
 * @author robin
 * @file orderDao
 * @date 2018-04-03 15:36
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order, Common } = dao;

class OrderDao extends Super {
  count(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      deadline_from,
      deadline_to,
      fund_org_code,
      asset_org_code,
      asset_order_no,
      borrow_certificate_no,
      order_no,
      order_status,
    } = params;
    return Order.Order(this.info,['asset','fund','admin']).count({
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      deadline_from,
      deadline_to,
      fund_org_code,
      asset_org_code,
      asset_order_no,
      borrow_certificate_no,
      order_no,
      order_status,
    });
  }

  query(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      deadline_from,
      deadline_to,
      fund_org_code,
      asset_org_code,
      asset_order_no,
      borrow_certificate_no,
      order_no,
      order_status,
      page_index,
    } = params;
    return Order.Order(this.info,['asset','fund','admin']).orders(
      {
        borrow_date_start,
        borrow_date_end,
        create_time_start,
        create_time_end,
        deadline_from,
        deadline_to,
        fund_org_code,
        asset_org_code,
        asset_order_no,
        borrow_certificate_no,
        order_no,
        order_status,
      },
      page_index,
    );
  }

  deadline(params = {}) {
    return Common.Dealine(this.info,['asset','fund','admin']).query();
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
      borrow_certificate_no,
      deadline_from,
      deadline_to,
      admin_org_code,
      fund_org_code,
      asset_org_code,
    } = params;
    return Order.Order(this.info,['asset','fund','admin']).filter({
      asset_order_no,
      order_no,
      borrow_date_start,
      borrow_date_end,
      create_time_start,
      create_time_end,
      order_status,
      page_index,
      borrow_certificate_no,
      deadline_from,
      deadline_to,
      admin_org_code,
      fund_org_code,
      asset_org_code,
    });
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

module.exports = req => new OrderDao(req);
