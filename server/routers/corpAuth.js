var {
    getConnectionQ,
    getWriteConnectionQ,
    writeOperTableLog,
  } = require('../pool'),
  sqls = require('../../config/sqls.json'),
  configure = require('../../config/configure.json')[process.env.NODE_ENV],
  {
    logger,
    promisify,
    co,
    Router,
    uuidv4,
    oss,
    upload,
    fs,
    path,
    userDiffer,
    appendUUID,
    getMySQLFieldValue,
    spawning,
    BusBoy,
    promisifyInterval,
    thunkifyEvent,
    promisifyPipingTempFile,
    promisifyTimeout,
    removefileIfExist,
  } = require('../util'),
  ropAPI = require('../ropAPI'),
  router = Router();

/**
 * 作者：石奇峰
 * 模块：企业授信列表
 * */

router.use((req, res, next) => {
  if (!req.session._submenu.includes('corp_auth')) {
    res.json({
      success: false,
      message: '您没有调用企业授信列表页面接口的权限',
    });
    return;
  }
  next();
});

router.post('/search', (req, res, next) => {
  let connection;
  co(function*() {
    let type = req.body.type;
    connection = yield getConnectionQ(req);
    let Query = promisify(connection.query, { multiArgs: true });
    let {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      pageIndex,
      assetOrgCode,
      fundOrgCode,
      borrow_name,
      fund_credit_status,
      asset_credit_status,
    } = req.body;
    const page_index =
      isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
    if (min_fee) {
      min_fee = Number(min_fee) * 100;
    }
    if (max_fee) {
      max_fee = Number(max_fee) * 100;
    }
    let param = getMySQLFieldValue({
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      fundOrgCode,
      assetOrgCode,
      fund_credit_status,
      asset_credit_status,
      page_index,
      borrow_name,
      ...req.session.subUserDataRestriction,
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code
    })
    let [[columnRow], [rows]] = yield [
      Query.call(
        connection,
        type !== 2 ? sqls.corpAssetAuthCount : sqls.corpFundAuthCount,
        param
      ),
      Query.call(
        connection,
        type !== 2 ? sqls.corpAssetAuth : sqls.corpFundAuth,
        param
      ),
    ];
    if (!columnRow || !columnRow[0]) {
      throw new Error('无记录');
    }
    res.json({ success: true, rows, total: columnRow[0].total });
    return rows;
  })
    .catch(function(err) {
      res.json({
        success: false,
        message: err.message || '查询失败',
      });
    })
    .then(() => {
      connection && connection.release();
    });
});
router.post('/detail', (req, res, next) => {
  let connection;
  co(function* () {
    connection = yield getConnectionQ(req);
    let Query = promisify(connection.query, {multiArgs: true});
    const {assetOrgCode, fundOrgCode, borrow_business_license} = req.body;
    let param = getMySQLFieldValue({fundOrgCode, assetOrgCode, borrow_business_license,
      ...req.session.subUserDataRestriction,[userDiffer(req.session.profile.user_type, ['admin_org_code','fundOrgCode', 'assetOrgCode',])]:req.session.profile.org_code,});
    let [rows] = yield Query.call(connection, sqls.corpAuthDetail, param);
    if (!rows || !rows[0]) {
      throw new Error('无记录');
    }
    res.json({ success: true, rows });
    return rows;
  })
    .catch(function(err) {
      res.json({
        success: false,
        message: err.message || '查询失败',
      });
    })
    .then(() => {
      connection && connection.release();
    });
});
router.post('/creditDetail', (req, res, next) => {
  let connection;
  co(function*() {
    connection = yield getConnectionQ(req);
    let Query = promisify(connection.query, { multiArgs: true });
    const { assetOrgCode, borrow_business_license } = req.body;
    let param = {
      ...{ asset_org_code: assetOrgCode, borrow_business_license },
    };
    let [rows] = yield Query.call(connection, sqls.corpAuthCredit, param);
    if (!rows || !rows.length) {
      throw new Error('无记录');
    }
    res.json({ success: true, rows });
    return rows;
  })
    .catch(function(err) {
      res.json({
        success: false,
        message: err.message || '查询失败',
      });
    })
    .then(() => {
      connection && connection.release();
    });
});
router.post('/match', upload.any(), (req, res, next) => {
  if (!req.session._button.includes('corp_auth_create')) {
    next();
    return;
  }
  if (!req.files || !req.files.length) {
    res.json({ success: false, message: '请上传订单信息' });
    return;
  }
  co(function*() {
    let resultFile = yield spawning(
      path.resolve(`${__dirname}/../spawn/corpCreditMatcher.js`),
      req.files[0].path,
      req.files[1].path
    );
    let resultData = JSON.parse(
      fs.readFileSync(resultFile, { encoding: 'utf8' })
    );
    res.json(Object.assign({ success: true }, resultData));
    fs.unlinkSync(req.files[0].path);
    fs.unlinkSync(req.files[1].path);
    fs.unlinkSync(resultFile);
  }).catch(e => {
    res.json({ success: false, message: (e && e.message) || '未知异常' });
  });
});

