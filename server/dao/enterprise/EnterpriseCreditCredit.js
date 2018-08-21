/*
 * File: EnterpriseCreditCredit.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const Model = require('../super');

// "enterpriseCreditCredit": "select * from t_enterprise_credit_credit where 1=1 and asset_org_code=:?asset_org_code and borrow_business_license=:?borrow_business_license",
// "corpAuthCredit": "select * from t_enterprise_credit_credit where 1=1 and borrow_business_license=:?borrow_business_license and asset_org_code=:?asset_org_code",

class EnterpriseCreditCredit extends Model {
  query(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'borrow_business_license',
    );
    return this.dao.findAll({
      where,
    });
  }
  corpAuthCredit(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(
      params,
      where,
      'borrow_business_license',
    );
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    return this.dao.findAll({
      where,
    });
  }
}

/* const enterpriseCreditCredit = new EnterpriseCreditCredit(
  't_enterprise_credit_credit'
); */
module.exports = (info, accessList = []) => new EnterpriseCreditCredit('t_enterprise_credit_credit', info, accessList);
