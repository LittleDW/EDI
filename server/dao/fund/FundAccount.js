/*
 * @Author Osborn
 * @File FundAccount.js
 * @Date 2018-03-26 16-05
 */

const Model = require('../super');
const { db } = require('../../schema/index');
const sequelize = require('sequelize');

// "fundAccountQuery": "select fund_org_code, asset_org_code,account_purpose, gathering_name, gathering_bank, gathering_card_no from t_fund_account where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and account_purpose=:?account_purpose",
// "fundAccountCheck": "select * from t_fund_account where 1=1 and account_purpose=:?account_purpose and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code",
// "fundAccountUpdate": "update t_fund_account set gathering_name=:?gathering_name, gathering_bank=:?gathering_bank, gathering_card_no=:?gathering_card_no, rx_updateTime=now() where 1=1 and account_purpose=:?account_purpose and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code",
// "fundAccountCreate": "INSERT INTO t_fund_account set fund_org_code=:?fund_org_code, asset_org_code=:?asset_org_code, account_purpose=:?account_purpose, gathering_name=:?gathering_name, gathering_bank=:?gathering_bank, gathering_card_no=:?gathering_card_no, rx_insertTime=now(), rx_updateTime=now() ",
// "fundAccountDelete": "delete from t_fund_account where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and account_purpose=:?account_purpose",

class FundAccount extends Model {
  query(params = {}) {
    const attributes = [
      'fund_org_code',
      'asset_org_code',
      'account_purpose',
      'gathering_name',
      'gathering_bank',
      'gathering_card_no',
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'account_purpose');
    return this.dao.findAll({
      attributes,
      where,
    });
  }

  update(values = {}, options = {}) {
    return this.nativeUpdate(values, options);
  }
  create(values = {}) {
    return this.nativeCreate(values);
  }
  delete(options = {}) {
    return this.nativeDelete(options);
  }
  getFundAccount(params = {}) {
    const attributes = [];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'account_purpose');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    return this.dao.findPlainAll({
      //attributes,
      include: [
        {
          attributes: [
            [sequelize.col('user_name'), 'fund_user_name'],
            [sequelize.col('user_full_name'), 'fund_user_full_name'],
          ],
          model: db.t_user,
        },
      ],
      where,
    });
  }
}

module.exports = (info, accessList = []) => new FundAccount('t_fund_account', info, accessList);
