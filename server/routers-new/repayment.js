/**
 * @author robin
 * @file repayment
 * @date 2018-04-25 18:04
 */
const router = require("express").Router();

const { asynclize, upload } = require("../util");
const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");
const { repayment } = require("../controllers");

router.post("/search", asynclize(repayment.search));
router.get('/export', authWithButtonForGet('repayment_export'), asynclize(repayment.exportCtrl, true));
router.post("/update", authWithButton(['repayment_asset_confirm','repayment_asset_commence','repayment_fund_confirm',]), asynclize(repayment.update));

module.exports = router;
