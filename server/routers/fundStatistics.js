/**
 * 作者：张俊杰
 * 模块：业务报表页面，平台规模统计页面
 * */

const {getConnectionQ} = require('../pool'), sqls = require("../../config/sqls.json"),
  {promisify, co, Router, getMySQLFieldValue} = require("../util"),
  router = Router();

router.post('/total', (req, res) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let {
      assetOrgCode,
      fundOrgCode,
      startDate,
      endDate,
      role
    } = req.body
    let params = getMySQLFieldValue({
      assetOrgCode,
      startDate,
      fundOrgCode,
      endDate
    })
    let [[totalList]] = yield [Query.call(connection, role === '1' ? sqls.fundStatisticsAssetTotal : sqls.fundStatisticsFundTotal, params)]
    if (!totalList || !totalList[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      totalList
    })
    return totalList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/fundOrAsset', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let {
      assetOrgCode,
      fundOrgCode,
      startDate,
      endDate,
      deadline_id,
      role
    } = req.body
    let params = getMySQLFieldValue({
      assetOrgCode,
      fundOrgCode,
      startDate,
      endDate,
      deadline_id
    })
    let [[orgDataList]] = yield [Query.call(connection, role === '1' ? sqls.fundStatisticsAsset : sqls.fundStatisticsFund, params)]
    if (!orgDataList || !orgDataList[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      orgDataList
    })
    return orgDataList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/deadline', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let {
      assetOrgCode,
      fundOrgCode,
      startDate,
      endDate,
      deadline_id,
      role
    } = req.body
    let params = getMySQLFieldValue({
      assetOrgCode,
      fundOrgCode,
      startDate,
      endDate,
      deadline_id
    })
    let [[deadlineDataList]] = yield [Query.call(connection, role === '2' ? sqls.fundStatisticsAssetDeadline : sqls.fundStatisticsFundDeadline, params)]
    if (!deadlineDataList || !deadlineDataList[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      deadlineDataList
    })
    return deadlineDataList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/platform', (req, res) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let {
      startDate,
      endDate
    } = req.body
    let params = getMySQLFieldValue({
      startDate,
      endDate
    })
    let [[scaleList]] = yield [Query.call(connection, sqls.adminStatisticsPlatformScale, params)]
    let [[collectList]] = yield [Query.call(connection, sqls.adminStatisticsPlatformCollect, params)]
    if (!scaleList || !scaleList[0] || !collectList || !collectList[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      platformList: {
        scaleList,
        collectList
      }
    })
    return {
      scaleList,
      collectList
    }
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});


module.exports = router
