/*
 * @Author zhangjunjie
 * @File withdrawOrderExport.js
 * @Created Date 2018-05-31 12-07
 * @Last Modified: 2018-05-31 12-07
 * @Modified By: zhangjunjie
 */

var pool = require('../pool').pool,
  sqls = require('../../config/sqls.json');
const configure = require('../../config/configure')[process.env.NODE_ENV];
var {
  logger,
  fs,
  getMySQLFieldValue,
  Bluebird,
  co,
  promisify,
} = require('../util');

process.on('uncaughtException', (err) => {
  logger.info(err);
  if (process.send) {
    process.send({
      success: false,
      message: (err && err.message) || '服务器出错',
    });
  }
});
logger.info(
  `子进程启动，pid = ${process.pid}, argv = ${JSON.stringify(process.argv)}`,
);
let getConnectionQ = promisify(pool.getConnection);

co(function*() {
  let connection = yield getConnectionQ.call(pool),
    data = [];
  const pageSize = configure.exportLimit;
  //let Query = promisify(connection.query, {multiArgs: true});
  const [
    user_type,
    asset_order_no,
    order_no,
    borrow_start_date,
    borrow_end_date,
    payment_start_date,
    payment_end_date,
    fund_org_code,
    asset_org_code,
    borrow_certificate_no,
    withdraw_status,
    asset_restriction,
    fund_restriction,
    pageIndex,
    outputFile,
  ] = process.argv.slice(2);
  const params = {
    asset_order_no,
    order_no,
    borrow_start_date,
    borrow_end_date,
    payment_start_date,
    payment_end_date,
    fund_org_code,
    asset_org_code,
    borrow_certificate_no,
    withdraw_status: withdraw_status && withdraw_status.split(','),
    asset_restriction: asset_restriction && asset_restriction.split(','),
    fund_restriction: fund_restriction && fund_restriction.split(','),
    pageIndex,
    outputFile,
  };
  const sql = sqls.withdrawExport;
  let error = null;
  connection
    .query(`${sql} limit ${pageIndex}, ${pageSize}`, params)
    .on('error', (err) => {
      logger.error(err.sql);
      error = err;
    })
    .on('result', function(row) {
      //connection.pause();
      data.push(row);
      //logger.info(`写入===>${JSON.stringify(row)}`)
      //fs.appendFileSync(outputFile, `${JSON.stringify(row)}@@$$@@`)
      //connection.resume();
    })
    .on('end', function() {
      connection.release();
      if (error && error.constructor && error.name == 'Error') {
        throw error;
      } else {
        fs.appendFileSync(outputFile, `@@$$**##@@${JSON.stringify(data)}`);
        process.send({
          success: true,
        });
        setTimeout(function() {
          process.exit();
        }, 200);
      }
    })
}).catch((e) => {
  let message = e.message || '执行失败';
  logger.error(message);
  process.send &&
    typeof process.send == 'function' &&
    process.send({
      success: false,
      message,
    });
});
