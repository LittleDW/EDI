const _ = require('lodash');
const sequelize = require('sequelize');

const s = sequelize;
const { Op } = sequelize;

const Model = require('../super');

// "orders": "select order_no, order_status, asset_org_code, asset_order_no, DATE_FORMAT(borrow_date, '%Y-%m-%d') as borrow_date, borrow_type, borrow_name, borrow_certificate_type, borrow_certificate_no, borrow_phone, borrow_bank, borrow_card_type, borrow_card_no, borrow_area, borrow_work_address, borrow_family_address, borrow_census_address, borrow_pay_mode, borrow_purpose, format(borrow_fee/100,2) as borrow_fee, borrow_period, borrow_deadline, format(borrow_credit_fee/100,2) as borrow_credit_fee, borrow_credit_report, borrow_income_report, gathering_name, gathering_bank, gathering_card_no, fund_org_code, fund_order_no, refuse_type, refuse_reason, business_type,repayment_mode,bank_loan_contract_no,occupation,repayment_from,DATE_FORMAT(rx_insertTime, '%Y-%m-%d %H:%i:%s') as rx_insertTime from t_order where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and rx_insertTime >= :?create_time_start and rx_insertTime <= :?create_time_end and borrow_daycount >= :?deadline_from and borrow_daycount <= :?deadline_to and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no = :?asset_order_no and borrow_certificate_no like :?borrow_certificate_no and order_no = :?order_no and order_status in ::?order_status order by order_no desc limit :?page_index,10",
// "ordersCount": "select count(*) as total, format(sum(borrow_fee)/100,2) as fee from t_order where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and rx_insertTime >= :?create_time_start and rx_insertTime <= :?create_time_end and borrow_daycount >= :?deadline_from and borrow_daycount <= :?deadline_to and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no = :?asset_order_no and borrow_certificate_no like :?borrow_certificate_no and order_no = :?order_no and order_status in ::?order_status",
// "ordersAssetExport": "select o.order_no as 平台订单号, o.order_status as 订单状态, o.asset_org_code as 资产方机构号, o.asset_order_no as 资产方订单号, DATE_FORMAT(o.borrow_date, '%Y-%m-%d') as 借款日期, DATE_FORMAT(o.rx_insertTime, '%Y-%m-%d %H:%i:%s') as 创建时间, o.borrow_type as 借款主体类型, o.borrow_name as 借款人名称, o.borrow_certificate_type as 借款人证件类型, o.borrow_certificate_no as 借款人证件号, o.borrow_phone as 借款人银行预留手机号, o.borrow_bank as 借款人开户行, o.borrow_card_type as 借款人银行卡类型, o.borrow_card_no as 借款人银行卡号, o.borrow_area as 借款人所属地区, o.borrow_work_address as 借款人工作地址, o.borrow_family_address as 借款人家庭地址, o.borrow_census_address as 借款人户籍地址, o.borrow_pay_mode as 借款支付方式, o.borrow_purpose as 借款用途, o.borrow_fee/100 as 借款金额（元）, o.borrow_period as 借款期限单位, o.borrow_deadline as 借款期限, o.borrow_credit_fee/100 as 借款人授信额度, o.borrow_credit_report as 借款人征信报告情况, o.borrow_income_report as 借款人收入情况, o.business_type as 业务类型, o.gathering_name as 收款账号名称, o.gathering_bank as 收款账户开户行, o.gathering_card_no as 收款账户号, o.fund_org_code as 资金方机构号, u.user_name as 资金方机构名, o.fund_order_no as 资金方订单号, o.refuse_type as 拒绝类型, o.refuse_reason as 拒绝原因, o.repayment_mode as 还款方式, o.occupation as 借款人职业, o.repayment_from as 还款来源 from t_order as o left join t_user as u on o.asset_org_code = u.org_code where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and o.borrow_daycount >= :?deadline_from and o.borrow_daycount <= :?deadline_to and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no=:?asset_order_no and order_no = :?order_no and order_status in ::?order_status and borrow_certificate_no like :?borrow_certificate_no order by order_no desc ",
// "ordersFundExport": "select o.order_no as 平台订单号, o.order_status as 订单状态, o.asset_org_code as 资产方机构号, u.user_name as 资产方机构名, o.asset_order_no as 资产方订单号, DATE_FORMAT(o.borrow_date, '%Y-%m-%d') as 借款日期, DATE_FORMAT(o.rx_insertTime, '%Y-%m-%d %H:%i:%s') as 创建时间, o.borrow_type as 借款主体类型, o.borrow_name as 借款人名称, o.borrow_certificate_type as 借款人证件类型, o.borrow_certificate_no as 借款人证件号, o.borrow_phone as 借款人银行预留手机号, o.borrow_bank as 借款人开户行, o.borrow_card_type as 借款人银行卡类型, o.borrow_card_no as 借款人银行卡号, o.borrow_area as 借款人所属地区, o.borrow_work_address as 借款人工作地址, o.borrow_family_address as 借款人家庭地址, o.borrow_census_address as 借款人户籍地址, o.borrow_pay_mode as 借款支付方式, o.borrow_purpose as 借款用途, o.borrow_fee/100 as 借款金额（元）, o.borrow_period as 借款期限单位, o.borrow_deadline as 借款期限, o.borrow_credit_fee/100 as 借款人授信额度, o.borrow_credit_report as 借款人征信报告情况, o.borrow_income_report as 借款人收入情况, o.business_type as 业务类型, o.gathering_name as 收款账号名称, o.gathering_bank as 收款账户开户行, o.gathering_card_no as 收款账户号, o.fund_org_code as 资金方机构号, o.fund_order_no as 资金方订单号, o.refuse_type as 拒绝类型, o.refuse_reason as 拒绝原因, o.repayment_mode as 还款方式, o.occupation as 借款人职业, o.repayment_from as 还款来源 from t_order as o left join t_user as u on o.fund_org_code = u.org_code where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and o.borrow_daycount >= :?deadline_from and o.borrow_daycount <= :?deadline_to and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and asset_order_no=:?asset_order_no and order_no = :?order_no and order_status in ::?order_status and borrow_certificate_no like :?borrow_certificate_no order by order_no desc",
// "ordersAdminExport": "select o.order_no as 平台订单号, o.order_status as 订单状态, o.asset_org_code as 资产方机构号, o.asset_order_no as 资产方订单号, DATE_FORMAT(o.borrow_date, '%Y-%m-%d') as 借款日期, DATE_FORMAT(o.rx_insertTime, '%Y-%m-%d %H:%i:%s') as 创建时间, o.borrow_type as 借款主体类型, o.borrow_name as 借款人名称, o.borrow_certificate_type as 借款人证件类型, o.borrow_certificate_no as 借款人证件号, o.borrow_phone as 借款人银行预留手机号, o.borrow_bank as 借款人开户行, o.borrow_card_type as 借款人银行卡类型, o.borrow_card_no as 借款人银行卡号, o.borrow_area as 借款人所属地区, o.borrow_work_address as 借款人工作地址, o.borrow_family_address as 借款人家庭地址, o.borrow_census_address as 借款人户籍地址, o.borrow_pay_mode as 借款支付方式, o.borrow_purpose as 借款用途, o.borrow_fee/100 as 借款金额（元）, o.borrow_period as 借款期限单位, o.borrow_deadline as 借款期限, o.borrow_credit_fee/100 as 借款人授信额度, o.borrow_credit_report as 借款人征信报告情况, o.borrow_income_report as 借款人收入情况, o.business_type as 业务类型, o.gathering_name as 收款账号名称, o.gathering_bank as 收款账户开户行, o.gathering_card_no as 收款账户号, o.fund_org_code as 资金方机构号, o.fund_order_no as 资金方订单号, o.refuse_type as 拒绝类型, o.refuse_reason as 拒绝原因, o.repayment_mode as 还款方式, o.occupation as 借款人职业, o.repayment_from as 还款来源 from t_order as o where 1=1 and borrow_date >= :?borrow_date_start and borrow_date <= :?borrow_date_end and o.rx_insertTime >= :?create_time_start and o.rx_insertTime <= :?create_time_end and o.borrow_daycount >= :?deadline_from and o.borrow_daycount <= :?deadline_to and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and order_no = :?order_no and asset_order_no=:?asset_order_no and order_status in ::?order_status and borrow_certificate_no like :?borrow_certificate_no order by order_no desc",
// "ordersForPublicity": "select * from t_order where 1=1 and asset_order_no = :?asset_order_no and order_no = :?order_no and borrow_name = :?borrow_name and borrow_certificate_no = :?borrow_certificate_no and borrow_phone = :?borrow_phone and borrow_card_no = :?borrow_card_no and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code order by order_no desc ",
class Order extends Model {
  constructor(tableName, logInfo, accessList) {
    super(tableName, logInfo, accessList);
    this.commonAttributes = [
      ['order_no', '平台订单号'],
      ['order_status', '订单状态'],
      ['asset_org_code', '资产方机构号'],
      ['asset_order_no', '资产方订单号'],
      [s.fn('DATE_FORMAT', s.col('borrow_date'), '%Y-%m-%d'), '借款日期'],
      [s.fn('DATE_FORMAT', s.col('t_order.rx_insertTime'), '%Y-%m-%d %H:%i:%s'), '创建时间'],
      ['borrow_type', '借款主体类型'],
      ['borrow_name', '借款人名称'],
      ['borrow_certificate_type', '借款人证件类型'],
      ['borrow_certificate_no', '借款人证件号'],
      ['borrow_phone', '借款人银行预留手机号'],
      ['borrow_bank', '借款人开户行'],
      ['borrow_card_type', '借款人银行卡类型'],
      ['borrow_card_no', '借款人银行卡号'],
      ['borrow_area', '借款人所属地区'],
      ['borrow_work_address', '借款人工作地址'],
      ['borrow_family_address', '借款人家庭地址'],
      ['borrow_census_address', '借款人户籍地址'],
      ['borrow_pay_mode', '借款支付方式'],
      ['borrow_purpose', '借款用途'],
      [s.literal('FORMAT(`borrow_fee`/100,2)'), '借款金额（元）'],
      ['borrow_period', '借款期限单位'],
      ['borrow_deadline', '借款期限'],
      [s.literal('FORMAT(`borrow_credit_fee`/100,2)'), '借款人授信额度'],
      ['borrow_credit_report', '借款人征信报告情况'],
      ['borrow_income_report', '借款人收入情况'],
      ['borrow_mail','借款人邮箱'],
      ['data_from','数据来源'],
      //[s.literal('IF(t_order.data_from = \'A\', \'系统对接\', \'手动创建\')'), '数据来源'],
      ['business_type', '业务类型'],
      ['gathering_name', '收款账号名称'],
      ['gathering_bank', '收款账户开户行'],
      ['gathering_card_no', '收款账户号'],
      ['fund_org_code', '资金方机构号'],
      // [s.col('asset_user.user_name'), '资金方机构名'],
      ['fund_order_no', '资金方订单号'],
      ['refuse_type', '拒绝类型'],
      ['refuse_reason', '拒绝原因'],
      ['repayment_mode', '还款方式'],
      ['occupation', '借款人职业'],
      ['repayment_from', '还款来源'],
      ['credit_org','授信机构'],
      ['credit_score','授信评分'],
      ['court_exec_count','被法院执行总次数'],
    ];
  }

