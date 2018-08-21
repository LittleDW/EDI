var {getConnectionQ, getWriteConnectionQ,writeOperTableLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, uuidv4, oss, upload, fs, path, userDiffer, BusBoy, appendUUID, getMySQLFieldValue,
    thunkifyEvent, promisifyInterval, promisifyPipingTempFile, spawning, promisifyTimeout, removefileIfExist,
    connectToSocketHub,pushMessage} = require("../util"),
  ropAPI = require("../ropAPI"), router = Router(),
  configure = require('../../config/configure.json')[process.env.NODE_ENV];

/**
 * 作者：石奇峰
 * 模块：个人订单模块
 * */
router.use((req, res, next) => {
  if(!req.session._submenu.includes("orders")){
    res.json({success:false, message:"您没有调用个人订单列表页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {assetOrderNo, orderNo, borrowDateStart, borrowDateEnd, createTimeStart, createTimeEnd, orderStatus, pageIndex, assetOrgCode, fundOrgCode,borrowCertificateNo, deadline_from, deadline_to} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = Object.assign(getMySQLFieldValue({
        assetOrderNo,
        orderNo,
        fundOrgCode,
        assetOrgCode,
        borrowCertificateNo,
        borrowDateStart,
        borrowDateEnd,
        createTimeStart,
        createTimeEnd,
        orderStatus,
        deadline_from,
        deadline_to,
        pageIndex: myPageIndex,
        ...req.session.subUserDataRestriction
      }), {
        [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code,
      })
    let [[countRows], [rows], [deadLines]] = yield[
      Query.call(connection, sqls.ordersCount, params),
      Query.call(connection, sqls.orders, params),
      Query.call(connection, sqls.borrowDeadline)
    ]
    if (!countRows || !countRows[0] || !deadLines || !deadLines.length) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      rows,
      total: countRows[0].total,
      fee: countRows[0].fee,
      deadLines
    })
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

router.post('/filterOrderVoucher', (req, res, next) => {
  if(!req.session._button.includes("orders_voucher_download")){
    next();
    return
  }
  let connection,writeConnection
  co(function* () {
    [connection,writeConnection] = yield [getConnectionQ(req), getWriteConnectionQ(req)]
    let Query = promisify(connection.query, {multiArgs: true});
    let {assetOrderNo, orderNo, borrowDateStart, borrowDateEnd, createTimeStart, createTimeEnd, orderStatus, pageIndex, assetOrgCode, fundOrgCode,borrowCertificateNo, deadline_from, deadline_to} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = Object.assign(getMySQLFieldValue({
        assetOrderNo,
        orderNo,
        fundOrgCode,
        assetOrgCode,
        borrowCertificateNo,
        borrowDateStart,
        borrowDateEnd,
        createTimeStart,
        createTimeEnd,
        orderStatus,
        deadline_from,
        deadline_to,
        ...req.session.subUserDataRestriction,
        pageIndex: myPageIndex,
      }),{
        [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code
      })
    let [rows] = yield Query.call(connection, sqls.filterOrderVoucher, params)
    res.json({
      success: true,
      rows
    })
    return {params, total: rows.length}
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then((result)=>{
    if(!result){return}
    let {params, total} = result
    return co(function*() {
      let from_table = 't_order_voucher',
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id,
        action_type = '导出';
      let oper_log = `动作：导出个人订单资料 ${total}条, 导出参数 ${JSON.stringify(params)}`
      return yield writeOperTableLog(writeConnection, {from_table, from_org_code, create_user_id, create_sub_user_id, oper_log, action_type})
    }).catch((err) => {logger.error(err)})
  }).then(() => {
    connection && connection.release();
    writeConnection && writeConnection.release();
  });
});

router.post('/orderRepayment', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [rows] = yield Query.call(connection, sqls.orderRepayment, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows,
      total: 0
    })
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
router.post('/orderVoucher', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [rows] = yield Query.call(connection, sqls.orderVoucher, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows
    })
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

router.post('/orderContract', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [rows] = yield Query.call(connection, sqls.orderContract, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows
    })
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
router.post('/orderService', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [rows] = yield Query.call(connection, sqls.orderService, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows
    })
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
router.post('/orderPayment', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [rows] = yield Query.call(connection, sqls.orderPayment, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows,
      total: 0
    })
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
router.post('/orderAdvance', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [rows] = yield Query.call(connection, sqls.orderAdvance, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows,
      total: 0
    })
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
router.post('/orderAccount', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [rows] = yield Query.call(connection, sqls.orderAccount, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows,
      total: 0
    })
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
router.post('/create', (req, res, next) => {
  if(!req.session._button.includes("orders_create")){
    next();
    return
  }
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: 5242880}}),
    executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 200), data, org_code, fund_org_code,
    dataVisited = []/*, socketPromise = connectToSocketHub(req.sessionID,process.pid)*/;
  co(function* () {
    let fieldThunk = thunkifyEvent({
      emitter: busboy,
      event: "field",
      count: 3,
      gen: function* (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        if (fieldname == "orders") {
          data = JSON.parse(val)
        } else if (fieldname == "fund_org_code") {
          if(req.session.profile.user_type == 2){
            fund_org_code = req.session.profile.org_code;
          } else {
            fund_org_code = val;
          }
        } else if (fieldname == "org_code") {
          if(req.session.profile.user_type == 1){
            org_code = req.session.profile.org_code;
          } else {
            org_code = val;
          }
        }
      }
    })

    let fileThunk = thunkifyEvent({
      emitter: busboy, event: "file", gen: function* (fieldname, file, filename, encoding, mimetype) {
        yield fieldThunk.collect()
        /*let socket
        try{socket = yield socketPromise}catch(e){}*/
        //let socket = yield connectToSocketHub()
        if (!Array.isArray(data) || (typeof org_code != "string")) {
          yield promisifyPipingTempFile(file)
          throw new Error("字段数据非法")
        }
        let _voucher_index = -1
        let matchedData = data.filter(r => {
          if (r && r.borrow_voucher_details && r.borrow_voucher_details.includes && r.borrow_voucher_details.includes(filename) && !dataVisited.includes(r)) {
            _voucher_index = r.borrow_voucher_details.indexOf(filename);
            return true
          }
          return false
        })
        if (!matchedData || !matchedData.length) {
          let err = `${filename} 无匹配数据，中断数据发送`
          logger.info(err)
          //file.destroy()
          yield promisifyPipingTempFile(file)
          throw new Error(err)
        }
        logger.info(`${filename} 开始上传OSS`)
        let result, ossEnd = (Date.now() + 3600000), repeatExecutor = function* () {
          try {
            result = yield oss.putStream(`${appendUUID(filename)}`, file)
          } catch (e) {
            /** 多数为如cpu 被抢占中，等待一秒后重试，直到成功或超时为止*/
            yield promisifyTimeout(1000)
            if (Date.now() < ossEnd) {
              yield* repeatExecutor()
            } else {
              matchedData.forEach(r => {
                r.borrow_voucher_details.splice(_voucher_index, 1);
              })
              yield promisifyPipingTempFile(file)
              throw new Error(e)
            }
          }
        }
        yield* repeatExecutor()
        let dataReady = matchedData.filter(r => {
          if (_voucher_index !== -1) {
            r.borrow_voucher_details[_voucher_index] = `${filename}@#@${result.url.replace(/^http\:\/\/.+?\//, configure.oss.host).trim()}`
          }
          delete r._checked
          return Array.isArray(r.borrow_voucher_details) && (r.borrow_voucher_details.filter(t => t.includes("@#@")).length === r.borrow_voucher_details.length)
        })
        logger.info(`${filename} 上传OSS成功 地址${result.url}`)

        if (dataReady.length) {
          let finalVoucher = dataReady[0].borrow_voucher_details.join("$|$"), thisBatch = []
          dataReady.forEach(r => {
            r.borrow_voucher_details = finalVoucher
            if (!dataVisited.includes(r)) {
              dataVisited.push(r)
              executorQueue.push(((r) => {
                let resolver, rejector;
                thisBatch.push(new Promise((res, rej) => {
                  resolver = res;
                  rejector = rej
                }))
                return () => ropAPI("ruixue.edi.order.apply.create", Object.assign({
                  asset_org_code: org_code,
                  fund_org_code
                }, r), "refuse_reason").then((result) => {
                  /*if(socket){
                    pushMessage(socket,{
                      target: req.headers["x-edi-token"],
                      topic:"order-creating-progress",
                      message: `${Number(100*(1 - (executorQueue.length/data.length))).toFixed(2)}%`,
                      debug: true
                    })
                  }*/
                  //socket && socket.send("order-creating-progress",`${Number(100*(dataVisited.indexOf(r) + 1)/dataVisited.length).toFixed(2)}%`)
                  resolver(result)
                  return result
                }).catch(e => {
                  rejector(e)
                  throw e
                })
              })(r))
            }
          })
          return yield thisBatch
        }
        return yield Promise.resolve()
      }, err: (e) => {
        logger.error(e)
        return Promise.resolve()
      }
    })

    thunkifyEvent({
      emitter: busboy, event: "finish", gen: function* () {
        yield fieldThunk.collect()
        yield fileThunk.collect()
        /*let socket
        try{socket = yield socketPromise}catch(e){}*/
        let resultData = yield getIntervalPromise()
        let failed = [], succeed = [].concat.apply([], resultData.map((r) => {
          r.data && (r.data.asset_org_code = org_code);
          if (!r.success) {
            failed.push(r.data)
            return []
          }
          return [r.data]
        }))
        res.json({success: true, failed, succeed})
        /*if(socket){
          socket.close()
        }*/
      }
    })
  }).catch(e => {
    res.json({success: false, message: e && e.message || "未知异常"});
  })
  return req.pipe(busboy);
});

