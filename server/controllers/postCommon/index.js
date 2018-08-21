/**
 * @author robin
 * @file index
 * @date 2018-03-30 12:54
 * @feature：所有http请求的入口，用于解析cookie，提取session，记录访问，验证登录，登录日志，调用字典，登出等共通的接口
 */
var path = require("path"), _=require("lodash"),
  cookieParser = require('cookie-parser'), bodyParser = require('body-parser'), {session} = require('../../session'),
  configure = require('../../../config/configure.json')[process.env.NODE_ENV],
  {logger, getMySQLFieldValue, promisifyInterval, getSurvivingDays, thunkifyEvent} = require("../../util"),
  svgCaptcha = require('svg-captcha'),
  {getDictionary, login, loginLog, loginLogCount, loginLogQuery} = require('../../services').business.postCommon;


const orderSupplementCtrl = async (req, res, next) => {
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: 5242880}}),
    executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10), data, org_code, dataVisited = [];

  try{
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
  } catch (e){
    res.json({success: false, message: e && e.message || "未知异常"});
  }
  return req.pipe(busboy);
};



module.exports = {
  orderSupplementCtrl
};