router.post('/create', (req, res, next) => {
  if (!req.session._button.includes('corp_auth_create')) {
    next();
    return;
  }
  let busboy = new BusBoy({
      headers: req.headers,
      limits: { fieldNameSize: 200, fieldSize: 5242880 },
    }),
    executorQueue = [],
    getIntervalPromise = promisifyInterval(executorQueue, 200),
    data,
    org_code,
    dataVisited = [];
  co(function*() {
    let fieldThunk = thunkifyEvent({
      emitter: busboy,
      event: 'field',
      count: 2,
      gen: function*(
        fieldname,
        val,
        fieldnameTruncated,
        valTruncated,
        encoding,
        mimetype
      ) {
        if (fieldname == 'orders') {
          data = JSON.parse(val);
        } else if (fieldname == 'org_code') {
          if (req.session.profile.user_type == 1) {
            org_code = req.session.profile.org_code;
          } else {
            org_code = val;
          }
        }
      },
      err: e => {
        logger.error(e);
        throw new Error(e);
      },
    });

    let fileThunk = thunkifyEvent({
      emitter: busboy,
      event: 'file',
      gen: function*(fieldname, file, filename, encoding, mimetype) {
        yield fieldThunk.collect();
        if (!Array.isArray(data) || typeof org_code != 'string') {
          yield promisifyPipingTempFile(file);
          throw new Error('字段数据非法');
        }
        let _voucher_index = -1;
        let matchedData = data.filter(r => {
          if (
            r &&
            r.borrow_credit_voucher_details &&
            r.borrow_credit_voucher_details.includes &&
            r.borrow_credit_voucher_details.includes(filename) &&
            !dataVisited.includes(r)
          ) {
            _voucher_index = r.borrow_credit_voucher_details.indexOf(filename);
            return true;
          }
          return false;
        });
        if (!matchedData || !matchedData.length) {
          let err = `${filename} 无匹配数据，中断数据发送`;
          logger.info(err);
          yield promisifyPipingTempFile(file);
          throw new Error(err);
        }
        logger.info(`${filename} 开始上传OSS`);
        let result,
          ossEnd = Date.now() + 3600000,
          repeatExecutor = function*() {
            try {
              result = yield oss.putStream(`${appendUUID(filename)}`, file);
            } catch (e) {
              /** 多数为如cpu 被抢占中，等待一秒后重试，直到成功或超时为止*/
              yield promisifyTimeout(1000);
              if (Date.now() < ossEnd) {
                yield* repeatExecutor();
              } else {
                matchedData.forEach(r => {
                  r.borrow_credit_voucher_details.splice(_voucher_index, 1);
                });
                yield promisifyPipingTempFile(file);
                throw new Error(e);
              }
            }
          };
        yield* repeatExecutor();

        let dataReady = matchedData.filter(r => {
          if (_voucher_index !== -1) {
            r.borrow_credit_voucher_details[
              _voucher_index
            ] = `${filename}@#@${result.url
              .replace(/^http\:\/\/.+?\//, configure.oss.host)
              .trim()}`;
          }
          delete r._checked;
          return (
            Array.isArray(r.borrow_credit_voucher_details) &&
            r.borrow_credit_voucher_details.filter(t => t.includes('@#@'))
              .length === r.borrow_credit_voucher_details.length
          );
        });
        logger.info(`${filename} 上传OSS成功 地址${result.url}`);

        if (dataReady.length) {
          let finalVoucher = dataReady[0].borrow_credit_voucher_details.join('$|$'),
            thisBatch = [];
          dataReady.forEach(r => {
            r.borrow_credit_voucher_details = finalVoucher;
            if (!dataVisited.includes(r)) {
              dataVisited.push(r);
              executorQueue.push(
                (r => {
                  let resolver,
                    rejector,
                    param = { ...r, asset_org_code: org_code };
                  thisBatch.push(
                    new Promise((res, rej) => {
                      resolver = res;
                      rejector = rej;
                    })
                  );
                  if (!isNaN(r.paid_in_capital)) {
                    param.paid_in_capital = 100 * Number(r.paid_in_capital);
                  }
                  //paid_in_capital: !isNaN(r.paid_in_capital) && 100 * Number(r.paid_in_capital)||undefined}
                  return () =>
                    ropAPI('ruixue.edi.enterprise.credit.apply.create', param)
                      .then(data => {
                        resolver(data);
                        return data;
                      })
                      .catch(e => {
                        rejector(e);
                        throw e;
                      });
                })(r)
              );
              //thisBatch.push(promisify)
            }
          });
          return yield thisBatch;
        }
        return yield Promise.resolve();
      },
      err: e => {
        logger.error(e);
      },
    });

    thunkifyEvent({
      emitter: busboy,
      event: 'finish',
      gen: function*() {
        yield fieldThunk.collect();
        yield fileThunk.collect();
        let resultData = yield getIntervalPromise();
        let failed = [],
          succeed = [].concat.apply(
            [],
            resultData.map(r => {
              //r.data && (r.data.asset_org_code = org_code);
              if (!r.success) {
                failed.push(r.data);
                return [];
              }
              return [r.data];
            })
          );
        res.json({ success: true, failed, succeed });
      },
    });
  }).catch(e => {
    res.json({ success: false, message: (e && e.message) || '未知异常' });
  });
  return req.pipe(busboy);
});

