var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, oss, upload, fs, path, userDiffer, appendUUID, spawning, BusBoy, getMySQLFieldValue, thunkifyEvent, promisifyPipingTempFile, promisifyTimeout} = require("../util"),
  router = Router(), ropAPI = require("../ropAPI"),configure = require('../../config/configure.json')[process.env.NODE_ENV];

/**
 * 作者：石奇峰
 * 模块：服务费结算单
 * */

router.use((req, res, next) => {
  if (!req.session._submenu.includes("finance_service_settlement")) {
    res.json({success: false, message: "您没有调用服务费结算单页面接口的权限"})
    return
  }
  next();
})

router.post('/changeStatus', (req, res, next) => {
  if (!req.session._button.includes("finance_service_settlement_oper")) {
    next();
    return
  }
  if (req.headers["content-type"] === 'application/json') {
    let connection, Query
    co(function* () {
      connection = yield getConnectionQ(req)
      Query = promisify(connection.query, {multiArgs: true})
      let {currentStatus, settlementCode, targetStatus, actionName} = req.body
      let params = {settlement_code: settlementCode, page_index: 0}
      let [rows] = yield Query.call(connection, sqls.financeService, params)
      if (!rows || rows.length === 0) {
        throw new Error('没查到要操作的订单记录')
      }
      let bill = rows[0]
      if (bill.settlement_status !== currentStatus) {
        throw new Error('该订单的状态已更新，请重试')
      }
      connection = yield getWriteConnectionQ(req)
      let Transaction = promisify(connection.beginTransaction),
        Commit = promisify(connection.commit),
        RollBack = promisify(connection.rollback);

      params = {
        settlement_code: settlementCode,
        settlement_status: targetStatus
      }

      try {
        yield  Transaction.call(connection)
        let [affectedRow] = yield Query.call(connection, sqls.financeServiceUpdate, params)

        if (!affectedRow && !affectedRow.length) {
          throw new Error('未成功更新该订单状态，请重试')
        }
        let logParam = {
          action_type: `${actionName}结算单`,
          from_table: 't_finance_service_settlement',
          from_table_key: settlementCode,
          from_org_code: req.session.profile.org_code,
          create_user_id: req.session.profile.user_id,
          sub_user_id: req.session.profile.sub_user_id,
          oper_log: `操作人：${req.session.profile.user_name}`
        }
        yield Commit.call(connection)
        res.json({
          success: true
        })
        return {
          params,
          logParam,
          targetStatus
        }
      } catch (e) {
        yield RollBack.call(connection)
        throw new Error(e.message || "更新失败")
      }
    }).then(data => {
      const {params, logParam, targetStatus} = data
      return co(function* () {
        if (targetStatus === '006') {
          Query.call(connection, sqls.financeServiceConfirmInvoke, params).catch(e=>logger.error(e))
        }
        yield writeOperLog(connection, logParam)
      })
    }).catch(function (err) {
      res.json({success: false, message: err.message || "查询失败"});
    }).then(() => {
      connection && connection.release();
    });
  } else {
    let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: 5242880}}), param = {},
      connection;
    let fieldThunk = thunkifyEvent({
      emitter: busboy,
      event: 'field',
      gen: function* (fieldname, val, fieldnameTruncated) {
        param[fieldname] = val
      }
    })
    let fileThunk = thunkifyEvent({
      emitter: busboy,
      event: 'file',
      gen: function* (fieldname, file, filename, encoding, mimetype) {
        let result = yield oss.putStream(`${appendUUID(filename)}`, file)
        param[fieldname] = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
        return Promise.resolve()
      }
    })
    thunkifyEvent({
      emitter: busboy, event: "finish", gen: function* () {
        yield fieldThunk.collect()
        yield fileThunk.collect()
        let c_param = {
          settlement_code: param['settlement_code'],
          page_index: 0
        }
        connection = yield getConnectionQ(req)
        let Query = promisify(connection.query, {multiArgs: true})
        let [rows] = yield Query.call(connection, sqls.financeService, c_param)
        if (!rows || rows.length === 0) {
          throw new Error('没查到要操作的订单记录')
        }
        let bill = rows[0]
        if (bill.settlement_status !== '004') {
          throw new Error('该订单的状态已更新，请重试')
        }
        connection = yield getWriteConnectionQ(req)
        let RollBack = promisify(connection.rollback);
        Query = promisify(connection.query, {multiArgs: true});
        try {
          let [results] = yield Query.call(connection, sqls.financeServiceUpdate, {
            ...param,
            [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code
          })
          if (results.changedRows < 1) {
            throw new Error("无需要更新的字段")
          }
          let logParam = {
            action_type: "添加/修改付款详情",
            from_table: 't_finance_service_settlement',
            from_table_key: param['settlement_code'],
            from_org_code: req.session.profile.org_code,
            create_user_id: req.session.profile.user_id,
            sub_user_id: req.session.profile.sub_user_id,
            oper_log: `操作人：${req.session.profile.user_name}`
          }
          yield [
            writeOperLog(connection, logParam),
          ]
          res.json({success: true})
        } catch (e) {
          yield RollBack.call(connection)
          res.json({
            success: false,
            message: e.message || "更新失败"
          })
        }
      }, err: e => {
        res.json({
          success: false,
          message: e.message || "更新失败"
        })
        connection && connection.release()
      }
    })
    return req.pipe(busboy)
  }
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {pageIndex} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1);
    let params = getMySQLFieldValue({
      ...req.body,
      pageIndex: myPageIndex,
      ...req.session.subUserDataRestriction,
      [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code
    })
    let [[countRows], [rows]] = yield[
      Query.call(connection, sqls.financeServiceCount, params),
      Query.call(connection, sqls.financeService, params)
    ]
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }
    res.json({success: true, rows, total: countRows[0].total,})
    return rows
  }).catch(function (err) {
    res.json({success: false, message: err.message || "查询失败"});
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/matchDetail', upload.any(), (req, res, next) => {
  if (!req.session._button.includes("create_finance_service_settlement")) {
    next();
    return
  }
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传服务结算明细"});
    return;
  }
  let {mapper} = req.body,
    param = [path.resolve(`${__dirname}/../spawn/financeServiceSettlementMatcher.js`), req.files[0].path, req.session.profile.org_code]
  if (mapper) {
    param.push(mapper)
  }
  co(function* () {
    let resultFile = yield spawning.apply(this, param)
    let resultData = JSON.parse(fs.readFileSync(resultFile, {encoding: "utf8"}))
    res.json(resultData)
    fs.unlinkSync(resultFile)
  }).catch(e => {
    res.json({success: false, message: e && e.message || "未知异常"});
  }).then(() => {
    fs.unlinkSync(req.files[0].path)
  })
});

