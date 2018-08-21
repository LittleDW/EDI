/**
 * @author robin
 * @file financeLoan
 * @date 2018-04-24 11:46
 */

const router = require("express").Router();

const { asynclize, upload } = require("../util");
const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");
const { financeLoan } = require("../controllers");

router.post("/search", asynclize(financeLoan.search));
router.post("/matchDetail", upload.any(), checkFileUpload, authWithButton(['create_finance_loan','append_finance_loan']), asynclize(financeLoan.matchDetail));
router.post("/createHistoricalDetail", authWithButton('append_finance_loan'), asynclize(financeLoan.createHistoricalDetail));
router.post("/createNewDetail", authWithButton('create_finance_loan'), asynclize(financeLoan.createNewDetail));
router.post("/changeStatus", authWithButton('finance_loan_oper'), asynclize(financeLoan.changeStatus));

module.exports = router;
