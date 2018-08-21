/**
 * @author robin
 * @file afterRepayment
 * @date 2018-05-17 16:41
 */
const router = require("express").Router();

const { afterRepayment } = require("../controllers");
const { asynclize, upload } = require("../util");
const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");

router.post("/search", asynclize(afterRepayment.search));
router.post("/matchDetail", upload.any(), checkFileUpload, authWithButton('create_after_repayment_order'), asynclize(afterRepayment.matchDetail));
router.post("/createNewDetail", authWithButton('create_after_repayment_order'), asynclize(afterRepayment.createNewDetail));
router.post("/changeStatus", authWithButton('after_repayment_order_oper'), asynclize(afterRepayment.changeStatus));

module.exports = router;