router.post('/matchSupplement', upload.any(), (req, res, next) => {
  if (!req.session._button.includes('corp_auth_supplement')) {
    next();
    return;
  }
  if (!req.files || !req.files.length) {
    res.json({ success: false, message: '请上传订单信息' });
    return;
  }
  co(function* () {
    let resultFile = yield spawning(path.resolve(`${__dirname}/../spawn/supplementCorpCreditMatcher.js`), req.files[0].path, req.files[1].path)
    let resultData = JSON.parse(fs.readFileSync(resultFile, {encoding: "utf8"}))
    res.json({success: true,...resultData})
    fs.unlinkSync(req.files[0].path)
    fs.unlinkSync(req.files[1].path)
    fs.unlinkSync(resultFile)
  }).catch(e => {
    res.json({ success: false, message: (e && e.message) || '未知异常' });
  });
});

router.post('/supplement', (req, res, next) => {
  if (!req.session._button.includes('corp_auth_supplement')) {
    next();
    return;
  }
  let busboy = new BusBoy({
      headers: req.headers,
      limits: { fieldNameSize: 200, fieldSize: 5242880 },
    }),
    executorQueue = [],
    getIntervalPromise = promisifyInterval(executorQueue, 200),
    data,
    org_code,
    dataVisited = [];
  co(function*() {
    let fieldThunk = thunkifyEvent({
      emitter: busboy,
      event: 'field',
      count: 2,
      gen: function*(
        fieldname,
        val,
        fieldnameTruncated,
        valTruncated,
        encoding,
        mimetype
      ) {
        if (fieldname == 'orders') {
          data = JSON.parse(val);
        } else if (fieldname == 'org_code') {
          if (req.session.profile.user_type == 1) {
            org_code = req.session.profile.org_code;
          } else {
            org_code = val;
          }
        }
      },
      err: e => {
        logger.error(e);
        throw new Error(e);
      },
    });

    let fileThunk = thunkifyEvent({
      emitter: busboy,
      event: 'file',
      gen: function*(fieldname, file, filename, encoding, mimetype) {
        yield fieldThunk.collect();
        if (!Array.isArray(data) || typeof org_code != 'string') {
          yield promisifyPipingTempFile(file);
          throw new Error('字段数据非法');
        }
        let _voucher_index = -1;
        let matchedData = data.filter(r => {
          if (
            r &&
            r.borrow_credit_voucher_details &&
            r.borrow_credit_voucher_details.includes &&
            r.borrow_credit_voucher_details.includes(filename) &&
            !dataVisited.includes(r)
          ) {
            _voucher_index = r.borrow_credit_voucher_details.indexOf(filename);
            return true;
          }
          return false;
        });
        if (!matchedData || !matchedData.length) {
          let err = `${filename} 无匹配数据，中断数据发送`;
          logger.info(err);
          yield promisifyPipingTempFile(file);
          throw new Error(err);
        }
        logger.info(`${filename} 开始上传OSS`);
        let result,
          ossEnd = Date.now() + 3600000,
          repeatExecutor = function*() {
            try {
              result = yield oss.putStream(`${appendUUID(filename)}`, file);
            } catch (e) {
              /** 多数为如cpu 被抢占中，等待一秒后重试，直到成功或超时为止*/
              yield promisifyTimeout(1000);
              if (Date.now() < ossEnd) {
                yield* repeatExecutor();
              } else {
                matchedData.forEach(r => {
                  r.borrow_credit_voucher_details.splice(_voucher_index, 1);
                });
                yield promisifyPipingTempFile(file);
                throw new Error(e);
              }
            }
          };
        yield* repeatExecutor();

        let dataReady = matchedData.filter(r => {
          if (_voucher_index !== -1) {
            r.borrow_credit_voucher_details[
              _voucher_index
            ] = `${filename}@#@${result.url
              .replace(/^http\:\/\/.+?\//, configure.oss.host)
              .trim()}`;
          }
          delete r._checked;
          return (
            Array.isArray(r.borrow_credit_voucher_details) &&
            r.borrow_credit_voucher_details.filter(t => t.includes('@#@'))
              .length === r.borrow_credit_voucher_details.length
          );
        });
        logger.info(`${filename} 上传OSS成功 地址${result.url}`);

        if (dataReady.length) {
          let finalVoucher = dataReady[0].borrow_credit_voucher_details.join('$|$'),
            thisBatch = [];
          dataReady.forEach(r => {
            r.borrow_credit_voucher_details = finalVoucher;
            if (!dataVisited.includes(r)) {
              dataVisited.push(r);
              executorQueue.push(
                (r => {
                  let resolver, rejector;
                  thisBatch.push(
                    new Promise((res, rej) => {
                      resolver = res;
                      rejector = rej;
                    })
                  );
                  return () =>
                    ropAPI('ruixue.edi.enterprise.credit.voucher.supplement', {
                      asset_org_code: org_code,
                      borrow_business_license: r.borrow_business_license,
                      borrow_credit_voucher_details:
                        r.borrow_credit_voucher_details,
                    })
                      .then(data => {
                        resolver(data);
                        data.data = Object.assign(data.data, r);
                        return data;
                      })
                      .catch(e => {
                        rejector(e);
                        throw e;
                      });
                })(r)
              );
              //thisBatch.push(promisify)
            }
          });
          return yield thisBatch;
        }
        return yield Promise.resolve();
      },
      err: e => {
        logger.error(e);
      },
    });

    thunkifyEvent({
      emitter: busboy,
      event: 'finish',
      gen: function*() {
        yield fieldThunk.collect();
        yield fileThunk.collect();
        let resultData = yield getIntervalPromise();
        let failed = [],
          succeed = [].concat.apply(
            [],
            resultData.map(r => {
              //r.data && (r.data.asset_org_code = org_code);
              if (!r.success) {
                failed.push(r.data);
                return [];
              }
              return [r.data];
            })
          );
        res.json({ success: true, failed, succeed });
      },
    });
  }).catch(e => {
    res.json({ success: false, message: (e && e.message) || '未知异常' });
  });
  return req.pipe(busboy);
});

