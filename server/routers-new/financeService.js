/**
 * @author robin
 * @file financeService
 * @date 2018-04-25 15:03
 */
const router = require("express").Router();

const { asynclize, upload } = require("../util");
const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");
const { financeService } = require("../controllers");

router.post("/search", asynclize(financeService.search));
router.post("/matchDetail", upload.any(), checkFileUpload, authWithButton('create_finance_service_settlement'), asynclize(financeService.matchDetail));
router.post("/createNewDetail", authWithButton('create_finance_service_settlement'), asynclize(financeService.createNewDetail));
router.post("/changeStatus", authWithButton('finance_service_settlement_oper'), asynclize(financeService.changeStatus));

module.exports = router;
