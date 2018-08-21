/*
 * File: EnterpriseOrder.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const _ = require('lodash');
const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');
const { db } = require('../../schema/index');

// "corpOrdersCount": "select count(*) as total, format(sum(borrow_fee)/100,2) as fee from t_enterprise_order where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and rx_insertTime >= :?create_time_start and rx_insertTime <= :?create_time_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no = :?asset_order_no and order_no = :?order_no and order_status in ::?order_status",
// "corpOrdersFundExport": "select o.order_no as 平台订单号, o.order_status as 订单状态, o.asset_org_code as 资产方机构号, u.user_name as 资产方机构名, o.asset_order_no as 资产方订单号, DATE_FORMAT(o.borrow_date, '%Y-%m-%d') as 借款日期, DATE_FORMAT(o.rx_insertTime, '%Y-%m-%d %H:%i:%s') as 创建时间, o.borrow_type as 借款主体类型, o.borrow_name as 借款人名称, o.borrow_business_license as 营业执照号, o.borrow_pay_mode as 借款支付方式, o.borrow_purpose as 借款用途, o.borrow_fee/100 as 借款金额（元）, o.borrow_period as 借款期限单位, o.borrow_deadline as 借款期限, o.gathering_name as 收款账号名称, o.gathering_bank as 收款账户开户行, o.gathering_card_no as 收款账户号, o.fund_org_code as 资金方机构号, o.fund_order_no as 资金方订单号, o.refuse_type as 拒绝类型, o.refuse_reason as 拒绝原因, o.repayment_mode as 还款方式, o.business_type as 业务类型 from t_enterprise_order as o left join t_user as u on o.fund_org_code = u.org_code where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no=:?asset_order_no  and order_no = :?order_no and order_status in ::?order_status order by order_no desc",
// "corpOrdersAdminExport": "select o.order_no as 平台订单号, o.order_status as 订单状态, o.asset_org_code as 资产方机构号, o.asset_order_no as 资产方订单号, DATE_FORMAT(o.borrow_date, '%Y-%m-%d') as 借款日期, DATE_FORMAT(o.rx_insertTime, '%Y-%m-%d %H:%i:%s') as 创建时间, o.borrow_type as 借款主体类型, o.borrow_name as 借款人名称, o.borrow_business_license as 营业执照号, o.borrow_pay_mode as 借款支付方式, o.borrow_purpose as 借款用途, o.borrow_fee/100 as 借款金额（元）, o.borrow_period as 借款期限单位, o.borrow_deadline as 借款期限, o.gathering_name as 收款账号名称, o.gathering_bank as 收款账户开户行, o.gathering_card_no as 收款账户号, o.fund_org_code as 资金方机构号, o.fund_order_no as 资金方订单号, o.refuse_type as 拒绝类型, o.refuse_reason as 拒绝原因, o.repayment_mode as 还款方式, o.business_type as 业务类型 from t_enterprise_order as o where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no=:?asset_order_no  and order_no = :?order_no and order_status in ::?order_status order by order_no desc",
// "corpOrdersAssetExport": "select o.order_no as 平台订单号, o.order_status as 订单状态, o.asset_org_code as 资产方机构号, o.asset_order_no as 资产方订单号, DATE_FORMAT(o.borrow_date, '%Y-%m-%d') as 借款日期, DATE_FORMAT(o.rx_insertTime, '%Y-%m-%d %H:%i:%s') as 创建时间, o.borrow_type as 借款主体类型, o.borrow_name as 借款人名称, o.borrow_business_license as 营业执照号, o.borrow_pay_mode as 借款支付方式, o.borrow_purpose as 借款用途, o.borrow_fee/100 as 借款金额（元）, o.borrow_period as 借款期限单位, o.borrow_deadline as 借款期限, o.gathering_name as 收款账号名称, o.gathering_bank as 收款账户开户行, o.gathering_card_no as 收款账户号, o.fund_org_code as 资金方机构号, u.user_name as 资金方机构名, o.fund_order_no as 资金方订单号, o.refuse_type as 拒绝类型, o.refuse_reason as 拒绝原因, o.repayment_mode as 还款方式, o.business_type as 业务类型 from t_enterprise_order as o left join t_user as u on o.asset_org_code = u.org_code where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and order_no = :?order_no and asset_order_no=:?asset_order_no and order_status in ::?order_status order by order_no desc ",
// "corpOrdersForPublicity": "select * from t_enterprise_order where 1=1 and asset_order_no = :?asset_order_no and order_no = :?order_no and borrow_name = :?borrow_name and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code order by order_no desc ",

class EnterpriseOrder extends Model {
  constructor(tableName,logInfo,accessList) {
    super(tableName,logInfo,accessList);
    this.commonAttributes = [
      ['order_no', '平台订单号'],
      ['order_status', '订单状态'],
      ['asset_org_code', '资产方机构号'],
      ['asset_order_no', '资产方订单号'],
      [s.fn('DATE_FORMAT', s.col('borrow_date'), '%Y-%m-%d'), '借款日期'],
      [
        s.fn(
          'DATE_FORMAT',
          s.col('t_enterprise_order.rx_insertTime'),
          '%Y-%m-%d %H:%i:%s'
        ),
        '创建时间',
      ],
      ['borrow_type', '借款主体类型'],
      ['borrow_name', '借款人名称'],
      ['borrow_business_license', '营业执照号'],
      ['borrow_pay_mode', '借款支付方式'],
      ['borrow_purpose', '借款用途'],
      [s.literal('FORMAT(`borrow_fee`/100,2)'), '借款金额（元'],
      ['borrow_period', '借款期限单位'],
      ['borrow_deadline', '借款期限'],
      ['gathering_name', '收款账号名称'],
      ['gathering_bank', '收款账户开户行'],
      ['gathering_card_no', '收款账户号'],
      ['fund_org_code', '资金方机构号'],
      ['fund_order_no', '资金方订单号'],
      ['refuse_type', '拒绝类型'],
      ['refuse_reason', '拒绝原因'],
      ['repayment_mode', '还款方式'],
      ['business_type', '业务类型'],
      ['data_from','数据来源'],
      // [s.col('fund_user.user_name'), '资金方机构名'],
    ];
  }

  corpOrders(params = {}, page_index = 0) {
    const attributes = [
      'order_no',
      'order_status',
      'asset_org_code',
      'asset_order_no',
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('borrow_date'), '%Y-%m-%d'),
        'borrow_date',
      ],
      'borrow_type',
      'borrow_name',
      'borrow_business_license',
      'borrow_purpose',
      /*[
        sequelize.fn('format', sequelize.col('borrow_fee'), '/ 100, 2'),
        'borrow_fee',
      ],*/
      [s.literal('FORMAT(`borrow_fee`/100,2)'), 'borrow_fee'],
      'borrow_period',
      'borrow_deadline',
      'borrow_pay_mode',
      'gathering_name',
      'gathering_bank',
      'gathering_card_no',
      'fund_org_code',
      'fund_order_no',
      'refuse_type',
      'refuse_reason',
      'business_type',
      'repayment_mode',
      'data_from',
      'bank_loan_contract_no',
      [
        sequelize.fn(
          'DATE_FORMAT',
          sequelize.col('rx_insertTime'),
          '%Y-%m-%d %H:%i:%s'
        ),
        'rx_insertTime',
      ],
    ];
    const where = {};
    this.durationGenerator(
      params,
      where,
      'borrow_date',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'create_time_start',
      'create_time_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsInSetupBuilder(params, where, 'order_status')

    return this.dao.findAll({
      order: [['order_no', 'DESC']],
      attributes,
      where,
      offset: page_index,
      limit: 10,
    });
  }

  corpOrdersCount(params = {}) {
    const attributes = [
      [s.fn('COUNT', '*'), 'total'],
      [s.literal('FORMAT(SUM( `borrow_fee` ) / 100, 2)'), 'fee'],
    ];
    const where = {};
    this.durationGenerator(
      params,
      where,
      'borrow_date',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'create_time_start',
      'create_time_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_status');
    return this.dao.findAll({
      attributes,
      where,
    });
  }
  corpOrdersFundExport(params = {}) {
    const attributes = _.cloneDeep(this.commonAttributes);
    attributes.push([s.col('fund_user.user_name'), '资金方机构名']);
    const where = {};
    this.durationGenerator(
      params,
      where,
      'borrow_date',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'create_time_start',
      'create_time_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_status');
    const order = [['order_no', 'DESC']];
    return this.dao.findAll({
      include: [{ model: db.t_user, as: 'fund_user', required: true }],
      attributes,
      where,
      order,
    });
  }
  corpOrdersAssetExport(params = {}) {
    const attributes = _.cloneDeep(this.commonAttributes);
    attributes.push([s.col('asset_user.user_name'), '资产方机构名']);
    const where = {};
    this.durationGenerator(
      params,
      where,
      'borrow_date',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'create_time_start',
      'create_time_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_status');
    const order = [['order_no', 'DESC']];
    return this.dao.findAll({
      include: [{ model: db.t_user, as: 'asset_user', required: true }],
      attributes,
      where,
      order,
    });
  }
  corpOrdersAdminExport(params = {}) {
    const attributes = this.commonAttributes;
    const where = {};
    this.durationGenerator(
      params,
      where,
      'borrow_date',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'create_time_start',
      'create_time_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_status');
    const order = [['order_no', 'DESC']];
    return this.dao.findAll({
      attributes,
      where,
      order,
    });
  }
  corpOrdersForPublicity(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsStringSetupBuilder(params, where, 'borrow_name');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    const order = [['order_no', 'DESC']];
    return this.dao.findAll({
      where,
      order,
    });
  }

  filter(params = {}) {
    const attributes = ['voucher_name', 'voucher_url'];
    const subWhere = {};
    this.durationGenerator(
      params,
      subWhere,
      'borrow_date',
      'borrow_date_start',
      'borrow_date_end',
    );
    this.durationGenerator(
      params,
      subWhere,
      'rx_insertTime',
      'create_time_start',
      'create_time_end',
    );
    this.QueryParamsOfIntervalEnhancer(
      params,
      subWhere,
      'borrow_daycount',
      'deadline_from',
      'deadline_to',
    );
    this.queryParamsStringSetupBuilder(params, subWhere, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, subWhere, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, subWhere, 'asset_order_no');
    this.queryParamsStringSetupBuilder(
      params,
      subWhere,
      'borrow_certificate_no',
    );
    this.queryParamsStringSetupBuilder(params, subWhere, 'order_no');
    this.queryParamsStringSetupBuilder(params, subWhere, 'order_status');
    return this.dao.findPlainAll({
      attributes:[],
      include: [
        {
          attributes,
          as:"t_enterprise_order_vouchers",
          model: this.db.t_order_voucher,
          required: true,
          //where: subWhere,
        },
      ],
      where: subWhere,
      group: ['order_no',sequelize.col('t_enterprise_order_vouchers.voucher_name'), sequelize.col('t_enterprise_order_vouchers.voucher_url')],
    });
  }
}

// const enterpriseOrder = new EnterpriseOrder('t_enterprise_order');
module.exports = (info, accessList = []) => new EnterpriseOrder('t_enterprise_order', info, accessList);
