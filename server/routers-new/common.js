/**
 * @author robin
 * @file common
 * @date 2018-03-30 18:14
 */

const router = require('express').Router();

const { common } = require('../controllers');
const { asynclize } = require('../util');

router.use(common.cookieParserCtrl)
router.use(common.bodyParserJsonCtrl)
router.use(common.bodyParserUrlencodedCtrl)
router.use(common.sessionCtrl)
router.post(common.sessionCheckCtrl)
router.use(common.visitorCtrl)
if (process.env.NODE_ENV == "development") {
  router.post('/86C1CCFA-E79F-4815-89F0-A788558AEAA6', asynclize(common.gitCtrl))
}
router.post("/getStore",common.getStoreCtrl)
router.post("/login",common.loginCtrl)
router.post("/getCaptcha",common.getCaptchaCtrl)
router.post("*",common.loginCheckCtrl)
router.post("/dictionary",common.dictionaryCtrl)
router.post("/logout",common.logoutCtrl)


/**
 * 因为财务页面共用此接口
 * 故将此接口抽出来放在共通
 * */
router.post('/finance/operLog/search',asynclize(common.financeOperLogSearchCtrl))

/**
 * 操作记录公共接口
 * 故将此接口抽出来放在共通
 * */
router.post('/operlog/search', asynclize(common.operLogSearchCtrl))
router.post('/operlog/combinedSearch', asynclize(common.operLogCombinedSearchCtrl))
router.post('/simplyLogIt', asynclize(common.simplyLogItCtrl))
router.post('/simplyLogTable', asynclize(common.simplyLogTableCtrl))


module.exports = router;
