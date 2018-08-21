/*
 * File: EnterpriseCreditVoucher.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */
const sequelize = require('sequelize');
const _ = require('lodash');

const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

// "corpAuthVoucher": "select asset_org_code,borrow_business_license, voucher_name, voucher_url from t_enterprise_credit_voucher where 1=1 and asset_org_code=:?asset_org_code and borrow_business_license=:?borrow_business_license",
// "filterCorpAuthAssetVoucher": "select DISTINCT * from (select v.voucher_name as voucher_name, v.voucher_url as voucher_url from t_enterprise_credit_voucher as v left join t_enterprise_asset_credit as a on a.asset_org_code = v.asset_org_code and a.borrow_business_license=v.borrow_business_license where 1=1 and a.rx_insertTime>=:?borrow_date_start and a.rx_insertTime<=:?borrow_date_end and a.asset_org_code=:?asset_org_code and a.borrow_name like :?borrow_name and a.asset_credit_status in ::?asset_credit_status ORDER BY a.rx_insertTime DESC) x;",
// "filterCorpAuthFundVoucher": "select DISTINCT * from (select v.voucher_name as voucher_name, v.voucher_url as voucher_url from t_enterprise_credit_voucher as v inner join t_enterprise_asset_credit as a on a.asset_org_code = v.asset_org_code and a.borrow_business_license=v.borrow_business_license inner join t_enterprise_fund_credit as b on b.asset_org_code = v.asset_org_code and b.borrow_business_license=v.borrow_business_license where 1=1 and a.rx_insertTime>=:?borrow_date_start and a.rx_insertTime<=:?borrow_date_end and a.asset_org_code=:?asset_org_code and a.borrow_name like :?borrow_name and a.asset_credit_status in ::?asset_credit_status and b.fund_org_code=:?fund_org_code ORDER BY a.rx_insertTime DESC) x;",

class EnterpriseCreditVoucher extends Model {
  corpAuthVoucher(params = {}) {
    const attributes = [
      'asset_org_code',
      'borrow_business_license',
      'voucher_name',
      'voucher_url',
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'borrow_business_license',
    );
    return this.dao.findAll({
      attributes,
      where,
    });
  }
  filterCorpAuthAssetVoucher(params = {}, page_index = 0) {
    return sequelizeDB.query(`
    SELECT DISTINCT
      *
    FROM
      (
    SELECT
      v.voucher_name AS voucher_name,
      v.voucher_url AS voucher_url
    FROM
      t_enterprise_credit_voucher AS v
      LEFT JOIN t_enterprise_asset_credit AS a ON a.asset_org_code = v.asset_org_code
      AND a.borrow_business_license = v.borrow_business_license
    WHERE
      1 = 1
      ${
  _.isEmpty(params.borrow_date_start)
    ? ''
    : `AND a.rx_insertTime >=  '${params.borrow_date_start}'`
}
      ${
  _.isEmpty(params.borrow_date_end)
    ? ''
    : `AND a.rx_insertTime <=  '${params.borrow_date_end}'`
}
      ${
  _.isEmpty(params.asset_org_code)
    ? ''
    : `AND a.asset_org_code =  '${params.asset_org_code}'`
}
      ${
  _.isEmpty(params.borrow_name)
    ? ''
    : `AND a.borrow_name LIKE  '${params.borrow_name}'`
}
      ${
  _.isEmpty(params.asset_credit_status)
    ? ''
    : `AND a.asset_credit_status IN (${params.asset_credit_status.map(r=>(`'${r}'`)).join(",")})`
}
    ORDER BY
      a.rx_insertTime DESC
      ) x;
    `,{ type: sequelize.QueryTypes.SELECT});
  }
  filterCorpAuthFundVoucher(params = {}) {
    return sequelizeDB.query(`
    SELECT DISTINCT
      *
    FROM
      (
    SELECT
      v.voucher_name AS voucher_name,
      v.voucher_url AS voucher_url
    FROM
      t_enterprise_credit_voucher AS v
      INNER JOIN t_enterprise_asset_credit AS a ON a.asset_org_code = v.asset_org_code
      AND a.borrow_business_license = v.borrow_business_license
      INNER JOIN t_enterprise_fund_credit AS b ON b.asset_org_code = v.asset_org_code
      AND b.borrow_business_license = v.borrow_business_license
    WHERE
      1 = 1
      ${
  _.isEmpty(params.borrow_date_start)
    ? ''
    : `AND a.rx_insertTime >= '${params.borrow_date_start}'`
}
      ${
  _.isEmpty(params.borrow_date_end)
    ? ''
    : `AND a.rx_insertTime <=  '${params.borrow_date_end}'`
}
      ${
  _.isEmpty(params.asset_org_code)
    ? ''
    : `AND a.asset_org_code = '${params.asset_org_code}'`
}
      ${
  _.isEmpty(params.borrow_name)
    ? ''
    : `AND a.borrow_name LIKE '${params.borrow_name}'`
}
      ${
  _.isEmpty(params.asset_credit_status)
    ? ''
    : `AND a.asset_credit_status IN (${params.asset_credit_status.map(r=>(`'${r}'`)).join(",")})`
}
       ${
  _.isEmpty(params.fund_credit_status)
    ? ''
    : `AND b.fund_credit_status IN (${params.fund_credit_status.map(r=>(`'${r}'`)).join(",")})`
}
      ${
  _.isEmpty(params.fund_org_code)
    ? ''
    : `AND b.fund_org_code = '${params.fund_org_code}'`
}
    ORDER BY
      a.rx_insertTime DESC
      ) x;
    `, { type: sequelize.QueryTypes.SELECT});
  }
}

/* const enterpriseCreditVoucher = new EnterpriseCreditVoucher(
  't_enterprise_credit_voucher'
); */
module.exports = (info, accessList = []) => new EnterpriseCreditVoucher('t_enterprise_credit_voucher', info, accessList);
