/**
 * @Author zhangjunjie
 * @Date 2018/4/17 11:20
 * @Description: 供需计划接口 fundSupply router
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { fundSupply } = require('../controllers');

router.post('/weekly', asynclize(fundSupply.weekly));
router.post('/daily', asynclize(fundSupply.daily));
router.post('/require', asynclize(fundSupply.requirePlan));
router.post('/collect', asynclize(fundSupply.collectPlan));

module.exports = router;
