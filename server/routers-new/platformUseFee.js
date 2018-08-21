/*
 * @Author zhangjunjie
 * @File platformUseFee.js
 * @Created Date 2018-05-30 15-17
 * @Last Modified: 2018-05-30 15-18
 * @Modified By: zhangjunjie
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { authWithButton } = require('../middlewares');
const { platformUseFee } = require('../controllers');

router.post('/billSearch', asynclize(platformUseFee.billSearch));
router.post(
  '/emailSearch',
  authWithButton('platform_use_fee_bill_notice'),
  asynclize(platformUseFee.emailSearch),
);
router.post(
  '/billReduce',
  authWithButton('platform_use_fee_bill_reduce'),
  asynclize(platformUseFee.billReduce),
);

router.post(
  '/payNotice',
  authWithButton('platform_use_fee_bill_notice'),
  asynclize(platformUseFee.payNotice),
);

router.post('/paySearch', asynclize(platformUseFee.paySearch));

router.post(
  '/payAdd',
  authWithButton('platform_use_fee_pay'),
  asynclize(platformUseFee.payAdd),
);
router.post(
  '/feeSearch',
  authWithButton('platform_use_fee_bill_notice'),
  asynclize(platformUseFee.feeSearch),
);
router.post(
  '/feeUpdate',
  authWithButton('platform_use_fee_pattern_update'),
  asynclize(platformUseFee.feeUpdate),
);
router.get(
  '/export',
  authWithButton('platform_use_fee_bill_export'),
  asynclize(platformUseFee.exportFn),
);

module.exports = router;
