/*
 * File: fundWeekPlan.js
 * File Created: Thursday, 22nd March 2018 11:47:12 am
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const Model = require("../super");
const { sequelizeDB } = require("../../schema/index");
const _ = require("lodash");

// "colHisList":"select a.fund_org_code , b.`year` , b.`week` , b.week_name , c.start_date , c.end_date , a.plan_fee from t_fund_week_plan as a inner join t_date as b on a.plan_date = b.date inner join t_week as c on c.`year` = b.`year` and c.`week` = b.`week` where 1=1 and a.fund_org_code = :?fund_org_code and CONCAT(b.`year` , b.`week`) < :?end_date order by b.`year` desc , b.`week` desc , b.date limit :?page_index , 70;",
// "colHisCount":"select ceil(count(*) / 7) as count from t_fund_week_plan as a inner join t_date as b on a.plan_date = b.date where 1=1 and fund_org_code = :?fund_org_code and CONCAT(b.`year` , b.`week`) < :?end_date;",

class FundWeekPlan extends Model {
  colHisList(params = {}, page_index = 0) {
    return sequelizeDB.query(`
      SELECT
        a.fund_org_code,
        b.year,
        b.week,
        b.week_name,
        c.start_date,
        c.end_date,
        a.plan_fee
      FROM
        t_fund_week_plan AS a
        INNER JOIN t_date AS b ON a.plan_date = b.date
        INNER JOIN t_week AS c ON c.YEAR = b.YEAR
        AND c.week = b.week
      WHERE
        1 = 1
        ${
          _.isEmpty(params.fund_org_code)
            ? ""
            : ` AND a.fund_org_code = '${params.fund_org_code}'`
        }
        ${
          _.isEmpty(params.end_date)
            ? ""
            : ` AND CONCAT( b.year, b.week ) < '${params.end_date}'`
        }
      ORDER BY
        b.year DESC,
        b.week DESC,
        b.date
        LIMIT ${page_index},
        70;
    `);
  }
  colHisListCount(params = {}) {
    return sequelizeDB.query(`
      SELECT
        ceil( count( * ) / 7 ) AS count
      FROM
        t_fund_week_plan AS a
        INNER JOIN t_date AS b ON a.plan_date = b.date
      WHERE
        1 = 1
        ${
          _.isEmpty(params.fund_org_code)
            ? ""
            : ` AND fund_org_code = '${params.fund_org_code}'`
        }
        ${
          _.isEmpty(params.end_date)
            ? ""
            : ` AND CONCAT( b.YEAR, b.WEEK ) < '${params.end_date}'`
        }
    `);
  }
  colInsertData(params = {}) {
    return sequelizeDB.query(`
    SELECT
      ceil( count( * ) / 7 ) AS count
    FROM
      t_fund_week_plan AS a
      INNER JOIN t_date AS b ON a.plan_date = b.date
    WHERE
      1 = 1
      ${
        _.isEmpty(params.fund_org_code)
          ? ""
          : `AND fund_org_code = '${params.fund_org_code}'`
      }
      ${
        _.isEmpty(params.end_date)
          ? ""
          : `AND CONCAT( b.YEAR, b.WEEK ) < '${params.end_date}'`
      }
    `);
  }
}

// const fundWeekPlan = new FundWeekPlan('t_fund_week_plan');
module.exports = (info, accessList = []) => new FundWeekPlan("t_fund_week_plan", info, accessList);
