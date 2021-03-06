/**
 * 作者：石奇峰
 * 功能：企业订单匹配器，用于防止解析excel大文件造成的阻塞所做
 * 相似：企业授信匹配器，个人订单匹配器，个人订单补充匹配器，企业订单补充匹配器，企业授信补充匹配器
 * */

var {logger, fs, path, uuidv4, XLSX, getSheetValue, getSheetDateValue} = require("../util")

process.on('uncaughtException', (err) => {
  logger.error(err)
  if (process.send) {
    process.send({
      success: false,
      message: err&&err.message||"服务器出错"
    });
  }
  setTimeout(function () {
    process.exit()
  }, 200)
});
logger.info(`子进程启动，pid = ${process.pid}, argv = ${JSON.stringify(process.argv)}`)
// 取得参数数据
let unmatched = [], matched=[],attachments = [], [file, voucher] = process.argv.slice(2), workbook = XLSX.readFile(file),
  sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];
let vouchers = JSON.parse(fs.readFileSync(voucher, {encoding: "utf8"})),
  usefulVouchers = vouchers.filter(r => /^.+(\.zip|\.rar)$/.test(r)).map(r=>r.toLowerCase()),
  shiftVouchers = vouchers.map(r => (typeof r == "string") ? r.toLowerCase() : new String(r).toLowerCase());
if (!usefulVouchers.length) {
  throw new Error("没有发现任何用户资料包")
}
XLSX.utils.sheet_to_json(sheet).forEach(r => {
  let row = {
    borrow_business_license: getSheetValue(r["营业执照号"]),
    business_type: getSheetValue(r["业务类型"]),
    borrow_type: getSheetValue(r["借款主体类型"]),
    borrow_name: getSheetValue(r["借款人名称"]),
    borrow_pay_mode: getSheetValue(r["借款支付方式"]),
    borrow_date: getSheetValue(r["借款日期"]),
    borrow_deadline: getSheetValue(r["借款期限"]),
    borrow_fee: getSheetValue(r["借款金额（元）"]),
    gathering_name: getSheetValue(r["收款账号名称"]),
    gathering_card_no: getSheetValue(r["收款账户号"]),
    gathering_bank: getSheetValue(r["收款账户开户行"]),
    asset_order_no: getSheetValue(r["资产方订单号"]),
    borrow_period: getSheetValue(r["借款期限单位"]),
    borrow_purpose: getSheetValue(r["借款用途"]),
    repayment_mode: getSheetValue(r["还款方式"]),
    credit_info_details: getSheetValue(r["征信信息集合"] || r["订单授信信息集合"]),
  }
  let rawnameKey = `${row.borrow_name}${row.borrow_business_license}`
  let nameKey = rawnameKey.toLowerCase(),
    matchZipIndex = usefulVouchers.indexOf(`${nameKey}.zip`),
    matchRarIndex = usefulVouchers.indexOf(`${nameKey}.rar`),
    inflateIndex = (matchZipIndex !== -1)? matchZipIndex:  matchRarIndex,
    new_borrow_date= getSheetDateValue(row.borrow_date);

  if (row.business_type && !/^(00[1-9]|01[0-1]|06[1-4]|100)$/.test(row.business_type)) {
    row._reason = "业务类型有误"
  } else if (!row.borrow_type || !/^(B)$/.test(row.borrow_type)) {
    row._reason = "借款主体类型有误"
  } else if (!row.borrow_name) {
    row._reason = "借款人名称为空"
  } else if (!row.borrow_business_license) {
    row._reason = "营业执照号为空"
  } else if (!row.borrow_pay_mode || !/^(A|B)$/.test(row.borrow_pay_mode)) {
    row._reason = "借款支付方式有误"
  } else if (!new_borrow_date) {
    row._reason = "借款日期有误"
  } else if (!row.borrow_deadline || isNaN(row.borrow_deadline)) {
    row._reason = "借款期限有误"
  } else if (!row.borrow_fee || isNaN(row.borrow_fee)) {
    row._reason = "借款金额有误"
  } else if (!row.asset_order_no) {
    row._reason = "资产方订单号为空"
  } else if (!row.borrow_purpose) {
    row._reason = "借款用途为空"
  } else if (!row.borrow_period || !/^(A|B|C)$/.test(row.borrow_period)) {
    row._reason = "借款期限单位有误"
  } else if (inflateIndex === -1){
    row._reason = "无zip或者rar资料包"
  } else if (!row.repayment_mode || !/^00[1-8]$/.test(row.repayment_mode)) {
    row._reason = "还款方式有误"
  }

  if(row._reason){
    if(!isNaN(row.borrow_fee)){
      row.borrow_fee = Number((100 * Number(row.borrow_fee)).toFixed(0))
    }
    unmatched.push(row)
    return
  }

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

  row.borrow_voucher_details = possibleFiles.map((r,i)=>shiftVouchers.includes(r)?rawPossibleFiles[i]:undefined).filter(r=>r);
  /*row.borrow_voucher_details = vouchers.filter(r => {
    var t = (typeof r == "string") ? r.toLowerCase(): new String(r).toLowerCase();
    let escapedNameKey = RegExp.escape(nameKey)
    if(new RegExp(`^${escapedNameKey}(\\.rar|\\.zip|\\.jpg|\\.png|\\.pdf)$`).test(t) || new RegExp(`^(身份证|电子签章|补充资料)${escapedNameKey}(\\.rar|\\.zip|\\.jpg|\\.png|\\.pdf)$`).test(t)){
      !attachments.includes(r)&&(attachments.push(r))
      return true
    }
    return false
  });*/
  (row.borrow_date !== "") && (row.borrow_date !== undefined) && (row.borrow_date = new_borrow_date);
  (row.borrow_fee !== "") && (row.borrow_fee !== undefined) && (row.borrow_fee = Number((100 * Number(row.borrow_fee)).toFixed(0)));
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
