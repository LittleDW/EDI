/*
 * @Author Osborn
 * @File withdraw.js
 * @Created Date 2018-05-29 11-05
 * @Last Modified: 2018-05-29 11-05
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { authWithMenuAndSubmenu: auth } = require('../middlewares');
const { withdraw } = require('../controllers');
const { asynclize } = require('../util');

router.post('/search', asynclize(withdraw.search));
router.get('/export', asynclize(withdraw.exportCtrl));
// router.post('/changePassword', asynclize(profile.changePassword));
module.exports = router;
