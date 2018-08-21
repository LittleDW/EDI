/**
 * @author robin
 * @file enterpriseCredit
 * @date 2018-04-13 17:08
 */
const router = require("express").Router();

const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");

const { asynclize, upload } = require("../util");
const { enterpriseCredit } = require("../controllers");

router.post('/search',  asynclize(enterpriseCredit.search));
router.post('/detail',  asynclize(enterpriseCredit.detail));
router.post('/creditDetail',  asynclize(enterpriseCredit.creditDetail));
router.post('/match',  upload.any(), checkFileUpload, authWithButton('corp_auth_create'), asynclize(enterpriseCredit.match));
router.post('/create', authWithButton('corp_auth_create'), asynclize(enterpriseCredit.create));
router.post('/matchSupplement', upload.any(), checkFileUpload, authWithButton('corp_auth_supplement'), asynclize(enterpriseCredit.matchSupplement));
router.post('/supplement', authWithButton('corp_auth_supplement'), asynclize(enterpriseCredit.supplement));
router.post('/authResultMatch',  upload.any(), checkFileUpload, authWithButton('corp_auth_auth_result_upload'), asynclize(enterpriseCredit.authResultMatch));
router.post('/authResultCreate', authWithButton('corp_auth_auth_result_upload'), asynclize(enterpriseCredit.authResultCreate));
router.get('/export', authWithButtonForGet('corp_auth_export'), asynclize(enterpriseCredit.exportCtrl, true));
router.post('/corpAuthVoucher', authWithButton('corp_auth_voucher'), asynclize(enterpriseCredit.voucher));
router.post('/filterCorpAuthVoucher', authWithButton('orders_voucher_download'), asynclize(enterpriseCredit.filterCorpAuthVoucher));

module.exports = router;
