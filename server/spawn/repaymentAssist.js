/**
 * 作者：石奇峰
 * 功能：还款单导出器，用于防止大任务造成的Node应用阻塞
 * 相似：企业授信导出器，企业订单导出器，个人订单导出器
 * */

var pool = require('../pool').pool, sqls = require("../../config/sqls.json")
const configure = require('../../config/configure')[process.env.NODE_ENV];

var {logger, fs, getMySQLFieldValue,promisify,co} = require("../util")
process.on('uncaughtException', (err) => {
  logger.info(err)
  if (process.send) {
    process.send({
      success: false,
      message: err&&err.message||"服务器出错"
    });
  }
});
logger.info(process.argv)
let getConnectionQ = promisify(pool.getConnection);

co(function*() {
  let connection = yield getConnectionQ.call(pool),data = [], pageSize = configure.exportLimit;
  let [user_type, fundOrgCode, assetOrgCode, repaymentDateStart, repaymentDateEnd, repaymentStatus, pageIndex, outputFile] = process.argv.slice(2),
    params = getMySQLFieldValue({
      fundOrgCode,
      assetOrgCode,
      repaymentDateStart,
      repaymentDateEnd,
      repaymentStatus: repaymentStatus.split(",")
    }), sql = sqls.repaymentExport, result = "", error = null

  connection.query(`${sql} limit ${pageIndex}, ${pageSize}`, params)
    .on('error', (err) => {
      logger.error(err.sql)
      error = err
    })
    .on('result', function (row) {
      //connection.pause();
      data.push(row)
      //logger.info(`写入===>${JSON.stringify(row)}`)
      //fs.appendFileSync(outputFile, `${JSON.stringify(row)}@@$$@@`)
      //connection.resume();
    })
    .on('end', function () {
      connection.release()
      if (error && error.constructor && (error.name == "Error")) {
        throw error
      } else {
        fs.appendFileSync(outputFile, `@@$$**##@@${JSON.stringify(data)}`)
        process.send({
          success: true
        });
        setTimeout(function () {
          process.exit()
        }, 200)
      }
    });
}).catch(e => {
  let message = e.message || "执行失败"
  logger.error(message)
  process.send && (typeof process.send == "function") && process.send({
    success: false,
    message
  });
})
/*


pool.getConnection(function (err, connection) {
  if (err) {
    if (process.send) {
      process.send({
        success: false,
        message: "连接数据库失败"
      });
    }
  }

  var [user_type, fundOrgCode, assetOrgCode, repaymentDateStart, repaymentDateEnd, repaymentStatus, pageIndex, pageSize, outputFile] = process.argv.slice(2),
    params = getMySQLFieldValue({
      fundOrgCode,
      assetOrgCode,
      repaymentDateStart,
      repaymentDateEnd,
      repaymentStatus: repaymentStatus.split(",")
    }), sql = sqls.repaymentExport, result = ""

  connection.query(`${sql} limit ${pageIndex}, ${pageSize}`, params).on('error', function (err) {
    process.send({
      success: false,
      message: err
    });
    connection.release();
    return
  })
    .on('fields', function (fields) {
      (pageIndex == "0") && (result += `${fields.map(r => r.name).join(",")}${os.EOL}`)
    })
    .on('result', function (row) {
      // Pausing the connnection is useful if your processing involves I/O
      connection.pause();
      for (var prop in row) {
        result += `${row[prop]},`
      }
      result = result.replace(/,$/, os.EOL)
      connection.resume();
    })
    .on('end', function () {
      connection.release()
      fs.appendFileSync(outputFile, result)
      if (process.send) {
        process.send({
          success: true
        });
      }
      setTimeout(function () {
        process.exit()
      }, 200)
    });

})
*/
