const sequelize = require("sequelize");
const Model = require("../super");
const { db, sequelizeDB } = require("../../schema/index");

class FundStatistics extends Model {
  // fundStatisticsAssetTotal
  fundStatisticsAssetTotal(params = {}) {
    const attributes = [
      ["fund_org_code", "fund_org_code"],
      [sequelize.col("t_deadline.deadline_name"), "deadline_name"],
      [
        sequelize.fn(
          "max",
          sequelize.col("t_asset_fund_day_match.deadline_id")
        ),
        "deadline_id"
      ],
      [
        sequelize.literal("format( sum( raise_fee ) / 1000000, 0 )"),
        "raise_fee"
      ]
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, "asset_org_code");
    this.QueryParamsOfIntervalEnhancer(
      params,
      where,
      "match_date",
      "start_date",
      "end_date"
    );
    return this.dao.findAll({
      attributes,
      where,
      include: [
        {
          attributes: [],
          model: db.t_deadline,
          as: "t_deadline",
          required: true
        },
        {
          attributes: [],
          model: db.t_user,
          as: "fund_user",
          required: true,
          where: {
            user_from: "1"
          }
        }
      ],
      as: "t_asset_fund_day_match",
      group: [
        sequelize.col("t_asset_fund_day_match.fund_org_code"),
        sequelize.col("t_deadline.deadline_name")
      ],
      order: [sequelize.col("fund_org_code"), sequelize.col("deadline_id")]
    });
  }

  // fundStatisticsFundTotal
  fundStatisticsFundTotal(params = {}) {
    const attributes = [
      ["asset_org_code", "asset_org_code"],
      [sequelize.col("t_deadline.deadline_name"), "deadline_name"],
      [
        sequelize.fn(
          "max",
          sequelize.col("t_asset_fund_day_match.deadline_id")
        ),
        "deadline_id"
      ],
      [
        sequelize.literal("format( sum( raise_fee ) / 1000000, 0 )"),
        "raise_fee"
      ]
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, "fund_org_code");
    this.queryParamsStringSetupBuilder(
      params,
      where,
      "match_date",
      "start_date",
      "end_date"
    );
    return this.dao.findAll({
      attributes,
      where,
      include: [
        {
          attributes: [],
          model: db.t_deadline,
          as: "t_deadline",
          required: true
        },
        {
          attributes: [],
          model: db.t_user,
          as: "asset_user",
          required: true,
          where: {
            user_from: "1"
          }
        }
      ],
      as: "t_asset_fund_day_match",
      group: [
        sequelize.col("t_asset_fund_day_match.asset_org_code"),
        sequelize.col("t_deadline.deadline_name")
      ],
      order: [sequelize.col("asset_org_code"), sequelize.col("deadline_id")]
    });
  }

  // fundStatisticsAsset
  fundStatisticsAsset(params = {}) {
    const { asset_org_code, start_date, end_date, deadline_id } = params;
    return sequelizeDB.query(
      `
      SELECT
        a.fund_org_code,
        format( max( c.fund_stock_fee ) / 1000000, 0 ) AS fund_stock_fee,
        format( sum( d.plan_fee ) / 1000000, 0 ) AS plan_fee,
        format( sum( a.match_fee ) / 1000000, 0 ) AS match_fee,
        format( sum( a.raise_fee ) / 1000000, 0 ) AS raise_fee,
        format( sum( a.raise_fee ) / sum( match_fee ) * 100, 2 ) AS raise_rate,
        format( sum( a.expend_fee ) / 1000000, 0 ) AS account_fee
      FROM
        (
        SELECT
          asset_org_code,
          fund_org_code,
          match_date,
          sum( match_fee ) AS match_fee,
          sum( raise_fee ) AS raise_fee,
          sum( expend_fee ) AS expend_fee
        FROM
          t_asset_fund_day_match
          INNER JOIN t_user AS u ON u.org_code = fund_org_code
        WHERE
          1 = 1
          AND u.user_from = "1"
          ${asset_org_code ? `AND asset_org_code = "${asset_org_code}"` : ""}
          ${start_date ? `AND match_date >= "${start_date}"` : ""}
          ${end_date ? `AND match_date <= "${end_date}"` : ""}
          ${deadline_id ? `AND deadline_id = "${deadline_id}"` : ""}
        GROUP BY
          asset_org_code,
          fund_org_code,
          match_date
        ) AS a
        INNER JOIN ( SELECT fund_org_code, sum( fund_stock_fee ) AS fund_stock_fee FROM t_asset_fund WHERE 1 = 1 ${
          asset_org_code ? `AND asset_org_code = "${asset_org_code}"` : ""
        } GROUP BY fund_org_code ) AS c ON a.fund_org_code = c.fund_org_code
            INNER JOIN t_fund_day_plan AS d ON a.asset_org_code = d.asset_org_code
            AND a.fund_org_code = d.fund_org_code
            AND a.match_date = d.plan_date
        GROUP BY
            a.fund_org_code;
            `,
      { type: sequelize.QueryTypes.SELECT }
    );
  }