router.post('/match', upload.any(), (req, res, next) => {
  if(!req.session._button.includes("orders_create")){
    next();
    return
  }
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传订单信息"});
    return;
  }
  co(function* () {
    let resultFile = yield spawning(path.resolve(`${__dirname}/../spawn/assetOrderMatcher.js`), req.files[0].path, req.files[1].path)
    let resultData = JSON.parse(fs.readFileSync(resultFile, {encoding: "utf8"}))
    res.json(Object.assign({success: true}, resultData))
    fs.unlinkSync(req.files[0].path)
    fs.unlinkSync(req.files[1].path)
    fs.unlinkSync(resultFile)
  }).catch(e => {
    res.json({success: false, message: e && e.message || "未知异常"});
  })
});

router.post('/matchSupplement', upload.any(), (req, res, next) => {
  if(!req.session._button.includes("orders_voucher_supplement")){
    next();
    return
  }
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传订单信息"});
    return;
  }
  co(function* () {
    let resultFile = yield spawning(path.resolve(`${__dirname}/../spawn/supplementAssetOrderMatcher.js`), req.files[0].path, req.files[1].path)
    let resultData = JSON.parse(fs.readFileSync(resultFile, {encoding: "utf8"}))
    res.json(Object.assign({success: true}, resultData))
    fs.unlinkSync(req.files[0].path)
    fs.unlinkSync(req.files[1].path)
    fs.unlinkSync(resultFile)
  }).catch(e => {
    res.json({success: false, message: e && e.message || "未知异常"});
  })
});

