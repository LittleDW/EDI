const sequelize = require("sequelize");
const Model = require("../super");
const _ = require("lodash");
const {db} = require("../../schema/index");

class FinanceAssetRepaymentPlan extends Model {
  search(params = {}) {
    const attributes = [
      ['fund_org_code', 'fund_org_code'],
      ['repayment_date', 'repayment_date'],
      [sequelize.literal('Round( ( sum( principal_fee ) + sum( interest_fee ) ) / 100, 2 )'), 'all_fee'],
      [sequelize.literal('Round( sum( principal_fee ) / 100, 2 )'), 'principal_fee'],
      [sequelize.literal('Round( sum( interest_fee ) / 100, 2 )'), 'interest_fee'],
      [sequelize.literal('Round( sum( service_fee ) / 100, 2 )'), 'service_fee'],
    ]
    const where = {
      
    }
    this.QueryParamsOfIntervalEnhancer(params, where, 'repayment_date', 'start_date', 'end_date')
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code', 'org_code')
    return this.dao.findAll({
      attributes,
      where,
      group: [
        [sequelize.col('repayment_date')],
        [sequelize.col('fund_org_code')],
      ],
      order: [
        'repayment_date',
        [sequelize.col('all_fee'), 'desc'],
        [sequelize.col('principal_fee'), 'desc'],
        [sequelize.col('interest_fee'), 'desc'],
        [sequelize.col('service_fee'), 'desc'],
      ],
      raw: true
    })
  }
}

module.exports = (info, accessList = []) => new FinanceAssetRepaymentPlan('t_finance_asset_repayment_plan', info, accessList);

