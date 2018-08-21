/*
 * @Author Osborn
 * @File userAttribute.js
 * @Created Date 2018-05-03 16-39
 * @Last Modified: 2018-05-03 16-39
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { userAttribute } = require('../controllers');

router.post('/search', asynclize(userAttribute.search));
router.post('/save', asynclize(userAttribute.save));

module.exports = router;
