/**
 * @author robin
 * @file index
 * @date 2018-04-26 16:37
 */
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const {bridgeService, service:{spawningService, pagingSpawningService}} = require('../Common');
const { sequelizeDB } = require('../../../schema');
const Dao = require('./personalPublicityDao');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const ropAPI = require('../../../ropAPI');
const sms = require("../../../sms");
const {promisifyInterval, promisifyPipingTempFile, thunkifyEvent, logger, oss, appendUUID} = require('../../../util');

const search = async (params, req) => {
  const dao = Dao(req)
  let [countRows, rows] = await Promise.all([dao.count(params), dao.query(params),])
  if (!countRows[0].get("total") || !rows || !rows[0]) {
    throw new Error("无记录")
  }
  return {
    rows,
    totalItemCount: countRows[0].get("total"),
    totalCount: countRows[0].get("total_count"),
    successCount: countRows[0].get("finish_count"),
    failCount: countRows[0].get("fail_count")
  }
};
const matcher = async (runner, param, files)=>{
  let filePaths = files.map(r=>r.path),
    myParam = _.isNil(param) || !Array.isArray(param) ? filePaths: [...filePaths,...param]
  return await spawningService(runner, myParam, filePaths)
}

const create = async ({data=[], param, userDif}, req) => {
  const dao = Dao(req)
  // 分别对上传借款人，企业平台订单号，企业资产订单号3个维度进行搜索
  let queryCollection = await Promise.all([].concat.apply([],data.map(r=>{
    let {order_no, asset_order_no} = r, qs = []
    if(r.borrow_name || r.borrow_certificate_no || r.borrow_name || r.borrow_name){
      qs.push(Promise.resolve([{
        borrow_name:r.borrow_name,borrow_certificate_no:r.borrow_certificate_no,
        borrow_phone:r.borrow_phone,borrow_card_no:r.borrow_card_no
      }]))
    }

    if (order_no){
      qs.push(dao.orderQuery({order_no, ...userDif}).then((rows)=>rows.map(j=>({
        borrow_name:j.borrow_name,borrow_certificate_no:j.borrow_certificate_no,
        borrow_phone:j.borrow_phone,borrow_card_no:j.borrow_card_no
      }))))
    }

    if (asset_order_no){
      qs.push(dao.orderQuery({asset_order_no, ...userDif}).then((rows)=>rows.map(j=>({
        borrow_name:j.borrow_name,borrow_certificate_no:j.borrow_certificate_no,
        borrow_phone:j.borrow_phone,borrow_card_no:j.borrow_card_no
      }))))
    }

    return qs
  })))

  let mergedCollection = [].concat.apply([],queryCollection)
  let queryData = [...new Set(mergedCollection.map(r=>r.borrow_certificate_no))].map(r=>mergedCollection.find(j=>j.borrow_certificate_no === r));

  let [countCollection,piCount] = await Promise.all([
    Promise.all(queryData.map(r=>dao.publicityDetailQuery({...r, ...param}))),
    dao.publicityQuery(param)
  ]);

  if (piCount > 0){
    throw new Error("任务名重复或数据异常")
  } else if(countCollection.find(r=>r > 0)){
    throw new Error("任务明细重复")
  }

  const t = await sequelizeDB.transaction();
  let detailParam = queryData.map(r=>({...r,...param, task_status: "1"})),
    piParam =  {...param, task_status: "1", total_count: data.length}
  try {
    await Promise.all([
      ...detailParam.map(r=>dao.createPublicityDetail(r,t)), dao.createPublicity(piParam,t)
    ]);
    await t.commit();
  } catch (e) {
    await t.rollback();
    throw new Error(e.message || '插入企业征信信息爬取任务失败');
  }

  let pi = {...piParam};
  let row = await ropAPI("ruixue.edi.individual.crawler.information", param)
  if(row.success){
    return {succeed: pi}
  } else {
    if(row.error_code !== 2){
      let statusUpdater = async (count) =>{
        const tl = await sequelizeDB.transaction();
        try {
          await Promise.all([
            ...detailParam.map(r=>dao.updatePublicityDetail({...r, task_status: "3"},tl)),
            dao.updatePublicity({...param, task_status: "3"},tl)
          ]);
          await tl.commit();
        } catch (e) {
          await tl.rollback();
          await promisifyTimeout(1000)
          if (isNaN(count) || (count<1)) {
            logger.error(e.message||"调用ROP接口发生错误")
          } else {
            await statusUpdater(count - 1)
          }
        }
      }
      await statusUpdater()
    } else {
      await dao.updatePublicity({...param, task_status: "3"})
    }
    return {failed: pi, reason: row.data._reason}
  }
};

const searchAll = async (params, req) => {
  const dao = Dao(req)
  let rows = await dao.queryAll(params)
  if (!rows || !rows[0]) {
    throw new Error("无记录")
  }
  return {rows,}
};

module.exports = bridgeService({
  search,
  matcher,
  create,
  searchAll
}, Dao);
