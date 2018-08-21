/*
 * @Author Osborn
 * @File cooperatorApiFund.js
 * @Created Date 2018-04-18 11-09
 * @Last Modified: 2018-04-18 11-09
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { cooperatorApiFund } = require('../controllers');
const { authWithButton } = require('../middlewares');

router.post('/search', asynclize(cooperatorApiFund.search));
router.post(
  '/create',
  authWithButton('cooperator_api_fund_create'),
  asynclize(cooperatorApiFund.create)
);

router.post(
  '/update',
  authWithButton('cooperator_api_fund_update'),
  asynclize(cooperatorApiFund.update)
);
router.post(
  '/delete',
  authWithButton('cooperator_api_fund_delete'),
  asynclize(cooperatorApiFund.remove)
);

module.exports = router;
