/**
 * 作者：石奇峰
 * 功能：统一化路由配置，根据url进行一级路由中间件分配
 * */

const router = require('express').Router();
var {killSession} = require('./session'),{logger} = require('./util');

const commonRouter = require('./routers/common')
const corpAuthRouter = require('./routers/corpAuth')
const orderRouter = require('./routers/order')
const corpOrderRouter = require('./routers/corpOrder')
const fundStatisticsRouter = require('./routers/fundStatistics')
const fundSupplyRouter = require('./routers/fundSupply')
const settleMethodRouter = require('./routers/settleMethod')
const balanceStatisticsRouter = require('./routers/balanceStatistics')
const repaymentRouter = require('./routers/repayment')
const assetAccountRouter = require('./routers/assetAccount')
const repaymentPlanRouter = require('./routers/repaymentPlan')
const requirementPlanRouter = require('./routers/requirementPlan')
const distriPlanRouter = require('./routers/distriPlan')
const collectionPlanRouter = require('./routers/collectionPlan')
const assetSettingRouter = require('./routers/assetSetting')
const fundSettingRouter = require('./routers/fundSetting')
const profileRouter = require('./routers/profile')
const subuserManagementRouter = require('./routers/subuserManagement')
const menuRouter = require('./routers/menu')
const cooperatorRouter = require('./routers/cooperator')
const cooperatorAccountInfoRouter = require('./routers/cooperatorAccountInfo')
const roleRouter = require('./routers/role')
const financeLoanRouter = require('./routers/financeLoan')
const financeRepaymentRouter = require('./routers/financeRepayment')
const financeServiceRouter = require('./routers/financeService')
const personalCertificateRouter = require('./routers/personalCertificate')
const userManagementRouter = require('./routers/userManagement')
const postCommonRouter = require('./routers/postCommon')
const enterprisePublicityRouter = require('./routers/enterprisePublicity')
const personalPublicityRouter = require('./routers/personalPublicity')
const operTableLogs = require('./routers/operTableLogs')
const cooperatorApiAsset = require('./routers/cooperatorApiAsset')
const cooperatorApiFund = require('./routers/cooperatorApiFund')
const platformUseFee = require('./routers/platformUseFee')
const userAttribute = require('./routers/userAttribute')
const userAttributeManagement = require('./routers/userAttributeManagement')
const cooperatorBusinessSpecifica = require('./routers/cooperatorBusinessSpecifica')
const afterRepaymentStatistics = require('./routers/afterRepaymentStatistics')
const afterRepayment = require('./routers/afterRepayment')

const refactorRouters = require('./routers-new');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
/** 清除多于11次事件请求时的报警*/
require('events').EventEmitter.defaultMaxListeners = 50;

module.exports.setupApp = (app) => {
  app.use(refactorRouters(router));
  //app.use(commonRouter)

  app.use('/order', orderRouter);
  app.use('/corpOrder', corpOrderRouter);
  app.use('/fundStatistics', fundStatisticsRouter);
  app.use('/fundSupply', fundSupplyRouter);
  app.use('/settleMethod', settleMethodRouter);
  app.use('/balanceStatistics', balanceStatisticsRouter);
  app.use('/corpAuth', corpAuthRouter);
  app.use('/repayment', repaymentRouter);
  app.use('/assetAccount', assetAccountRouter);
  app.use('/repaymentPlan', repaymentPlanRouter);
  app.use('/requirementPlan', requirementPlanRouter);
  app.use('/distriPlan', distriPlanRouter);
  app.use('/collectionPlan', collectionPlanRouter);
  app.use('/assetSetting', assetSettingRouter);
  app.use('/fundSetting', fundSettingRouter);
  app.use('/profile', profileRouter);
  app.use('/subuserManagement', subuserManagementRouter);
  app.use('/userManagement', userManagementRouter);
  app.use('/menu', menuRouter);
  app.use('/cooperator', cooperatorRouter);
  app.use('/cooperatorAccountInfo', cooperatorAccountInfoRouter);
  app.use('/role', roleRouter);
  app.use('/financeLoan', financeLoanRouter);
  app.use('/financeRepayment', financeRepaymentRouter);
  app.use('/financeService', financeServiceRouter);
  app.use('/personalCertificate', personalCertificateRouter);
  app.use('/enterprisePublicity', enterprisePublicityRouter);
  app.use('/personalPublicity', personalPublicityRouter);
  app.use('/cooperatorApiAsset', cooperatorApiAsset);
  app.use('/cooperatorApiFund', cooperatorApiFund);
  app.use('/userAttribute', userAttribute);
  app.use('/userAttributeManagement', userAttributeManagement);
  app.use('/operTableLogs', operTableLogs);
  app.use('/platformUseFee', platformUseFee);
  app.use('/cooperatorBusinessSpecifica', cooperatorBusinessSpecifica);
  app.use('/afterRepaymentStatistics', afterRepaymentStatistics);
  app.use('/afterRepaymentOrder', afterRepayment);
  //app.use(postCommonRouter);

  process.on('exit', () => {
    killSession()
    logger.shutdown()
  })
}
