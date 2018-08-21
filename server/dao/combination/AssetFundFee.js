/*
 * @Author Osborn
 * @File AssetFundFee
 * @Date 2018-03-28 14-47
 */

// "distrSettingGet":"select a.asset_org_code , a.match_date , a.fund_org_code , a.asset_fee , a.fund_fee , a.max_fee , a.min_fee , a.finish_max_fee , b.is_check_stock, b.stock_day_count, b.priority from t_asset_fund_fee as a inner join t_user AS uf ON a.fund_org_code = uf.org_code inner join t_user AS ua ON a.asset_org_code = ua.org_code inner join t_asset_fund as b on a.asset_org_code = b.asset_org_code and a.fund_org_code = b.fund_org_code where 1=1 and a.asset_org_code =:?asset_org_code and a.fund_org_code =:?fund_org_code and match_date = :?match_date and ua.user_type = '1' and uf.user_type = '2' order by a.asset_org_code, a.fund_org_code",
// "distrDeadlineSettingCollectFee":"update t_asset_fund_fee as a inner join ( select asset_org_code,fund_org_code,match_date ,sum(asset_fee) as asset_fee,sum(fund_fee) as fund_fee ,sum(max_fee) as max_fee ,sum(min_fee) as min_fee from t_asset_fund_deadline_fee where asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and match_date = :?match_date group by asset_org_code,fund_org_code,match_date) as b on a.asset_org_code = b.asset_org_code and a.fund_org_code = b.fund_org_code and a.match_date = b.match_date set a.asset_fee = b.asset_fee, a.fund_fee = b.fund_fee, a.max_fee = b.max_fee, a.min_fee = b.min_fee;",

const sequelize = require('sequelize');
const _ = require('lodash');

const Modal = require('../super');
const { db, sequelizeDB } = require('../../schema/index');

class AssetFundFee extends Modal {
  distrSettingGet(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'match_date');
    const subWhere = {
      user_from: '1',
    };

    const attributes = [
      'asset_org_code',
      'match_date',
      'fund_org_code',
      'asset_fee',
      'fund_fee',
      'max_fee',
      'min_fee',
      'finish_max_fee',
      [sequelize.col('t_asset_fund.is_check_stock'), 'is_check_stock'],
      [sequelize.col('t_asset_fund.stock_day_count'), 'stock_day_count'],
      [sequelize.col('t_asset_fund.priority'), 'priority'],
    ];
    const order = ['asset_org_code', 'fund_org_code'];
    return this.dao.findAll({
      attributes,
      include: [
        {
          attributes: [],
          model: db.t_asset_fund,
          as: 't_asset_fund',
          required: true,
        },
        {
          attributes: [],
          model: this.db.t_user,
          as: 'fund_user',
          required: true,
          where: subWhere,
        },
        {
          attributes: [],
          model: this.db.t_user,
          as: 'asset_user',
          required: true,
          where: subWhere,
        },
      ],
      where,
      order,
      // raw: true,
    });
  }
  queryDeadlineSetting(params = {}) {
    return this.nativeQuery({ where: params });
  }
  distrDeadlineSettingCollectFee(params = {}, transaction = null) {
    return sequelizeDB.query(
      `
    UPDATE t_asset_fund_fee AS a
    INNER JOIN (
    SELECT
      asset_org_code,
      fund_org_code,
      match_date,
      sum( asset_fee ) AS asset_fee,
      sum( fund_fee ) AS fund_fee,
      sum( max_fee ) AS max_fee,
      sum( min_fee ) AS min_fee
    FROM
      t_asset_fund_deadline_fee
    WHERE
      1=1
      ${_.isEmpty(params.asset_org_code) ? '' : ` AND asset_org_code = '${params.asset_org_code}'`}
      ${_.isEmpty(params.fund_org_code) ? '' : `AND fund_org_code = '${params.fund_org_code}'`}
      ${_.isEmpty(params.match_date) ? '' : `AND match_date = '${params.match_date}'`}
    GROUP BY
      asset_org_code,
      fund_org_code,
      match_date
      ) AS b ON a.asset_org_code = b.asset_org_code
      AND a.fund_org_code = b.fund_org_code
      AND a.match_date = b.match_date
      SET a.asset_fee = b.asset_fee,
      a.fund_fee = b.fund_fee,
      a.max_fee = b.max_fee,
      a.min_fee = b.min_fee;
    `,
      { 
        transaction,
      },
    );
  }
}

module.exports = (info, accessList = []) => new AssetFundFee('t_asset_fund_fee', info, accessList);
