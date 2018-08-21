/*
 * @Author Osborn
 * @File assetSetting.js
 * @Date 2018-03-28 14-19
 */

const _ = require('lodash');

const Super = require('../super');

const dao = require('../../../dao');

const { Combination: combinationDao } = dao;
class AssetSetting extends Super {
  distrSettingGet(params = {}) {
    const { fund_org_code, asset_org_code, match_date } = params;
    return combinationDao
      .AssetFundFee(this.info)
      .distrSettingGet({ fund_org_code, asset_org_code, match_date });
  }
  distrDeadlineSettingGet(params = {}) {
    return combinationDao.AssetFundDeadlineFee(this.info).distrDeadlineSettingGet(params);
  }
  distrDeadlineSettingCaptchaUpdate(values = {}, options = {}, transaction = null) {
    const {
      asset_org_code, fund_org_code, match_date, deadline_id,
    } = options;
    return combinationDao.AssetFundDeadlineFee(this.info).nativeUpdate(values, {
      where: {
        asset_org_code,
        fund_org_code,
        match_date,
        deadline_id,
      },
      transaction,
    });
  }
  distrSettingUpdatePriority(values = {}, transaction = null) {
    const { priority, is_check_stock, stock_day_count } = values;
    const { asset_org_code, fund_org_code } = values;
    return combinationDao.AssetFund(this.info).nativeUpdate(
      { priority, is_check_stock, stock_day_count },
      {
        where: { asset_org_code, fund_org_code },
        transaction,
        action_type: 'assetSetting',
      },
    );
  }
  distrDeadlineAssetSettingUpdate(values = {}, transaction = null) {
    const { asset_fee } = values;
    const {
      fund_org_code, asset_org_code, deadline_id, match_date,
    } = values;
    return combinationDao.AssetFundDeadlineFee(this.info).nativeUpdate(
      { asset_fee },
      {
        where: {
          fund_org_code,
          asset_org_code,
          deadline_id,
          match_date,
        },
        transaction,
      },
    );
  }
  distrDeadlineFundSettingUpdate(values = {}, transaction = null) {
    const { fund_fee } = values;
    const {
      fund_org_code, asset_org_code, deadline_id, match_date,
    } = values;
    return combinationDao.AssetFundDeadlineFee(this.info).nativeUpdate(
      { fund_fee },
      {
        where: {
          fund_org_code,
          asset_org_code,
          deadline_id,
          match_date,
        },
        transaction,
      },
    );
  }
  distrDeadlineAdminSettingUpdate(values = {}, transaction = null) {
    const { fund_fee, asset_fee } = values;
    const {
      fund_org_code, asset_org_code, deadline_id, match_date,
    } = values;
    return combinationDao.AssetFundDeadlineFee(this.info).nativeUpdate(
      { fund_fee, asset_fee },
      {
        where: {
          fund_org_code,
          asset_org_code,
          deadline_id,
          match_date,
        },
        transaction,
      },
    );
  }
  distrDeadlineSettingUpdateOtherFee(params = {}, transaction = null) {
    const { fund_fee, asset_fee } = params;
    const max_fee = _.min([asset_fee, fund_fee]);
    const min_fee = max_fee / 2;
    const {
      fund_org_code, asset_org_code, deadline_id, match_date,
    } = params;
    return combinationDao.AssetFundDeadlineFee(this.info).nativeUpdate(
      { min_fee, max_fee },
      {
        where: {
          fund_org_code,
          asset_org_code,
          deadline_id,
          match_date,
        },
        transaction,
      },
    );
  }
  distrDeadlineSettingCollectFee(params = {}, transaction = null) {
    const { asset_org_code, fund_org_code, match_date } = params;
    return combinationDao
      .AssetFundFee(this.info)
      .distrDeadlineSettingCollectFee({ asset_org_code, fund_org_code, match_date }, transaction);
  }
}

module.exports = (req) => new AssetSetting(req);
