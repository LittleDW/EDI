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
const Dao = require('./financeRepaymentDao');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const ropAPI = require('../../../ropAPI');
const {userDiffer, promisifyPipingTempFile, thunkifyEvent, logger, oss, appendUUID} = require('../../../util');

const search = async (params, req) => {
  const dao = Dao(req)
  let {rows, count:total} = await dao.pagingQuery(params)
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
      if (fieldname != "repaymentFile") {
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
      data.repayment_file_url = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
      return yield Promise.resolve()
    }
  })

  return thunkifyEvent({
    emitter: busboy, event: "finish", count:1, gen: function* () {
      yield fileThunk.collect()

      let repayment_details = JSON.parse(data.repayment_details)
      repayment_details.forEach(r => {
        !isNaN(r.account_fee) && (r.account_fee = Number((100*r.account_fee).toFixed(0)));
        !isNaN(r.interest_total_fee) && (r.interest_total_fee = Number((100*r.interest_total_fee).toFixed(0)));
        !isNaN(r.service_total_fee) && (r.service_total_fee = Number((100*r.service_total_fee).toFixed(0)));
        !isNaN(r.repayment_principal_fee) && (r.repayment_principal_fee = Number((100*r.repayment_principal_fee).toFixed(0)));
        !isNaN(r.repayment_interest_fee) && (r.repayment_interest_fee = Number((100*r.repayment_interest_fee).toFixed(0)));
        !isNaN(r.repayment_all_fee) && (r.repayment_all_fee = Number((100*r.repayment_all_fee).toFixed(0)));
        !isNaN(r.interest_rate) && (r.interest_rate = Number(Number(r.interest_rate).toFixed(4)));
      })
      data.repayment_details = JSON.stringify(repayment_details)
      data.repayment_principal_fee = Number((100*data.repayment_principal_fee).toFixed(0))
      data.repayment_interest_fee = Number((100*data.repayment_interest_fee).toFixed(0))
      data.repayment_total_fee = Number((100*data.repayment_total_fee).toFixed(0))

      let apiResult = yield ropAPI("rong.edi.finance.repayment.create", {
        edi_user_id: req.session.profile.user_id, ...data,
        [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code
      })
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

const changeStatus = async (body, req) => {
  const dao = Dao(req)
  let {current_status, repayment_code, target_status, action_name} = body, params = {repayment_code, page_index: 0}
  let bill = await dao.query(params)
  if (!bill) {
    throw new Error('没查到要操作的订单记录')
  }
  if (bill.get("repayment_status") !== current_status) {
    throw new Error('该订单的状态已更新，请重试')
  }
  params = {repayment_code, repayment_status: target_status,action_type:`还款对账单${action_name}`}

  let [affectedCount] = await dao.update({...params, [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code})

  if (!affectedCount) {
    throw new Error('未成功更新该订单状态，请重试')
  }

  // 调用存储过程，异步
  if (target_status === '006') {
    dao.confirmInvoke(params).catch(e=>logger.error(e || "存储过程发生异常"))
  }
};

const changeStatusUpload = async (busboy, req) => {
  const dao = Dao(req);
  let param = {};
  let fieldThunk = thunkifyEvent({emitter: busboy, event: 'field',
    gen: function* (fieldname, val, fieldnameTruncated) {
      param[fieldname] = val
    }
  })
  let fileThunk = thunkifyEvent({emitter: busboy, event: 'file',
    gen: function* (fieldname, file, filename, encoding, mimetype) {
      let result = yield oss.putStream(`${appendUUID(filename)}`, file)
      param[fieldname] = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
      return Promise.resolve()
    }
  })
  return thunkifyEvent({
    emitter: busboy, event: "finish", count:1, gen: function* () {
      yield fieldThunk.collect()
      yield fileThunk.collect()
      let c_param = {
        repayment_code: param['repayment_code'],
        page_index: 0
      }
      let {rows} = yield dao.pagingQuery(c_param)
      if (!rows || rows.length === 0) {
        throw new Error('没查到要操作的订单记录')
      }
      let bill = rows[0]
      if (bill["repayment_status"] !== '004') {
        throw new Error('该订单的状态已更新，请重试')
      }
      let [affectedCount] = yield dao.update({...param,
        [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code,
        action_type:`添加/修改还款对账单`
      })

      if (!affectedCount) {
        throw new Error('无需要更新的字段')
      }
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect()
};

module.exports = bridgeService({
  search,
  matcher,
  createNewDetail,
  changeStatus,
  changeStatusUpload,

}, Dao);
