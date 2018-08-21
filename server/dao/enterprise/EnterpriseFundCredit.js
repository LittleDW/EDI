/*
 * File: EnterpriseFundCredit.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');
const { db } = require('../../schema/index');

// "corpFundAuth": "SELECT DATE_FORMAT(fund.rx_insertTime, '%Y-%m-%d %H:%i:%s') as borrow_time, fund.borrow_business_license, fund.asset_org_code, asset.borrow_name, fund.fund_credit_status, fund.fund_credit_fee, fund.fund_credit_refuse_reason, fund.fund_org_code,asset.asset_credit_status,asset.borrow_org_code,asset.borrow_account_licence,asset.borrow_credit_code,asset.borrow_tax_registration,asset.borrow_enterprise_type,asset.borrow_type,asset.borrow_registered_address,asset.borrow_manage_address,DATE_FORMAT(asset.borrow_register_date, '%Y-%m-%d') as borrow_register_date,asset.borrow_corporate_name,asset.borrow_corporate_certificate_no,asset.borrow_phone,asset.borrow_bank,asset.borrow_branch_bank,asset.borrow_bank_account_name,asset.borrow_bank_account_no,asset.borrow_bank_account_address,asset.industry,asset.income,format(asset.paid_in_capital/100,2) as paid_in_capital FROM t_enterprise_fund_credit AS fund INNER JOIN t_enterprise_asset_credit AS asset ON asset.asset_org_code=fund.asset_org_code and fund.borrow_business_license = asset.borrow_business_license where 1=1 and fund.rx_insertTime>=:?borrow_date_start and fund.rx_insertTime<=:?borrow_date_end and fund.fund_credit_fee>= :?min_fee and fund.fund_credit_fee<=:?max_fee and fund.fund_org_code=:?fundOrgCode and fund.asset_org_code=:?assetOrgCode and asset.borrow_name like :?borrow_name and fund.fund_credit_status in ::?fund_credit_status ORDER BY fund.rx_insertTime DESC LIMIT :?page_index,10;",
// "corpFundAuthCount": "select count(*) as total FROM t_enterprise_fund_credit AS fund INNER JOIN t_enterprise_asset_credit AS asset ON fund.borrow_business_license = asset.borrow_business_license where 1=1 and fund.rx_insertTime>=:?borrow_date_start and fund.rx_insertTime<=:?borrow_date_end and fund.fund_credit_fee>= :?min_fee and fund.fund_credit_fee<=:?max_fee and fund.fund_org_code=:?fundOrgCode and fund.asset_org_code=:?assetOrgCode and asset.borrow_name like :?borrow_name and fund.fund_credit_status  in ::?fund_credit_status",
// "corpAuthDetail": "select fund.fund_org_code, asset.borrow_name, fund.fund_credit_status, format(fund.fund_credit_fee/1000000, 2) as fund_credit_fee, IFNULL(fund.fund_credit_refuse_reason, '') as fund_credit_refuse_reason FROM t_enterprise_fund_credit AS fund INNER JOIN t_enterprise_asset_credit AS asset ON fund.borrow_business_license = asset.borrow_business_license where 1=1 and fund.fund_org_code = :?fundOrgCode and fund.asset_org_code = :?assetOrgCode and fund.borrow_business_license = :?borrow_business_license",
// "corpAuthDetailCount": "select count(*) as total FROM t_enterprise_fund_credit AS fund INNER JOIN t_enterprise_asset_credit AS asset ON fund.borrow_business_license = asset.borrow_business_license where fund.asset_org_code = :?assetOrgCode and fund.borrow_business_license = :?borrow_business_license;",

class EnterpriseFundCredit extends Model {
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
      [s.literal('FORMAT(`borrow_fee`/100, 2)'), '借款金额（元'],
      ['borrow_period', '借款期限单位'],
      ['borrow_deadline', '借款期限'],
      ['borrow_mail', '借款人邮箱'],
      ['gathering_name', '收款账号名称'],
      ['gathering_bank', '收款账户开户行'],
      ['gathering_card_no', '收款账户号'],
      ['fund_org_code', '资金方机构号'],
      ['fund_order_no', '资金方订单号'],
      ['refuse_type', '拒绝类型'],
      ['refuse_reason', '拒绝原因'],
      ['repayment_mode', '还款方式'],
      ['business_type', '业务类型'],
      // [s.col('fund_user.user_name'), '资金方机构名'],
    ];
  }

  corpFundAuth(params = {}, page_index = 0) {
    let fund = this.tableNameGenerator('t_enterprise_fund_credit');
    let asset = this.tableNameGenerator('t_enterprise_asset_credit');
    const attributes = [
      [
        s.fn('DATE_FORMAT', fund('rx_insertTime'), '%Y-%m-%d %H:%i:%s'),
        'borrow_time',
      ],
      [fund('borrow_business_license'), 'borrow_business_license'],
      [fund('asset_org_code'), 'asset_org_code'],
      [asset('borrow_name'), 'borrow_name'],
      [fund('fund_credit_status'), 'fund_credit_status'],
      [fund('fund_credit_fee'), 'fund_credit_fee'],
      [fund('fund_credit_refuse_reason'), 'fund_credit_refuse_reason'],
      [fund('fund_org_code'), 'fund_org_code'],
      [asset('asset_credit_status'), 'asset_credit_status'],
      [asset('borrow_org_code'), 'borrow_org_code'],
      [asset('borrow_account_licence'), 'borrow_account_licence'],
      [asset('borrow_credit_code'), 'borrow_credit_code'],
      [asset('borrow_tax_registration'), 'borrow_tax_registration'],
      [asset('borrow_enterprise_type'), 'borrow_enterprise_type'],
      [asset('borrow_type'), 'borrow_type'],
      [asset('borrow_registered_address'), 'borrow_registered_address'],
      [asset('borrow_manage_address'), 'borrow_manage_address'],
      [
        s.fn('DATE_FORMAT', asset('borrow_register_date'), '%Y-%m-%d'),
        'borrow_register_date',
      ],
      [asset('borrow_corporate_name'), 'borrow_corporate_name'],
      [
        asset('borrow_corporate_certificate_no'),
        'borrow_corporate_certificate_no',
      ],
      [asset('borrow_phone'), 'borrow_phone'],
      [asset('borrow_bank'), 'borrow_branch_bank'],
      [asset('borrow_branch_bank'), 'borrow_branch_bank'],
      [asset('borrow_bank_account_name'), 'borrow_bank_account_name'],
      [asset('borrow_bank_account_no'), 'borrow_bank_account_no'],
      [asset('borrow_bank_account_address'), 'borrow_bank_account_address'],
      [asset('borrow_mail'), 'borrow_mail'],
      [asset('industry'), 'industry'],
      [asset('income'), 'income'],
      [
        s.literal(
          'FORMAT(`t_enterprise_asset_credit`.`paid_in_capital`/100, 2)'
        ),
        'paid_in_capital',
      ],
    ];
    const where = {};
    const subWhere = {};
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.QueryParamsOfIntervalEnhancer(
      params,
      where,
      'fund_credit_fee',
      'min_fee',
      'max_fee'
    );

    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'fund_credit_status');
    this.queryParamsLikeSetupBuilder(
      params,
      subWhere,
      'borrow_name',
      'borrow_name'
    );
    // subWhere['borrow_business_license'] = asset('borrow_business_license');
    asset = null;
    fund = null;
    return this.dao.findPlainAll({
      include: [
        {
          model: db.t_enterprise_asset_credit,
          required: true,
          as: 't_enterprise_asset_credit',
          where: subWhere,
        },
        //{ model: db.t_user, required: false, attributes: [] },
      ],
      attributes,
      where,
      order: [['rx_insertTime', 'DESC']],
      limit: 10,
      subQuery: false,
      offset: page_index,
    });
  }
  corpFundAuthCount(params = {}) {
    const where = {};
    const subWhere = {};
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.QueryParamsOfIntervalEnhancer(
      params,
      where,
      'fund_credit_fee',
      'min_fee',
      'max_fee'
    );
    this.queryParamsStringSetupBuilder(
      params, where, 'fund_org_code',
    );
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'asset_org_code',
      'assetOrgCode'
    );
    this.queryParamsInSetupBuilder(params, where, 'fund_credit_status');

    this.queryParamsLikeSetupBuilder(params, subWhere, 'borrow_name');
    return this.dao.count({
      include: [
        {
          model: db.t_enterprise_asset_credit,
          required: true,
          as: 't_enterprise_asset_credit',
          where: subWhere,
        },
        //{ model: db.t_user, required: false, attributes: [] },
      ],
      where,
    });
  }
  corpAuthDetail(params = {}) {
    const where = {};
    const attributes = [
      'fund_org_code', 'fund_credit_status',
      s.col('t_enterprise_asset_credit_b.borrow_name'),
      [sequelize.literal('format(t_enterprise_fund_credit.fund_credit_fee/1000000, 2)'), 'fund_credit_fee'],
      [sequelize.literal('IFNULL(t_enterprise_fund_credit.fund_credit_refuse_reason, \'\')'), 'fund_credit_refuse_reason'],
    ];

    this.queryParamsStringSetupBuilder(
      params,
      where,
      'fund_org_code',
      'fundOrgCode'
    );
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'asset_org_code',
      'assetOrgCode'
    );
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'borrow_business_license'
    );
    return this.dao.findAll({
      include: [
        {
          model: db.t_enterprise_asset_credit,
          as: 't_enterprise_asset_credit_b',
          attributes: [],
          required: true
        },
      ],
      attributes,
      where,
    });
  }
  corpAuthDetailCount(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'asset_org_code',
      'assetOrgCode'
    );
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'borrow_business_license'
    );
    return this.dao.count({
      include: [
        {
          model: db.t_enterprise_asset_credit,
          as: 't_enterprise_asset_credit_b',
          required: true,
        },
      ],
      where,
    });
  }

  corpAuthFundExport(params = {}) {
    const attributes = [
      [
        s.fn(
          'DATE_FORMAT',
          s.col('t_enterprise_asset_credit.rx_insertTime'),
          '%Y-%m-%d %H:%i:%s'
        ),
        '授信时间',
      ],
      ['asset_org_code', '资产方机构号'],
      ['borrow_business_license', '营业执照号'],
      ['asset_credit_status', '资产方授信状态'],
      ['borrow_name', '借款人名称'],
      ['borrow_org_code', '组织机构代码'],
      ['borrow_account_licence', '开户许可证'],
      ['borrow_credit_code', '信用代码证'],
      ['borrow_tax_registration', '税务登记证'],
      ['borrow_enterprise_type', '企业类型'],
      ['borrow_type', '借款主体类型'],
      ['borrow_registered_address', '注册地址'],
      ['borrow_manage_address', '经营地址'],
      [
        s.fn('DATE_FORMAT', s.col('borrow_register_date'), '%Y-%m-%d'),
        '成立日期',
      ],
      ['borrow_corporate_name', '法人姓名'],
      ['borrow_corporate_certificate_no', '法人身份证号'],
      ['borrow_phone', '联系人手机号'],
      ['borrow_bank', '开户行'],
      ['borrow_branch_bank', '开户支行'],
      ['borrow_bank_account_name', '开户名称'],
      ['borrow_bank_account_no', '开户银行账号'],
      ['borrow_bank_account_address', '开户地址'],
      ['borrow_mail', '借款人邮箱'],
      ['industry', '行业'],
      ['income', '借款人收入及负债'],
      [s.literal('FORMAT(`paid_in_capital`/100, 2)'), '实缴资本（元）'],
    ];
    const where = {};
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'borrow_date_start',
      'borrow_date_end'
    );
    const subWhere = {}
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsInSetupBuilder(params, where, 'asset_credit_status');

    this.queryParamsLikeSetupBuilder(params, subWhere, 'borrow_name');

    return this.dao.findPlainAll({
      include: [
        {
          model: db.t_enterprise_asset_credit,
          required: true,
          as: 't_enterprise_asset_credit',
          where: subWhere,
        },
        { model: db.t_user, required: false, attributes: [] },
      ],
      attributes,
      where,
      order: [['rx_insertTime', 'DESC']],
    });
  }
}

/* const enterpriseFundCredit = new EnterpriseFundCredit(
  't_enterprise_fund_credit'
); */
module.exports = (info, accessList = []) =>
  new EnterpriseFundCredit('t_enterprise_fund_credit', info, accessList);
