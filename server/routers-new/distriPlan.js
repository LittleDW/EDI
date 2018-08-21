/*
 * @Author zhangjunjie
 * @File distriPlan.js
 * @Created Date 2018-05-22 15-16
 * @Last Modified: 2018-05-28 13-51
 * @Modified By: zhangjunjie
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { authWithButton } = require('../middlewares');
const { distriPlan } = require('../controllers');

router.post('/search', asynclize(distriPlan.search));
router.post('/searchHistory', asynclize(distriPlan.searchHis));
router.post(
  '/update',
  authWithButton('submit_plan'),
  asynclize(distriPlan.update),
);

module.exports = router;
