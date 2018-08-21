const Model = require('../super');
const {sequelizeDB} = require("../../schema/index");
const {db} = require("../../schema/index");



// "UserAttributeDeadline": "select deadline_id,deadline_name FROM t_deadline where 1=1 order by deadline_id",
// "borrowDeadline":"select deadline_name,`from`,`to`  from t_deadline order by deadline_id",
class Deadline extends Model {
  query() {
    const attributes = ['deadline_id', 'deadline_name','from','to'];
    return this.nativeQuery({
      attributes,
      order: ['deadline_id'],
    });
  }
  // fundSupplyWeekly
  fundSupplyWeekly(params = {}) {
    const {start_date, end_date} = params;
    return sequelizeDB.query(
      `
      SELECT
        a.deadline_id,
        a.deadline_name,
        IFNULL( c.fund_fee, 0 ) AS fund_fee,
        IFNULL( b.asset_fee, 0 ) AS asset_fee,
        IFNULL( c.fund_fee, 0 ) - IFNULL( b.asset_fee, 0 ) AS result_fee
      FROM
        t_deadline AS a
        LEFT JOIN ( SELECT deadline_id, ceil( sum( plan_fee ) / 1000000 ) AS asset_fee FROM t_asset_deadline_day_plan WHERE plan_date >= "${start_date}" AND plan_date <= "${end_date}" GROUP BY deadline_id ) AS b ON a.deadline_id = b.deadline_id
        LEFT JOIN ( SELECT deadline_id, ceil( sum( plan_fee ) / 1000000 ) AS fund_fee FROM t_fund_deadline_day_plan WHERE plan_date >= "${start_date}" AND plan_date <= "${end_date}" GROUP BY deadline_id ) AS c ON a.deadline_id = c.deadline_id
      ORDER BY
        a.deadline_id;
      `
    );
  }

  // fundSupplyDaily
  fundSupplyDaily(params = {}) {
    const {year, week, week_name} = params;
    return sequelizeDB.query(
      `
          SELECT
          a.deadline_id,
          a.deadline_name,
          IFNULL( c.fund_fee, 0 ) AS fund_fee,
          IFNULL( b.asset_fee, 0 ) AS asset_fee,
          IFNULL( c.fund_fee, 0 ) - IFNULL( b.asset_fee, 0 ) AS result_fee
        FROM
          t_deadline AS a
          LEFT JOIN ( SELECT m.deadline_id, ceil( sum( m.plan_fee ) / 1000000 ) AS asset_fee FROM t_asset_deadline_day_plan AS m INNER JOIN t_date AS c ON m.plan_date = c.date WHERE c.\`year\` = "${year}" AND c.\`week\` = "${week}" AND c.week_name = "${week_name}" GROUP BY m.deadline_id ) AS b ON a.deadline_id = b.deadline_id
          LEFT JOIN ( SELECT n.deadline_id, ceil( sum( n.plan_fee ) / 1000000 ) AS fund_fee FROM t_fund_deadline_day_plan AS n INNER JOIN t_date AS c ON n.plan_date = c.date WHERE c.\`year\` = "${year}" AND c.\`week\` = "${week}" AND c.week_name = "${week_name}" GROUP BY n.deadline_id ) AS c ON a.deadline_id = c.deadline_id
        ORDER BY
          a.deadline_id;
        `
    );
  }

  // fundSupplyAsset
  fundSupplyAsset(params = {}) {
    const {year, week, asset_org_code} = params;
    return sequelizeDB.query(
      `
      SELECT
        a.org_code AS asset_org_code,
        c.deadline_id,
        c.deadline_name,
        b.week_name,
        b.date AS plan_date,
        ceil( d.plan_fee / 1000000 ) AS plan_fee
      FROM
        t_user AS a
        INNER JOIN t_date AS b ON 1 = 1
        INNER JOIN t_deadline AS c ON 1 = 1
        LEFT JOIN t_asset_deadline_day_plan AS d ON a.org_code = d.asset_org_code
        AND b.date = d.plan_date
        AND c.deadline_id = d.deadline_id
      WHERE
        1 = 1
        ${asset_org_code ? `AND a.org_code ="${asset_org_code}"` : ''}
        ${year ? `AND b.\`year\` ="${year}"` : ''}
        ${week ? `AND b.\`week\` ="${week}"` : ''}
      ORDER BY
        a.org_code,
        c.deadline_id,
        b.date;
        `
    )
  }

  // fundSupplyFund
  fundSupplyFund(params = {}) {
    const {year, week, fund_org_code} = params;
    return sequelizeDB.query(
      `
      SELECT
        a.org_code AS fund_org_code,
        c.deadline_id,
        c.deadline_name,
        b.week_name,
        b.date AS plan_date,
        ceil( d.plan_fee / 1000000 ) AS plan_fee
      FROM
        t_user AS a
        INNER JOIN t_date AS b ON 1 = 1
        INNER JOIN t_deadline AS c ON 1 = 1
        LEFT JOIN t_fund_deadline_day_plan AS d ON a.org_code = d.fund_org_code
        AND b.date = d.plan_date
        AND c.deadline_id = d.deadline_id
      WHERE
        1 = 1
        ${fund_org_code ? `AND a.org_code ="${fund_org_code}"` : ''}
        ${year ? `AND b.\`year\` ="${year}"` : ''}
        ${week ? `AND b.\`week\` ="${week}"` : ''}
      ORDER BY
        a.org_code,
        c.deadline_id,
        b.date;
        `
    )
  }
}

// const deadline = new Deadline('t_deadline');
module.exports = (info, accessList = []) => new Deadline('t_deadline', info, accessList);
