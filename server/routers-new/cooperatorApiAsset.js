/*
 * @Author Osborn
 * @File cooperatorApiAsset.js
 * @Date 2018-04-17 11-21
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { cooperatorApiAsset } = require('../controllers');
const { authWithButton } = require('../middlewares');

router.post('/search', asynclize(cooperatorApiAsset.search));
router.post(
  '/create',
  authWithButton('cooperator_api_asset_create'),
  asynclize(cooperatorApiAsset.create)
);

router.post(
  '/update',
  authWithButton('cooperator_api_asset_update'),
  asynclize(cooperatorApiAsset.update)
);
router.post(
  '/delete',
  authWithButton('cooperator_api_asset_delete'),
  asynclize(cooperatorApiAsset.remove)
);

module.exports = router;
