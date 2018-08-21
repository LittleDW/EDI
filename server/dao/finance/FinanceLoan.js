const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

// "financeLoan": "select a.loan_code, a.fund_org_code, a.asset_org_code, a.edi_user_id, b.user_from, a.data_from, DATE_FORMAT(a.account_date, '%Y-%m-%d') as account_date, DATE_FORMAT(a.rx_insertTime, '%Y-%m-%d') as rx_insertTime, format(a.account_fee/100,2) as account_fee, a.real_gathering_name, a.real_gathering_bank, a.real_gathering_card_no, a.repayment_name, a.repayment_bank, a.remark, a.repayment_card_no, a.pay_channel, a.loan_status, a.loan_file_url, a.account_voucher_url, b.user_full_name as fund_user_full_name, c.user_full_name as asset_user_full_name from t_finance_loan as a left join t_user as b on a.fund_org_code = b.org_code left join t_user as c on a.asset_org_code = c.org_code where 1=1 and a.loan_code=:?loan_code and a.asset_org_code=:?asset_org_code and a.fund_org_code=:?fund_org_code and a.real_gathering_name like :?real_gathering_name and a.loan_status=:?loan_status and b.user_from=:?fund_user_from and a.account_date=:?account_date and a.data_from=:?data_from order by loan_code desc limit :?page_index,10",
class FinanceLoan extends Model {
  pagingSearch(param={},page_index=0){
    const attributes = [
      "loan_code", "fund_org_code", "asset_org_code", "edi_user_id", "data_from",
      [sequelize.fn('DATE_FORMAT', sequelize.col('account_date'), '%Y-%m-%d'), 'account_date'],
      //[sequelize.fn('DATE_FORMAT', sequelize.col('rx_insertTime'), '%Y-%m-%d'), 'rx_insertTime'],
      [sequelize.literal('DATE_FORMAT(t_finance_loan.rx_insertTime, \'%Y-%m-%d\')'), 'rx_insertTime'],
      [sequelize.literal('format(t_finance_loan.account_fee/100,2)'), 'account_fee'],
      "real_gathering_name", "real_gathering_bank", "real_gathering_card_no", "repayment_name",
      "repayment_bank", "remark", "repayment_card_no", "pay_channel", "loan_status", "loan_file_url", "account_voucher_url"
    ]
    const includingFundAttributes = [
      [sequelize.col('user_from'), 'user_from'],
      [sequelize.col('user_full_name'), 'fund_user_full_name'],
    ]
    const includingAssetAttributes = [
      [sequelize.col('user_full_name'), 'asset_user_full_name'],
    ]
    let clonedParam = _.cloneDeep(param), where={}, fundWhere = {}
    this.queryParamsStringSetupBuilder(clonedParam, where, "loan_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.queryParamsLikeSetupBuilder(clonedParam, where, "real_gathering_name")
    this.queryParamsStringSetupBuilder(clonedParam, where, "loan_status")
    //this.queryParamsStringSetupBuilder(clonedParam, where, "account_date")
    this.durationGenerator(clonedParam, where, 'account_date', 'account_date_start', 'account_date_end');
    this.queryParamsStringSetupBuilder(clonedParam, where, "data_from")

    this.queryParamsStringSetupBuilder(clonedParam, fundWhere, "user_from","fund_user_from")
    return this.dao.findAndCountPlainAll({
      attributes,
      include: [
        {
          model: this.db.t_user,
          as:"finance_loan_fund_org",
          attributes: includingFundAttributes,
          //required: false,
          where:fundWhere
        },
        {
          model: this.db.t_user,
          as:"finance_loan_asset_org",
          attributes: includingAssetAttributes,
          required: false,
        },
      ],
      where,
      order: [['loan_code','DESC']],
      offset: page_index,
      limit: 10,
      //subQuery: true,
    });
  }

  // "financeLoanUpdate":"update t_finance_loan set loan_status = :?loan_status, rx_updateTime = now() where 1=1 and loan_code =:?loan_code;",
  update(param={}){
    let clonedParam = _.cloneDeep(param), where={}, {action_type}=param
    this.queryParamsStringSetupBuilder(clonedParam, where, "loan_code")
    delete clonedParam.loan_code
    delete clonedParam.action_type
    return this.dao.update(clonedParam, {
      where,
      action_type,
      individualHooks: true
    });
  }

  // "financeLoanConfirmInvoke":"call p_finance_loan(:!loan_code); ",
  confirmInvoke(param={}){
    return sequelizeDB.query(`call p_finance_loan('${param.loan_code}')`, {type: sequelize.QueryTypes.UPDATE });
  }
}


module.exports = (info, accessList = []) => new FinanceLoan('t_finance_loan', info, accessList);
