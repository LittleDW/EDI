/*
 * File: OrderVoucher.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const { db } = require('../../schema/index');
const Model = require('../super');

// "orderVoucher": "select order_no, voucher_name, voucher_url from t_order_voucher where 1=1 and order_no=:?order_no",
// "filterOrderVoucher": "select v.voucher_name as voucher_name, v.voucher_url as voucher_url from t_order_voucher as v left join t_order as o on o.order_no = v.order_no where 1=1 and o.borrow_date >= :?borrow_date_start and o.borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and o.borrow_daycount >= :?deadline_from and o.borrow_daycount <= :?deadline_to and o.fund_org_code=:?fund_org_code and o.asset_org_code=:?asset_org_code and o.asset_order_no = :?asset_order_no and o.borrow_certificate_no like :?borrow_certificate_no and o.order_no = :?order_no and o.order_status in ::?order_status group by v.voucher_name,v.voucher_url",
// "filterCorpOrderVoucher": "select v.voucher_name as voucher_name, v.voucher_url as voucher_url from t_order_voucher as v left join t_enterprise_order as o on o.order_no = v.order_no  where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no = :?asset_order_no and o.order_no = :?order_no and order_status in ::?order_status group by v.voucher_name,v.voucher_url",
// "corpOrderVoucher": "select order_no, voucher_name, voucher_url from t_order_voucher where 1=1 and order_no=:?order_no",

class OrderVoucher extends Model {
  query(params = {}) {
    const attributes = ['order_no', 'voucher_name', 'voucher_url'];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    return this.dao.findAll({
      attributes,
      where,
    });
  }
  // FIXME
  corpOrder(params = {}) {
    return this.query(params).bind(this);
  }
}

// const orderVoucher = new OrderVoucher('t_order_voucher');
module.exports = (info, accessList = []) => new OrderVoucher('t_order_voucher', info, accessList);
