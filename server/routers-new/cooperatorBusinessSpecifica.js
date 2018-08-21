/*
 * @Author Osborn
 * @File cooperatorBusinessSpecifica.js
 * @Created Date 2018-04-18 15-04
 * @Last Modified: 2018-04-18 15-04
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { cooperatorBusinessSpecifica } = require('../controllers');

router.post('/search', asynclize(cooperatorBusinessSpecifica.search));

module.exports = router;
