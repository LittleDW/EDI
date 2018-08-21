/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-26 14-15
 */

module.exports = {
  business: {
    profile: require('./business/Profile'),
    assetAccount: require('./business/AssetAccount'),
    assetSetting: require('./business/AssetSetting'),
    balanceStatistics: require('./business/BalanceStatistics'),
    distriPlan: require('./business/DistriPlan'),
    fundStatistics: require('./business/FundStatistics'),
    cooperator: require('./business/Cooperator'),
    cooperatorApiAsset: require('./business/CooperatorApiAsset'),
    cooperatorApiFund: require('./business/CooperatorApiFund'),
    repaymentPlan: require('./business/RepaymentPlan'),
    fundSupply: require('./business/FundSupply'),
    settleMethod: require('./business/SettleMethod'),
    order: require('./business/Order'),
    enterpriseOrder: require('./business/EnterpriseOrder'),
    enterpriseCredit: require('./business/EnterpriseCredit'),
    enterprisePublicity: require('./business/EnterprisePublicity'),
    personalPublicity: require('./business/PersonalPublicity'),
    financeLoan: require('./business/FinanceLoan'),
    financeRepayment: require('./business/FinanceRepayment'),
    financeService: require('./business/FinanceService'),
    menu: require('./business/Menu'),
    repayment: require('./business/Repayment'),
    platformUseFee: require('./business/PlatformUseFee'),
    role: require('./business/Role'),
    operationTableLog: require('./business/OperationTableLog'),
    loginLogs: require('./business/LoginLogs'),
    userAttribute: require('./business/UserAttribute'),
    userManagement: require('./business/UserManagement'),
    subuserManagement: require('./business/SubuserManagement'),
    afterRepaymentStatistics: require('./business/AfterRepaymentStatistics'),
    afterRepayment: require('./business/AfterRepayment'),
    withdraw: require('./business/Withdraw'),
    businessCommon: require('./business/BusinessCommon'),
    common: require('./business/Common').service,
  },
  common: {
    sms: require('./rop/sms'),
  },
};