  durationBuilder(params, where) {
    this.durationGenerator(params, where, 'borrow_date', 'borrow_date_start', 'borrow_date_end');

    this.durationGenerator(params, where, 'rx_insertTime', 'create_time_start', 'create_time_end');
  }
  exportWhereBuilder(params, where) {
    this.durationBuilder(params, where);
    this.QueryParamsOfIntervalEnhancer(
      params,
      where,
      'borrow_daycount',
      'deadline_from',
      'deadline_to',
    );
    if (!_.isEmpty(params.fund_org_code)) {
      _.assign(where, { fund_org_code: params.fund_org_code });
    }
    if (!_.isEmpty(params.asset_org_code)) {
      _.assign(where, { asset_org_code: params.asset_org_code });
    }
    if (!_.isEmpty(params.asset_order_no)) {
      _.assign(where, { asset_order_no: params.asset_order_no });
    }
    if (!_.isEmpty(params.order_no)) {
      _.assign(where, { order_no: params.order_no });
    }
    if (!_.isEmpty(params.order_status) && _.isArray(params.order_status)) {
      _.assign(where, { order_status: { [Op.in]: params.order_no } });
    }
    if (!_.isEmpty(params.borrow_certificate_no)) {
      _.assign(where, {
        borrow_certificate_no: { [Op.like]: params.borrow_certificate_no },
      });
    }
    return where;
  }
  orders(params = {}, page_index = 0) {
    const attributes = [
      'order_no',
      'order_status',
      'asset_org_code',
      'asset_order_no',
      [sequelize.fn('DATE_FORMAT', sequelize.col('borrow_date'), '%Y-%m-%d'), 'borrow_date'],
      'borrow_type',
      'borrow_name',
      'borrow_certificate_type',
      'borrow_certificate_no',
      'borrow_phone',
      'borrow_bank',
      'borrow_card_type',
      'borrow_card_no',
      'borrow_area',
      'borrow_work_address',
      'borrow_family_address',
      'borrow_census_address',
      'borrow_pay_mode',
      'borrow_purpose',
      'borrow_mail',
      'data_from',
      [s.literal('FORMAT(`borrow_fee`/100,2)'), 'borrow_fee'],
      'borrow_period',
      'borrow_deadline',
      [s.literal('FORMAT(`borrow_credit_fee`/100,2)'), 'borrow_credit_fee'],
      'borrow_credit_report',
      'borrow_income_report',
      'gathering_name',
      'gathering_bank',
      'gathering_card_no',
      'fund_org_code',
      'fund_order_no',
      'refuse_type',
      'refuse_reason',
      'business_type',
      'repayment_mode',
      'bank_loan_contract_no',
      'occupation',
      'repayment_from',
      'credit_org',
      'credit_score',
      'court_exec_count',
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('rx_insertTime'), '%Y-%m-%d %H:%i:%s'),
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
    this.QueryParamsOfIntervalEnhancer(
      params,
      where,
      'borrow_daycount',
      'deadline_from',
      'deadline_to',
    );
    //this.durationGenerator(params, where, 'borrow_daycount', 'deadline_from', 'deadline_to');
    if (!_.isEmpty(params.fund_org_code)) {
      _.assign(where, {
        fund_org_code: params.fund_org_code,
      });
    }
    if (!_.isEmpty(params.asset_org_code)) {
      _.assign(where, {
        asset_org_code: params.asset_org_code,
      });
    }
    if (!_.isEmpty(params.asset_order_no)) {
      _.assign(where, {
        asset_order_no: params.asset_order_no,
      });
    }
    if (!_.isEmpty(params.borrow_certificate_no)) {
      _.assign(where, {
        borrow_certificate_no: { [Op.like]: params.borrow_certificate_no },
      });
    }
    if (!_.isEmpty(params.order_no)) {
      _.assign(where, {
        order_no: params.order_no,
      });
    }
    if (!_.isEmpty(params.order_status)) {
      _.assign(where, {
        order_status: { [Op.in]: params.order_status },
      });
    }

    return this.dao.findAll({
      order: [['order_no', 'DESC']],
      attributes,
      where,
      offset: page_index,
      limit: 10,
    });
  }
  count(params = {}) {
    const attributes = [
      [sequelize.fn('COUNT', '*'), 'total'],
      [sequelize.literal('FORMAT(sum(borrow_fee)/100,2)'), 'fee'],
    ];
    const where = {};
    this.durationGenerator(params, where, 'borrow_date', 'borrow_date_start', 'borrow_date_end');
    this.durationGenerator(params, where, 'rx_insertTime', 'create_time_start', 'create_time_end');
    this.QueryParamsOfIntervalEnhancer(params, where, 'borrow_daycount', 'deadline_from', 'deadline_to');
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_certificate_no');
    this.queryParamsInSetupBuilder(params, where, 'order_status');
    return this.dao.findAll({
      attributes,
      where,
    });
  }
  assetExport(params = {}) {
    const attributes = _.cloneDeep(this.commonAttributes);
    attributes.push([s.col('asset_user.user_name'), '资产方机构名']);
    const where = {};
    this.exportWhereBuilder(params, where);
    return this.dao.findAll({
      include: [{ model: this.db.t_user, as: 'asset_user', require: true }],
      attributes,
      where,
      order: [['order_no', 'DESC']],
    });
  }
  fundExport(params = {}) {
    const attributes = _.cloneDeep(this.commonAttributes);
    attributes.push([s.col('fund_user.user_name'), '资金方机构名']);
    const where = {};
    this.exportWhereBuilder(params, where);
    return this.dao.findAll({
      include: [{ model: this.db.t_user, as: 'fund_user', require: true }],
      attributes,
      where,
      order: [['order_no', 'DESC']],
    });
  }
  adminExport(params = {}) {
    const where = {};
    const attributes = this.commonAttributes;
    this.exportWhereBuilder(params, where);
    return this.dao.findAll({
      attributes,
      where,
      order: [['order_no', 'DESC']],
    });
  }

