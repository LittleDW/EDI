/*
 * @Author Osborn
 * @File personalCertificate.js
 * @Created Date 2018-05-03 15-59
 * @Last Modified: 2018-05-03 15-59
 * @Modified By: Osborn
 */

const router = require('express').Router();

const { authWithMenuAndSubmenu: auth } = require('../middlewares');
const { personalCertificate } = require('../controllers');
const { asynclize } = require('../util');

router.post('/get', asynclize(personalCertificate.get));
module.exports = router;
