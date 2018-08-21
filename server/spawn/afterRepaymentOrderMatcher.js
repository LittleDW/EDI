/**
 * 作者：石奇峰
 * 功能：贷后订单匹配器，用于防止解析excel大文件造成的阻塞所做
 * 相似：放款对账单匹配器，服务费对账单匹配器
 * */

var pool = require('../pool').writePool, sqls = require("../../config/sqls.json")
var {logger, XLSX, BlueBird, co, promisify, getMySQLFieldValue, getSheetNumberValue, getSheetPercentValue, getSheetValue, getSheetDateValue, getSheetSuffixValue, getSheetMonthValue, killSubProcess} = require("../util")

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
    "放款日期","借款主体类型","借款人名称","借款人证件号","借款人银行预留手机号","总期数","剩余期数","待还总金额（元）",
    "待还本金（元）","待还利息（元）","本期应还金额（元）","应还日期","实际还款日期","实收总金额（元）","实收本金（元）",
    "实收利息（元）","提前还款金额（元）","业务类型","逾期状态","逾期天数","逾期手续费（元）","逾期违约金（元）","备注"
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

    if (map) {
      let newHeaders = [];
      parsedData = parsedData.map(r => {
        let item = {}
       /* headers.forEach(t => {
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
      let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "010"}));
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
  } else {
    promise = dbrunner()
  }
  /**
   * 执行重新匹配计算
   * */
} else {
  //promise = Promise.resolve()
  let getConnectionQ = promisify(pool.getConnection), connection
  promise = co(function* () {
    connection = yield getConnectionQ.call(pool)
    let Query = promisify(connection.query, {multiArgs: true});
    yield Query.call(connection, sqls.deleteOrgMode, getMySQLFieldValue({org_code, mode_type: "010"}));
  }).catch(function (err) {
    logger.error(err)
  }).then(() => {
    connection && connection.release();
  });
}

promise.then(() => {
  if (ngHeader) {
    resultString = JSON.stringify({success: true, ngHeaders: [...new Set(headers)], map})
  } else {
    parsedData.forEach(r => {
      let row = {
        loan_date: getSheetValue(r["放款日期"]),
        borrow_type: getSheetValue(r["借款主体类型"]),
        borrow_name: getSheetValue(r["借款人名称"]),
        borrow_certificate_no: getSheetValue(r["借款人证件号"]),
        borrow_phone: getSheetValue(r["借款人银行预留手机号"]),
        period_count: getSheetValue(r["总期数"]),
        remaining_periods: getSheetValue(r["剩余期数"]),
        remaining_total_fee: getSheetValue(r["待还总金额（元）"]),
        remaining_principal_fee: getSheetValue(r["待还本金（元）"]),
        remaining_interest_fee: getSheetValue(r["待还利息（元）"]),
        current_balance: getSheetValue(r["本期应还金额（元）"]),
        due_date: getSheetValue(r["应还日期"]),
        actual_repayment_date: getSheetValue(r["实际还款日期"]),
        paid_up_total_fee: getSheetValue(r["实收总金额（元）"]),
        paid_up_principal_fee: getSheetValue(r["实收本金（元）"]),
        paid_up_interest_fee: getSheetValue(r["实收利息（元）"]),
        prepayment_fee: getSheetValue(r["提前还款金额（元）"]),
        business_type: getSheetValue(r["业务类型"]),
        overdue_status: getSheetValue(r["逾期状态"]),
        overdue_days: getSheetValue(r["逾期天数"]),
        overdue_poundage: getSheetValue(r["逾期手续费（元）"]),
        overdue_penalty: getSheetValue(r["逾期违约金（元）"]),
        remark: getSheetValue(r["备注"])
      }
      let dayCount = getSheetSuffixValue(["天", "日", "号"]),
        phaseCount = getSheetSuffixValue(["期"])
      let new_loan_date = getSheetDateValue(row.loan_date),
        new_period_count = phaseCount(row.period_count),
        new_remaining_periods = phaseCount(row.remaining_periods),
        new_remaining_total_fee = getSheetNumberValue(row.remaining_total_fee),
        new_remaining_interest_fee = getSheetNumberValue(row.remaining_interest_fee),
        new_remaining_principal_fee = getSheetNumberValue(row.remaining_principal_fee),
        new_current_balance = getSheetNumberValue(row.current_balance),
        new_due_date = getSheetDateValue(row.due_date),
        new_actual_repayment_date = getSheetDateValue(row.actual_repayment_date),
        new_paid_up_total_fee = getSheetNumberValue(row.paid_up_total_fee),
        new_paid_up_principal_fee = getSheetNumberValue(row.paid_up_principal_fee),
        new_paid_up_interest_fee = getSheetNumberValue(row.paid_up_interest_fee),
        new_prepayment_fee = getSheetNumberValue(row.prepayment_fee),
        new_overdue_days = dayCount(row.overdue_days),
        new_overdue_poundage = getSheetNumberValue(row.overdue_poundage),
        new_overdue_penalty = getSheetNumberValue(row.overdue_penalty)

      if(!new_loan_date){
        row._reason = "放款日期有误"
      } else if (!row.borrow_type || !/^A|B$/.test(row.borrow_type)) {
        row._reason = "借款主体类型有误"
      } else if (!row.borrow_name) {
        row._reason = "借款人名称为空"
      } else if (!row.borrow_certificate_no) {
        row._reason = "借款人证件号为空"
      } else if (!row.borrow_phone){ //|| !/^\d{11}$/.test(row.borrow_type)) {
        row._reason = "借款人银行预留手机号有误"
      } else if ((row.period_count !== "") && (row.period_count !== undefined) && (isNaN(new_period_count) || (new_period_count < 0))) {
        row._reason = "总期数有误"
      } else if ((row.remaining_periods !== "") && (row.remaining_periods !== undefined) && (isNaN(new_remaining_periods) || (new_remaining_periods < 0))) {
        row._reason = "剩余期数有误"
      } else if ((row.remaining_total_fee !== "") && (row.remaining_total_fee !== undefined) && (isNaN(new_remaining_total_fee) || (new_remaining_total_fee < 0))) {
        row._reason = "待还总金额有误"
      } else if ((row.remaining_interest_fee !== "") && (row.remaining_interest_fee !== undefined) && (isNaN(new_remaining_interest_fee) || (new_remaining_interest_fee < 0))) {
        row._reason = "待还本金有误"
      } else if ((row.remaining_principal_fee !== "") && (row.remaining_principal_fee !== undefined) && (isNaN(new_remaining_principal_fee) || (new_remaining_principal_fee < 0))) {
        row._reason = "待还利息有误"
      } else if ((row.current_balance !== "") && (row.current_balance !== undefined) && (isNaN(new_current_balance) || (new_current_balance < 0))) {
        row._reason = "本期应还金额有误"
      } else if ((row.due_date !== "") && (row.due_date !== undefined) && !new_due_date) {
        row._reason = "应还日期有误"
      } else if ((row.paid_up_total_fee !== "") && (row.paid_up_total_fee !== undefined) && (isNaN(new_paid_up_total_fee) || (new_paid_up_total_fee < 0))) {
        row._reason = "实收总金额有误"
      } else if ((row.paid_up_principal_fee !== "") && (row.paid_up_principal_fee !== undefined) && (isNaN(new_paid_up_principal_fee) || (new_paid_up_principal_fee < 0))) {
        row._reason = "实收本金有误"
      } else if ((row.paid_up_interest_fee !== "") && (row.paid_up_interest_fee !== undefined) && (isNaN(new_paid_up_interest_fee) || (new_paid_up_interest_fee < 0))) {
        row._reason = "实收利息有误"
      } else if ((row.prepayment_fee !== "") && (row.prepayment_fee !== undefined) && (isNaN(new_prepayment_fee) || (new_prepayment_fee < 0))) {
        row._reason = "提前还款金额有误"
      } else if (row.business_type && !/^(00[1-9])|(01[0-1])|(06[1-4]|100)$/.test(row.business_type)) {
        row._reason = "业务类型有误"
      } else if (!row.overdue_status || !/^A|B|C$/.test(row.overdue_status)) {
        row._reason = "逾期状态有误"
        // 逾期中状态下，实际还款日期可以为空
      } else if((!row.overdue_status || !/^C$/.test(row.overdue_status)) && !new_actual_repayment_date){
        row._reason = "实际还款日期有误"
      } else if ((row.overdue_days !== "") && (row.overdue_days !== undefined) && (/^[1-9]?\d*\.\d+$/.test(row.overdue_days) || (isNaN(new_overdue_days) || (new_overdue_days < 0)))) {
        row._reason = "逾期天数有误"
      } else if ((row.overdue_poundage !== "") && (row.overdue_poundage !== undefined) && (isNaN(new_overdue_poundage) || (new_overdue_poundage < 0))) {
        row._reason = "逾期手续费有误"
      } else if ((row.overdue_penalty !== "") && (row.overdue_penalty !== undefined) && (isNaN(new_overdue_penalty) || (new_overdue_penalty < 0))) {
        row._reason = "逾期违约金有误"
      }

      if (row._reason) {
        unmatched.push(row)
        return
      }

      (row.loan_date !== "") && (row.loan_date !== undefined) && (row.loan_date = new_loan_date);
      (row.period_count !== "") && (row.period_count !== undefined) && (row.period_count = new_period_count);
      (row.remaining_periods !== "") && (row.remaining_periods !== undefined) && (row.remaining_periods = new_remaining_periods);
      (row.remaining_total_fee !== "") && (row.remaining_total_fee !== undefined) && (row.remaining_total_fee = new_remaining_total_fee);
      (row.remaining_interest_fee !== "") && (row.remaining_interest_fee !== undefined) && (row.remaining_interest_fee = new_remaining_interest_fee);
      (row.remaining_principal_fee !== "") && (row.remaining_principal_fee !== undefined) && (row.remaining_principal_fee = new_remaining_principal_fee);
      (row.current_balance !== "") && (row.current_balance !== undefined) && (row.current_balance = new_current_balance);
      (row.due_date !== "") && (row.due_date !== undefined) && (row.due_date = new_due_date);
      (row.actual_repayment_date !== "") && (row.actual_repayment_date !== undefined) && (row.actual_repayment_date = new_actual_repayment_date);
      (row.paid_up_total_fee !== "") && (row.paid_up_total_fee !== undefined) && (row.paid_up_total_fee = new_paid_up_total_fee);
      (row.paid_up_principal_fee !== "") && (row.paid_up_principal_fee !== undefined) && (row.paid_up_principal_fee = new_paid_up_principal_fee);
      (row.paid_up_interest_fee !== "") && (row.paid_up_interest_fee !== undefined) && (row.paid_up_interest_fee = new_paid_up_interest_fee);
      (row.prepayment_fee !== "") && (row.prepayment_fee !== undefined) && (row.prepayment_fee = new_prepayment_fee);
      (row.overdue_days !== "") && (row.overdue_days !== undefined) && (row.overdue_days = new_overdue_days);
      (row.overdue_poundage !== "") && (row.overdue_poundage !== undefined) && (row.overdue_poundage = new_overdue_poundage);
      (row.overdue_penalty !== "") && (row.overdue_penalty !== undefined) && (row.overdue_penalty = new_overdue_penalty);

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
        let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "010"}));
        return yield Query.call(connection, rows[0] ? sqls.updateOrgMode : sqls.insertOrgMode, getMySQLFieldValue({
          org_code,
          mode_type: "010",
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

