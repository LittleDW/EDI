/*
 * File: profile.js
 * File Created: Friday, 23rd March 2018 4:16:05 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Wed Mar 28 2018
 * Modified By: Osborn
 */

const router = require('express').Router();

const { authWithMenuAndSubmenu: auth } = require('../middlewares');
const { profile } = require('../controllers');
const { asynclize } = require('../util');

router.post('/update', asynclize(profile.update));
router.post('/changePassword', asynclize(profile.changePassword));
module.exports = router;
