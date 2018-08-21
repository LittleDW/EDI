/**
 * @author robin
 * @file index
 * @date 2018-04-24 12:51
 */
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const {bridgeService, service:{spawningService, pagingSpawningService}} = require('../Common');
const { sequelizeDB } = require('../../../schema');
const Dao = require('./financeLoanDao');
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
      if (fieldname === "data") {
        data = JSON.parse(val)
      }
    }
  })

  let fileThunk = thunkifyEvent({
    emitter: busboy, event: "file", gen: function* (fieldname, file, filename, encoding, mimetype) {
      yield fieldThunk.collect()
      let property
      if (fieldname === "loanVoucherFile") {
        property = "account_voucher_url"
      } else if (fieldname === "loanFile") {
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

  return thunkifyEvent({
    emitter: busboy, event: "finish", count:1, gen: function* () {
      yield fieldThunk.collect()
      yield fileThunk.collect()
      let loan_details = JSON.parse(data.loan_details)
      loan_details.forEach(r => {
        !isNaN(r.account_fee) && (r.account_fee = Number((100 * r.account_fee).toFixed(0)));
        !isNaN(r.interest_total_fee) && (r.interest_total_fee = Number((100*r.interest_total_fee).toFixed(0)));
        !isNaN(r.service_total_fee) && (r.service_total_fee = Number((100*r.service_total_fee).toFixed(0)));
        !isNaN(r.interest_rate) && (r.interest_rate = Number(Number(r.interest_rate).toFixed(4)));
      })
      data.loan_details = JSON.stringify(loan_details)
      data.account_fee = Number((100*data.account_fee).toFixed(0))

      let apiResult = yield ropAPI("rong.edi.finance.loan.create", {
        edi_user_id: req.session.profile.user_id, ...data,
        [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code
      })
      if (apiResult.success) {
        return apiResult
      } else {
        return {...apiResult, message: apiResult.data._reason}
      }
    },
    err: e => {
      return {success: false, message: e.message || "更新失败"}
    }
  }).collect()
};

const changeStatus = async (body, req) => {
  const dao = Dao(req)
  let {current_status, loan_code, target_status, action_name} = body, params = {loan_code, page_index: 0}
  let bill = await dao.query(params)
  if (!bill) {
    throw new Error('没查到要操作的订单记录')
  }
  if (bill.get("loan_status") !== current_status) {
    throw new Error('该订单的状态已更新，请重试')
  }
  if (target_status === '003' && bill.get("data_from") === 'B' && moment().diff(moment(bill.rx_insertTime), 'days') > 7) {
    throw new Error('不能废弃超过一周的历史对账单')
  }
  params = {loan_code, loan_status: target_status,action_type:`放款对账单${action_name}`}

  let [affectedCount] = await dao.update({...params, [userDiffer(req.session.profile.user_type, ['admin_org_code', 'fund_org_code', 'asset_org_code'])]: req.session.profile.org_code})

  if (!affectedCount) {
    throw new Error('未成功更新该订单状态，请重试')
  }

  // 调用存储过程，异步
  if (target_status === '004' || target_status === '003') {
    dao.confirmInvoke(params).catch(e=>logger.error(e || "存储过程发生异常"))
  }
};

module.exports = bridgeService({
  search,
  matcher,
  createHistoricalDetail,
  createNewDetail,
  changeStatus
}, Dao);
