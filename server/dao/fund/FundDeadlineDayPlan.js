
const Model = require('../super');


// "colDeadlineDeleteData": "DELETE FROM t_fund_deadline_day_plan where fund_org_code = :?fund_org_code and plan_date >= :?start_date and plan_date <= :?end_date;",
// "colDeadlineInsertData": "INSERT INTO t_fund_deadline_day_plan( fund_org_code , deadline_id , plan_date , plan_fee , rx_insertTime , rx_updateTime) SELECT :?fund_org_code , :?deadline_id , :?plan_date , :?plan_fee , now() , now();",
// "colDeadlineDeleteDataNew": "DELETE FROM t_fund_deadline_day_plan where fund_org_code = :!fund_org_code and plan_date >= :!start_date and plan_date <= :!end_date;",
// "colDeadlineInsertDataNew": "INSERT INTO t_fund_deadline_day_plan set fund_org_code = :!fund_org_code , deadline_id =:!deadline_id , plan_date =:!plan_date , plan_fee =:!plan_fee , rx_insertTime = now(), rx_updateTime = now();",


class FundDeadlineDayPlan extends Model {
  colDeadlineDeleteData(options = {}) {
    // logic bubble
    return this.nativeDelete(options);
  }
  colDeadlineInsertData(values = {}) {
    return this.nativeCreate(values);
  }
}

// const fundDeadlineDayPlan = new FundDeadlineDayPlan('t_fund_deadline_day_plan');
module.exports = (info, accessList = []) => new FundDeadlineDayPlan('t_fund_deadline_day_plan', info, accessList);