  // fundStatisticsFund
  fundStatisticsFund(params = {}) {
    const { fund_org_code, start_date, end_date, deadline_id } = params;
    return sequelizeDB.query(
      `SELECT
        a.asset_org_code,
        format( max( c.fund_stock_fee ) / 1000000, 0 ) AS fund_stock_fee,
        format( sum( d.plan_fee ) / 1000000, 0 ) AS plan_fee,
        format( sum( match_fee ) / 1000000, 0 ) AS match_fee,
        format( sum( raise_fee ) / 1000000, 0 ) AS raise_fee,
        format( sum( a.raise_fee ) / sum( match_fee ) * 100, 2 ) AS raise_rate,
        format( sum( account_fee ) / 1000000, 0 ) AS expend_fee
      FROM
        (
        SELECT
          asset_org_code,
          fund_org_code,
          match_date,
          sum( match_fee ) AS match_fee,
          sum( raise_fee ) AS raise_fee,
          sum( account_fee ) AS account_fee
        FROM
          t_asset_fund_day_match
          INNER JOIN t_user AS u ON u.org_code = asset_org_code
        WHERE
          1 = 1
          AND u.user_from = "1"
          ${fund_org_code ? `AND fund_org_code = "${fund_org_code}"` : ""}
          ${start_date ? `AND match_date >= "${start_date}"` : ""}
          ${end_date ? `AND match_date <= "${end_date}"` : ""}
          ${deadline_id ? `AND deadline_id = "${deadline_id}"` : ""}
        GROUP BY
          asset_org_code,
          fund_org_code,
          match_date
        ) AS a
        INNER JOIN ( SELECT asset_org_code, sum( fund_stock_fee ) AS fund_stock_fee FROM t_asset_fund WHERE 1 = 1 ${
          fund_org_code ? `AND fund_org_code = "${fund_org_code}"` : ""
        } GROUP BY asset_org_code ) AS c ON a.asset_org_code = c.asset_org_code
        INNER JOIN t_asset_day_plan AS d ON a.asset_org_code = d.asset_org_code
        AND a.fund_org_code = d.fund_org_code
        AND a.match_date = d.plan_date
      GROUP BY
        a.asset_org_code;
	    `,
      { type: sequelize.QueryTypes.SELECT }
    );
  }

