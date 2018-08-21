var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue, moment} = require("../util"), router = Router();

/**
 * 作者：张俊杰
 * 模块：每周需求计划
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("requirement_plan_new") && !req.session._submenu.includes("collection_plan_new")){
    res.json({success:false, message:"您没有调用每周需求计划页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res) => {
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
    const {hasFavor} = req.body

    const {user_type} = req.session.profile
    let param = {
      week: tarWeek.week,
      year: tarWeek.year,
      asset_org_code: user_type === 1 ? req.session.profile.org_code : '',
      fund_org_code: user_type === 2 ? req.session.profile.org_code : '',
      ...req.session.subUserDataRestriction,
    }
    const sqlGetData = user_type === 1 ? sqls.reqGetData : sqls.colGetData
    const sqlGetDeadlineData = user_type === 1 ? sqls.reqDeadlineData : sqls.colDeadlineGetData
    const sqlGetDeadlineFavor = user_type === 1 ? sqls.distriPlanAssetDeadlineDataHasFavor : sqls.distriPlanFundDeadlineDataHasFavor
    let readOnly = Number(tarWeek.year) < Number(curWeek.year) || (Number(tarWeek.year) === Number(curWeek.year) && Number(tarWeek.week) < Number(curWeek.week))
    let [data] = yield Query.call(connection, sqlGetData, param)
    let [deadlineData] = yield Query.call(connection, sqlGetDeadlineData, param)
    let [deadlineDataFavor] = yield Query.call(connection, sqlGetDeadlineFavor, param)
    deadlineData = [...deadlineData, ...deadlineDataFavor]
    if (!deadlineData || deadlineData.some(item => !item.deadline_id)) {
      deadlineData = []
    }

    res.json({
      success: true,
      readOnly,
      data: data,
      deadlineData: deadlineData
    })
    return deadlineData
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
})
router.post('/searchHistory', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    })
    let {year, week, pageIndex} = req.body
    const {org_code, user_type} = req.session.profile
    let myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 70 * (pageIndex - 1)
    let end_date = `${year}${week}`
    let param = getMySQLFieldValue({
      fund_org_code: user_type === 2 ? org_code : '',
      asset_org_code: user_type === 1 ? org_code : '',
      end_date,
      pageIndex: myPageIndex
    })
    const sqlHisCount = user_type === 1 ? sqls.reqHisCount : sqls.colHisCount
    const sqlHisList = user_type === 1 ? sqls.reqHisList : sqls.colHisList
    let [[[total]], [hisList]] = yield [Query.call(connection, sqlHisCount, param), Query.call(connection, sqlHisList, param)]

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
router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("submit_plan")){
    next();
    return
  }
  let connection, {startDate, endDate, data, deadlineData, hasFavor, preferedDeadline} = req.body
  const {org_code, user_type} = req.session.profile
  let params = {
    fund_org_code: user_type === 2 ? org_code : '',
    asset_org_code: user_type === 1 ? org_code : '',
    start_date: startDate,
    end_date: endDate
  }

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
      const sqlDeleteData = user_type === 1 ? sqls.reqDeleteDataNew : sqls.colDeleteDataNew
      yield Query.call(connection, sqlDeleteData, params)
      let insertQ = []
      const sqlInsertData = user_type === 1 ? sqls.reqInsertDataNew : sqls.colInsertDataNew
      for (let item of data) {
        let {asset_org_code, fund_org_code, plan_date} = item
        if (!item.plan_fee) {
          item.plan_fee = 0
        }
        insertQ.push(Query.call(connection, sqlInsertData, item))
      }
      let [...insertResult] = yield insertQ
      const sqlDeadlineDeleteData = user_type === 1 ? sqls.reqDeadlineDeleteData : sqls.colDeadlineDeleteData
      yield Query.call(connection, sqlDeadlineDeleteData, params)
      // 产品期限
      let insertDeadlineQ = []
      const sqlDeadlineInsertData = user_type === 1 ? sqls.distriPlanAssetDeadlineInsertData : sqls.distriPlanFundDeadlineInsertData
      for (let item of deadlineData) {
        if (!hasFavor && item.deadline_id !== '100') {
          item.plan_fee = 0
        } else if (hasFavor && !preferedDeadline.includes(item.deadline_id)) {
          item.plan_fee = 0
        }
        if (!item.plan_fee) {
          item.plan_fee = 0
        }
        insertDeadlineQ.push(Query.call(connection, sqlDeadlineInsertData, item))
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