router.post('/filterCorpAuthVoucher', (req, res, next) => {
  if (!req.session._button.includes('orders_voucher_download')) {
    next();
    return;
  }
  let connection, writeConnection;
  co(function*() {
    [connection, writeConnection] = yield [
      getConnectionQ(),
      getWriteConnectionQ(),
    ];
    let type = req.body.type;
    let Query = promisify(connection.query, { multiArgs: true });
    let {
        borrow_date_start,
        borrow_date_end,
        min_fee,
        max_fee,
        pageIndex,
        assetOrgCode,
        fundOrgCode,
        borrow_name,
        fund_credit_status,
        asset_credit_status,
      } = req.body,
      myPageIndex =
        isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1),
      params = Object.assign(
        getMySQLFieldValue({
          borrow_date_start,
          borrow_date_end,
          min_fee,
          max_fee,
          fundOrgCode,
          assetOrgCode,
          fund_credit_status,
          asset_credit_status,
          borrow_name,
          ...req.session.subUserDataRestriction,
        }),
        {
          [userDiffer(req.session.profile.user_type, [
            'admin_org_code',
            'fund_org_code',
            'asset_org_code',
          ])]: req.session.profile.org_code,
        }
      );
    let [rows] = yield Query.call(
      connection,
      type !== 2
        ? sqls.filterCorpAuthAssetVoucher
        : sqls.filterCorpAuthFundVoucher,
      params
    );

    res.json({
      success: true,
      rows,
    });
    return { params, total: rows.length };
  })
    .catch(function(err) {
      res.json({
        success: false,
        message: err.message || '查询失败',
      });
    })
    .then(result => {
      if (!result) {
        return;
      }
      let { params, total } = result;
      return co(function*() {
        let from_table = 't_order_voucher',
          from_org_code = req.session.profile.org_code,
          create_user_id = req.session.profile.user_id,
          create_sub_user_id = req.session.profile.sub_user_id,
          action_type = '导出';
        let oper_log = `动作：导出企业授信资料 ${total}条, 导出参数 ${JSON.stringify(
          params
        )}`;
        return yield writeOperTableLog(writeConnection, {
          from_table,
          from_org_code,
          create_user_id,
          create_sub_user_id,
          oper_log,
          action_type,
        });
      }).catch(err => {
        logger.error(err);
      });
    })
    .then(() => {
      connection && connection.release();
      writeConnection && writeConnection.release();
    });
});

