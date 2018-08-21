/*
 * File: AssetDayPlan.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */


const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');
const _ = require('lodash');

// "reqDeleteData": "DELETE FROM t_asset_day_plan where 1=1 and asset_org_code =:?asset_org_code and plan_date >=:?start_date and plan_date <=:?end_date",
// "reqInsertData": "INSERT INTO t_asset_day_plan( asset_org_code , fund_org_code , plan_date , plan_fee , rx_insertTime , rx_updateTime) SELECT :?asset_org_code , :?fund_org_code , :?plan_date , :?plan_fee , now() , now();",
// "reqDeleteDataNew": "DELETE FROM t_asset_day_plan where 1=1 and asset_org_code =:!asset_org_code and plan_date >=:!start_date and plan_date <=:!end_date",
// "reqInsertDataNew": "INSERT INTO t_asset_day_plan set asset_org_code =:!asset_org_code , fund_org_code =:!fund_org_code , plan_date =:!plan_date , plan_fee=:!plan_fee , rx_insertTime = now() , rx_updateTime = now();",

class AssetDayPlan extends Model {
  reqDeleteData(options = {}) {
    // logic bubble
    return this.nativeDelete(options);
  }
  //
  reqInsertData(values = {}, options = {}) {
    // logic bubble
    return this.nativeCreate(values, options);
  }
  assetFundAccountQuery(params = {}) {
    return sequelizeDB.query(`
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
  _.isEmpty(params.fund_org_code)
    ? ''
    : `AND fund_org_code = '${params.fund_org_code}'`
}
      ${
  _.isEmpty(params.asset_org_code)
    ? ''
    : `AND asset_org_code = '${params.asset_org_code}'`
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
  _.isEmpty(params.fund_org_code)
    ? ''
    : `AND fund_org_code = '${params.fund_org_code}' `
}
      ${
  _.isEmpty(params.asset_org_code)
    ? ''
    : `AND asset_org_code = '${params.asset_org_code}' `
}
      ) a
    ORDER BY
      asset_org_code,
      fund_org_code
    `);
  }
}

module.exports = (info, accessList = []) => new AssetDayPlan('t_asset_day_plan', info, accessList);
