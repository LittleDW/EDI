/*
 * @Author Osborn
 * @File assetSetting.js
 * @Date 2018-03-28 11-30
 */

const router = require('express').Router();

const { authWithButton } = require('../middlewares');
const { asynclize } = require('../util');
const { assetSetting } = require('../controllers');

router.post(
  '/update',
  authWithButton('distribution_setting_update'),
  asynclize(assetSetting.update)
);

router.post(
  '/search',
  asynclize(assetSetting.search)
);

router.post('/captcha', asynclize(assetSetting.captcha));

router.post(
  '/updateDeadline',
  authWithButton('distribution_setting_update'),
  asynclize(assetSetting.updateDeadline)
);
module.exports = router;
