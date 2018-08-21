/*
 * @Author Osborn
 * @File userAttributeMangement.js
 * @Created Date 2018-05-08 14-38
 * @Last Modified: 2018-05-08 14-38
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { userAttributeManagement } = require('../controllers');

router.post('/search', asynclize(userAttributeManagement.search));

module.exports = router;
