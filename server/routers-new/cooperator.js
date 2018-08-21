/*
 * @Author Osborn
 * @File cooperator.js
 * @Date 2018-04-02 11-24
 */

const router = require('express').Router();

const { authWithButton, authWithMenuAndSubmenu } = require('../middlewares');
const { asynclize } = require('../util');
const { cooperator } = require('../controllers');

router.post('/search', asynclize(cooperator.search));

router.post(
  '/create',
  authWithButton('cooperator_info_create'),
  asynclize(cooperator.create)
);
router.post(
  '/update',
  authWithButton('cooperator_info_update'),
  asynclize(cooperator.update)
);
router.post(
  '/delete',
  authWithButton('cooperator_info_delete'),
  asynclize(cooperator.remove)
);
router.post('/searchRelation', asynclize(cooperator.searchRelation));
router.post(
  '/addRelation',
  authWithButton('cooperator_info_add_relation'),
  asynclize(cooperator.addRelation)
);
router.post('/addRelation', asynclize(cooperator.searchRelation));
router.post('/searchAddedRelation', asynclize(cooperator.searchAddedRelation));
router.post(
  '/supplyInfo',
  authWithButton('cooperator_info_supply_info'),
  asynclize(cooperator.supplyInfo)
);
router.post(
  '/accountInfo',
  authWithMenuAndSubmenu(
    '_submenu',
    'cooperator_account_info',
    '您没有调用开户信息页面接口的权限'
  ),
  asynclize(cooperator.accountInfo)
);

module.exports = router;
