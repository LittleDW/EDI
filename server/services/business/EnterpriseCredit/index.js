/**
 * @author robin
 * @file index
 * @date 2018-04-13 17:07
 */
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const {bridgeService, service: {spawningService, pagingSpawningService}} = require('../Common');
const {sequelizeDB} = require('../../../schema');
const Dao = require('./enterpriseCreditDao');
//const CommonDao = require('../Common/commonDao');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const ropAPI = require('../../../ropAPI');
const {promisifyInterval, promisifyPipingTempFile, thunkifyEvent, logger, oss, appendUUID} = require('../../../util');

const search = async (params, req) => {
  const dao = Dao(req)
  let count, rows;
  if (params.type !== 2) {
    [count, rows] = await Promise.all([dao.assetCount(params), dao.assetQuery(params)])
  } else {
    [count, rows] = await Promise.all([dao.fundCount(params), dao.fundQuery(params)])
  }
  if (!count) {
    throw new Error('无记录');
  }
  return {rows, total: count};
};

const matcher = async (runner, param, files) => {
  let filePaths = files.map(r => r.path),
    myParam = _.isNil(param) || !Array.isArray(param) ? filePaths : [...filePaths, ...param]
  return await spawningService(runner, myParam, filePaths)
}

const create = async (busboy, req) => {
  let executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 200), data = [], org_code,
    dataVisited = [];
  let fieldThunk = thunkifyEvent({
    emitter: busboy, event: 'field', count: 2,
    gen: function* (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
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
  });

  let fileThunk = thunkifyEvent({
    emitter: busboy, event: 'file',
    gen: function* (fieldname, file, filename, encoding, mimetype) {
      yield fieldThunk.collect();
      if (!Array.isArray(data) || typeof org_code != 'string') {
        yield promisifyPipingTempFile(file);
        throw new Error('字段数据非法');
      }
      let _voucher_index = -1;
      let matchedData = data.filter(r => {
        if (r && r.borrow_credit_voucher_details && r.borrow_credit_voucher_details.includes &&
          r.borrow_credit_voucher_details.includes(filename) && !dataVisited.includes(r)) {
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
      let result, ossEnd = Date.now() + 3600000, repeatExecutor = function* () {
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
          r.borrow_credit_voucher_details[_voucher_index] =
            `${filename}@#@${result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim()}`;
        }
        delete r._checked;
        return (
          Array.isArray(r.borrow_credit_voucher_details) &&
          r.borrow_credit_voucher_details.filter(t => t.includes('@#@')).length === r.borrow_credit_voucher_details.length
        );
      });
      logger.info(`${filename} 上传OSS成功 地址${result.url}`);

      if (dataReady.length) {
        let finalVoucher = dataReady[0].borrow_credit_voucher_details.join('$|$'), thisBatch = [];
        dataReady.forEach(r => {
          r.borrow_credit_voucher_details = finalVoucher;
          if (!dataVisited.includes(r)) {
            dataVisited.push(r);
            executorQueue.push(
              (r => {
                let resolver, rejector, param = {...r, asset_org_code: org_code};
                thisBatch.push(
                  new Promise((res, rej) => {
                    resolver = res;
                    rejector = rej;
                  })
                );
                if (!isNaN(r.paid_in_capital)) {
                  param.paid_in_capital = Number((100 * Number(r.paid_in_capital)).toFixed(0));
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
      //return yield Promise.resolve();
    },
  });

  return await thunkifyEvent({
    emitter: busboy,
    event: 'finish',
    count: 1,
    gen: function* () {
      yield fieldThunk.collect();
      yield fileThunk.collect();
      let resultData = yield getIntervalPromise();
      let failed = [],
        succeed = [].concat.apply([], resultData.map(r => {
            //r.data && (r.data.asset_org_code = org_code);
            if (!r.success) {
              failed.push(r.data);
              return [];
            }
            return [r.data];
          })
        );
      return {failed, succeed};
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect();
};

const supplement = async (busboy, req) => {
  let executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 200), data = [],
    org_code, dataVisited = [];
  let fieldThunk = thunkifyEvent({
    emitter: busboy,
    event: 'field',
    count: 2,
    gen: function*(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
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
  });

  let fileThunk = thunkifyEvent({emitter: busboy, event: 'file',
    gen: function*(fieldname, file, filename, encoding, mimetype) {
      yield fieldThunk.collect();
      if (!Array.isArray(data) || typeof org_code != 'string') {
        yield promisifyPipingTempFile(file);
        throw new Error('字段数据非法');
      }
      let _voucher_index = -1;
      let matchedData = data.filter(r => {
        if (r && r.borrow_credit_voucher_details && r.borrow_credit_voucher_details.includes &&
          r.borrow_credit_voucher_details.includes(filename) && !dataVisited.includes(r)) {
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
      let result, ossEnd = Date.now() + 3600000, repeatExecutor = function*() {
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
          r.borrow_credit_voucher_details[_voucher_index] =
            `${filename}@#@${result.url.replace(/^http\:\/\/.+?\//, configure.oss.host).trim()}`;
        }
        delete r._checked;
        return (
          Array.isArray(r.borrow_credit_voucher_details) &&
          r.borrow_credit_voucher_details.filter(t => t.includes('@#@')).length === r.borrow_credit_voucher_details.length
        );
      });
      logger.info(`${filename} 上传OSS成功 地址${result.url}`);

      if (dataReady.length) {
        let finalVoucher = dataReady[0].borrow_credit_voucher_details.join(
          '$|$'
          ),
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
    },
  });

  return await thunkifyEvent({emitter: busboy, event: 'finish', count:1,
    gen: function*() {
      yield fieldThunk.collect();
      yield fileThunk.collect();
      let resultData = yield getIntervalPromise();
      let failed = [],
        succeed = [].concat.apply([],
          resultData.map(r => {
            //r.data && (r.data.asset_org_code = org_code);
            if (!r.success) {
              failed.push(r.data);
              return [];
            }
            return [r.data];
          })
        );
      return { failed, succeed };
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect();
};

const authResultCreate = async (busboy, req) => {
  let data = {}, executorQueue = [], getIntervalPromise = promisifyInterval(executorQueue, 10);
  let fieldThunk = thunkifyEvent({emitter: busboy, event: 'field', count: 1,
    gen: function*(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      if (fieldname == 'data') {
        data = JSON.parse(val);
      }
    },
  });

  return await thunkifyEvent({emitter: busboy, event: 'finish', count:1,
    gen: function*() {
      yield fieldThunk.collect();
      let details = JSON.parse(data.details), unmatched = [], matched = [], thisBatch = [];

      if (details.length) {
        details.forEach(r => {
          let {asset_org_code, borrow_business_license, fund_credit_fee, auth_result, refuse_reason,} = r;
          let is_success = auth_result == 1 ? 'true' : 'false';
          let new_fund_credit_fee = '';

          fund_credit_fee !== '' &&
          fund_credit_fee !== undefined &&
          (new_fund_credit_fee = Number((100 * fund_credit_fee).toFixed(0)));
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
                  {
                    edi_user_id: req.session.profile.user_id,
                    fund_org_code: req.session.profile.org_code,
                    is_success,
                    borrow_business_license,
                    fund_credit_fee: new_fund_credit_fee,
                    refuse_reason,
                    asset_org_code,
                  }
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
        return {matched, unmatched, message: '有上传失败记录',};
      } else {
        return {matched, unmatched}
      }
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect();
};
const enterpriseCreditExport = async (params, req)=>{
  const dao = Dao(req);
  let total = await ((req.session.profile.user_type !== 2)? dao.assetCount(params) : dao.fundCount(params))
  if (!total) {
    throw new Error("无记录")
  }
  let pages = Math.ceil(total / configure.exportLimit);
  if (total > configure.exportMaxRows) {
    throw new Error(`导出量已超过上线 ${configure.exportMaxRows} 条`)
  }
  let { borrow_date_start, borrow_date_end, asset_org_code, fund_org_code, borrow_name, asset_credit_status, fund_credit_status} = params
  let xslx = await pagingSpawningService(
    path.resolve(`${__dirname}/../../../spawn/corpAuthAssist.js`),
    [
      req.session.profile.user_type, borrow_date_start, borrow_date_end,
      asset_org_code || "", fund_org_code || "",
      borrow_name,
      Array.isArray(asset_credit_status)?asset_credit_status.join(","):'',
      Array.isArray(fund_credit_status)?fund_credit_status.join(","):'',
      JSON.stringify(req.session.subUserDataRestriction || {})
    ],
    pages
  )
  return {xslx, total}
}
const filterCorpAuthVoucher = async (params, req) => {
  const dao = Dao(req)
  let rows;
  if (params.type !== 2) {
    rows = await dao.assetVoucher(params)
  } else {
    rows = await dao.fundVoucher(params)
  }
  return rows;
};

module.exports = bridgeService({
  search,
  matcher,
  create,
  supplement,
  authResultCreate,
  enterpriseCreditExport,
  filterCorpAuthVoucher
}, Dao);