router.get('/export', (req, res, next) => {
  if (!req.session.profile) {
    return res.status(404).send('无权下载')
  }
  if(!req.session._button.includes("orders_export")){
    return res.status(403).send("您无权做导出操作，请联系管理员");
  }

  let connection, writeConnection, outputFile = path.resolve(`${__dirname}/../../temp/${uuidv4()}`),
    xslx = path.resolve(`${__dirname}/../../temp/${uuidv4()}`);
  fs.closeSync(fs.openSync(outputFile, 'w'));
  co(function* () {
    [connection,writeConnection] = yield [getConnectionQ(req), getWriteConnectionQ(req)]
    let Query = promisify(connection.query, {multiArgs: true}), Download = promisify(res.download);
    let {assetOrderNo, orderNo, borrowDateStart, borrowDateEnd, createTimeStart, createTimeEnd, orderStatus, fundOrgCode, assetOrgCode, deadlineFrom, deadlineTo, borrowCertificateNo} = req.query,
      deadline_from = deadlineFrom,
      deadline_to = deadlineTo,
      params = {...getMySQLFieldValue({
          assetOrderNo,
          orderNo,
          fundOrgCode,
          assetOrgCode,
          borrowDateStart,
          borrowDateEnd,
          createTimeStart,
          createTimeEnd,
          deadline_from,
          deadline_to,
          borrowCertificateNo,
          orderStatus: orderStatus.split(","),
          ...req.session.subUserDataRestriction,
        }), [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}, qList = []
    let [countRows] = yield Query.call(connection, sqls.ordersCount, params)
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }
    let {total} = countRows[0], pages = Math.ceil(total / configure.exportLimit);
    if (total > configure.exportMaxRows) {
      throw new Error(`导出量已超过上线 ${configure.exportMaxRows} 条`)
    }
    for (var i = 0; i < pages; i++) {
      qList.push(spawning(path.resolve(`${__dirname}/../spawn/orderAssist.js`), req.session.profile.user_type,
        assetOrderNo, orderNo, borrowDateStart, borrowDateEnd, createTimeStart, createTimeEnd, orderStatus,
        fundOrgCode, assetOrgCode, i * configure.exportLimit, configure.exportLimit, outputFile, deadline_from,
        deadline_to, borrowCertificateNo, JSON.stringify(req.session.subUserDataRestriction || {})))
    }
    yield qList
    yield spawning(path.resolve(`${__dirname}/../spawn/json2xslx.js`), outputFile, xslx)
    yield Download.call(res, xslx, '个人订单导出.xlsx')
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
      let from_table = 't_order',
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id,
        action_type = '导出';
      let oper_log = `动作：导出个人订单 ${total}条, 导出参数 ${JSON.stringify(params)}`
      return yield writeOperTableLog(writeConnection, {from_table, from_org_code, create_user_id, create_sub_user_id, oper_log, action_type})
    }).catch((err) => {logger.error(err)})
  }).then(() => {
    logger.info(res._headers)
    connection && connection.release();
    writeConnection && writeConnection.release();
    removefileIfExist(outputFile)
    removefileIfExist(xslx)
  });
});


