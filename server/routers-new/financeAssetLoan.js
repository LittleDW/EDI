/**
 * @author robin
 * @file financeAssetLoan
 * @date 2018-06-30 11:46
 */

const router = require("express").Router();

const { asynclize, upload } = require("../util");
const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");
const { assetRepaymentLoan: financeAssetLoan } = require("../controllers");

router.post("/search", asynclize(financeAssetLoan.search));
router.post("/matchDetail", upload.any(), checkFileUpload, authWithButton(['create_finance_asset_loan']), asynclize(financeAssetLoan.matchDetail));
router.post("/createNewDetail", authWithButton('create_finance_asset_loan'), asynclize(financeAssetLoan.createNewDetail));
router.post("/changeStatus", authWithButton('finance_asset_loan_oper'), asynclize(financeAssetLoan.changeStatus));

module.exports = router;
