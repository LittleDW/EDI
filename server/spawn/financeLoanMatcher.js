/**
 * 作者：石奇峰
 * 功能：放款对账单匹配器，用于防止解析excel大文件造成的阻塞所做
 * 相似：还款对账单匹配器，服务费对账单匹配器
 * */

var pool = require('../pool').writePool, sqls = require("../../config/sqls.json")
var {logger, XLSX, BlueBird, co, promisify, getMySQLFieldValue, getSheetNumberValue, getSheetPercentValue, getSheetValue, getSheetDateValue, getSheetMonthValue,getSheetSuffixValue, killSubProcess} = require("../util")

process.on('uncaughtException', (err) => {
  logger.info(err)
  if (process.send) {
    process.send({
      success: false,
      message: err && err.message || "服务器出错"
    });
  }
  setTimeout(function () {
    process.exit()
  }, 200)
});
logger.info(`子进程启动，pid = ${process.pid}, argv = ${JSON.stringify(process.argv)}`)

// 取得参数数据
let unmatched = [], matched = [], [file, org_code, old_map] = process.argv.slice(2), workbook = XLSX.readFile(file),
  sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];
if (!sheet) {
  throw new Error("上传xlsx没有任何sheet页")
}
let parsedData = XLSX.utils.sheet_to_json(sheet), headerRow = XLSX.utils.sheet_to_csv(sheet).split("\n")[0],
  headers = headerRow && headerRow.split(",").filter(r => r) || [],
  predefinedHeaders = [
    "标的编号", "标的名称", "借款人名称", "业务推荐方名称", "业务推荐方简称", "收款方名称", "满标日期", "出账日期", "到账日期",
    "出账金额（元）", "借款到期日", "计息方式", "计息天数", "借款利率", "服务费率", "综合费率", "本息还款方式", "服务费结算方式",
    "本金总期数", "利息总期数", "服务费总期数", "每期还款日", "利息总额（元）", "服务费总额（元）", "服务费结算月份", "备注"
  ], predefinedRepaymentMode = [
    "到期还本付息", "按月付息到期还本", "按月等额本息", "按月等额本金", "按周付息到期还本", "按周等额本息", "按周等额本金", "其它"
  ], predefinedServiceFeeMode = [
    "出账次月结算", "付息时结算", "付息次月结算", "还本时结算", "还本次月结算", "其它"
  ], ngHeader, resultString, promise, map = old_map && JSON.parse(old_map) || undefined

ngHeader = headers.find(r => !predefinedHeaders.includes(r))
if(!ngHeader){
  ngHeader = predefinedHeaders.find(r=>!headers.includes(r));
}
if(!Array.isArray(parsedData) || !parsedData.length){
  throw new Error("上传文件无数据")
}
/**
 * 如果表头不匹配，先看用户有没有上传mapper，再看数据库里有没有mapper，如果header都不匹配，再返回数据库里的mapper
 * */
