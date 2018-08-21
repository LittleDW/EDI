/**
 * 作者：石奇峰
 * 功能：企业订单导出器，用于防止大任务造成的Node应用阻塞
 * 相似：企业授信导出器，个人订单导出器，还款单导出器
 * */

var pool = require('../pool').pool, sqls = require("../../config/sqls.json")
var {logger, fs, getMySQLFieldValue,promisify,co} = require("../util")
var {exportLimit:pageSize} = require("../../config/configure")[process.env.NODE_ENV]

process.on('uncaughtException', (err) => {
  logger.info(err)
  if (process.send) {
    process.send({
      success: false,
      message: err && err.message || "服务器出错"
    });
  }
});

logger.info(`子进程启动，pid = ${process.pid}, argv = ${JSON.stringify(process.argv)}`)
let getConnectionQ = promisify(pool.getConnection);

co(function* () {
  let connection = yield getConnectionQ.call(pool),data = []
  let [user_type, assetOrderNo, orderNo, borrowDateStart, borrowDateEnd, createTimeStart, createTimeEnd, orderStatus,
      fundOrgCode, assetOrgCode, restrictionString,pageIndex, outputFile,] = process.argv.slice(2),
    restriction = JSON.parse(restrictionString),
    params = getMySQLFieldValue({
      assetOrderNo,
      orderNo,
      borrowDateStart,
      borrowDateEnd,
      createTimeStart,
      createTimeEnd,
      fundOrgCode, assetOrgCode,
      orderStatus: orderStatus.split(","),
      ...restriction
    }),
    sql = ((user_type == '3') || (user_type == '4')) ? sqls.corpOrdersAdminExport : ((user_type == '2') ? sqls.corpOrdersAssetExport : sqls.corpOrdersFundExport),
    error = null
  connection.query(`${sql} limit ${pageIndex}, ${pageSize}`, params)
    .on('error', (err) => {
      logger.error(err.sql)
      error = err
    })
    .on('result', function (row) {
      //connection.pause();
      data.push(row)
      logger.info(`写入===>${JSON.stringify(row)}`)
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
