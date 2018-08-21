/**
 * @Author zhangjunjie
 * @Date 29/03/2018 16:13
 * @Description: Balance Statistics Dao
 */
const dao = require('../../../dao');
const Super = require('../super');

const { Finance: financeDao } = dao;

class BalaSta extends Super {
  monthForAdmin(params = {}) {
    const { org_type } = params;
    let result;
    if (org_type === 'fund_org_code') {
      result = financeDao
        .FinanceFundMonthStatistics(this.info)
        .queryForAdmin(params);
    } else {
      result = financeDao
        .FinanceAssetMonthStatistics(this.info)
        .queryForAdmin(params);
    }
    return result;
  }
  monthForAsset(params = {}) {
    return financeDao.FinanceAssetMonthStatistics(this.info, ['asset', 'fund', 'admin']).query(params);
  }
  monthForFund(params = {}) {
    return financeDao.FinanceFundMonthStatistics(this.info, ['asset', 'fund', 'admin']).query(params);
  }
  dayForAdmin(params = {}) {
    const { org_type } = params;
    let result;
    if (org_type === 'fund_org_code') {
      result = financeDao
        .FinanceFundDayStatistics(this.info)
        .queryForAdmin(params);
    } else {
      result = financeDao
        .FinanceAssetDayStatistics(this.info)
        .queryForAdmin(params);
    }
    return result;
  }
  dayForAsset(params = {}) {
    return financeDao.FinanceAssetDayStatistics(this.info, ['asset', 'fund', 'admin']).query(params);
  }
  dayForFund(params = {}) {
    return financeDao.FinanceFundDayStatistics(this.info, ['asset', 'fund', 'admin']).query(params);
  }
  balanceForAdmin(params = {}) {
    const { org_type } = params;
    let result;
    if (org_type === 'fund_org_code') {
      result = financeDao
        .FinanceFundDayStatistics(this.info)
        .queryBalanceForAdmin(params);
    } else {
      result = financeDao
        .FinanceAssetDayStatistics(this.info)
        .queryBalanceForAdmin(params);
    }
    return result;
  }
  balanceForFund(params = {}) {
    return financeDao.FinanceFundDayStatistics(this.info, ['asset', 'fund', 'admin']).queryBalance(params);
  }
  balanceForAsset(params = {}) {
    return financeDao.FinanceAssetDayStatistics(this.info, ['asset', 'fund', 'admin']).queryBalance(params);
  }
  balanceStatisticsTab4(params = {}) {
    const {assetList, fundList} = params
    return financeDao.FinanceFundDayStatistics(this.info).queryBalanceForAdminInTab4({assetList, fundList})  
  }
}

module.exports = (req) => new BalaSta(req);
