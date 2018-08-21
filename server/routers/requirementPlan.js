var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue, moment} = require("../util"), router = Router();

/**
 * 作者：张俊杰
 * 模块：每周需求计划
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("requirement_plan")){
    res.json({success:false, message:"您没有调用每周需求计划页面接口的权限"})
    return
  }
  next();
})

router.post('/reqWeekly/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    })

    let [[curWeek]] = yield Query.call(connection, sqls.getNextWeek)
    let tarWeek = {
      week: req.body.week,
      year: req.body.year
    }

    let param = {
      week: tarWeek.week,
      year: tarWeek.year,
      asset_org_code: req.session.profile.org_code
    }
    let readOnly = Number(tarWeek.year) < Number(curWeek.year) || (Number(tarWeek.year) === Number(curWeek.year) && Number(tarWeek.week) < Number(curWeek.week))
    let [reqData] = yield Query.call(connection, sqls.reqGetData, param)
    let [reqDeadlineData] = yield Query.call(connection, sqls.reqDeadlineData, param)

    res.json({
      success: true,
      readOnly,
      data: reqData,
      deadlineData: reqDeadlineData
    })
    return reqDeadlineData
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
})
router.post('/reqHisWeekly/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    })
    let {asset_org_code, year, week, pageIndex} = req.body
    let myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 70 * (pageIndex - 1)
    let end_date = `${year}${week}`
    let param = getMySQLFieldValue({
      asset_org_code,
      end_date,
      pageIndex: myPageIndex
    })
    let [[[total]], [hisList]] = yield [Query.call(connection, sqls.reqHisCount, param), Query.call(connection, sqls.reqHisList, param)]

    res.json({
      success: true,
      total: total.count,
      hisList: hisList
    })
    return hisList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
})
router.post('/reqWeekly/update', (req, res, next) => {
  if(!req.session._button.includes("requirement_plan_submit")){
    next();
    return
  }
  let connection, {startDate, endDate, asset_org_code, data, deadlineData} = req.body
  let params = {start_date: startDate, end_date: endDate, asset_org_code}

  try {
    if (!startDate || !endDate || moment(startDate).day() !== 1 || moment(endDate).day() !== 0 || moment(startDate).diff(moment(), 'hours') <= 0) {
      throw new Error('请选择合法的周进行设置')
    } else if (moment(startDate).diff(moment(), 'hours') < 55) {
      throw new Error('周五17:00之后不可更改下周计划')
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message || "请选择合法的周进行设置"
    });
    return error
  }
  co(function* () {
    connection = yield getWriteConnectionQ(req)
    let Commit = promisify(connection.commit).bind(connection),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {
        multiArgs: true
      });
    try {
      // 每周需求计划
      yield Query.call(connection, sqls.reqDeleteData, params)
      let insertQ = []
      for (let item of data) {
        insertQ.push(Query.call(connection, sqls.reqInsertData, item))
      }
      let [...insertResult] = yield insertQ
      yield Query.call(connection, sqls.reqDeadlineDeleteData, params)
      // 产品期限
      let insertDeadlineQ = []
      for (let item of deadlineData) {
        insertDeadlineQ.push(Query.call(connection, sqls.reqDeadlineInsertData, item))
      }
      let [...insertDeadlineResult] = yield insertDeadlineQ
      yield Commit()
      res.json({
        success: true,
        insertResult,
        insertDeadlineResult
      })
      return insertResult
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "保存失败")
    }
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "保存失败"
    });
  }).then(() => {
    connection && connection.release();
  });
})

module.exports = router