router.post('/corpAuthVoucher', (req, res, next) => {
  let connection;
  co(function*() {
    connection = yield getConnectionQ();
    let Query = promisify(connection.query, {
      multiArgs: true,
    });
    let [rows] = yield Query.call(
      connection,
      sqls.corpAuthVoucher,
      getMySQLFieldValue(req.body)
    );
    res.json({
      success: true,
      rows,
    });
    return rows;
  })
    .catch(function(err) {
      res.json({
        success: false,
        message: err.message || '查询失败',
      });
    })
    .then(() => {
      connection && connection.release();
    });
});

router.get('/export', (req, res, next) => {
  if (!req.session.profile) {
    return res.status(404).send('无权下载');
  }
  if (!req.session._button.includes('corp_auth_export')) {
    return res.status(403).send('您无权做导出操作，请联系管理员');
  }

  let connection,
    writeConnection,
    outputFile = path.resolve(`${__dirname}/../../temp/${uuidv4()}`),
    xslx = path.resolve(`${__dirname}/../../temp/${uuidv4()}`);
  fs.closeSync(fs.openSync(outputFile, 'w'));
  co(function*() {
    [connection, writeConnection] = yield [
      getConnectionQ(req),
      getWriteConnectionQ(req),
    ];
    let Query = promisify(connection.query, { multiArgs: true }),
      Download = promisify(res.download);
    let {
        borrow_date_start,
        borrow_date_end,
        min_fee,
        max_fee,
        pageIndex,
        asset_org_code,
        fund_org_code,
        borrow_name,
        fund_credit_status,
        asset_credit_status,
      } = req.query,
      params = {
        ...getMySQLFieldValue({
          borrow_date_start,
          borrow_date_end,
          min_fee,
          max_fee,
          asset_org_code,
          fund_org_code,
          fund_credit_status: fund_credit_status && fund_credit_status.split(",")||null,
          asset_credit_status: asset_credit_status && asset_credit_status.split(",")||null,
          borrow_name,
          ...req.session.subUserDataRestriction,
        }),
        [userDiffer(req.session.profile.user_type, [
          'admin_org_code',
          'fund_org_code',
          'asset_org_code',
        ])]: req.session.profile.org_code,
      },
      qList = [];
    let [countRows] = yield Query.call(
      connection,
      req.session.profile.user_type !== 2 ? sqls.corpAssetAuthCount : sqls.corpFundAuthCount,
      params
    );
    if (!countRows || !countRows[0]) {
      throw new Error('无记录');
    }
    let { total } = countRows[0],
      pages = Math.ceil(total / configure.exportLimit);
    if (total > configure.exportMaxRows) {
      throw new Error(`导出量已超过上线 ${configure.exportMaxRows} 条`);
    }
    for (var i = 0; i < pages; i++) {
      qList.push(
        spawning(
          path.resolve(`${__dirname}/../spawn/corpAuthAssist.js`),
          req.session.profile.user_type,
          borrow_date_start,
          borrow_date_end,
          params.asset_org_code,
          params.fund_org_code,
          borrow_name,
          asset_credit_status,
          fund_credit_status,
          JSON.stringify(req.session.subUserDataRestriction || {}),
          i * configure.exportLimit,
          outputFile
        )
      );
    }
    yield qList;
    yield spawning(
      path.resolve(`${__dirname}/../spawn/json2xslx.js`),
      outputFile,
      xslx
    );
    yield Download.call(res, xslx, '企业授信导出.xlsx');
    return { params, total: countRows[0].total };
  })
    .catch(function(err) {
      if (res.headersSent) {
        logger.error(err);
      } else {
        res.status(404).send((err && err.message) || err || '发生错误');
      }
    })
    .then(result => {
      if (!result) {
        return;
      }
      let { params, total } = result;
      return co(function*() {
        let from_table = 't_enterprise_asset_credit',
          from_org_code = req.session.profile.org_code,
          create_user_id = req.session.profile.user_id,
          create_sub_user_id = req.session.profile.sub_user_id,
          action_type = '导出';
        let oper_log = `动作：导出企业授信 ${total}条, 导出参数 ${JSON.stringify(
          params
        )}`;
        return yield writeOperTableLog(writeConnection, {
          from_table,
          from_org_code,
          create_user_id,
          create_sub_user_id,
          oper_log,
          action_type,
        });
      }).catch(err => {
        logger.error(err);
      });
    })
    .then(() => {
      logger.info(res._headers);
      connection && connection.release();
      writeConnection && writeConnection.release();
      removefileIfExist(outputFile);
      removefileIfExist(xslx);
    });
});

