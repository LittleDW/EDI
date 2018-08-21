/*
 * @Author Osborn
 * @File menu.js
 * @Created Date 2018-04-18 15-50
 * @Last Modified: 2018-04-18 15-50
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { authWithButton, authWithButtonForGet } = require('../middlewares');

const { asynclize, upload } = require('../util');
const { menu } = require('../controllers');

router.post('/search', asynclize(menu.search));
router.post('/detail', asynclize(menu.detail));
router.post('/create', authWithButton('menu_management_create'), asynclize(menu.create));
router.post('/update', authWithButton('menu_management_update'), asynclize(menu.update));
router.post('/delete', authWithButton('menu_management_delete'), asynclize(menu.remove));
router.post('/up', authWithButton('menu_management_up'), asynclize(menu.up));
router.post('/down', authWithButton('menu_management_down'), asynclize(menu.down));
module.exports = router;
