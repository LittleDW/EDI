const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');


class FinanceServiceSettlement extends Model {

  // "financeService": "select a.settlement_code, a.fund_org_code, a.asset_org_code, a.edi_user_id, a.settlement_status, a.settlement_mode, DATE_FORMAT(a.settlement_month, '%Y-%m') as settlement_month, format(a.settlement_service_fee/100,2) as settlement_service_fee, a.settlement_file_url, a.repayment_voucher_url,a.real_gathering_name,a.real_gathering_bank, a.real_gathering_card_no, a.repayment_card_no, a.repayment_bank, a.repayment_name,c.gathering_name as real_name, c.gathering_bank as real_bank, c.gathering_card_no as real_card_no, b.gathering_name as real_repayment_name, b.gathering_bank as real_repayment_bank, b.gathering_card_no as real_repayment_card_no,  a.remark from t_finance_service_settlement a left join t_asset_account b on a.asset_org_code=b.asset_org_code and a.fund_org_code=b.fund_org_code and b.account_purpose='001' left join t_fund_account c on a.asset_org_code=c.asset_org_code and a.fund_org_code=c.fund_org_code and c.account_purpose='003' where 1=1 and a.settlement_code=:?settlement_code and a.fund_org_code=:?fund_org_code and a.asset_org_code=:?asset_org_code and a.settlement_status=:?settlement_status and a.settlement_mode=:?settlement_mode <and DATE_FORMAT(a.settlement_month, '%Y') =:!year> <and DATE_FORMAT(a.settlement_month, '%m') =:!month> order by a.settlement_code desc limit :?page_index,10",
  pagingSearch(param={},page_index=0){
    const attributes = [
      "settlement_code", "fund_org_code", "asset_org_code", "edi_user_id", "settlement_status", "settlement_mode",
      [sequelize.fn('DATE_FORMAT', sequelize.col('settlement_month'), '%Y-%m'),'settlement_month',],
      [sequelize.literal('FORMAT(`t_finance_service_settlement`.`settlement_service_fee`/100,2)'), 'settlement_service_fee'],
      "settlement_file_url", "repayment_voucher_url","real_gathering_name","real_gathering_bank",
      "real_gathering_card_no", "repayment_card_no", "repayment_bank", "repayment_name","remark"
    ]
    const includingFundAttributes = [
      ["gathering_name","real_name"], ["gathering_bank","real_bank"],["gathering_card_no","real_card_no"],
    ]
    const includingAssetAttributes = [
      ["gathering_name","real_repayment_name"],["gathering_bank","real_repayment_bank"],
      ["gathering_card_no","real_repayment_card_no"],
    ]
    let clonedParam = _.cloneDeep(param), {year, month} = clonedParam,where = {}, whereParam = []
    this.queryParamsStringSetupBuilder(clonedParam, where, "settlement_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "fund_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "asset_org_code")
    this.queryParamsStringSetupBuilder(clonedParam, where, "settlement_status")
    this.queryParamsStringSetupBuilder(clonedParam, where, "settlement_mode")
    if(year){
      whereParam.push(sequelize.where(
        sequelize.fn("DATE_FORMAT", sequelize.col("settlement_month"),'%Y'), { [Op.eq]: year }
      ),)
    }
    if(month){
      whereParam.push(sequelize.where(
        sequelize.fn("DATE_FORMAT", sequelize.col("settlement_month"),'%m'), { [Op.eq]: month }
      ),)
    }
    if(whereParam.length){
      where[Op.and] = whereParam
    }
    return this.dao.findAndCountPlainAll({
      attributes,
      include: [
        {
          model: this.db.t_asset_account,
          as:"finance_service_settlement_asset",
          attributes: includingAssetAttributes,
          where:{account_purpose:"001"},
          required: false,
        },
        {
          model: this.db.t_fund_account,
          as:"finance_service_settlement_fund",
          attributes: includingFundAttributes,
          where:{account_purpose:"003"},
          required: false,
        },
      ],
      where,
      order: [['settlement_code','desc']],
      offset: page_index,
      limit: 10,
      subQuery: false,
    });
  }

  // "financeServiceUpdate":"update t_finance_service_settlement set settlement_status = :?settlement_status, repayment_voucher_url = :?repayment_voucher_url,real_gathering_name=:?real_gathering_name,real_gathering_bank=:?real_gathering_bank,real_gathering_card_no=:?real_gathering_card_no, repayment_name = :?repayment_name,repayment_bank = :?repayment_bank, repayment_card_no = :?repayment_card_no, rx_updateTime = now() where 1=1 and settlement_code =:?settlement_code;",
  update(param={}){
    let clonedParam = _.cloneDeep(param), where={}, {action_type}=param
    this.queryParamsStringSetupBuilder(clonedParam, where, "settlement_code")
    delete clonedParam.repayment_code
    delete clonedParam.action_type
    return this.dao.update(clonedParam, {
      where,
      action_type,
      individualHooks: true
    });
  }

  // "financeServiceConfirmInvoke":"call p_finance_service_settlement(:!settlement_code); ",
  confirmInvoke(param={}){
    return sequelizeDB.query(`call p_finance_service_settlement('${param.settlement_code}')`, {type: sequelize.QueryTypes.UPDATE });
  }
}


module.exports = (info, accessList = []) => new FinanceServiceSettlement('t_finance_service_settlement', info, accessList);
