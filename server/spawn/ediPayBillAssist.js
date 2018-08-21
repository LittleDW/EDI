/**
 * 作者：马伯骁
 * 功能：平台使用费账单导出器，用于防止大任务造成的Node应用阻塞
 * 相似：个人订单导出器，企业授信导出器，企业订单导出器，还款单导出器
 * */

var pool = require('../pool').pool, sqls = require("../../config/sqls.json")
var {logger, fs, getMySQLFieldValue,Bluebird,co,promisify} = require("../util")
var {exportLimit:pageSize} = require("../../config/configure")[process.env.NODE_ENV]

process.on('uncaughtException', (err) => {
  logger.info(err)
  if (process.send) {
    process.send({
      success: false,
      message: err&&err.message||"服务器出错"
    });
  }
});
logger.info(`子进程启动，pid = ${process.pid}, argv = ${JSON.stringify(process.argv)}`)
let getConnectionQ = promisify(pool.getConnection);

co(function*() {
  let connection = yield getConnectionQ.call(pool),data = []
  //let Query = promisify(connection.query, {multiArgs: true});
  let [ownerUserType, ownerOrgCode, billYear, billMonth, userType, orgCode, platformPayMode, restrictionString,pageIndex, outputFile,] = process.argv.slice(2),
    restriction = JSON.parse(restrictionString),
    params = getMySQLFieldValue({
      month:(billYear?billYear:"%") + "-" + (billMonth?billMonth:"%"),
      userType:ownerUserType==3?userType:ownerUserType,
      orgCode:ownerUserType==3?orgCode:ownerOrgCode,
      platformPayMode,
      ...restriction
    }),
    error = null
  connection.query(`${sqls.ediPayBillExport} limit ${pageIndex}, ${pageSize}`, params)
    .on('error', (err) => {
      logger.error(err.sql)
      error = err
    })
    .on('fields', function(fields) {
      //columns = fields
      logger.info(`写入===>${JSON.stringify(fields)}`)
    })
    .on('result', function (row) {
      data.push(row)
      logger.info(`写入===>${JSON.stringify(row)}`)
    })
    .on('end', function () {
      connection.release()
      if(error && error.constructor && (error.name == "Error")){
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
