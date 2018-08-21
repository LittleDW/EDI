/**
 * 作者：石奇峰
 * 功能：个人订单导出器，用于防止大任务造成的Node应用阻塞
 * 相似：企业授信导出器，企业订单导出器，还款单导出器
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
  let [user_type, assetOrderNo, orderNo, borrowDateStart, borrowDateEnd, createTimeStart, createTimeEnd, orderStatus,
      fundOrgCode, assetOrgCode, deadline_from, deadline_to,borrowCertificateNo,
      restrictionString,pageIndex, outputFile,
    ] = process.argv.slice(2),
    restriction = JSON.parse(restrictionString),
    params = getMySQLFieldValue({
      assetOrderNo,
      orderNo,
      borrowDateStart,
      borrowDateEnd,
      createTimeStart,
      createTimeEnd,
      borrowCertificateNo,
      fundOrgCode, assetOrgCode,deadline_from, deadline_to,
      orderStatus: orderStatus.split(","),
      ...restriction
    }),
    sql = ((user_type == '3') || (user_type == '4')) ? sqls.ordersAdminExport : ((user_type == '2') ? sqls.ordersAssetExport : sqls.ordersFundExport),
    error = null
  connection.query(`${sql} limit ${pageIndex}, ${pageSize}`, params)
    .on('error', (err) => {
      logger.error(err.sql)
      error = err
    })
    .on('fields', function(fields) {
      //columns = fields
      logger.info(`写入===>${JSON.stringify(fields)}`)
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
/*pool.getConnection(function (err, connection) {
  if (err) {
    if (process.send) {
      process.send({
        success: false,
        message: "连接数据库失败"
      });
    }
  }

  var [user_type, assetOrderNo, orderNo, borrowDateStart, borrowDateEnd, orderStatus, fundOrgCode, assetOrgCode, pageIndex, pageSize, outputFile] = process.argv.slice(2),
    params = getMySQLFieldValue({
      assetOrderNo,
      orderNo,
      borrowDateStart,
      borrowDateEnd,
      fundOrgCode, assetOrgCode,
      orderStatus: orderStatus.split(",")
    }),
    sql = ((user_type == '3') || (user_type == '4')) ? sqls.ordersAdminExport : ((user_type == '2') ? sqls.ordersAssetExport : sqls.ordersFundExport),
    result = "";


  connection.query(`${sql} limit ${pageIndex}, ${pageSize}`, params)
    .on('error', (err) => {
    logger.info(err.sql)
    process.send({
      success: false,
      message: err
    });
    connection.release();
    return
  })
  /!*.on('fields', function (fields) {
   (pageIndex == "0") && (result += `${fields.map(r => r.name).join(",")}\r\n`)
   })*!/
    .on('result', function (row) {
      // Pausing the connnection is useful if your processing involves I/O
      connection.pause();
      for (var prop in row) {
        result += `${row[prop]},`
      }
      //result = result.replace(/,$/, "\r\n")

      connection.resume();
    })
    .on('end', function () {
      connection.release()
      fs.appendFileSync(outputFile, result)
      if (process.send) {
        process.send({
          success: true,
          //result
        });
      }
      setTimeout(function () {
        process.exit()
      }, 200)
    });

})*/
