

const Model = require('../super');

// "colDeleteData": "DELETE FROM t_fund_day_plan where 1=1 and fund_org_code = :?fund_org_code and plan_date >=:?start_date and plan_date <=:?end_date",
// "colInsertData": "INSERT INTO t_fund_day_plan( fund_org_code , asset_org_code , plan_date , plan_fee , rx_insertTime , rx_updateTime) SELECT :?fund_org_code , :?asset_org_code , :?plan_date , :?plan_fee , now() , now();",
// "colDeleteDataNew": "DELETE FROM t_fund_day_plan where 1=1 and fund_org_code = :!fund_org_code and plan_date >=:!start_date and plan_date <=:!end_date",
// "colInsertDataNew": "INSERT INTO t_fund_day_plan set fund_org_code =:!fund_org_code , asset_org_code = :!asset_org_code , plan_date =:!plan_date , plan_fee =:!plan_fee , rx_insertTime = now() , rx_updateTime = now();",


class FundDayPlan extends Model {
  colDeleteData(options = {}) {
    // logic bubble
    return this.nativeDelete(options);
  }
  colInsertData(values = {}) {
    return this.nativeCreate(values);
  }
}

// const fundDayPlan = new FundDayPlan('t_fund_day_plan');
module.exports = (info, accessList = []) => new FundDayPlan('t_fund_day_plan', info, accessList);