router.post('/checkResultMatch', upload.any(), (req, res, next) => {
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传审核结果"});
    return;
  }
  let {mapper} = req.body, param = [path.resolve(`${__dirname}/../spawn/orderCheckResultMatcher.js`), req.files[0].path, req.session.profile.org_code]
  if(mapper){
    param.push(mapper)
  }
  co(function*(){
    let resultFile = yield spawning.apply(this, param)
    let resultData = JSON.parse(fs.readFileSync(resultFile,{encoding:"utf8"}))
    if (Array.isArray(resultData.unmatched) && resultData.unmatched.length > 0 ) {
      res.json(resultData)
    } else {
      res.json({hiddleResult: true, ...resultData})
    }
    fs.unlinkSync(resultFile)
  }).catch(e=>{
    if (res.headersSent) {
      logger.error(e)
    } else {
      res.json({success: false, message: e&&e.message|| "未知异常"});
    }
  }).then(()=>{
    fs.unlinkSync(req.files[0].path)
  })
});

router.post('/checkResultCreate', (req, res, next) => {
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: Infinity}}), data = {},
    executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10);
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

  thunkifyEvent({
    emitter: busboy, event: "finish", gen: function* () {
      yield fieldThunk.collect()

      let details = JSON.parse(data.details), unmatched = [], matched = [], thisBatch = []

      if (details.length) {
        details.forEach(r => {
          let {order_no, order_status, refuse_reason} = r
          // 审核通过
          if (order_status == 1) {
            executorQueue.push(((r) => {
              let resolver, rejector;
              thisBatch.push(new Promise((res, rej) => {
                resolver = res;
                rejector = rej
              }))
              return () => ropAPI("rong.edi.notify.fund.status", Object.assign({edi_user_id: req.session.profile.user_id, fund_org_code: req.session.profile.org_code}, {order_no, order_status: "140"})).then((data) => {
                resolver(data)
                if (data.success) {
                  matched.push(r)
                } else {
                  r._reason = data.data._reason
                  unmatched.push(r)
                }
                return data
              }).catch(e => {
                rejector(e)
                throw e
              })
            })(r))
          } else if (order_status == 2) { // 审核拒绝
            executorQueue.push(((r) => {
              let resolver, rejector;
              thisBatch.push(new Promise((res, rej) => {
                resolver = res;
                rejector = rej
              }))
              return () => ropAPI("rong.edi.notify.fund.refuse", Object.assign({edi_user_id: req.session.profile.user_id, fund_org_code: req.session.profile.org_code}, {order_no, refuse_type: "A", refuse_reason})).then((data) => {
                resolver(data)
                if (data.success) {
                  matched.push(r)
                } else {
                  r._reason = data.data._reason
                  unmatched.push(r)
                }
                return data
              }).catch(e => {
                rejector(e)
                throw e
              })
            })(r))
          }

        })
      }

      yield thisBatch
      yield getIntervalPromise()

      if (unmatched.length > 0) {
        res.json({success: true, matched, unmatched, message: "有上传失败记录"})
      } else {
        res.json({success: true, matched, unmatched})
      }

    }, err: (e) => {
      res.json({success: false, message: e && e.message || e || "发生异常"})
    }
  })
  return req.pipe(busboy);
});

