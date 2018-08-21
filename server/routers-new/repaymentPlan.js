/**
 * @Author zhangjunjie
 * @Date 2018/4/13 15:47
 * @Description: 还款计划表 repaymentPlan Router
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { repaymentPlan } = require('../controllers');

router.post('/search', asynclize(repaymentPlan.search));

module.exports = router;
