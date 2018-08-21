/*
 * @Author zhangjunjie
 * @File afterRepaymentStatistics.js
 * @Created Date 2018-05-17 14-42
 * @Last Modified: 2018-05-17 15-07
 * @Modified By: zhangjunjie
 */

const router = require("express").Router();

const { asynclize } = require("../util");
const { afterRepaymentStatistics } = require("../controllers");

router.post("/search", asynclize(afterRepaymentStatistics.search));
module.exports = router;
