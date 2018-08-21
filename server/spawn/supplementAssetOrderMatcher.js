/**
 * 作者：石奇峰
 * 功能：个人订单补充匹配器，用于防止解析excel大文件造成的阻塞所做
 * 相似：企业授信匹配器，个人订单匹配器，企业订单匹配器，企业订单补充匹配器，企业授信补充匹配器
 * */

var {logger, XLSX, path, fs, getSheetValue,uuidv4} = require("../util")

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
let unmatched = [], matched = [], attachments = [], [file, voucher] = process.argv.slice(2),
  workbook = XLSX.readFile(file),
  sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];
let vouchers = JSON.parse(fs.readFileSync(voucher, {encoding: "utf8"})),
  shiftVouchers = vouchers.map(r => (typeof r == "string") ? r.toLowerCase() : new String(r).toLowerCase());;
if (!vouchers.length) {
  throw new Error("没有发现任何用户资料包")
}
XLSX.utils.sheet_to_json(sheet).forEach(r => {
  let row = {
    asset_order_no: getSheetValue(r["资产方订单号"]),
    borrow_name: getSheetValue(r["借款人名称"]),
    borrow_certificate_no: getSheetValue(r["借款人证件号"]),
    borrow_voucher_details: getSheetValue(r["借款凭证集合"]),
  }
  let rawnameKey = `${row.borrow_name}${row.borrow_certificate_no}`
  let nameKey = rawnameKey.toLowerCase();

  // 20种上传文件的可能性
  let possibleFiles = [`${nameKey}.rar`,
    `${nameKey}.zip`,
    `${nameKey}.jpg`,
    `${nameKey}.png`,
    `${nameKey}.pdf`,
    `身份证${nameKey}.rar`,
    `身份证${nameKey}.zip`,
    `身份证${nameKey}.jpg`,
    `身份证${nameKey}.png`,
    `身份证${nameKey}.pdf`,
    `电子签章${nameKey}.rar`,
    `电子签章${nameKey}.zip`,
    `电子签章${nameKey}.jpg`,
    `电子签章${nameKey}.png`,
    `电子签章${nameKey}.pdf`,
    `补充资料${nameKey}.rar`,
    `补充资料${nameKey}.zip`,
    `补充资料${nameKey}.jpg`,
    `补充资料${nameKey}.png`,
    `补充资料${nameKey}.pdf`];
  let rawPossibleFiles = [`${rawnameKey}.rar`,
    `${rawnameKey}.zip`,
    `${rawnameKey}.jpg`,
    `${rawnameKey}.png`,
    `${rawnameKey}.pdf`,
    `身份证${rawnameKey}.rar`,
    `身份证${rawnameKey}.zip`,
    `身份证${rawnameKey}.jpg`,
    `身份证${rawnameKey}.png`,
    `身份证${rawnameKey}.pdf`,
    `电子签章${rawnameKey}.rar`,
    `电子签章${rawnameKey}.zip`,
    `电子签章${rawnameKey}.jpg`,
    `电子签章${rawnameKey}.png`,
    `电子签章${rawnameKey}.pdf`,
    `补充资料${rawnameKey}.rar`,
    `补充资料${rawnameKey}.zip`,
    `补充资料${rawnameKey}.jpg`,
    `补充资料${rawnameKey}.png`,
    `补充资料${rawnameKey}.pdf`];

  let usefulVouchers = possibleFiles.map((r,i)=>shiftVouchers.includes(r)?rawPossibleFiles[i]:undefined).filter(r=>r);
  /*let usefulVouchers = vouchers.filter(r => {
    var t = (typeof r == "string") ? r.toLowerCase() : new String(r).toLowerCase();
    let escapedNameKey = RegExp.escape(nameKey)
    if (new RegExp(`^${escapedNameKey}(\\.rar|\\.zip|\\.jpg|\\.png|\\.pdf)$`).test(t) || new RegExp(`^(身份证|电子签章|补充资料)${escapedNameKey}(\\.rar|\\.zip|\\.jpg|\\.png|\\.pdf)$`).test(t)) {
      !attachments.includes(r) && (attachments.push(r))
      return true
    }
    return false
  })*/
  if (!row.asset_order_no) {
    row._reason = "资产方订单号为空"
  } else if (!row.borrow_name) {
    row._reason = "借款人名称为空"
  } else if (!row.borrow_certificate_no) {
    row._reason = "借款人证件号为空"
  } else if (!usefulVouchers.length && (!row.borrow_voucher_details || !row.borrow_voucher_details.includes("$|$") || !row.borrow_voucher_details.includes("@#@"))) {
    row._reason = "无匹配资料"
  }
  if (row._reason) {
    unmatched.push(row)
    return
  }
  // 11种上传文件的可能性
  if(!row.borrow_voucher_details){
    row.borrow_voucher_details = usefulVouchers;
  } else if(row.borrow_voucher_details.includes("$|$")){
    row.borrow_voucher_details = [...row.borrow_voucher_details.split("$|$"), ...usefulVouchers]
  } else {
    row.borrow_voucher_details = []
  }

  matched.push(row)
  return
});

let resultString = JSON.stringify({matched, unmatched, attachments})
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
