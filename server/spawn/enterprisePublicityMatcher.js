var {pool, writePool, getConnectionQ} = require('../pool'), sqls = require("../../config/sqls.json")
var {
  logger, XLSX, fs, path, BlueBird, co, promisify, uuidv4, getMySQLFieldValue, getSheetNumberValue,
  getSheetPercentValue, getSheetValue, getSheetDateValue, getSheetMonthValue, getSheetSuffixValue,
  killSubProcess
} = require("../util")

process.on('uncaughtException', (err) => {
  logger.error(err)
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
let unmatched = [], matched = [], [file, extraParams] = process.argv.slice(2),
  workbook = XLSX.readFile(file), sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]],
  asset_order_no_refer = [], borrow_name_refer = [], order_no_refer = [],
  queues = [], rawData = XLSX.utils.sheet_to_json(sheet);

rawData.forEach(r => {
  let row = {
    asset_order_no: getSheetValue(r["资产方订单号"]),
    borrow_name: getSheetValue(r["企业名称"]),
    order_no: getSheetValue(r["平台订单号"]),
  }, q = Promise.resolve()

  /*if(row.order_no){
    delete row.asset_order_no
  }*/
  if (row.asset_order_no && asset_order_no_refer.includes(row.asset_order_no)){
    row._reason = "重复的资产方订单号"
  } else if (row.borrow_name && borrow_name_refer.includes(row.borrow_name)){
    row._reason = "重复的企业名称"
  } else if (row.order_no && order_no_refer.includes(row.order_no)){
    row._reason = "重复的平台订单号"
  } else if (!row.borrow_name && !row.asset_order_no && !row.order_no){
    row._reason = "信息不能都为空"
  } else {
    asset_order_no_refer.push(row.asset_order_no);
    borrow_name_refer.push(row.borrow_name);
    order_no_refer.push(row.order_no);
    if (!row.borrow_name && (row.asset_order_no || row.order_no)) {
      let connection;
      q = co(function* () {
        connection = yield getConnectionQ()
        let Query = promisify(connection.query, {multiArgs: true}).bind(connection),
          extras = JSON.parse(extraParams);
        let [rows] = yield Query(sqls.corpOrdersForPublicity, {order_no:row.order_no,asset_order_no:row.asset_order_no,...extras})
        if (!rows.length) {
          throw new Error("无企业订单记录")
        }
        return rows
      }).catch(function (err) {
        row._reason = err.message || "匹配失败"
      }).then(() => {
        connection && connection.release();
      })
      queues.push(q);
    }
  }
  q.then(()=>{
    if (row._reason) {
      unmatched.push(row)
    } else {
      matched.push(row)
    }
  })
});

Promise.all(queues).catch(e=>{
  matched = []
}).then(()=>{
  let resultString = JSON.stringify({matched, unmatched})
  logger.info(`数据已读取 ==> `)

  let tempFile = path.resolve(`${__dirname}/../../temp/${uuidv4()}`), fd = fs.openSync(tempFile, 'w+')
  fs.writeFileSync(fd, resultString)

  process.send && (typeof process.send == "function") && process.send({
    success: true,
    file: tempFile
  });

  setTimeout(function () {
    process.exit()
  }, 200)
})