router.post('/contractSupplymentMatch', upload.any(), (req, res, next) => {
  if(!req.session._button.includes("orders_contract_supplement")){
    next();
    return
  }
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传补充合同"});
    return;
  }
  let {mapper} = req.body, param = [path.resolve(`${__dirname}/../spawn/orderContractSupplymentMatcher.js`), req.files[0].path, req.session.profile.org_code]
  if(mapper){
    param.push(mapper)
  }
  co(function*(){
    let resultFile = yield spawning.apply(this, param)
    let resultData = JSON.parse(fs.readFileSync(resultFile,{encoding:"utf8"}))
    if (Array.isArray(resultData.unmatched) && resultData.unmatched.length > 0 ) {
      res.json(resultData)
    } else {
      res.json({hiddleResult: true, ...resultData})
    }
    fs.unlinkSync(resultFile)
  }).catch(e=>{
    res.json({success: false, message: e&&e.message|| "未知异常"});
  }).then(()=>{
    fs.unlinkSync(req.files[0].path)
  })
});

router.post('/contractSupplymentCreate', (req, res, next) => {
  if(!req.session._button.includes("orders_contract_supplement")){
    next();
    return
  }

  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: Infinity}}), data = {},
    executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10);
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

  thunkifyEvent({
    emitter: busboy, event: "finish", gen: function* () {
      yield fieldThunk.collect()

      let details = JSON.parse(data.details), unmatched = [], matched = [], thisBatch = []

      if (details.length) {
        details.forEach(r => {
          let { order_no, contract_type, contract_number, contract_url } = r;
          executorQueue.push(((r) => {
            let resolver, rejector;
            thisBatch.push(new Promise((res, rej) => {
              resolver = res;
              rejector = rej
            }))
            return () => ropAPI("rong.edi.order.contract.supplement", Object.assign({ edi_user_id: req.session.profile.user_id, fund_org_code: req.session.profile.org_code }, { order_no, contract_details: `${contract_type}@#@${contract_number}@#@${contract_url}` }))
                .then(data => {
                  resolver(data);
                  if (data.success) {
                    matched.push(r);
                  } else {
                    r._reason = data.data._reason;
                    unmatched.push(r);
                  }
                  return data;
                })
                .catch(e => {
                  rejector(e);
                  throw e;
                });
          })(r))
        })
      }

      yield thisBatch
      yield getIntervalPromise()

      if (unmatched.length > 0) {
        res.json({success: true, matched, unmatched, message: "有上传失败记录"})
      } else {
        res.json({success: true, matched, unmatched})
      }

    }, err: (e) => {
      res.json({success: false, message: e && e.message || e || "发生异常"})
    }
  })
  return req.pipe(busboy);
});