if (ngHeader) {
  let runner = (newMap,dbheader) => {
    map = newMap
    /*logger.info(JSON.stringify(map))
    logger.info(JSON.stringify(headers))*/

    if (map) {
      let newHeaders = [];
      parsedData = parsedData.map(r => {
        let item = {}
        /*headers.forEach(t => {
          var found = map.find(s => (s.value == t))
          if (found) {
            var R = found.label;
            item[R] = r[t]
            !newHeaders.includes(R) && newHeaders.push(R)
          }
        })*/

        map.forEach(s=>{
          var found = headers.find(t => (s.value == t))
          if (found) {
            var R = s.label;
            item[R] = r[found]
            !newHeaders.includes(R) && newHeaders.push(R)
          // 可以置空，置空时无视，但是为了允许修改必须让用户能够再次修改，故增加_initialized字段，如果置空第二次重新选择
          } else if (!s.value){
            var R = s.label;
            item[R] = undefined
            !newHeaders.includes(R) && newHeaders.push(R)
          }
        })
        return item
      })
      ngHeader = newHeaders.find(r => !predefinedHeaders.includes(r));
      if (!ngHeader) {
        ngHeader = predefinedHeaders.find(r => !newHeaders.includes(r));
      }
    }

    if(!ngHeader && dbheader){
      ngHeader = dbheader.find(r=>!headers.includes(r));
      if(!ngHeader){
        ngHeader = headers.find(r=>!dbheader.includes(r));
      }
    }
  }, dbrunner = () => {
    let getConnectionQ = promisify(pool.getConnection), connection
    return co(function* () {
      connection = yield getConnectionQ.call(pool)
      let Query = promisify(connection.query, {multiArgs: true});
      let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "001"}));
      if (rows[0]) {
        let obj = JSON.parse(rows[0].mode_content)
        if(obj.hasOwnProperty("_map") && obj.hasOwnProperty("_headers") && (Object.keys(obj).length === 2)){
          let {_map:dbmap,_headers:dbheaders} = obj
          runner(dbmap,dbheaders)
        } else {
          runner(obj)
        }
      }
      return Promise.resolve()
    }).catch(function (err) {
      logger.error(err)
    }).then(() => {
      connection && connection.release();
    });
  }

  if (map) {
    runner(map)
    promise = Promise.resolve()
    /*if(ngHeader){
      promise = dbrunner()
    } else {
      promise = Promise.resolve()
    }*/
  } else {
    promise = dbrunner()
  }
  /**
   * 执行重新匹配计算
   * */
} else {
  let getConnectionQ = promisify(pool.getConnection), connection
  promise = co(function* () {
    connection = yield getConnectionQ.call(pool)
    let Query = promisify(connection.query, {multiArgs: true});
    yield Query.call(connection, sqls.deleteOrgMode, getMySQLFieldValue({org_code, mode_type: "001"}));
  }).catch(function (err) {
    logger.error(err)
  }).then(() => {
    connection && connection.release();
  });
}

