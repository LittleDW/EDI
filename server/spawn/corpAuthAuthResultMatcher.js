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
    "资产方机构编码", "企业营业执照号", "授信金额（元）", "授信结果", "拒绝原因"
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
      let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "008"}));
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
        asset_org_code: getSheetValue(r["资产方机构编码"]),
        borrow_business_license: getSheetValue(r["企业营业执照号"]),
        fund_credit_fee: getSheetValue(r["授信金额（元）"]),
        auth_result: getSheetValue(r["授信结果"]),
        refuse_reason: getSheetValue(r["拒绝原因"]),
      }

      let new_fund_credit_fee = getSheetNumberValue(row.fund_credit_fee)

      if (!row.asset_org_code) {
        row._reason = "资产方机构编码为空"
      } else if (!row.borrow_business_license) {
        row._reason = "企业营业执照号为空"
      } else if (!row.fund_credit_fee) {
        row._reason = "授信金额（元）为空"
      } else if (!row.auth_result) {
        row._reason = "授信结果为空"
      } else if (isNaN(new_fund_credit_fee) || (new_fund_credit_fee <= 0)) {
        row._reason = "授信金额（元）有误"
      } else if (isNaN(row.auth_result) || !/^[1-2]$/.test(getSheetNumberValue(row.auth_result))) {
        row._reason = "授信结果有误"
      }

      if (row._reason) {
        unmatched.push(row)
        return
      }

      (row.fund_credit_fee !== "") && (row.fund_credit_fee !== undefined) && (row.fund_credit_fee = new_fund_credit_fee);

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
        let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "008"}));
        return yield Query.call(connection, rows[0] ? sqls.updateOrgMode : sqls.insertOrgMode, getMySQLFieldValue({
          org_code,
          mode_type: "008",
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

