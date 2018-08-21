/*
 * @Author Osborn
 * @File assetAccountDao.js
 * @Date 2018-03-26 15-13
 */
const dao = require('../../../dao');
const Super = require('../super');

const { Asset: assetDao, Fund: fundDao } = dao;
class AssetAccount extends Super {
  assetAccountQuery(params = {}) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    return assetDao
      .AssetAccount(this.info, ['asset', 'fund', 'admin'])
      .query({ fund_org_code, asset_org_code, account_purpose });
  }
  assetFundAccountQuery(params = {}) {
    const { fund_org_code, asset_org_code } = params;
    return assetDao
      .AssetAccount(this.info, ['asset', 'fund', 'admin'])
      .assetFundAccountQuery({ fund_org_code, asset_org_code });
  }
  fundAccountQuery(params = {}) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    return fundDao.FundAccount(this.info, ['asset', 'fund', 'admin']).query({ fund_org_code, asset_org_code, account_purpose });
  }
  assetAccountCheck(params = {}) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    return assetDao
      .AssetAccount(this.info, ['asset', 'fund', 'admin'])
      .nativeQuerySingle({ where: { fund_org_code, asset_org_code, account_purpose } });
  }
  fundAccountCheck(params = {}) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    return fundDao
      .FundAccount(this.info, ['asset', 'fund', 'admin'])
      .nativeQuerySingle({ where: { fund_org_code, asset_org_code, account_purpose } });
  }
}

module.exports = req => new AssetAccount(req);
