/**
 * @author robin
 * @file index
 * @date 2018-04-25 10:09
 */
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const {bridgeService, service:{spawningService, pagingSpawningService}} = require('../Common');
const { sequelizeDB } = require('../../../schema');
const Dao = require('./afterRepaymentDao');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const ropAPI = require('../../../ropAPI');
const {userDiffer, promisifyPipingTempFile, thunkifyEvent, logger, oss, appendUUID} = require('../../../util');

const search = async (params, req) => {
  const dao = Dao(req), user_type = req.session.profile.user_type
  /*if(user_type !== 2){
    const {rows, count:total} = await dao.pagingQuery(params)
    return {rows, total}
  } else {
    const [rows, [{total}]] = await Promise.all([
      dao.restrictedSearch(params),
      dao.restrictedCount(params)
    ])
    return {rows, total}
  }*/
  let {rows, count:total} = await ((user_type !== 2)? dao.pagingQuery(params):dao.restrictedSearch(params));
  return {rows, total}
};
const matcher = async (runner, param, files)=>{
  let filePaths = files.map(r=>r.path),
    myParam = _.isNil(param) || !Array.isArray(param) ? filePaths: [...filePaths,...param]
  return await spawningService(runner, myParam, filePaths)
}
const createNewDetail = async (busboy, req) => {
  let data = {};
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
      if (fieldname != "afterRepaymentOrderDetailFile") {
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
      data.detail_file_url = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
      return yield Promise.resolve()
    }
  })

  return thunkifyEvent({
    emitter: busboy, event: "finish", count:1, gen: function* () {
      yield fileThunk.collect()

      let details = JSON.parse(data.json_details)
      details.forEach(r => {
        !isNaN(r.remaining_total_fee) && (r.remaining_total_fee = Number((100*r.remaining_total_fee).toFixed(0)));
        !isNaN(r.remaining_principal_fee) && (r.remaining_principal_fee = Number((100*r.remaining_principal_fee).toFixed(0)));
        !isNaN(r.remaining_interest_fee) && (r.remaining_interest_fee = Number((100*r.remaining_interest_fee).toFixed(0)));
        !isNaN(r.current_balance) && (r.current_balance = Number((100*r.current_balance).toFixed(0)));
        !isNaN(r.paid_up_total_fee) && (r.paid_up_total_fee = Number((100*r.paid_up_total_fee).toFixed(0)));
        !isNaN(r.paid_up_principal_fee) && (r.paid_up_principal_fee = Number((100*r.paid_up_principal_fee).toFixed(0)));
        !isNaN(r.paid_up_interest_fee) && (r.paid_up_interest_fee = Number((100*r.paid_up_interest_fee).toFixed(0)));
        !isNaN(r.prepayment_fee) && (r.prepayment_fee = Number((100*r.prepayment_fee).toFixed(0)));
        !isNaN(r.overdue_poundage) && (r.overdue_poundage = Number((100*r.overdue_poundage).toFixed(0)));
        !isNaN(r.overdue_penalty) && (r.overdue_penalty = Number((100*r.overdue_penalty).toFixed(0)));
      })
      data.json_details = JSON.stringify(details)

      let apiResult = yield ropAPI("ruixue.edi.after.repayment.order.create", {...data,
        [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code})
      if (apiResult.success) {
        return apiResult
      } else {
        return Object.assign(apiResult, {message: apiResult.data._reason})
      }
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect()
};

const changeStatus = async (body={}, req) => {
  body.order_status = (body.order_status === '002') ? 'A':'Z'
  let result = await ropAPI("ruixue.edi.after.repayment.order.status.update", body)

  if (result.success) {
    return result
  } else {
    return {...result, message: result.data._reason}
  }
};

module.exports = bridgeService({
  search,
  matcher,
  createNewDetail,
  changeStatus,
}, Dao);
