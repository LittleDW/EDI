
/**
 * @author robin
 * @file index
 * @date 2018-04-03 15:36
 */
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const {bridgeService, service:{spawningService, pagingSpawningService}} = require('../Common');
const { sequelizeDB } = require('../../../schema');
const Dao = require('./orderDao');
const CommonDao = require('../Common/commonDao');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const ropAPI = require('../../../ropAPI');
const {promisifyInterval, promisifyPipingTempFile, thunkifyEvent, logger, oss, appendUUID,getMySQLFieldValue, promisifyTimeout} = require('../../../util');

const search = async (params, req) => {
  const dao = Dao(req), commonDao = CommonDao(req)
  let [countRows, rows, deadLines] = await Promise.all([
    dao.count(params),
    dao.query(params),
    commonDao.deadline()
  ])
  if (!countRows[0].get("total") || !deadLines || !deadLines.length) {
    throw new Error("无记录")
  }
  return {
    rows,
    total: countRows[0].get("total"),
    fee: countRows[0].get("fee"),
    deadLines
  }
};
const create = async (busboy, req) => {
  let executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 200), data, org_code, fund_org_code,
    dataVisited = [], firedFieldEventCount = 0;

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
      firedFieldEventCount++
      if(firedFieldEventCount === 3){
        let dataReady = data.filter(r=>r && r.borrow_voucher_details && Array.isArray(r.borrow_voucher_details)
          && r.borrow_voucher_details.length
          && (r.borrow_voucher_details.filter(s=>s.includes("@#@")).length === r.borrow_voucher_details.length))
          .map(r=>{
            delete r._checked
            r.borrow_voucher_details = r.borrow_voucher_details.join("$|$")
            return r
          })
        dataReady.forEach(r => {
          if (!dataVisited.includes(r)) {
            dataVisited.push(r)
            executorQueue.push(((r) => {
              return () => ropAPI("ruixue.edi.order.apply.create", Object.assign({
                asset_org_code: org_code,
                fund_org_code
              }, r), "refuse_reason").then((result) => {
                return result
              }).catch(e => {
                throw e
              })
            })(r))
          }
        })
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
        logger.error(err)
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
          r.borrow_voucher_details[_voucher_index] = `${filename}@#@${result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim()}`
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
      //return yield Promise.resolve()
    }
  })

  return await thunkifyEvent({
    emitter: busboy, event: "finish",count: 1,gen: function* () {
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

      return {failed, succeed}
      /*if(socket){
        socket.close()
      }*/
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect()
};

const matcher = async (runner, param, files)=>{
  let filePaths = files.map(r=>r.path),
    myParam = _.isNil(param) || !Array.isArray(param) ? filePaths: [...filePaths,...param]
  return await spawningService(runner, myParam, filePaths)
}

const supplement = async (busboy, req) => {
  let executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10), data, org_code, dataVisited = [],
    firedFieldEventCount = 0;
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
      firedFieldEventCount++;
      if(firedFieldEventCount === 2){
        let dataReady = data.filter(r=>r && r.borrow_voucher_details && Array.isArray(r.borrow_voucher_details)
          && r.borrow_voucher_details.length
          && (r.borrow_voucher_details.filter(s=>s.includes("@#@")).length === r.borrow_voucher_details.length))
          .map(r=>{
            delete r._checked
            r.borrow_voucher_details = r.borrow_voucher_details.join("$|$")
            return r
          })
        dataReady.forEach(r=>{
          if (!dataVisited.includes(r)) {
            dataVisited.push(r)
            executorQueue.push(((r) => {
              return () => ropAPI("ruixue.edi.order.voucher.supplement", {
                asset_org_code: org_code,
                ...r
              }).then((data) => {
                data.data = Object.assign(data.data, r)
                return data
              }).catch(e => {
                throw e
              })
            })(r))
          }
        })
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
    }
  })

  return await thunkifyEvent({
    emitter: busboy, event: "finish", count:1, gen: function* () {
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
      return {failed, succeed}
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect()
};

const orderExportService = async (params, req)=>{
  const dao = Dao(req);
  let countRows = await dao.count(params)
  if (!countRows || !countRows[0]) {
    throw new Error("无记录")
  }
  let total = countRows[0].get("total"), pages = Math.ceil(total / configure.exportLimit);
  if (total > configure.exportMaxRows) {
    throw new Error(`导出量已超过上线 ${configure.exportMaxRows} 条`)
  }
  let { asset_order_no, order_no, borrow_date_start, borrow_date_end, create_time_start, create_time_end, order_status,
    fund_org_code, asset_org_code, deadline_from, deadline_to, borrow_certificate_no} = params
  let xslx = await pagingSpawningService(
    path.resolve(`${__dirname}/../../../spawn/orderAssist.js`),
    [
      req.session.profile.user_type, asset_order_no, order_no, borrow_date_start, borrow_date_end,create_time_start,
      create_time_end,Array.isArray(order_status)?order_status.join(","):'',fund_org_code,asset_org_code,deadline_from,
      deadline_to,borrow_certificate_no, JSON.stringify(req.session.subUserDataRestriction || {})
    ],
    pages
  )
  return {xslx, total}
}

const checkResultCreate = async (busboy, req) => {
  let data = {}, executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10);
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

  return await thunkifyEvent({
    emitter: busboy, event: "finish", count: 1, gen: function* () {
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
        return {matched, unmatched, message: "有上传失败记录"}
      } else {
        return {matched, unmatched}
      }

    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect()
};

const accountDetailCreate = async (busboy, req) => {
  let data = {}, executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10);
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

  return await thunkifyEvent({
    emitter: busboy, event: "finish", count: 1, gen: function* () {
      yield fieldThunk.collect()

      let details = JSON.parse(data.details), unmatched = [], matched = [], thisBatch = []

      if (details.length) {
        details.forEach(r => {

          let new_account_fee = "", new_payment_fee = "";

          (r.account_fee !== "") && (r.account_fee !== undefined) && (new_account_fee = Number((100 * r.account_fee).toFixed(0)));
          (r.payment_fee !== "") && (r.payment_fee !== undefined) && (new_payment_fee = Number((100 * r.payment_fee).toFixed(0)));

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
        return {matched, unmatched, message: "有上传失败记录"}
      } else {
        return {matched, unmatched}
      }

    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect()
};

const contractSupplymentCreate = async (busboy, req) => {
  let data = {},
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

  return await thunkifyEvent({
    emitter: busboy, event: "finish", count: 1, gen: function* () {
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
        return {matched, unmatched, message: "有上传失败记录"}
      } else {
        return {matched, unmatched}
      }

    }, err: (e) => {
      return {success: false, message: e.message || "发生异常"}
    }
  }).collect()
};

module.exports = bridgeService({
  search,
  create,
  matcher,
  supplement,
  orderExportService,
  checkResultCreate,
  accountDetailCreate,
  contractSupplymentCreate
}, Dao);

