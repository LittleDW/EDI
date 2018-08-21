/**
 * @author robin
 * @file enterpriseOrder
 * @date 2018-04-12 11:14
 */
const router = require("express").Router();

const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");

const { asynclize, upload } = require("../util");
const { enterpriseOrder} = require("../controllers");

router.post('/search',  asynclize(enterpriseOrder.search));
router.post('/filterOrderVoucher',  authWithButton('corp_orders_voucher_download'), asynclize(enterpriseOrder.filterOrderVoucher));
router.post('/repayment',  asynclize(enterpriseOrder.orderRepayment));
router.post('/voucher',  asynclize(enterpriseOrder.orderVoucher));
router.post('/contract',  asynclize(enterpriseOrder.orderContract));
router.post('/payment',  asynclize(enterpriseOrder.orderPayment));
router.post('/advance',  asynclize(enterpriseOrder.orderAdvance));
router.post('/account',  asynclize(enterpriseOrder.orderAccount));
router.post('/credit',  asynclize(enterpriseOrder.orderCredit));
router.post('/service',  asynclize(enterpriseOrder.orderService));
router.post('/match',  upload.any(), checkFileUpload, authWithButton('corp_orders_create'), asynclize(enterpriseOrder.match));
router.post('/create', authWithButton('corp_orders_create'), asynclize(enterpriseOrder.create));
router.post('/matchSupplement', upload.any(), checkFileUpload, authWithButton('corp_orders_voucher_supplement'), asynclize(enterpriseOrder.matchSupplement));
router.post('/contractSupplymentMatch', upload.any(), checkFileUpload, authWithButton('corp_orders_contract_supplement'), asynclize(enterpriseOrder.contractSupplymentMatch));
router.post('/supplement', authWithButton('corp_orders_voucher_supplement'), asynclize(enterpriseOrder.supplement));
router.get('/export', authWithButtonForGet('corp_orders_export'), asynclize(enterpriseOrder.exportCtrl, true));
router.post('/checkResultMatch',  upload.any(), checkFileUpload, authWithButtonForGet('corp_orders_check_result_upload'), asynclize(enterpriseOrder.checkResultMatch));
router.post('/checkResultCreate',  authWithButtonForGet('corp_orders_check_result_upload'), asynclize(enterpriseOrder.checkResultCreate));
router.post('/accountDetailMatch',  upload.any(), checkFileUpload,  authWithButtonForGet('corp_orders_account_detail_upload'),asynclize(enterpriseOrder.accountDetailMatch));
router.post('/accountDetailCreate',  authWithButtonForGet('corp_orders_account_detail_upload'),asynclize(enterpriseOrder.accountDetailCreate));
router.post('/contractSupplymentCreate',  authWithButtonForGet('corp_orders_contract_supplement'),asynclize(enterpriseOrder.contractSupplymentCreate));

module.exports = router;
