/*
 * File: AssetWeekPlan.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');
const _ = require('lodash');

// "reqHisList":"SELECT a.asset_org_code , b.`year` , b.`week` , b.week_name , c.start_date , c.end_date , a.plan_fee FROM t_asset_week_plan AS a INNER JOIN t_date AS b ON a.plan_date = b.date INNER JOIN t_week AS c ON c.`year` = b.`year` and c.`week` = b.`week` where 1=1 and a.asset_org_code =:?asset_org_code and CONCAT(b.`year` , b.`week`) < :?end_date ORDER BY b.`year` DESC , b.`week` DESC , b.date LIMIT :?page_index , 70;",
// "reqHisCount":"SELECT ceil(count(*) / 7) AS count FROM t_asset_week_plan AS a INNER JOIN t_date AS b ON a.plan_date = b.date where 1=1 and asset_org_code = :?asset_org_code and CONCAT(b.`year` , b.`week`) < :?end_date;",

class AssetWeekPlan extends Model {
  reqHisList(params = {}, page_index = 0) {
    return sequelizeDB.query(`
    SELECT
      a.asset_org_code,
      b.year,
      b.week,
      b.week_name,
      c.start_date,
      c.end_date,
      a.plan_fee
    FROM
      t_asset_week_plan AS a
      INNER JOIN t_date AS b ON a.plan_date = b.date
      INNER JOIN t_week AS c ON c.YEAR = b.YEAR
      AND c.week = b.week
    WHERE
      1 = 1
      ${
        _.isEmpty(params.asset_org_code)
          ? ''
          : `AND a.asset_org_code = '${params.asset_org_code}'`
      }
      ${
        _.isEmpty(params.end_date)
          ? ''
          : `AND CONCAT( b.year, b.week ) < '${params.end_date}'`
      }
    ORDER BY
      b.year DESC,
      b.week DESC,
      b.date
      LIMIT ${page_index},
      70;
    `);
  }
  reqHisListCount(params = {}) {
    return sequelizeDB.query(`
    SELECT
      ceil( count( * ) / 7 ) AS count
    FROM
      t_asset_week_plan AS a
      INNER JOIN t_date AS b ON a.plan_date = b.date
    WHERE
      1 = 1
      ${
        _.isEmpty(params.asset_org_code)
          ? ''
          : `AND asset_org_code = '${params.asset_org_code}'`
      }
      ${
        _.isEmpty(params.end_date)
          ? ''
          : `AND CONCAT( b.year, b.week ) < '${params.end_date}'`
      }
    `);
  }
}

module.exports = (info, accessList = []) => new AssetWeekPlan('t_asset_week_plan', accessList);
