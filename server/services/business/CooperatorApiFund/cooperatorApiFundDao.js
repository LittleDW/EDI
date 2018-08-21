/*
 * @Author Osborn
 * @File cooperatorApiAssetDao.js
 * @Date 2018-04-17 11-29
 */

const Super = require('../super');
const dao = require('../../../dao');

const { Fund: fundDao } = dao;

class CooperatorApiFund extends Super {
  queryAndCount(params = {}) {
    const { fund_org_code, page_index } = params;
    return fundDao.FundApi(this.info).queryAndCount({ fund_org_code }, page_index);
  }
  check(params = {}) {
    const { fund_org_code, api_type } = params;
    return fundDao.FundApi(this.info).queryCheck({ fund_org_code, api_type });
  }
  create(params = {}) {
    const {
      fund_org_code, api_type, api_url, api_token, create_user_id,
    } = params;
    return fundDao.FundApi(this.info).nativeCreate({
      fund_org_code,
      api_type,
      api_url,
      api_token,
      create_user_id,
    });
  }
  update(params = {}) {
    const { api_url, api_token } = params;
    const { fund_org_code, api_type } = params;
    return fundDao
      .FundApi(this.info)
      .nativeUpdate({ api_url, api_token }, { where: { fund_org_code, api_type } });
  }
  remove(params = {}) {
    const { fund_org_code, api_type } = params;
    return fundDao.FundApi(this.info).nativeDelete({ where: { fund_org_code, api_type } });
  }
}
module.exports = req => new CooperatorApiFund(req);