promise.then(() => {
  if (ngHeader) {
    resultString = JSON.stringify({success: true, ngHeaders: headers, map})
  } else {
    parsedData.forEach(r => {
      let row = {
        target_no: getSheetValue(r["标的编号"]),
        target_name: getSheetValue(r["标的名称"]),
        borrow_name: getSheetValue(r["借款人名称"]),
        recommended_name: getSheetValue(r["业务推荐方名称"]),
        recommended_short_name: getSheetValue(r["业务推荐方简称"]),
        payee_name: getSheetValue(r["收款方名称"]),
        fill_date: getSheetValue(r["满标日期"]),
        account_date: getSheetValue(r["出账日期"]),
        payment_date: getSheetValue(r["到账日期"]),
        account_fee: getSheetValue(r["出账金额（元）"]),
        borrow_end_date: getSheetValue(r["借款到期日"]),
        interest_mode: getSheetValue(r["计息方式"]),
        interest_daycount: getSheetValue(r["计息天数"]),
        interest_rate: getSheetValue(r["借款利率"]),
        service_rate: getSheetValue(r["服务费率"]),
        all_rate: getSheetValue(r["综合费率"]),
        repayment_mode: getSheetValue(r["本息还款方式"]),
        service_fee_mode: getSheetValue(r["服务费结算方式"]),
        principal_period_count: getSheetValue(r["本金总期数"]),
        interest_period_count: getSheetValue(r["利息总期数"]),
        service_fee_period_count: getSheetValue(r["服务费总期数"]),
        each_repayment_day: getSheetValue(r["每期还款日"]),
        interest_total_fee: getSheetValue(r["利息总额（元）"]),
        service_total_fee: getSheetValue(r["服务费总额（元）"]),
        service_settlement_month: getSheetValue(r["服务费结算月份"]),
        remark: getSheetValue(r["备注"])
      }
      let dayCount = getSheetSuffixValue(["天", "日", "号"]),
        phaseCount = getSheetSuffixValue(["期"])
      let new_fill_date = getSheetDateValue(row.fill_date),
        new_account_date = getSheetDateValue(row.account_date),
        new_payment_date = getSheetDateValue(row.payment_date),
        new_account_fee = getSheetNumberValue(row.account_fee),
        new_borrow_end_date = getSheetDateValue(row.borrow_end_date),
        new_interest_daycount = dayCount(row.interest_daycount),
        new_interest_rate = getSheetPercentValue(row.interest_rate),
        new_service_rate = getSheetPercentValue(row.service_rate),
        new_all_rate = getSheetPercentValue(row.all_rate),
        new_principal_period_count = phaseCount(row.principal_period_count),
        new_interest_period_count = phaseCount(row.interest_period_count),
        new_service_fee_period_count = phaseCount(row.service_fee_period_count),
        new_each_repayment_day = dayCount(row.each_repayment_day),
        new_interest_total_fee = getSheetNumberValue(row.interest_total_fee),
        new_service_total_fee = getSheetNumberValue(row.service_total_fee),
        new_service_settlement_month = getSheetMonthValue(row.service_settlement_month);

      if (!row.target_no && !row.target_name) {
        row._reason = "标的名称与标的编号必填一项"
      } else if (!row.borrow_name) {
        row._reason = "借款人名称为空"
      } else if (!row.recommended_name && !row.recommended_short_name) {
        row._reason = "推荐方名称与简称必填一项"
      } else if (row.fill_date && !new_fill_date) {
        row._reason = "满标日期有误"
      } else if (!new_account_date) {
        row._reason = "出账日期有误"
      } else if (!new_payment_date) {
        row._reason = "到账日期有误"
      } else if (isNaN(new_account_fee) || (new_account_fee <= 0)) {
        row._reason = "出账金额有误"
      } else if (!new_borrow_end_date) {
        row._reason = "借款到期日有误"
      } else if (row.interest_mode && !/^00[1-2]$/.test(row.interest_mode)) {
        row._reason = "计息方式有误"
      } else if ((row.interest_daycount === "") || (row.interest_daycount === undefined) || isNaN(new_interest_daycount) || (new_interest_daycount <= 0)) {
        row._reason = "计息天数有误"
      } else if (isNaN(new_interest_rate) || (new_interest_rate <= 0)) {
        row._reason = "借款利率有误"
      } else if ((row.service_rate !== "") && (row.service_rate !== undefined) && (isNaN(new_service_rate) || (new_service_rate < 0))) {
        row._reason = "服务费率有误"
      } else if (isNaN(new_all_rate) || (new_all_rate <= 0)) {
        row._reason = "综合费率有误"
      } else if (((row.service_rate === "") || (row.service_rate === undefined)) && (new_all_rate < new_interest_rate)) {
        row._reason = "综合费率不能小于借款利率"
      } else if (((row.service_rate !== "") && (row.service_rate !== undefined)) && (Number(new_all_rate).toFixed(4) != Number(new_interest_rate + new_service_rate).toFixed(4))) {
        row._reason = "综合费率须等于借款利率和服务费率之和"
      } else if (!/^00[1-8]$/.test(row.repayment_mode) && !predefinedRepaymentMode.includes(row.repayment_mode)) {
        row._reason = "本息还款方式有误"
      } else if ((row.service_fee_mode !== "") && (row.service_fee_mode !== undefined) && !/^00[1-6]$/.test(row.service_fee_mode) && !predefinedServiceFeeMode.includes(row.service_fee_mode)) {
        row._reason = "服务费结算方式有误"
      } else if (isNaN(new_principal_period_count) || (new_principal_period_count <= 0)) {
        row._reason = "本金总期数有误"
      } else if (isNaN(new_interest_period_count) || (new_interest_period_count <= 0)) {
        row._reason = "利息总期数有误"
      } else if (isNaN(new_service_fee_period_count) || (new_service_fee_period_count < 0)) {
        row._reason = "服务费总期数有误"
      } else if ((row.each_repayment_day !== "") && (row.each_repayment_day !== undefined) && (!new_each_repayment_day || (new_each_repayment_day < 1) || (new_each_repayment_day > 31))) {
        row._reason = "每期还款日有误"
      } else if ((row.interest_total_fee !== "") && (row.interest_total_fee !== undefined) && (isNaN(new_interest_total_fee) || (new_interest_total_fee <= 0))) {
        row._reason = "利息总额有误"
      } else if ((row.service_total_fee !== "") && (row.service_total_fee !== undefined) && (isNaN(new_service_total_fee) || (new_service_total_fee < 0))) {
        row._reason = "服务费总额有误"
      } else if ((row.service_settlement_month !== "") && (row.service_settlement_month !== undefined) && !new_service_settlement_month) {
        row._reason = "服务费结算月份有误"
      }

      if (row._reason) {
        unmatched.push(row)
        return
      }
      (row.fill_date !== "") && (row.fill_date !== undefined) && (row.fill_date = new_fill_date);
      (row.account_date !== "") && (row.account_date !== undefined) && (row.account_date = new_account_date);
      (row.payment_date !== "") && (row.payment_date !== undefined) && (row.payment_date = new_payment_date);
      (row.account_fee !== "") && (row.account_fee !== undefined) && (row.account_fee = new_account_fee);
      (row.borrow_end_date !== "") && (row.borrow_end_date !== undefined) && (row.borrow_end_date = new_borrow_end_date);
      (row.interest_daycount !== "") && (row.interest_daycount !== undefined) && (row.interest_daycount = new_interest_daycount);
      (row.interest_rate !== "") && (row.interest_rate !== undefined) && (row.interest_rate = new_interest_rate);
      (row.service_rate !== "") && (row.service_rate !== undefined) && (row.service_rate = new_service_rate);
      (row.all_rate !== "") && (row.all_rate !== undefined) && (row.all_rate = new_all_rate);
      (row.principal_period_count !== "") && (row.principal_period_count !== undefined) && (row.principal_period_count = new_principal_period_count);
      (row.interest_period_count !== "") && (row.interest_period_count !== undefined) && (row.interest_period_count = new_interest_period_count);
      (row.service_fee_period_count !== "") && (row.service_fee_period_count !== undefined) && (row.service_fee_period_count = new_service_fee_period_count);
      (row.each_repayment_day !== "") && (row.each_repayment_day !== undefined) && (row.each_repayment_day = new_each_repayment_day);
      (row.interest_total_fee !== "") && (row.interest_total_fee !== undefined) && (row.interest_total_fee = new_interest_total_fee);
      (row.service_total_fee !== "") && (row.service_total_fee !== undefined) && (row.service_total_fee = new_service_total_fee);
      (row.service_settlement_month !== "") && (row.service_settlement_month !== undefined) && (row.service_settlement_month = new_service_settlement_month);

      matched.push(row)
    });
    resultString = JSON.stringify({success: true, matched, unmatched})
    /**
     * 如果
     * */
    if (map) {
      let getConnectionQ = promisify(pool.getConnection), connection
      return co(function* () {
        connection = yield getConnectionQ.call(pool)
        let Query = promisify(connection.query, {multiArgs: true});
        let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "001"}));
        return yield Query.call(connection, rows[0] ? sqls.updateOrgMode : sqls.insertOrgMode, getMySQLFieldValue({
          org_code,
          mode_type: "001",
          mode_content: JSON.stringify({_map:map,_headers:headers})
        }));
      }).catch(function (err) {
        logger.error(err)
      }).then(() => {
        connection && connection.release();
      });
    }
  }
}).then(() => {
  killSubProcess(resultString, process)
})

