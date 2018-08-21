/*
 * File: Repayment.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const sequelize = require('sequelize');

const s = sequelize;
const Model = require('../super');

// "repayment": "select fund_org_code,asset_org_code,DATE_FORMAT(repayment_date, '%Y-%m-%d') as repayment_date,repayment_status,repayment_bank,repayment_name,repayment_card_no,format(repayment_original_fee/100,2) as repayment_original_fee,format(repayment_interest_fee/100,2) as repayment_interest_fee, DATE_FORMAT(repayment_end_date, '%Y-%m-%d') as repayment_end_date from t_repayment where 1=1 and repayment_date >= :?repayment_date_start and repayment_date <= :?repayment_date_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and repayment_status in ::?repayment_status order by repayment_date desc limit :?page_index,10",
// "repaymentCount": "select count(*) as total from t_repayment where 1=1 and repayment_date >= :?repayment_date_start and repayment_date <= :?repayment_date_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and repayment_status in ::?repayment_status",
// "repaymentExport": "select fund_org_code as 资金方机构编码,asset_org_code as 资产方机构编码,DATE_FORMAT(repayment_date, '%Y-%m-%d') as 兑付日期,repayment_status as 兑付状态,repayment_bank as 兑付开户行,repayment_name as 兑付户名,repayment_card_no as 兑付账户,repayment_original_fee/100 as 兑付本金（单位：元）,repayment_interest_fee/100 as 兑付利息（单位：元）, DATE_FORMAT(repayment_end_date, '%Y-%m-%d') as 兑付到期日 from t_repayment where 1=1 and repayment_date >= :?repayment_date_start and repayment_date <= :?repayment_date_end and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and repayment_status in ::?repayment_status order by repayment_date desc",
// "repaymentUpdate": "update t_repayment set repayment_status=:?repayment_status, rx_updateTime=now() where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and repayment_date=:?repayment_date",
// "repaymentQuery": "select fund_org_code,asset_org_code,DATE_FORMAT(repayment_date, '%Y-%m-%d') as repayment_date,repayment_status,repayment_bank,repayment_name,repayment_card_no,format(repayment_original_fee/100,2) as repayment_original_fee,format(repayment_interest_fee/100,2) as repayment_interest_fee, DATE_FORMAT(repayment_end_date, '%Y-%m-%d') as repayment_end_date from t_repayment where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and repayment_date=:?repayment_date",

class Repayment extends Model {
  constructor(tableName,logInfo,accessList) {
    super(tableName,logInfo,accessList);
    this.commonAttributes = [
      'fund_org_code',
      'asset_org_code',
      'repayment_status',
      'repayment_bank',
      'repayment_name',
      'repayment_card_no',
      [sequelize.literal('format(t_repayment.repayment_original_fee/100, 2 )'), 'repayment_original_fee'],
      [sequelize.literal('format(t_repayment.repayment_interest_fee/100, 2 )'), 'repayment_interest_fee'],
      [sequelize.literal('DATE_FORMAT(t_repayment.repayment_end_date, \'%Y-%m-%d\' )'), 'repayment_end_date'],
      [sequelize.literal('DATE_FORMAT(t_repayment.repayment_date, \'%Y-%m-%d\' )'), 'repayment_date'],
    ];
  }
  repayment(params = {}, page_index = 0) {
    const attributes = this.commonAttributes;
    const where = {};
    this.durationGenerator(
      params,
      where,
      'repayment_date',
      'repayment_date_start',
      'repayment_date_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsInSetupBuilder(params, where, 'repayment_status');
    return this.dao.findAndCountAll({
      attributes,
      where,
      order: [['repayment_date', 'DESC']],
      limit: 10,
      offset: page_index,
    });
  }
  count(params = {}) {
    const where = {};
    this.durationGenerator(
      where,
      params,
      'repayment_date',
      'repayment_date_start',
      'repayment_date_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsInSetupBuilder(params, where, 'repayment_status');
    return this.nativeCount({
      where,
    });
  }
  export(params = {}) {
    const attributes = [
      ['fund_org_code', '资金方机构编码'],
      ['asset_org_code', '资产方机构编码'],
      [s.fn('DATE_FORMAT', s.col('repayment_date'), '%Y-%m-%d'), '兑付日期'],
      ['repayment_status', '兑付状态'],
      ['repayment_bank', '兑付开户行'],
      ['repayment_name', '兑付户名'],
      ['repayment_card_no', '兑付账户'],
      [
        s.literal('FORMAT(`repayment_original_fee`/100)'),
        '兑付本金（单位：元）',
      ],
      [
        s.literal('FORMAT(`repayment_interest_fee`/100)'),
        '兑付利息（单位：元）',
      ],
      [
        s.fn('DATE_FORMAT', s.col('repayment_end_date'), '%Y-%m-%d'),
        '兑付到期日',
      ],
    ];
    const where = {};
    this.durationGenerator(
      params,
      where,
      'repayment_date',
      'repayment_date_start',
      'repayment_date_end'
    );
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsInSetupBuilder(params, where, 'repayment_status');
    return this.dao.findAll({
      attributes,
      where,
      order: [['repayment_date', 'DESC']],
    });
  }
  update(params = {}, condition = {}) {
    const values = {};
    const where = {};
    this.queryParamsStringSetupBuilder(params, values, 'repayment_status');

    this.queryParamsStringSetupBuilder(condition, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(condition, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(condition, where, 'repayment_date');
    return this.nativeUpdate(values, { where });
  }
  query(params = {}) {
    const attributes = this.commonAttributes;
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'repayment_date');
    return this.dao.findAll({ attributes, where });
  }
}

module.exports = (info, accessList = []) => new Repayment('t_repayment', info, accessList);