router.post('/createNewDetail', (req, res, next) => {
  if (!req.session._button.includes("create_finance_service_settlement")) {
    next();
    return
  }
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: 5242880}}), data = {};
  let fieldThunk = thunkifyEvent({
    emitter: busboy,
    event: "field",
    count: 1,
    gen: function* (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      if (fieldname == "data") {
        data = JSON.parse(val)
      }
    }
  })

  let fileThunk = thunkifyEvent({
    emitter: busboy, event: "file", gen: function* (fieldname, file, filename, encoding, mimetype) {
      yield fieldThunk.collect()
      if (fieldname != "settlementFile") {
        yield promisifyPipingTempFile(file)
        throw new Error("凭证非法")
      }
      logger.info(`${filename} 开始上传OSS`)
      let result = "", ossEnd = (Date.now() + 3600000), repeatExecutor = function* () {
        try {
          result = yield oss.putStream(`${appendUUID(filename)}`, file)
        } catch (e) {
          /** 多数为如cpu 被抢占中，等待一秒后重试，直到成功或超时为止*/
          yield promisifyTimeout(1000)
          if (Date.now() < ossEnd) {
            yield* repeatExecutor()
          } else {
            yield promisifyPipingTempFile(file)
            throw new Error(e)
          }
        }
      }
      yield* repeatExecutor()
      data.settlement_file_url = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
      return yield Promise.resolve()
    }
  })

  thunkifyEvent({
    emitter: busboy, event: "finish", gen: function* () {
      yield fileThunk.collect()

      let settlement_details = JSON.parse(data.settlement_details)
      settlement_details.forEach(r => {
        !isNaN(r.account_fee) && (r.account_fee = Number((100 * r.account_fee).toFixed(0)));
        !isNaN(r.interest_total_fee) && (r.interest_total_fee = Number((100 * r.interest_total_fee).toFixed(0)));
        !isNaN(r.service_total_fee) && (r.service_total_fee = Number((100 * r.service_total_fee).toFixed(0)));
        !isNaN(r.current_service_fee) && (r.current_service_fee = Number((100 * r.current_service_fee).toFixed(0)));
      })
      data.settlement_details = JSON.stringify(settlement_details)
      data.settlement_service_fee = Number((100 * data.settlement_service_fee).toFixed(0))

      let apiResult = yield ropAPI("rong.edi.finance.service.settlement.create", {
        edi_user_id: req.session.profile.user_id, ...data,
        [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code
      })
      if (apiResult.success) {
        res.json(apiResult)
      } else {
        res.json(Object.assign(apiResult, {message: apiResult.data._reason}))
      }
    }, err: (e) => {
      res.json({success: false, message: e && e.message || e || "发生异常"})
    }
  })
  return req.pipe(busboy);
});

module.exports = router
