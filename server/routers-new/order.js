/**
 * @author robin
 * @file order
 * @date 2018-04-02 13:32
 */
const router = require("express").Router();

const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");

const { asynclize, upload } = require("../util");
const { order } = require("../controllers");

router.post('/search',  asynclize(order.search));
router.post('/filterOrderVoucher',  authWithButton('orders_voucher_download'), asynclize(order.filterOrderVoucher));
router.post('/orderRepayment',  asynclize(order.orderRepayment));
router.post('/orderVoucher',  asynclize(order.orderVoucher));
router.post('/orderContract',  asynclize(order.orderContract));
router.post('/orderPayment',  asynclize(order.orderPayment));
router.post('/orderAdvance',  asynclize(order.orderAdvance));
router.post('/orderAccount',  asynclize(order.orderAccount));
router.post('/orderCredit',  asynclize(order.orderCredit));
router.post('/orderService',  asynclize(order.orderService));
router.post('/match',  upload.any(), checkFileUpload, authWithButton('orders_create'), asynclize(order.match));
router.post('/create', authWithButton('orders_create'), asynclize(order.create));
router.post('/matchSupplement', upload.any(), checkFileUpload, authWithButton('orders_voucher_supplement'), asynclize(order.matchSupplement));
router.post('/matchSupplementFundContract', upload.any(), checkFileUpload, authWithButton('orders_contract_supplement'), asynclize(order.matchSupplementFundContract));
router.post('/contractSupplymentMatch', upload.any(), checkFileUpload, authWithButton('orders_contract_supplement'), asynclize(order.contractSupplymentMatch));
router.post('/supplement', authWithButton('orders_voucher_supplement'), asynclize(order.supplement));
router.get('/export', authWithButtonForGet('orders_export'), asynclize(order.exportCtrl, true));
router.post('/checkResultMatch',  upload.any(), checkFileUpload, authWithButtonForGet('orders_check_result_upload'), asynclize(order.checkResultMatch));
router.post('/checkResultCreate',  authWithButtonForGet('orders_check_result_upload'), asynclize(order.checkResultCreate));
router.post('/accountDetailMatch',  upload.any(), checkFileUpload,  authWithButtonForGet('orders_account_detail_upload'),asynclize(order.accountDetailMatch));
router.post('/accountDetailCreate',  authWithButtonForGet('orders_account_detail_upload'),asynclize(order.accountDetailCreate));
router.post('/contractSupplymentCreate',  authWithButtonForGet('orders_contract_supplement'),asynclize(order.contractSupplymentCreate));

module.exports = router;
