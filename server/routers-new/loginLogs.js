/*
 * @Author Osborn
 * @File loginLogs.js
 * @Created Date 2018-05-21 15-10
 * @Last Modified: 2018-05-21 15-10
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { loginLogs } = require('../controllers');
const { asynclize } = require('../util');

router.post('/search', asynclize(loginLogs.search));
module.exports = router;
