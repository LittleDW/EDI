/*
 * File: AssetDeadlineDayPlan.js
 * File Created: Thursday, 22nd March 2018 5:29:15 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const Model = require('../super');

// "reqDeadlineDeleteData": "DELETE FROM t_asset_deadline_day_plan where asset_org_code = :?asset_org_code and plan_date >= :?start_date and plan_date <= :?end_date;",
// "reqDeadlineInsertData": "INSERT INTO t_asset_deadline_day_plan( asset_org_code , deadline_id , plan_date , plan_fee , rx_insertTime , rx_updateTime) SELECT :?asset_org_code , :?deadline_id , :?plan_date , :?plan_fee , now() , now();",
// "reqDeadlineInsertDataNew": "INSERT INTO t_asset_deadline_day_plan set asset_org_code :!asset_org_code , deadline_id = :!deadline_id , plan_date =:!plan_date , plan_fee = :?plan_fee , rx_insertTime = now() , rx_updateTime = now()",
// "distriPlanAssetDeadlineInsertData": "INSERT INTO t_asset_deadline_day_plan set asset_org_code = :!asset_org_code, deadline_id=:!deadline_id , plan_date =:!plan_date , plan_fee =:!plan_fee, rx_insertTime = now() , rx_updateTime = now()",
// "distriPlanFundDeadlineInsertData": "INSERT INTO t_fund_deadline_day_plan set fund_org_code = :?fund_org_code, deadline_id=:!deadline_id , plan_date =:!plan_date , plan_fee =:!plan_fee, rx_insertTime = now() , rx_updateTime = now()",

class AssetDeadlineDayPlan extends Model {
  reqDeadlineDeleteData(options = {}) {
    // logic bubble
    return this.nativeDelete(options);
  }
  reqDeadlineInsertData(values = {}) {
    // logic bubble
    return this.nativeCreate(values);
  }
  //
  reqDeadlineInsertDataNew(values = {}) {
    // logic bubble
    return this.nativeCreate(values);
  }
  distriPlanAssetDeadlineInsertData(values = {}) {
    // logic bubble
    return this.nativeCreate(values);
  }
  distriPlanFundDeadlineInsertData(values = {}) {
    // logic bubble
    return this.nativeCreate(values);
  }
}

module.exports = (info, accessList = []) => new AssetDeadlineDayPlan('t_asset_deadline_day_plan', info, accessList);
