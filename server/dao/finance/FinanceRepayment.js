
const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');


class FinanceRepayment extends Model {

  // "financeRepayment": "select a.repayment_code, a.fund_org_code, a.asset_org_code, a.edi_user_id, a.repayment_status, a.partner_name, DATE_FORMAT(a.repayment_from_date, '%Y-%m-%d') as repayment_from_date, DATE_FORMAT(a.repayment_closing_date, '%Y-%m-%d') as repayment_closing_date, format(a.repayment_principal_fee/100,2) as repayment_principal_fee, format(a.repayment_interest_fee/100,2) as repayment_interest_fee, format(a.repayment_total_fee/100,2) as repayment_total_fee, a.repayment_file_url, a.repayment_voucher_url,a.real_gathering_name,a.real_gathering_bank, a.real_gathering_card_no, a.repayment_name, a.repayment_bank, a.repayment_card_no,c.gathering_name as real_name, c.gathering_bank as real_bank, c.gathering_card_no as real_card_no, b.gathering_name as real_repayment_name, b.gathering_bank as real_repayment_bank, b.gathering_card_no as real_repayment_card_no, remark  from t_finance_repayment a left join t_asset_account b on a.asset_org_code=b.asset_org_code and a.fund_org_code=b.fund_org_code and b.account_purpose='001' left join t_fund_account c on a.asset_org_code=c.asset_org_code and a.fund_org_code=c.fund_org_code and c.account_purpose='002' where 1=1 and a.repayment_code=:?repayment_code and a.fund_org_code=:?fund_org_code and a.asset_org_code=:?asset_org_code and a.partner_name like :?partner_name and a.repayment_status=:?repayment_status  and a.repayment_from_date >= :?repayment_date_start and a.repayment_closing_date <= :?repayment_date_end order by a.repayment_code desc limit :?page_index,10",
  pagingSearch(param={},page_index=0){
    const attributes = [
      "repayment_code", "fund_org_code", "asset_org_code", "edi_user_id", "repayment_status", "partner_name",
      [sequelize.fn('DATE_FORMAT', sequelize.col('repayment_from_date'), '%Y-%m-%d'),'repayment_from_date',],
      [sequelize.fn('DATE_FORMAT', sequelize.col('repayment_closing_date'), '%Y-%m-%d'),'repayment_closing_date',],
      /*[sequelize.fn('FORMAT', sequelize.col('repayment_principal_fee'), '/ 100, 2'),'repayment_principal_fee',],
      [sequelize.fn('FORMAT', sequelize.col('repayment_interest_fee'), '/ 100, 2'),'repayment_interest_fee',],
      [sequelize.fn('FORMAT', sequelize.col('repayment_total_fee'), '/ 100, 2'),'repayment_total_fee',],*/
      [sequelize.literal('FORMAT(`t_finance_repayment`.`repayment_principal_fee`/100,2)'), 'repayment_principal_fee'],
      [sequelize.literal('FORMAT(`t_finance_repayment`.`repayment_interest_fee`/100,2)'), 'repayment_interest_fee'],
      [sequelize.literal('FORMAT(`t_finance_repayment`.`repayment_total_fee`/100,2)'), 'repayment_total_fee'],
      "repayment_file_url", "repayment_voucher_url","real_gathering_name","real_gathering_bank",
      "real_gathering_card_no", "repayment_name", "repayment_bank", "repayment_card_no", "remark"
    ]
    const includingFundAttributes = [
      ["gathering_name","real_name"], ["gathering_bank","real_bank"],["gathering_card_no","real_card_no"],
    ]
    const includingAssetAttributes = [
      ["gathering_name","real_repayment_name"],["gathering_bank","real_repayment_bank"],
      ["gathering_card_no","real_repayment_card_no"],
    ]

    let clonedParam = _.cloneDeep(param), where={}
    this.queryParamsStringSetupBuilder(clonedParam, where, "repayment_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsLikeSetupBuilder(clonedParam, where, "partner_name")
    this.queryParamsStringSetupBuilder(clonedParam, where, "repayment_status")
    this.queryParamsGTESetupBuilder(clonedParam, where, "repayment_from_date","repayment_date_start")
    this.queryParamsLTESetupBuilder(clonedParam, where, "repayment_closing_date","repayment_date_end")
    return this.dao.findAndCountPlainAll({
      attributes,
      include: [
        {
          model: this.db.t_asset_account,
          as:"finance_repayment_asset",
          attributes: includingAssetAttributes,
          where:{account_purpose:"001"},
          required: false,
        },
        {
          model: this.db.t_fund_account,
          as:"finance_repayment_fund",
          attributes: includingFundAttributes,
          where:{account_purpose:"002"},
          required: false,
        },
      ],
      where,
      order: [['repayment_code','desc']],
      offset: page_index,
      limit: 10,
      //raw: true,
      // subQuery: true,
    });
  }

  // "financeRepaymentUpdate":"update t_finance_repayment set repayment_status = :?repayment_status, repayment_voucher_url = :?repayment_voucher_url,real_gathering_name=:?real_gathering_name,real_gathering_bank=:?real_gathering_bank,real_gathering_card_no=:?real_gathering_card_no, repayment_name = :?repayment_name,repayment_bank = :?repayment_bank, repayment_card_no = :?repayment_card_no, rx_updateTime = now() where 1=1 and repayment_code =:?repayment_code;",
  update(param={}){
    let clonedParam = _.cloneDeep(param), where={}, {action_type}=param
    this.queryParamsStringSetupBuilder(clonedParam, where, "repayment_code")
    delete clonedParam.repayment_code
    delete clonedParam.action_type
    return this.dao.update(clonedParam, {
      where,
      action_type,
      individualHooks: true
    });
  }

  // "financeRepaymentConfirmInvoke":"call p_finance_repayment(:!repayment_code); ",
  confirmInvoke(param={}){
    return sequelizeDB.query(`call p_finance_repayment('${param.repayment_code}')`, {type: sequelize.QueryTypes.UPDATE });
  }
}

module.exports = (info, accessList = []) => new FinanceRepayment('t_finance_repayment', info, accessList);
