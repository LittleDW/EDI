/*
 * File: index.js
 * File Created: Friday, 23rd March 2018 4:32:34 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Thu May 31 2018
 * Modified By: zhangjunjie
 */

module.exports = {
  profile: require('./Profile'),
  assetAccount: require('./AssetAccount'),
  assetSetting: require('./AssetSetting'),
  balanceStatistics: require('./BalanceStatistics'),
  cooperator: require('./Cooperator'),
  cooperatorAccountInfo: require('./CooperatorAccountInfo'),
  cooperatorApiAsset: require('./CooperatorApiAsset'),
  cooperatorApiFund: require('./CooperatorApiFund'),
  cooperatorBusinessSpecifica: require('./CooperatorBusinessSpecifica'),
  order: require('./Order'),
  enterpriseOrder: require('./EnterpriseOrder'),
  enterpriseCredit: require('./EnterpriseCredit'),
  common: require('./Common'),
  distriPlan: require('./DistriPlan'),
  fundSetting: require('./FundSetting'),
  repaymentPlan: require('./RepaymentPlan'),
  platformUseFee: require('./PlatformUseFee'),
  fundSupply: require('./FundSupply'),
  settleMethod: require('./SettleMethod'),
  //postCommon: require('./postCommon'),
  fundStatistics: require('./FundStatistics'),
  financeLoan: require('./FinanceLoan'),
  financeRepayment: require('./FinanceRepayment'),
  financeService: require('./FinanceService'),
  enterprisePublicity: require('./EnterprisePublicity'),
  personalPublicity: require('./PersonalPublicity'),
  repayment: require('./Repayment'),
  role: require('./Role'),
  menu: require('./Menu'),
  operationTableLog: require('./OperationTableLog'),
  loginLogs: require('./LoginLogs'),
  personalCertificate: require('./PersonalCertificate'),
  userAttribute: require('./UserAttribute'),
  userAttributeManagement: require('./UserAttributeManagement'),
  userManagement: require('./UserManagement'),
  subuserManagement: require('./SubuserManagement'),
  afterRepaymentStatistics: require('./AfterRepaymentStatistics'),
  afterRepayment: require('./AfterRepayment'),
  withdraw: require('./Withdraw'),
}
