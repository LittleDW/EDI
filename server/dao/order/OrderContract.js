/*
 * File: OrderContract.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */


const Model = require('../super');

// "orderContract": "select order_no, contract_type, contract_number, contract_url from t_order_contract where 1=1 and order_no=:?order_no",
// "corpOrderContract": "select order_no, contract_type, contract_number, contract_url from t_order_contract where 1=1 and order_no=:?order_no",

class OrderContract extends Model {
  query(params = {}) {
    const attributes = ['order_no', 'contract_type', 'contract_number', 'contract_url'];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    return this.dao.findAll({
      attributes,
      where,
    });
  }
  corpOrder(params = {}) {
    return this.query(params).bind(this);
  }
  // filter(params = {}) {
  //   const attributes = ['voucher_name', 'voucher_url'];
  //   const subWhere = {};
  //   this.durationGenerator(
  //     params,
  //     subWhere,
  //     'borrow_date',
  //     'borrow_date_start',
  //     'borrow_date_end'
  //   );
  //   this.durationGenerator(
  //     params,
  //     subWhere,
  //     'rx_insertTime',
  //     'create_time_start',
  //     'create_time_end'
  //   );
  //   this.QueryParamsOfIntervalEnhancer(
  //     params,
  //     subWhere,
  //     'borrow_daycount',
  //     'deadline_from',
  //     'deadline_to'
  //   );
  //   this.queryParamsStringSetupBuilder(params, subWhere, 'fund_org_code');
  //   this.queryParamsStringSetupBuilder(params, subWhere, 'asset_org_code');
  //   this.queryParamsStringSetupBuilder(params, subWhere, 'asset_order_no');
  //   this.queryParamsStringSetupBuilder(params, subWhere, 'borrow_certificate_no');
  //   this.queryParamsStringSetupBuilder(params, subWhere, 'order_no');
  //   this.queryParamsStringSetupBuilder(params, subWhere, 'order_status');
  //   return this.dao.findAll({
  //     include: [
  //       {
  //         attributes: [],
  //         model: db.t_order,
  //         required: true,
  //         where: subWhere,
  //       },
  //     ],
  //     attributes,
  //     group: ['voucher_name', 'voucher_url'],
  //   });
  // }
}

// const orderContract = new OrderContract('t_order_contract');
module.exports = (info, accessList = []) => new OrderContract('t_order_contract', info, accessList);
