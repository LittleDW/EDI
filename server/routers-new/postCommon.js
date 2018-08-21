/**
 * @author robin
 * @file common
 * @date 2018-03-30 18:14
 */
/**
 * 作者：石奇峰
 * 功能：后续接口
 * 因为个人和企业订单资料补充共用此接口
 * 故将此接口抽出来放在共通
 * */
const router = require('express').Router();
const { authWithButton } = require('../middlewares');
const { postCommon } = require('../controllers');
const { asynclize } = require('../util');

router.post('/order/supplement',
  authWithButton(['orders_voucher_supplement','corp_orders_voucher_supplement']),
  postCommon.orderSupplementCtrl);
router.post('/order/orderCredit', postCommon.orderCreditCtrl);
/**
 * 因为财务页面共用此接口
 * 故将此接口抽出来放在共通
 * */
router.post('/finance/operLog/search', postCommon.financeOperLogSearchCtrl)
/**
 * 操作记录公共接口
 * 故将此接口抽出来放在共通
 * */
router.post('/operlog/search', postCommon.operlogSearchCtrl)
router.post("*", postCommon.endOfRoute)

module.exports = router;
