/*
 * @Author Osborn
 * @File AssetFundFee
 * @Date 2018-03-28 14-47
 */

//  "distrDeadlineSettingGet":"select * from t_asset_fund_deadline_fee where 1 = 1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and match_date = :?match_date and deadline_id = :?deadline_id",
// "distrDeadlineAssetSettingUpdate":"update t_asset_fund_deadline_fee set asset_fee = :!asset_fee where 1=1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and deadline_id = :?deadline_id and match_date = :?match_date;",
// "distrDeadlineFundSettingUpdate":"update t_asset_fund_deadline_fee set fund_fee = :!fund_fee where 1=1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and deadline_id = :?deadline_id and match_date = :?match_date;",
// "distrDeadlineAdminSettingUpdate":"update t_asset_fund_deadline_fee set asset_fee = :!asset_fee ,fund_fee = :!fund_fee where 1=1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and deadline_id = :?deadline_id and match_date = :?match_date;",
// "distrDeadlineSettingUpdateOtherFee":"update t_asset_fund_deadline_fee set max_fee = IF( asset_fee < fund_fee , asset_fee , fund_fee) , min_fee = IF( asset_fee < fund_fee , asset_fee , fund_fee) / 2 where 1=1 and asset_org_code =:?asset_org_code and fund_org_code = :?fund_org_code and deadline_id = :?deadline_id and match_date = :?match_date;",
// "distrDeadlineSettingCaptchaUpdate": "update t_asset_fund_deadline_fee set verification_code = :?verification_code, verification_valid_time = now() where 1=1 and asset_org_code = :?asset_org_code and fund_org_code = :?fund_org_code and deadline_id = :?deadline_id and match_date = :?match_date;",

const Modal = require('../super');

class AssetFundDeadlineFee extends Modal {
  distrDeadlineSettingGet(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'match_date');
    this.queryParamsStringSetupBuilder(params, where, 'deadline_id');
    const subWhere = {
      user_from: '1',
    };
    return this.dao.findAll({
      include: [
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
      // raw: true,
    });
  }
}

module.exports = (info, accessList = []) =>
  new AssetFundDeadlineFee('t_asset_fund_deadline_fee', info, accessList);
