/*
 * @Author Osborn
 * @File cooperatorApiAssetDao.js
 * @Date 2018-04-17 11-29
 */

const Super = require('../super');
const dao = require('../../../dao');

const { Asset: assetDao } = dao;

class CooperatorApiAsset extends Super {
  queryAndCount(params = {}) {
    const { asset_org_code, page_index } = params;
    return assetDao.AssetApi(this.info).queryAndCount({ asset_org_code }, page_index);
  }
  check(params = {}) {
    const { asset_org_code, api_type } = params;
    return assetDao.AssetApi(this.info).queryCheck({ asset_org_code, api_type });
  }
  create(params = {}) {
    const {
      asset_org_code, api_type, api_url, api_token, create_user_id,
    } = params;
    return assetDao.AssetApi(this.info).nativeCreate({
      asset_org_code,
      api_type,
      api_url,
      api_token,
      create_user_id,
    });
  }
  update(params = {}) {
    const { api_url, api_token } = params;
    const { asset_org_code, api_type } = params;
    return assetDao
      .AssetApi(this.info)
      .nativeUpdate({ api_url, api_token }, { where: { asset_org_code, api_type } });
  }
  remove(params = {}) {
    const { asset_org_code, api_type } = params;
    return assetDao.AssetApi(this.info).nativeDelete({ where: { asset_org_code, api_type } });
  }
}
module.exports = req => new CooperatorApiAsset(req);
