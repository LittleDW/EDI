/*
 * File: EnterpriseAssetCredit.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Tue Jun 19 2018
 * Modified By: Osborn
 */

const sequelize = require('sequelize');

const s = sequelize;

const Model = require('../super');
const { db } = require('../../schema/index');

// "corpAssetAuth": "SELECT DATE_FORMAT(rx_insertTime, '%Y-%m-%d %H:%i:%s') as borrow_time, borrow_business_license, borrow_name, asset_org_code, asset_credit_status,borrow_org_code,borrow_account_licence,borrow_credit_code,borrow_tax_registration,borrow_enterprise_type,borrow_type,borrow_registered_address,borrow_manage_address,DATE_FORMAT(borrow_register_date, '%Y-%m-%d') as borrow_register_date,borrow_corporate_name,borrow_corporate_certificate_no,borrow_phone,borrow_bank,borrow_branch_bank,borrow_bank_account_name,borrow_bank_account_no,borrow_bank_account_address,industry,income,format(paid_in_capital/100,2) as paid_in_capital,DATE_FORMAT(rx_insertTime, '%Y-%m-%d %H:%i:%s') as rx_insertTime FROM t_enterprise_asset_credit where 1=1 and rx_insertTime>=:?borrow_date_start and rx_insertTime<=:?borrow_date_end and asset_org_code=:?assetOrgCode and borrow_name like :?borrow_name and asset_credit_status in ::?asset_credit_status ORDER BY rx_insertTime DESC LIMIT :?page_index,10;",
// "corpAssetAuthCount": "select count(*) as total FROM t_enterprise_asset_credit where 1=1 and rx_insertTime>=:?borrow_date_start and rx_insertTime<=:?borrow_date_end and asset_org_code=:?assetOrgCode and borrow_name like :?borrow_name and asset_credit_status in ::?asset_credit_status",
// "corpAuthAssetExport": "select DATE_FORMAT(a.rx_insertTime, '%Y-%m-%d %H:%i:%s') as 授信时间, a.asset_org_code as 资产方机构号,a.borrow_business_license as 营业执照号,a.asset_credit_status as 资产方授信状态,a.borrow_name as 借款人名称,a.borrow_org_code as 组织机构代码,a.borrow_account_licence as 开户许可证,a.borrow_credit_code as 信用代码证,a.borrow_tax_registration as 税务登记证,a.borrow_enterprise_type as 企业类型,a.borrow_type as 借款主体类型,a.borrow_registered_address as 注册地址,a.borrow_manage_address as 经营地址,DATE_FORMAT(a.borrow_register_date, '%Y-%m-%d')  as 成立日期,a.borrow_corporate_name as 法人姓名,a.borrow_corporate_certificate_no as 法人身份证号,a.borrow_phone as 联系人手机号,a.borrow_bank as 开户行,a.borrow_branch_bank as 开户支行,a.borrow_bank_account_name as 开户名称,a.borrow_bank_account_no          as 开户银行账号,a.borrow_bank_account_address as 开户地址,a.industry as 行业,a.income as 借款人收入及负债,format(a.paid_in_capital/100,2) as 实缴资本（元） from t_enterprise_asset_credit as a left join t_user as u on a.asset_org_code = u.org_code where 1=1 and a.rx_insertTime>=:?borrow_date_start and a.rx_insertTime<=:?borrow_date_end and a.asset_org_code=:?asset_org_code and borrow_name like :?borrow_name and a.asset_credit_status in ::?asset_credit_status ORDER BY a.rx_insertTime DESC",

class EnterpriseAssetCredit extends Model {
  corpAssetAuth(params = {}, page_index = 0) {
    const attributes = [
      /*[
        s.fn('DATE_FORMAT', s.col('rx_insertTime'), '%Y-%m-%d %H:%i:%s'),
        'borrow_time',
      ],*/
      [s.literal("DATE_FORMAT( t_enterprise_asset_credit.rx_insertTime, '%Y-%m-%d %H:%i:%s' )"), 'borrow_time'],
      'borrow_business_license',
      'asset_org_code',
      'borrow_name',
      'asset_credit_status',
      'borrow_org_code',
      'borrow_account_licence',
      'borrow_credit_code',
      'borrow_tax_registration',
      'borrow_enterprise_type',
      'borrow_type',
      'borrow_registered_address',
      'borrow_manage_address',

      [
        s.fn('DATE_FORMAT', s.col('borrow_register_date'), '%Y-%m-%d'),
        'borrow_register_date',
      ],
      'borrow_corporate_name',
      'borrow_corporate_certificate_no',
      'borrow_phone',
      'borrow_bank',
      'borrow_mail',
      'borrow_branch_bank',
      'borrow_bank_account_name',
      'borrow_bank_account_no',
      'borrow_bank_account_address',
      'industry',
      'income',
      [s.literal('FORMAT(`paid_in_capital`/100, 2)'), 'paid_in_capital'],

      /*[
        s.fn('DATE_FORMAT', s.col('rx_insertTime'), '%Y-%m-%d %H:%i:%s'),
        'rx_insertTime',
      ],*/
      [s.literal("DATE_FORMAT( t_enterprise_asset_credit.rx_insertTime, '%Y-%m-%d %H:%i:%s' )"), 'rx_insertTime'],
    ];
    const where = {};
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'borrow_date_start',
      'borrow_date_end'
    );

    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code',);
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_name');
    this.queryParamsInSetupBuilder(params, where, 'asset_credit_status');
    return this.dao.findPlainAll({
      attributes,
      where,
      include: [{ model: db.t_user, required: true, attributes: [] }],
      order: [['rx_insertTime', 'DESC']],
      limit: 10,
      offset: page_index,
    });
  }
  corpAssetAuthCount(params = {}) {
    const where = {};
    this.durationGenerator(
      params,
      where,
      'rx_insertTime',
      'borrow_date_start',
      'borrow_date_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code',);
    this.queryParamsInSetupBuilder(params, where, 'asset_credit_status');
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_name');
    return this.dao.count({
      where,
    });
  }
  corpAuthAssetExport(params = {}) {
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
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_name');
    this.queryParamsInSetupBuilder(params, where, 'asset_credit_status');
    return this.dao.findPlainAll({
      include: [{ model: db.t_user, required: true, attributes: [] }],
      attributes,
      where,
      order: [['rx_insertTime', 'DESC']],
    });
  }
}

/* const enterpriseAssetCredit = new EnterpriseAssetCredit(
  't_enterprise_asset_credit'
); */
module.exports = (info, accessList = []) =>
  new EnterpriseAssetCredit('t_enterprise_asset_credit', info, accessList);
