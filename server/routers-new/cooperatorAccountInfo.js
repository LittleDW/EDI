/*
 * @Author Osborn
 * @File cooperatorAccountInfo
 * @Date 2018-04-17 10-49
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { cooperatorAccountInfo } = require('../controllers');

router.post('/accountInfo', asynclize(cooperatorAccountInfo.accountInfo));

module.exports = router;
