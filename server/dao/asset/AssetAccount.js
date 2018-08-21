/*
 * File: AssetAccount.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Wed Jul 04 2018
 * Modified By: zhangjunjie
 */

const Model = require('../super');
const sequelize = require('sequelize');
const { sequelizeDB, db } = require('../../schema/index');
const _ = require('lodash');

// "assetAccountQuery ": "select fund_org_code, asset_org_code,account_purpose,gathering_name, gathering_bank, gathering_card_no from t_asset_account where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and account_purpose=:?account_purpose",
// "assetAccountCheck": "select * from t_asset_account where 1=1 and account_purpose=:?account_purpose and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code",
// "assetAccountUpdate": "update t_asset_account set gathering_name=:?gathering_name, gathering_bank=:?gathering_bank, gathering_card_no=:?gathering_card_no, rx_updateTime=now() where 1=1 and account_purpose=:?account_purpose and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code",
// "assetAccountCreate": "INSERT INTO t_asset_account set fund_org_code=:?fund_org_code, asset_org_code=:?asset_org_code, account_purpose=:?account_purpose, gathering_name=:?gathering_name, gathering_bank=:?gathering_bank, gathering_card_no=:?gathering_card_no, repayment_mode=:?repayment_mode, rx_insertTime=now(), rx_updateTime=now() ",
// "assetAccountDelete": "delete from t_asset_account where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code and account_purpose=:?account_purpose",
// "assetFundAccountQuery": "select * from (select fund_org_code, asset_org_code,account_purpose, gathering_name, gathering_bank, gathering_card_no from t_asset_account  where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code union select fund_org_code, asset_org_code,account_purpose, gathering_name, gathering_bank, gathering_card_no from t_fund_account  where 1=1 and fund_org_code=:?fund_org_code and asset_org_code=:?asset_org_code) a order by asset_org_code,fund_org_code",

class AssetAccount extends Model {
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
    this.queryParamsInSetupBuilder(params, where, 'account_purpose');
    return this.dao.findAll({
      attributes,
      where,
    });
  }

  assetFundAccountQuery(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      *
    FROM
      (
    SELECT
      fund_org_code,
      asset_org_code,
      account_purpose,
      gathering_name,
      gathering_bank,
      gathering_card_no
    FROM
      t_asset_account
    WHERE
      1 = 1
      ${
        _.isArray(params.fund_org_code)
          ? `AND fund_org_code IN (${params.fund_org_code
              .map((item) => `'${item}'`)
              .join(',')})`
          : (_.isString(params.fund_org_code)
            ? `AND fund_org_code = '${params.fund_org_code}'`
            : '')
      }
      ${
        _.isArray(params.asset_org_code)
          ? `AND asset_org_code IN (${params.asset_org_code
              .map((item) => `'${item}'`)
              .join(',')})`
          : (_.isString(params.asset_org_code)
            ? `AND asset_org_code = '${params.asset_org_code}'`
            : '')
      }
    UNION SELECT
      fund_org_code,
      asset_org_code,
      account_purpose,
      gathering_name,
      gathering_bank,
      gathering_card_no
    FROM
      t_fund_account
    WHERE
      1 = 1
      ${
        _.isArray(params.fund_org_code)
          ? `AND fund_org_code IN (${params.fund_org_code
              .map((item) => `'${item}'`)
              .join(',')})`
          : (_.isString(params.fund_org_code)
            ? `AND fund_org_code = '${params.fund_org_code}'`
            : '')
      }
      ${
        _.isArray(params.asset_org_code)
          ? `AND asset_org_code IN (${params.asset_org_code
              .map((item) => `'${item}'`)
              .join(',')})`
          : (_.isString(params.asset_org_code)
            ? `AND asset_org_code = '${params.asset_org_code}'`
            : '')
      }
      ) a
    ORDER BY
      asset_org_code,
      fund_org_code
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  getAssetAccount(params = {}) {
    const attributes = [];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'account_purpose');
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    return this.dao.findPlainAll({
      // attributes,
      include: [
        {
          attributes: [
            [sequelize.col('user_name'), 'asset_user_name'],
            [sequelize.col('user_full_name'), 'asset_user_full_name'],
          ],
          model: db.t_user,
        },
      ],
      where,
    });
  }
}

// const AssetAccount = new AssetAccount('t_asset_fund');
module.exports = (info, accessList = []) =>
  new AssetAccount('t_asset_account', info, accessList);