  // fundStatisticsAssetDeadline
  fundStatisticsAssetDeadline(params = {}) {
    const { fund_org_code, start_date, end_date, asset_org_code } = params;
    return sequelizeDB.query(
      `
      SELECT
        b.deadline_name,
        max( a.deadline_id ) AS deadline_id,
        format( max( c.fund_stock_fee ) / 1000000, 0 ) AS fund_stock_fee,
        format( sum( d.plan_fee ) / 1000000, 0 ) AS plan_fee,
        format( sum( match_fee ) / 1000000, 0 ) AS match_fee,
        format( sum( raise_fee ) / 1000000, 0 ) AS raise_fee,
        format( sum( a.raise_fee ) / sum( match_fee ) * 100, 2 ) AS raise_rate,
        format( sum( account_fee ) / 1000000, 0 ) AS expend_fee
      FROM
        (
        SELECT
          asset_org_code,
          deadline_id,
          match_date,
          sum( match_fee ) AS match_fee,
          sum( raise_fee ) AS raise_fee,
          sum( account_fee ) AS account_fee
        FROM
          t_asset_fund_day_match
        WHERE
          1 = 1
          ${fund_org_code ? `AND fund_org_code = "${fund_org_code}"` : ""}
          ${asset_org_code ? `AND asset_org_code = "${asset_org_code}"` : ""}
          ${start_date ? `AND match_date >= "${start_date}"` : ""}
          ${end_date ? `AND match_date <= "${end_date}"` : ""}
        GROUP BY
          asset_org_code,
          deadline_id,
          match_date
        ) AS a
        INNER JOIN t_deadline AS b ON a.deadline_id = b.deadline_id
        INNER JOIN ( SELECT deadline_id, sum( fund_stock_fee ) AS fund_stock_fee FROM t_asset_fund_deadline_stcok WHERE 1 = 1 ${
          fund_org_code ? `AND fund_org_code = "${fund_org_code}"` : ""
        } ${
        asset_org_code ? `AND asset_org_code = "${asset_org_code}"` : ""
      } GROUP BY deadline_id ) AS c ON a.deadline_id = c.deadline_id
        INNER JOIN t_asset_deadline_day_plan AS d ON a.asset_org_code = d.asset_org_code
        AND a.deadline_id = d.deadline_id
        AND a.match_date = d.plan_date
      GROUP BY
        b.deadline_name
      ORDER BY
        deadline_id;
	    `,
      { type: sequelize.QueryTypes.SELECT }
    );
  }

  // fundStatisticsFundDeadline
  fundStatisticsFundDeadline(params = {}) {
    const { fund_org_code, start_date, end_date, asset_org_code } = params;
    return sequelizeDB.query(
      `
      SELECT
        b.deadline_name,
        max( a.deadline_id ) AS deadline_id,
        format( max( c.fund_stock_fee ) / 1000000, 0 ) AS fund_stock_fee,
        format( sum( d.plan_fee ) / 1000000, 0 ) AS plan_fee,
        format( sum( match_fee ) / 1000000, 0 ) AS match_fee,
        format( sum( raise_fee ) / 1000000, 0 ) AS raise_fee,
        format( sum( a.raise_fee ) / sum( match_fee ) * 100, 2 ) AS raise_rate,
        format( sum( expend_fee ) / 1000000, 0 ) AS account_fee
      FROM
        (
        SELECT
          fund_org_code,
          deadline_id,
          match_date,
          sum( match_fee ) AS match_fee,
          sum( raise_fee ) AS raise_fee,
          sum( expend_fee ) AS expend_fee
        FROM
          t_asset_fund_day_match
        WHERE
          1 = 1
          ${fund_org_code ? `AND fund_org_code = "${fund_org_code}"` : ""}
          ${asset_org_code ? `AND asset_org_code = "${asset_org_code}"` : ""}
          ${start_date ? `AND match_date >= "${start_date}"` : ""}
          ${end_date ? `AND match_date <= "${end_date}"` : ""}
        GROUP BY
          fund_org_code,
          deadline_id,
          match_date
        ) AS a
        INNER JOIN t_deadline AS b ON a.deadline_id = b.deadline_id
        INNER JOIN ( SELECT deadline_id, sum( fund_stock_fee ) AS fund_stock_fee FROM t_asset_fund_deadline_stcok WHERE 1 = 1 ${
          fund_org_code ? `AND fund_org_code = "${fund_org_code}"` : ""
        } ${
        asset_org_code ? `AND asset_org_code = "${asset_org_code}"` : ""
      } GROUP BY deadline_id ) AS c ON a.deadline_id = c.deadline_id
        INNER JOIN t_fund_deadline_day_plan AS d ON a.fund_org_code = d.fund_org_code
        AND a.deadline_id = d.deadline_id
        AND a.match_date = d.plan_date
      GROUP BY
        b.deadline_name
      ORDER BY
        deadline_id;
	    `,
      { type: sequelize.QueryTypes.SELECT }
    );
  }
}

module.exports = (info, accessList = []) => new FundStatistics("t_asset_fund_day_match", info, accessList);
