var {getConnectionQ,getWriteConnectionQ} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router} = require("../util"),
  router = Router();

/**
 * 作者：张俊杰
 * 模块：多页面共通
 * */


// TODO 该路由可能已废弃
router.post('/weekAndDateThisOrNext', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    const {year, week} = req.body
    let param = {}
    if (!year || !week) {
      let day = new Date().getDay()
      let [[_week]] = yield Query.call(connection, day < 5 && day > 0 ? sqls.getThisWeek : sqls.getNextWeek)
      param = {
        week: _week.week,
        year: _week.year
      }
    } else {
      param = { week, year }
    }
    let [[dateRange]] = yield Query.call(connection, sqls.getDateRange, param)

    if (!dateRange) {
      throw new Error("无记录")
    }
    const info = {
      week: param.week,
      year: param.year,
      startDate: dateRange.start_date,
      endDate: dateRange.end_date,
    }
    res.json({
      success: true,
      info
    })
    return info
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  })
})

router.post('/weekly', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let param = {}
    if (req.body.week && req.body.year) {
      param = {
        week: req.body.week,
        year: req.body.year
      }
    } else {
      throw new Error("传入的年份或者月份有误")
    }
    let [[dateRange]] = yield Query.call(connection, sqls.getDateRange, param)
    let [weekList] = yield Query.call(connection, sqls.fundSupplyWeekly, dateRange)

    if (!weekList) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      weekList
    })
    return weekList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
    return {}
  }).then(()=>{
    connection && connection.release();
  })
})
router.post('/daily', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let param = {}
    if (req.body.week && req.body.year) {
      param = {
        week: req.body.week,
        year: req.body.year
      }
    } else {
      let [[week]] = yield Query.call(connection, sqls.reqGetWeek)
      param = {
        week: week.week,
        year: week.year
      }
    }
    param['week_name'] = req.body.week_name
    let [dailyList] = yield Query.call(connection, sqls.fundSupplyDaily, param)

    if (!dailyList) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      dailyList
    })
    return dailyList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  })
})

router.post('/require', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    })
    let param = {}
    if (req.body.week && req.body.year) {
      param = {
        week: req.body.week,
        year: req.body.year,
        asset_org_code: req.body.asset_org_code
      }
    } else {
      let [[week]] = yield Query.call(connection, sqls.getNextWeek)
      param = {
        week: week.week,
        year: week.year,
        asset_org_code: req.body.asset_org_code
      }
    }
    let [[dateRange]] = yield Query.call(connection, sqls.getDateRange, param)
    let [reqDeadlineData] = yield Query.call(connection, sqls.fundSupplyAsset, param)

    res.json({
      success: true,
      deadlineData: reqDeadlineData
    })
    return reqDeadlineData
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
})

router.post('/collect', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    })
    let param = {}
    if (req.body.week && req.body.year) {
      param = {
        week: req.body.week,
        year: req.body.year,
        fund_org_code: req.body.fund_org_code
      }
    } else {
      let [[week]] = yield Query.call(connection, sqls.reqGetWeek)
      param = {
        week: week.week,
        year: week.year,
        fund_org_code: req.body.fund_org_code
      }
    }
    let [[dateRange]] = yield Query.call(connection, sqls.getDateRange, param)
    let [deadlineData] = yield Query.call(connection, sqls.fundSupplyFund, param)

    res.json({
      success: true,
      deadlineData: deadlineData,
    })
    return deadlineData
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
})

module.exports = router