router.post('/accountDetailMatch', upload.any(), (req, res, next) => {
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传出账明细"});
    return;
  }
  let {mapper} = req.body, param = [path.resolve(`${__dirname}/../spawn/orderAccountDetailMatcher.js`), req.files[0].path, req.session.profile.org_code]
  if(mapper){
    param.push(mapper)
  }
  co(function*(){
    let resultFile = yield spawning.apply(this, param)
    let resultData = JSON.parse(fs.readFileSync(resultFile,{encoding:"utf8"}))
    if (Array.isArray(resultData.unmatched) && resultData.unmatched.length > 0 ) {
      res.json(resultData)
    } else {
      res.json({hiddleResult: true, ...resultData})
    }
    fs.unlinkSync(resultFile)
  }).catch(e=>{
    res.json({success: false, message: e&&e.message|| "未知异常"});
  }).then(()=>{
    fs.unlinkSync(req.files[0].path)
  })
});


router.post('/accountDetailCreate', (req, res, next) => {
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: Infinity}}), data = {},
    executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10);
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

  thunkifyEvent({
    emitter: busboy, event: "finish", gen: function* () {
      yield fieldThunk.collect()

      let details = JSON.parse(data.details), unmatched = [], matched = [], thisBatch = []

      if (details.length) {
        details.forEach(r => {

          let new_account_fee = "", new_payment_fee = "";

          (r.account_fee !== "") && (r.account_fee !== undefined) && (new_account_fee = 100 * r.account_fee);
          (r.payment_fee !== "") && (r.payment_fee !== undefined) && (new_payment_fee = 100 * r.payment_fee);

          executorQueue.push(((r) => {
            let resolver, rejector;
            thisBatch.push(new Promise((res, rej) => {
              resolver = res;
              rejector = rej
            }))
            return () => ropAPI("rong.edi.bank.order.account.update", Object.assign({
                edi_user_id: req.session.profile.user_id,
                fund_org_code: req.session.profile.org_code
              }, r,
              {account_fee: new_account_fee, payment_fee: new_payment_fee})).then((data) => {
              resolver(data)
              if (data.success) {
                matched.push(r)
              } else {
                r._reason = data.data._reason
                unmatched.push(r)
              }
              return data
            }).catch(e => {
              rejector(e)
              throw e
            })
          })(r))
        })
      }

      yield thisBatch
      yield getIntervalPromise()

      if (unmatched.length > 0) {
        res.json({success: true, matched, unmatched, message: "有上传失败记录"})
      } else {
        res.json({success: true, matched, unmatched})
      }

    }, err: (e) => {
      res.json({success: false, message: e && e.message || e || "发生异常"})
    }
  })
  return req.pipe(busboy);
});


/**
 * 作者：石奇峰
 * 功能：后续接口
 * 因为个人和企业订单资料补充共用此接口
 * 故将此接口抽出来放在共通
 * */
