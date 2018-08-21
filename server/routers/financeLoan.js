var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, oss, moment, upload, fs, path, userDiffer, appendUUID, spawning, BusBoy, getMySQLFieldValue, thunkifyEvent, promisifyPipingTempFile, promisifyTimeout} = require("../util"),
  router = Router(),configure = require('../../config/configure.json')[process.env.NODE_ENV],
  ropAPI = require("../ropAPI");

/**
 * 作者：石奇峰
 * 模块：放款对账单
 * */

router.use((req, res, next) => {
  if (!req.session._submenu.includes("finance_loan")) {
    res.json({success: false, message: "您没有调用放款对账单页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {pageIndex, accountStartDate, accountEndDate} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1);
    let account_date_start = accountStartDate && (accountStartDate + " 00:00:00") || '',
      account_date_end = accountEndDate && (accountEndDate + " 23:59:59") || '',
      params = getMySQLFieldValue({
        ...req.body,
        pageIndex: myPageIndex,
        account_date_start,
        account_date_end,
        ...req.session.subUserDataRestriction,
        [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code
      })
    let [[countRows], [rows]] = yield[
      Query.call(connection, sqls.financeLoanCount, params),
      Query.call(connection, sqls.financeLoan, params)
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
  if (!req.session._button.includes("create_finance_loan") && !req.session._button.includes("append_finance_loan")) {
    next();
    return
  }
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传出账明细"});
    return;
  }
  let {mapper} = req.body,
    param = [path.resolve(`${__dirname}/../spawn/financeLoanMatcher.js`), req.files[0].path, req.session.profile.org_code]
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

router.post('/createHistoricalDetail', (req, res, next) => {
  if (!req.session._button.includes("append_finance_loan")) {
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
      let property
      if (fieldname == "loanVoucherFile") {
        property = "account_voucher_url"
      } else if (fieldname == "loanFile") {
        property = "loan_file_url"
      } else {
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
      data[property] = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
      return yield Promise.resolve()
    }, err: (e) => {
      logger.error(e)
      return Promise.resolve()
    }
  })

  thunkifyEvent({
    emitter: busboy, event: "finish", gen: function* () {
      yield fileThunk.collect()

      let loan_details = JSON.parse(data.loan_details)
      loan_details.forEach(r => {
        !isNaN(r.account_fee) && (r.account_fee = Number((100 * r.account_fee).toFixed(0)));
        !isNaN(r.interest_total_fee) && (r.interest_total_fee = Number((100 * r.interest_total_fee).toFixed(0)));
        !isNaN(r.service_total_fee) && (r.service_total_fee = Number((100 * r.service_total_fee).toFixed(0)));
      })
      data.loan_details = JSON.stringify(loan_details)
      data.account_fee = Number((100 * data.account_fee).toFixed(0))

      let apiResult = yield ropAPI("rong.edi.finance.loan.history.import", {
        edi_user_id: req.session.profile.user_id, ...data,
        [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code
      })
      if (apiResult.success) {
        res.json(apiResult)
      } else {
        res.json(Object.assign(apiResult, {message: apiResult.data._reason}))
      }
    }
  })
  return req.pipe(busboy);
})
;

router.post('/createNewDetail', (req, res, next) => {
  if (!req.session._button.includes("create_finance_loan")) {
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
      let property
      if (fieldname == "loanVoucherFile") {
        property = "account_voucher_url"
      } else if (fieldname == "loanFile") {
        property = "loan_file_url"
      } else {
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
      data[property] = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
      return yield Promise.resolve()
    }
  })

  thunkifyEvent({
    emitter: busboy, event: "finish", gen: function* () {
      yield fieldThunk.collect()
      yield fileThunk.collect()
      let loan_details = JSON.parse(data.loan_details)
      loan_details.forEach(r => {
        !isNaN(r.account_fee) && (r.account_fee = Number((100 * r.account_fee).toFixed(0)));
        !isNaN(r.interest_total_fee) && (r.interest_total_fee = Number((100*r.interest_total_fee).toFixed(0)));
        !isNaN(r.service_total_fee) && (r.service_total_fee = Number((100*r.service_total_fee).toFixed(0)));
      })
      data.loan_details = JSON.stringify(loan_details)
      data.account_fee = Number((100*data.account_fee).toFixed(0))

      let apiResult = yield ropAPI("rong.edi.finance.loan.create", {
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

router.post('/changeStatus', (req, res, next) => {
  if (!req.session._button.includes("finance_loan_oper")) {
    next();
    return
  }
  let connection,Query
  co(function* () {
    connection = yield getConnectionQ(req)
    Query = promisify(connection.query, {multiArgs: true})
    let {currentStatus, loanCode, targetStatus, actionName} = req.body
    let params = {loan_code: loanCode, page_index: 0}
    let [rows] = yield Query.call(connection, sqls.financeLoan, params)
    if (!rows || rows.length === 0) {
      throw new Error('没查到要操作的订单记录')
    }
    let bill = rows[0]
    if (bill.loan_status !== currentStatus) {
      throw new Error('该订单的状态已更新，请重试')
    }
    if (targetStatus === '003' && bill.data_from === 'B' && moment().diff(moment(bill.rx_insertTime), 'days') > 7) {
      throw new Error('不能废弃超过一周的历史对账单')
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback);

    params = {
      loan_code: loanCode,
      loan_status: targetStatus
    }
    try {
      yield  Transaction.call(connection)
      let [affectedRow] = yield Query.call(connection, sqls.financeLoanUpdate, {...params, [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code})

      if (!affectedRow && !affectedRow.length) {
        throw new Error('未成功更新该订单状态，请重试')
      }

      let logParam = {
        action_type: `${actionName}结算单`,
        from_table: 't_finance_loan',
        from_table_key: loanCode,
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
  }).then((data) => {
    return co(function* () {
      const {params, logParam, targetStatus} = data
      if (targetStatus === '004' || targetStatus === '003') {
        Query.call(connection, sqls.financeLoanConfirmInvoke, params).catch(e=>logger.error(e))
      }
      yield writeOperLog(connection, data.logParam)
    })
  }).catch(function (err) {
    res.json({success: false, message: err.message || "查询失败"});
  }).then(() => {
    connection && connection.release();
  })
})

module.exports = router
