/*
 * File: profile.js
 * File Created: Friday, 23rd March 2018 4:16:05 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Wed Mar 28 2018
 * Modified By: Osborn
 */

const router = require('express').Router();

const {
  authWithButton,
} = require('../middlewares');
const { asynclize } = require('../util');
const { assetAccount } = require('../controllers');

router.post(
  '/update',
  authWithButton('asset_account_setting'),
  asynclize(assetAccount.update)
);
router.post('/search', asynclize(assetAccount.search));
module.exports = router;
