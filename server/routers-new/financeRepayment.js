/**
 * @author robin
 * @file financeRepayment
 * @date 2018-04-25 13:35
 */

const router = require("express").Router();

const { asynclize, upload } = require("../util");
const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");
const { financeRepayment } = require("../controllers");

router.post("/search", asynclize(financeRepayment.search));
router.post("/matchDetail", upload.any(), checkFileUpload, authWithButton('create_finance_repayment'), asynclize(financeRepayment.matchDetail));
router.post("/createNewDetail", authWithButton('create_finance_repayment'), asynclize(financeRepayment.createNewDetail));
router.post("/changeStatus", authWithButton('finance_repayment_oper'), asynclize(financeRepayment.changeStatus));

module.exports = router;
