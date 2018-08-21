var {getConnectionQ, getWriteConnectionQ, writeOperLog,writeOperTableLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  configure = require('../../config/configure.json')[process.env.NODE_ENV],
  {logger, promisify, co, Router, uuidv4, userDiffer,fs, path, spawning, getMySQLFieldValue, removefileIfExist, operLogDictionaryGenerator} = require("../util"),
  router = Router();

/**
 * 作者：石奇峰
 * 模块：兑付单列表
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("repayment")){
    res.json({success:false, message:"您没有调用兑付单列表页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {fundOrgCode, assetOrderNo, repaymentDateStart, repaymentDateEnd, repaymentStatus, pageIndex, assetOrgCode} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = {...getMySQLFieldValue({
        fundOrgCode,
        assetOrderNo,
        assetOrgCode,
        repaymentDateStart,
        repaymentDateEnd,
        repaymentStatus,
        pageIndex: myPageIndex
      }),[userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.repaymentCount, params),
      Query.call(connection, sqls.repayment, params)
    ]
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }
    res.json({success: true, rows, total: countRows[0].total})
    return rows
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});
router.get('/export', (req, res, next) => {
  if (!req.session.profile) {
    return res.status(404).send('无权下载')
  }
  if(!req.session._button.includes("repayment_export")){
    return res.status(403).send("您无权做导出操作，请联系管理员");
  }
  let connection, writeConnection, outputFile = path.resolve(`${__dirname}/../../temp/${uuidv4()}`),
    xslx = path.resolve(`${__dirname}/../../temp/${uuidv4()}`);
  fs.closeSync(fs.openSync(outputFile, 'w'));
  co(function* () {
    [connection,writeConnection] = yield [getConnectionQ(req), getWriteConnectionQ(req)]
    let Query = promisify(connection.query, {multiArgs: true}), Download = promisify(res.download);
    let {fundOrgCode, assetOrgCode, repaymentDateStart, repaymentDateEnd, repaymentStatus} = req.query,
      params = {...getMySQLFieldValue({
        fundOrgCode,
        assetOrgCode,
        repaymentDateStart,
        repaymentDateEnd,
        repaymentStatus: repaymentStatus.split(",")
      }),[userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}, qList = [];
    let [countRows] = yield Query.call(connection, sqls.repaymentCount, params)
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }
    let {total} = countRows[0], pages = Math.ceil(total / configure.exportLimit)
    if (total > configure.exportMaxRows) {
      throw new Error(`导出量已超过上线 ${configure.exportMaxRows} 条`)
    }
    for (var i = 0; i < pages; i++) {
      qList.push(spawning(path.resolve(`${__dirname}/../spawn/repaymentAssist.js`), req.session.profile.user_type, (req.session.profile.user_type == 2) ? req.session.profile.org_code : fundOrgCode, (req.session.profile.user_type == 1) ? req.session.profile.org_code : assetOrgCode, repaymentDateStart, repaymentDateEnd, repaymentStatus, configure.exportLimit * i, configure.exportLimit, outputFile))
    }
    yield qList
    yield spawning(path.resolve(`${__dirname}/../spawn/json2xslx.js`), outputFile, xslx)
    yield Download.call(res, xslx, 'repayment.xlsx')
    return {params, total: countRows[0].total}
  }).catch(function (err) {
    if (res.headersSent) {
      logger.error(err)
    } else {
      res.status(404).send(err && err.message || err || "发生错误");
    }
  }).then((result)=>{
    if(!result){return}
    let {params, total} = result
    return co(function*() {
      let from_table = 't_repayment',
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id,
        action_type = '导出';
      let oper_log = `动作：导出兑付单 ${total}条, 导出参数 ${JSON.stringify(params)}`
      return yield writeOperTableLog(writeConnection, {from_table, from_org_code, create_user_id, create_sub_user_id, oper_log, action_type})
    }).catch((err) => {logger.error(err)})
  }).then(() => {
    connection && connection.release();
    removefileIfExist(outputFile)
    removefileIfExist(xslx)
  });
})

router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("repayment_asset_confirm") && !req.session._button.includes("repayment_asset_commence") && !req.session._button.includes("repayment_fund_confirm")){
    next();
    return
  }
  let connection, params = {...getMySQLFieldValue(req.body),[userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}
  co(function* () {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    let old_value = ''
    try {
      yield  Transaction.call(connection)
      let [countRows] = yield Query.call(connection, sqls.repaymentQuery, params)
      if (!countRows || !countRows[0]) {
        throw new Error("查无此字段")
      }
      old_value = countRows[0].repayment_status
      let [results] = yield Query.call(connection, sqls.repaymentUpdate, params)
      if (results.affectedRows < 1) {
        throw new Error("查无此字段，更新失败")
      }
      yield Commit.call(connection)
      if (results.changedRows < 1) {
        throw new Error("无需更新的字段")
      }
      let [rows] = yield Query.call(connection, sqls.repaymentQuery, params)
      if (!rows || !rows[0]) {
        throw new Error("已更新但查无记录")
      }
      res.json({success: true, data: rows[0]})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function* () {
      params = operLogDictionaryGenerator('t_repayment', ['repayment_status'], params);
      const transformedOldValue = operLogDictionaryGenerator('t_repayment', ['repayment_status'], {repayment_status: old_value});
      let from_table = 't_repayment',
        from_table_key = `${params.asset_org_code},${params.fund_org_code}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id,
        oper_log = `动作：修改兑付单 修改内容：状态由 ${transformedOldValue} 变成 ${params.repayment_status} `
      yield writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
      return connection
    }).catch((err) => {
      logger.info(err)
      return connection
    })
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "更新失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

module.exports = router
