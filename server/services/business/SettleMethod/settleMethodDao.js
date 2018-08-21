/**
 * @Author zhangjunjie
 * @Date 2018/4/17 16:52
 * @Description: 结算方式 SettleMethod Business Dao
 */

const { AssetFund: afDao } = require('../../../dao').Combination;
const Super = require('../super');
const _ = require('lodash');

class SettleMethodDao extends Super {
  search(params) {
    return afDao(this.info, ['asset', 'fund', 'admin']).settleMethodSearch(
      params,
    );
  }
  update(params = {}, transaction = null) {
    const {
      fund_org_code,
      asset_org_code,
      interest_mode,
      service_mode,
      guarantee_url,
      borrow_agreements_url,
      cooperative_agreements_url,
      due_diligence_url,
      other_agreements_url,
    } = params;
    let { total_rate } = params;
    total_rate = Number.parseFloat(total_rate).toFixed(4);
    if (_.isEmpty(fund_org_code) || _.isEmpty(asset_org_code)) {
      throw new Error('更新失败，缺少必须参数');
    }
    return afDao(this.info).nativeUpdate(
      {
        total_rate,
        interest_mode,
        service_mode,
        guarantee_url,
        borrow_agreements_url,
        cooperative_agreements_url,
        due_diligence_url,
        other_agreements_url,
      },
      {
        where: { fund_org_code, asset_org_code },
        transaction,
        action_type: 'settleMethod',
        action_name: '修改结算方式',
      },
    );
  }
}

module.exports = (req) => new SettleMethodDao(req);
