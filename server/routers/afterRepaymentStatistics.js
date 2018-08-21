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

router.use((req, res, next) => {
  if (!req.session._submenu.includes("after-repayment-statistics")) {
    res.json({success: false, message: "您没有调用贷后统计报表页面接口的权限"})
    return
  }
  next();
})

router.post("/search", asynclize(afterRepaymentStatistics.search));
module.exports = router;