router.post('/authResultMatch', upload.any(), (req, res, next) => {
  if (!req.files || !req.files.length) {
    res.json({ success: false, message: '请上传授信结果' });
    return;
  }
  let { mapper } = req.body,
    param = [
      path.resolve(`${__dirname}/../spawn/corpAuthAuthResultMatcher.js`),
      req.files[0].path,
      req.session.profile.org_code,
    ];
  if (mapper) {
    param.push(mapper);
  }
  co(function*() {
    let resultFile = yield spawning.apply(this, param);
    let resultData = JSON.parse(
      fs.readFileSync(resultFile, { encoding: 'utf8' })
    );
    if (Array.isArray(resultData.unmatched) && resultData.unmatched.length > 0 ) {
      res.json(resultData)
    } else {
      res.json({hiddleResult: true, ...resultData})
    }
    fs.unlinkSync(resultFile);
  })
    .catch(e => {
      res.json({ success: false, message: (e && e.message) || '未知异常' });
    })
    .then(() => {
      fs.unlinkSync(req.files[0].path);
    });
});

router.post('/authResultCreate', (req, res, next) => {
  let busboy = new BusBoy({
      headers: req.headers,
      limits: { fieldNameSize: 200, fieldSize: Infinity },
    }),
    data = {},
    executorQueue = [],
    getIntervalPromise = promisifyInterval(executorQueue, 10);
  let fieldThunk = thunkifyEvent({
    emitter: busboy,
    event: 'field',
    count: 1,
    gen: function*(
      fieldname,
      val,
      fieldnameTruncated,
      valTruncated,
      encoding,
      mimetype
    ) {
      if (fieldname == 'data') {
        data = JSON.parse(val);
      }
    },
  });

  thunkifyEvent({
    emitter: busboy,
    event: 'finish',
    gen: function*() {
      yield fieldThunk.collect();

      let details = JSON.parse(data.details),
        unmatched = [],
        matched = [],
        thisBatch = [];

      if (details.length) {
        details.forEach(r => {
          let {
            asset_org_code,
            borrow_business_license,
            fund_credit_fee,
            auth_result,
            refuse_reason,
          } = r;
          let is_success = auth_result == 1 ? 'true' : 'false';
          let new_fund_credit_fee = '';

          fund_credit_fee !== '' &&
            fund_credit_fee !== undefined &&
            (new_fund_credit_fee = 100 * fund_credit_fee);
          refuse_reason = refuse_reason ? refuse_reason : '';

          executorQueue.push(
            (r => {
              let resolver, rejector;
              thisBatch.push(
                new Promise((res, rej) => {
                  resolver = res;
                  rejector = rej;
                })
              );
              return () =>
                ropAPI(
                  'rong.edi.enterprise.credit.result.send',
                  Object.assign(
                    {
                      edi_user_id: req.session.profile.user_id,
                      fund_org_code: req.session.profile.org_code,
                    },
                    {
                      is_success,
                      borrow_business_license,
                      fund_credit_fee: new_fund_credit_fee,
                      refuse_reason,
                      asset_org_code,
                    }
                  )
                )
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
            })(r)
          );
        });
      }

      yield thisBatch;
      yield getIntervalPromise();

      if (unmatched.length > 0) {
        res.json({
          success: true,
          matched,
          unmatched,
          message: '有上传失败记录',
        });
      } else {
        res.json({success: true, matched, unmatched})
      }
    },
    err: e => {
      res.json({
        success: false,
        message: (e && e.message) || e || '发生异常',
      });
    },
  });
  return req.pipe(busboy);
});

module.exports = router;
