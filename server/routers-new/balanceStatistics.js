/**
 * @Author zhangjunjie
 * @Date 29/03/2018 15:13
 * @Description: 余额统计表接口 /balanceStatistics
 */

const router = require('express').Router();

const { asynclize } = require('../util');
const { balanceStatistics } = require('../controllers');

router.post('/search', asynclize(balanceStatistics.search));
router.post('/searchTab4', asynclize(balanceStatistics.searchTab4));

module.exports = router;