router.post('/supplement', (req, res, next) => {
  if(!req.session._button.includes("orders_voucher_supplement") && !req.session._button.includes("corp_orders_voucher_supplement")){
    next();
    return
  }
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: 5242880}}),
    executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10), data, org_code, dataVisited = [];
  co(function* () {
    let fieldThunk = thunkifyEvent({
      emitter: busboy,
      event: "field",
      count: 2,
      gen: function* (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        if (fieldname == "orders") {
          data = JSON.parse(val)
        } else if (fieldname == "org_code") {
          org_code = val;
        }
      }
    })

    let fileThunk = thunkifyEvent({
      emitter: busboy, event: "file", gen: function* (fieldname, file, filename, encoding, mimetype) {
        yield fieldThunk.collect()
        if (!Array.isArray(data) || (typeof org_code != "string")) {
          yield promisifyPipingTempFile(file)
          throw new Error("字段数据非法")
        }
        let _voucher_index = -1
        let matchedData = data.filter(r => {
          if (r && r.borrow_voucher_details && r.borrow_voucher_details.includes && r.borrow_voucher_details.includes(filename) && !dataVisited.includes(r)) {
            _voucher_index = r.borrow_voucher_details.indexOf(filename);
            return true
          }
          return false
        })
        if (!matchedData || !matchedData.length) {
          let err = `${filename} 无匹配数据，中断数据发送`
          logger.info(err)
          //file.destroy()
          yield promisifyPipingTempFile(file)
          throw new Error(err)
        }
        logger.info(`${filename} 开始上传OSS`)
        let result, ossEnd = (Date.now() + 3600000), repeatExecutor = function* () {
          try {
            result = yield oss.putStream(`${appendUUID(filename)}`, file)
          } catch (e) {
            /** 多数为如cpu 被抢占中，等待一秒后重试，直到成功或超时为止*/
            yield promisifyTimeout(1000)
            if (Date.now() < ossEnd) {
              yield* repeatExecutor()
            } else {
              matchedData.forEach(r => {
                r.borrow_voucher_details.splice(_voucher_index, 1);
              })
              yield promisifyPipingTempFile(file)
              throw new Error(e)
            }
          }
        }
        yield* repeatExecutor()
        let dataReady = matchedData.filter(r => {
          if (_voucher_index !== -1) {
            r.borrow_voucher_details[_voucher_index] = `${filename}@#@${result.url.replace(/^http\:\/\/.+?\//, configure.oss.host).trim()}`
          }
          delete r._checked
          return Array.isArray(r.borrow_voucher_details) && (r.borrow_voucher_details.filter(t => t.includes("@#@")).length === r.borrow_voucher_details.length)
        })
        logger.info(`${filename} 上传OSS成功 地址${result.url}`)

        if (dataReady.length) {
          let finalVoucher = dataReady[0].borrow_voucher_details.join("$|$"), thisBatch = []
          dataReady.forEach(r => {
            r.borrow_voucher_details = finalVoucher
            if (!dataVisited.includes(r)) {
              dataVisited.push(r)
              executorQueue.push(((r) => {
                let resolver, rejector;
                thisBatch.push(new Promise((res, rej) => {
                  resolver = res;
                  rejector = rej
                }))
                return () => ropAPI("ruixue.edi.order.voucher.supplement", {
                  asset_org_code: org_code,
                  asset_order_no: r.asset_order_no,
                  borrow_voucher_details: r.borrow_voucher_details
                }).then((data) => {
                  resolver(data)
                  data.data = Object.assign(data.data, r)
                  return data
                }).catch(e => {
                  rejector(e)
                  throw e
                })
              })(r))
              //thisBatch.push(promisify)
            }
          })
          return yield thisBatch
        }
        return yield Promise.resolve()
      }, err: (e) => {
        logger.error(e)
        return Promise.resolve()
      }
    })

    thunkifyEvent({
      emitter: busboy, event: "finish", gen: function* () {
        yield fieldThunk.collect()
        yield fileThunk.collect()
        let resultData = yield getIntervalPromise()
        let failed = [], succeed = [].concat.apply([], resultData.map((r) => {
          r.data && (r.data.asset_org_code = org_code);
          if (!r.success) {
            failed.push(r.data)
            return []
          }
          return [r.data]
        }))
        res.json({success: true, failed, succeed})
      }
    })
  }).catch(e => {
    res.json({success: false, message: e && e.message || "未知异常"});
  })
  return req.pipe(busboy);
});

router.post('/orderCredit', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let [rows] = yield Query.call(connection, sqls.orderCredit, getMySQLFieldValue(req.body))
    res.json({
      success: true,
      rows,
      total: 0
    })
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

module.exports = router