  publicityQuery(params = {}, page_index = 0) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_order_no');
    this.queryParamsStringSetupBuilder(params, where, 'order_no');
    this.queryParamsStringSetupBuilder(params, where, 'borrow_name');
    this.queryParamsStringSetupBuilder(params, where, 'borrow_certificate_no');
    this.queryParamsStringSetupBuilder(params, where, 'borrow_phone');
    this.queryParamsStringSetupBuilder(params, where, 'borrow_card_no');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    return this.dao.findAll({
      order: [['order_no', 'DESC']],
      where,
    });
  }

  queryWithdraw(params = {}, page_index = 0) {
    const attributes = [
      'order_no',
      'order_status',
      'asset_org_code',
      'asset_order_no',
      [sequelize.fn('DATE_FORMAT', sequelize.col('borrow_date'), '%Y-%m-%d'), 'borrow_date'],
      'borrow_type',
      'borrow_name',
      'borrow_certificate_type',
      'borrow_certificate_no',
      'borrow_phone',
      'borrow_bank',
      'borrow_card_type',
      'borrow_card_no',
      'borrow_area',
      'borrow_work_address',
      'borrow_family_address',
      'borrow_census_address',
      'borrow_pay_mode',
      'borrow_purpose',
      [s.literal('FORMAT(`borrow_fee`/100,2)'), 'borrow_fee'],
      'borrow_period',
      'borrow_deadline',
      [s.literal('FORMAT(`borrow_credit_fee`/100,2)'), 'borrow_credit_fee'],
      'borrow_credit_report',
      'borrow_income_report',
      'borrow_mail',
      'data_from',
      'gathering_name',
      'gathering_bank',
      'gathering_card_no',
      'fund_org_code',
      'fund_order_no',
      'refuse_type',
      'refuse_reason',
      'business_type',
      'repayment_mode',
      'bank_loan_contract_no',
      'occupation',
      'repayment_from',
      'credit_org',
      'credit_score',
      'court_exec_count',
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('t_order.rx_insertTime'), '%Y-%m-%d %H:%i:%s'),
        'order_rx_insertTime',
      ],
    ];
    const apiAttributes = [
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('t_order_payment.payment_date'), '%Y-%m-%d'),
        'payment_date',
      ],
    ];
    const orderWhere = {};
    const paymentWhere = {};
    const withdrawWhere = {};

    this.queryParamsInSetupBuilder(params, withdrawWhere, 'withdraw_status');

    this.durationGenerator(
      params,
      orderWhere,
      'borrow_date',
      'borrow_start_date',
      'borrow_end_date',
    );
    this.queryParamsStringSetupBuilder(params, orderWhere, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, orderWhere, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, orderWhere, 'asset_order_no');
    this.queryParamsLikeSetupBuilder(params, orderWhere, 'order_no');
    this.queryParamsLikeSetupBuilder(params, orderWhere, 'borrow_certificate_no');

    this.durationGenerator(
      params,
      paymentWhere,
      'payment_date',
      'payment_start_date',
      'payment_end_date',
    );

    return this.dao.findPlainAll({
      include: [
        {
          model: this.db.t_order_withdraw,
          require: false,
          where: withdrawWhere,
        },
        {
          model: this.db.t_order_payment,
          attributes: apiAttributes,
          where: paymentWhere,
          require: false,
        },
        {
          model: this.db.t_fund_api,
          require: false,
          where: { api_type: '04' },
        },
      ],
      where: orderWhere,
      attributes,
      order: [[sequelize.col('t_order_payment.payment_date'), 'DESC']],
      offset: page_index,
      limit: 10,
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
          as:"t_order_order_vouchers",
          model: this.db.t_order_voucher,
          required: true,
          //where: subWhere,
        },
      ],
      where: subWhere,
      group: ['order_no',sequelize.col('t_order_order_vouchers.voucher_name'), sequelize.col('t_order_order_vouchers.voucher_url')],
    });
  }
}

// const order = new Order('t_order');
module.exports = (info, accessList = []) => new Order('t_order', info, accessList);
