/**
 * @author robin
 * @file enterprisePublicity
 * @date 2018-04-18 09:40
 */
const router = require("express").Router();

const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");

const { asynclize, upload } = require("../util");
const { enterprisePublicity} = require("../controllers");

router.post('/search',  asynclize(enterprisePublicity.search));
router.post('/match', upload.any(), checkFileUpload, authWithButton('enterprise_publicity_create'), asynclize(enterprisePublicity.match));
router.post('/create', authWithButton('enterprise_publicity_create'), asynclize(enterprisePublicity.create));
router.post('/searchExport', authWithButtonForGet('enterprise_publicity_search'), asynclize(enterprisePublicity.exportCtrl));

module.exports = router;
