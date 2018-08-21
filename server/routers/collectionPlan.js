var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue,moment} = require("../util"),
  router = Router();

/**
 * 作者：张俊杰
 * 模块：每周募集计划
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("collection_plan")){
    res.json({success:false, message:"您没有调用每周募集计划页面接口的权限"})
    return
  }
  next();
})

router.post('/colWeekly/search', (req, res, next) => {
  let connection
  co(function*() {
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
      fund_org_code: req.session.profile.org_code
    }
    let readOnly = Number(tarWeek.year) < Number(curWeek.year) || (Number(tarWeek.year) === Number(curWeek.year) && Number(tarWeek.week) < Number(curWeek.week))

    let [colData] = yield Query.call(connection, sqls.colGetData, param)
    let [colDeadlineData] = yield Query.call(connection, sqls.colDeadlineGetData, param)

    res.json({
      success: true,
      readOnly,
      data: colData,
      deadlineData: colDeadlineData,
    })
    return colData
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
})
router.post('/colWeekly/update', (req, res, next) => {
  if(!req.session._button.includes("collection_plan_submit")){
    next();
    return
  }
  let connection, {startDate, endDate, fund_org_code, data, deadlineData} = req.body
  let params = {start_date: startDate, end_date: endDate, fund_org_code}
  try {
    if (!startDate || !endDate || moment(startDate).day() !== 1 || moment(endDate).day() !== 0 || moment(startDate).diff(moment(), 'hours') <= 0) {
      throw new Error('请选择合法的周进行设置')
    } else if(moment(startDate).diff(moment(), 'hours') < 55) {
      throw new Error('周五17:00之后不可更改下周计划')
    }
  } catch (error){
    res.json({
      success: false,
      message: error.message || "请选择合法的周进行设置"
    });
    return error
  }
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit).bind(connection),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {
        multiArgs: true
      });
    try {
      yield Query.call(connection, sqls.colDeleteData, params)
      let insertQ = []
      for (let item of data) {
        insertQ.push(Query.call(connection, sqls.colInsertData, item))
      }
      let [...insertResult] = yield insertQ
      yield Query.call(connection, sqls.colDeadlineDeleteData, params)
      let insertDeadlineQ = []
      for (let item of deadlineData) {
        insertDeadlineQ.push(Query.call(connection, sqls.colDeadlineInsertData, item))
      }
      yield insertDeadlineQ
      yield Commit()
      res.json({
        success: true
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
  }).then(()=>{
    connection && connection.release();
  });
})
router.post('/colHisWeekly/search', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    })
    let {fund_org_code, year, week, pageIndex} = req.body
    let myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 70 * (pageIndex - 1)
    let end_date = `${year}${week}`
    let param = getMySQLFieldValue({
      fund_org_code,
      end_date,
      pageIndex: myPageIndex
    })
    let [[[total]], [hisList]] = yield [Query.call(connection, sqls.colHisCount, param), Query.call(connection, sqls.colHisList, param)]

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
  }).then(()=>{
    connection && connection.release();
  });
})

module.exports = router
