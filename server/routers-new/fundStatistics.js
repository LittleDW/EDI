/**
 * @Author zhangjunjie
 * @Date 2018/4/12 15:05
 * @Description: 业务报表 fundStatistics
 */

const router = require("express").Router();

const { asynclize } = require("../util");
const { fundStatistics } = require("../controllers");

router.post("/total", asynclize(fundStatistics.total));
router.post("/fundOrAsset", asynclize(fundStatistics.fundOrAsset));
router.post("/deadline", asynclize(fundStatistics.deadline));

module.exports = router;
