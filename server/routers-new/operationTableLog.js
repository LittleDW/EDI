/*
 * File: profile.js
 * File Created: Friday, 23rd March 2018 4:16:05 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Thu May 03 2018
 * Modified By: Osborn
 */

const router = require('express').Router();

const { authWithMenuAndSubmenu: auth } = require('../middlewares');
const { operationTableLog } = require('../controllers');
const { asynclize } = require('../util');

router.post('/search', asynclize(operationTableLog.search));
module.exports = router;
