/**
 * @author robin
 * @file personalPublicity
 * @date 2018-04-26 16:26
 */
const router = require("express").Router();

const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");

const { asynclize, upload } = require("../util");
const { personalPublicity} = require("../controllers");

router.post('/search',  asynclize(personalPublicity.search));
router.post('/match', upload.any(), checkFileUpload, authWithButton('personal_publicity_create'), asynclize(personalPublicity.match));
router.post('/create', authWithButton('personal_publicity_create'), asynclize(personalPublicity.create));
router.post('/searchExport', authWithButtonForGet('personal_publicity_search'), asynclize(personalPublicity.exportCtrl));

module.exports = router;
