/**
 * @Author zhangjunjie
 * @Date 2018/4/17 16:37
 * @Description: 结算方式 settleMethod Router
 */

const router = require('express').Router();

const { authWithButton } = require('../middlewares');

const { asynclize } = require('../util');
const { settleMethod } = require('../controllers');

router.post('/search', asynclize(settleMethod.search));
router.post(
  '/update',
  authWithButton('settle_method_oper'),
  asynclize(settleMethod.update),
);

module.exports = router;
