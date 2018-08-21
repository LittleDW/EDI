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
    "平台订单号", "合同类型", "合同号", "合同地址"
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
      let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "004"}));
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
        contract_type: getSheetValue(r["合同类型"]),
        contract_number: getSheetValue(r["合同号"]),
        contract_url: getSheetValue(r["合同地址"]),
      }

      if (!row.order_no) {
        row._reason = "平台订单号为空"
      } else if (!/^(1111).+$/.test(row.order_no)) {
        row._reason = "个人平台订单号非法"
      } else if (!row.contract_type) {
        row._reason = "合同类型为空"
      } else if (!/^00[1-4]$/.test(row.contract_type)) {
        row._reason = "合同类型有误"
      } else if (!row.contract_number) {
        row._reason = "合同号为空"
      } else if (!row.contract_url) {
        row._reason = "合同地址为空"
      }

      if (row._reason) {
        unmatched.push(row)
        return
      }

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
        let [rows] = yield Query.call(connection, sqls.getOrgMode, getMySQLFieldValue({org_code, mode_type: "009"}));
        return yield Query.call(connection, rows[0] ? sqls.updateOrgMode : sqls.insertOrgMode, getMySQLFieldValue({
          org_code,
          mode_type: "009",
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

