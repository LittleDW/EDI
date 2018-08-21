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
    "平台订单号", "银行贷款合同号", "产品利率", "出账金额（元）", "出账日期", "收款账户名称", "收款账户开户行", "收款账户号",
    "合同详细内容", "到账日期", "到账金额（元）", "支付凭证地址", "支付渠道", "交易流水号"
  ], ngHeader, resultString, promise, map = old_map && JSON.parse(old_map) || undefined

ngHeader = headers.find(r => !predefinedHeaders.includes(r))

if(!Array.isArray(parsedData) || !parsedData.length){
  throw new Error("上传文件无数据")
}

/**
 * 如果表头不匹配，先看用户有没有上传mapper，再看数据库里有没有mapper，如果header都不匹配，再返回数据库里的mapper
 * */
if (ngHeader) {
  let runner = (newMap) => {
    map = newMap

    if (map && (headers.length >= predefinedHeaders.length)) {
      let newHeaders = [];
      parsedData = parsedData.map(r => {
        let item = {}
        headers.forEach(t => {
          var found = map.find(s => (s.value == t))
          if (found) {
            var R = found.label;
            item[R] = r[t]
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
  }, dbrunner = () => {
    let getConnectionQ = promisify(pool.getConnection), connection
    return co(function* () {
      connection = yield getConnectionQ.call(pool)
      let Query = promisify(connection.query, {multiArgs: true});
      let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "007"}));
      if (rows[0]) {
        runner(JSON.parse(rows[0].mode_content))
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
  promise = Promise.resolve()
}

promise.then(() => {
  if (ngHeader) {
    resultString = JSON.stringify({success: true, ngHeaders: headers, map})
  } else {
    parsedData.forEach(r => {
      let row = {
        order_no: getSheetValue(r["平台订单号"]),
        bank_loan_contract_no: getSheetValue(r["银行贷款合同号"]),
        product_rate: getSheetValue(r["产品利率"]),
        account_fee: getSheetValue(r["出账金额（元）"]),
        account_date: getSheetValue(r["出账日期"]),
        real_gathering_name: getSheetValue(r["收款账户名称"]),
        real_gathering_bank: getSheetValue(r["收款账户开户行"]),
        real_gathering_card_no: getSheetValue(r["收款账户号"]),
        contract_details: getSheetValue(r["合同详细内容"]),
        payment_date: getSheetValue(r["到账日期"]),
        payment_fee: getSheetValue(r["到账金额（元）"]),
        payment_certificate_url: getSheetValue(r["支付凭证地址"]),
        payment_channel: getSheetValue(r["支付渠道"]),
        payment_serial_no: getSheetValue(r["交易流水号"])
      }

      let new_product_rate = getSheetPercentValue(row.product_rate),
        new_account_fee = getSheetNumberValue(row.account_fee),
        new_account_date = getSheetDateValue(row.account_date),
        new_payment_date = getSheetDateValue(row.payment_date),
        new_payment_fee = getSheetNumberValue(row.payment_fee)

      if (!row.order_no) {
        row._reason = "平台订单号为空"
      } else if (!row.bank_loan_contract_no) {
        row._reason = "银行贷款合同号为空"
      } else if (!row.product_rate) {
        row._reason = "产品利率为空"
      } else if (!row.account_fee) {
        row._reason = "出账金额（元）为空"
      } else if (!row.account_date) {
        row._reason = "出账日期为空"
      } else if (!row.real_gathering_name) {
        row._reason = "收款账户名称为空"
      } else if (!row.real_gathering_bank) {
        row._reason = "收款账户开户行为空"
      } else if (!row.real_gathering_card_no) {
        row._reason = "收款账户号为空"
      } else if (!/^(1211)/.test(row.order_no)) {
        row._reason = "企业平台订单号只能以[1211]开头"
      } else if (isNaN(new_product_rate) || (new_product_rate <= 0) || (!/^[0-9]*(\.\d{1,4})?$/.test(new_product_rate.toFixed(4)))) {
        row._reason = "产品利率有误"
      } else if (isNaN(new_account_fee) || (new_account_fee <= 0)) {
        row._reason = "出账金额（元）有误"
      } else if (!new_account_date) {
        row._reason = "出账日期有误"
      } else if (row.payment_date && !new_payment_date) {
        row._reason = "到账日期有误"
      } else if ((row.payment_fee !== "") && (row.payment_fee !== undefined) && (isNaN(new_payment_fee) || (new_payment_fee <= 0))) {
        row._reason = "到账金额（元）有误"
      }

      if (row._reason) {
        unmatched.push(row)
        return
      }

      (row.product_rate !== "") && (row.product_rate !== undefined) && (row.product_rate = new_product_rate);
      (row.account_fee !== "") && (row.account_fee !== undefined) && (row.account_fee = new_account_fee);
      (row.account_date !== "") && (row.account_date !== undefined) && (row.account_date = new_account_date);
      (row.payment_date !== "") && (row.payment_date !== undefined) && (row.payment_date = new_payment_date);
      (row.payment_fee !== "") && (row.payment_fee !== undefined) && (row.payment_fee = new_payment_fee);

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
        let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "007"}));
        return yield Query.call(connection, rows[0] ? sqls.updateOrgMode : sqls.insertOrgMode, getMySQLFieldValue({
          org_code,
          mode_type: "007",
          mode_content: JSON.stringify(map)
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

