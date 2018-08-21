/*
 * File: OrderAccount.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');

// "orderAccount": "select order_no, fund_org_code, fund_order_no, product_rate, format(account_fee/100,2) as account_fee, DATE_FORMAT(account_date, '%Y-%m-%d') as account_date, real_gathering_name,real_gathering_bank,real_gathering_card_no,repayment_card_no,repayment_bank,repayment_name from t_order_account where 1=1 and order_no=:?order_no",
// "corpOrderAccount": "select order_no, fund_org_code, fund_order_no, product_rate, format(account_fee/100,2) as account_fee, DATE_FORMAT(account_date, '%Y-%m-%d') as account_date, real_gathering_name,real_gathering_bank,real_gathering_card_no,repayment_card_no,repayment_bank,repayment_name from t_order_account where 1=1 and order_no=:?order_no",

class OrderAccount extends Model {
  query(params = {}) {
    const attributes = [
      'order_no',
      'fund_org_code',
      'fund_order_no',
      'product_rate',
      [s.fn('DATE_FORMAT', s.col('account_date'), '%Y-%m-%d'), 'account_date'],
      [s.literal('FORMAT(`account_fee`/100, 2)'), 'account_fee'],
      'real_gathering_name',
      'real_gathering_bank',
      'real_gathering_card_no',
      'repayment_card_no',
      'repayment_bank',
      'repayment_name',
    ];
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

// const orderAccount = new OrderAccount('t_order_account');
module.exports = (info, accessList = []) => new OrderAccount('t_order_account', info, accessList);
