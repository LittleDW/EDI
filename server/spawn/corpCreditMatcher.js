/**
 * 作者：石奇峰
 * 功能：企业授信匹配器，用于防止解析excel大文件造成的阻塞所做
 * 相似：企业订单匹配器，个人订单匹配器，个人订单补充匹配器，企业订单补充匹配器，企业授信补充匹配器
 * */

var {logger, fs, path, uuidv4, XLSX, getSheetValue, getSheetDateValue,getSheetNumberValue} = require("../util")

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
let unmatched = [], matched=[],attachments = [], [file, voucher] = process.argv.slice(2), workbook = XLSX.readFile(file);
let vouchers = JSON.parse(fs.readFileSync(voucher, {encoding: "utf8"})),
  usefulVouchers = vouchers.filter(r => /^.+(\.zip|\.rar)$/.test(r)).map(r=>r.toLowerCase()),
  sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]],
  shiftVouchers = vouchers.map(r => (typeof r == "string") ? r.toLowerCase() : new String(r).toLowerCase());

if (!usefulVouchers.length) {
  throw new Error("没有发现任何用户资料包")
}
XLSX.utils.sheet_to_json(sheet).forEach(r => {
  let row = {
    borrow_name: getSheetValue(r["借款人名称"]),
    borrow_business_license: getSheetValue(r["营业执照号"]),
    borrow_org_code: getSheetValue(r["组织机构代码"]),
    borrow_account_licence: getSheetValue(r["开户许可证"]),
    borrow_credit_code: getSheetValue(r["信用代码证"]),
    borrow_tax_registration: getSheetValue(r["税务登记证"]),
    borrow_enterprise_type: getSheetValue(r["企业类型"]),
    borrow_type: getSheetValue(r["借款主体类型"]),
    borrow_registered_address: getSheetValue(r["注册地址"]),
    borrow_manage_address: getSheetValue(r["经营地址"]),
    borrow_register_date: getSheetValue(r["成立日期"]),
    borrow_corporate_name: getSheetValue(r["法人姓名"]),
    borrow_corporate_certificate_no: getSheetValue(r["法人身份证号"]),
    borrow_phone: getSheetValue(r["联系人手机号"]),
    borrow_mail: getSheetValue(r["借款人邮箱"]),
    borrow_bank: getSheetValue(r["开户行"]),
    borrow_branch_bank: getSheetValue(r["开户支行"]),
    borrow_bank_account_name: getSheetValue(r["开户名称"]),
    borrow_bank_account_no: getSheetValue(r["开户银行账号"]),
    borrow_bank_account_address: getSheetValue(r["开户地址"]),
    industry: getSheetValue(r["行业"]),
    income: getSheetValue(r["借款人收入及负债"])||getSheetValue(r["收入情况"]),
    credit_info: getSheetValue(r["征信情况"]),
    paid_in_capital: getSheetValue(r["实缴资本（元）"]),
  }
  let rawnameKey = `${row.borrow_name}${row.borrow_business_license}`
  let nameKey = rawnameKey.toLowerCase(),
    matchZipIndex = usefulVouchers.indexOf(`${nameKey}.zip`),
    matchRarIndex = usefulVouchers.indexOf(`${nameKey}.rar`),
    inflateIndex = (matchZipIndex !== -1)? matchZipIndex:  matchRarIndex,
    new_borrow_register_date= getSheetDateValue(row.borrow_register_date),
    new_paid_in_capital = getSheetNumberValue(row.paid_in_capital);

  /*if ((!row.borrow_type || !/^(B)$/.test(row.borrow_type))
    || (!row.borrow_business_license)
    || (!row.borrow_org_code)
    || (!row.borrow_account_licence)
    || (!row.borrow_credit_code)
    || (!row.borrow_tax_registration)
    || (row.borrow_enterprise_type && !/^(A|B|C|D|E|F|G|H)$/.test(row.borrow_enterprise_type))
    || (!row.borrow_corporate_name)
    || (!row.borrow_corporate_certificate_no)
    || (row.borrow_register_date && !new_borrow_register_date)
    || (!row.borrow_phone)
    || (!row.borrow_name)
    || (!row.borrow_branch_bank)
    || (!row.borrow_bank_account_name)
    || (!row.borrow_bank_account_no)
    || (inflateIndex === -1)) {
    unmatched.push(row)
    return
  }*/

  if (!row.borrow_type || !/^(B)$/.test(row.borrow_type)) {
    row._reason = "借款主体类型有误"
  } else if (!row.borrow_business_license) {
    row._reason = "营业执照号为空"
  } else if (!row.borrow_org_code) {
    row._reason = "组织机构代码为空"
  } else if (!row.borrow_account_licence) {
    row._reason = "开户许可证为空"
  } else if (!row.borrow_credit_code) {
    row._reason = "信用代码证为空"
  } else if (!row.borrow_tax_registration) {
    row._reason = "税务登记证为空"
  } else if (!row.borrow_enterprise_type || !/^(A|B|C|D|E|F|G|H)$/.test(row.borrow_enterprise_type)) {
    row._reason = "企业类型有误"
  } else if (!row.borrow_corporate_name) {
    row._reason = "法人姓名为空"
  } else if (!row.borrow_corporate_certificate_no) {
    row._reason = "法人身份证号为空"
  } else if (row.borrow_register_date && !new_borrow_register_date) {
    row._reason = "成立日期有误"
  } else if (!row.borrow_phone) {
    row._reason = "联系人手机号为空"
  } else if (!row.borrow_name) {
    row._reason = "借款人名称为空"
  } else if (!row.borrow_branch_bank) {
    row._reason = "开户支行为空"
  } else if (!row.borrow_bank_account_name) {
    row._reason = "开户名称为空"
  } else if (!row.borrow_bank_account_no) {
    row._reason = "开户银行账号为空"
  } else if (inflateIndex === -1) {
    row._reason = "无zip或者rar资料包"
  } else if (!row.industry) {
    row._reason = "行业为空"
  } else if (!row.income) {
    row._reason = "借款人收入及负债为空"
  } else if ((row.paid_in_capital !== "") && (row.paid_in_capital !== undefined) && (isNaN(new_paid_in_capital) || (new_paid_in_capital <= 0))){
    row._reason = "实缴资本有误"
  }

  if(row._reason){
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

  row.borrow_credit_voucher_details = possibleFiles.map((r,i)=>shiftVouchers.includes(r)?rawPossibleFiles[i]:undefined).filter(r=>r);

  /*row.borrow_credit_voucher_details = vouchers.filter(r => {
    var t = (typeof r == "string") ? r.toLowerCase(): new String(r).toLowerCase();
    let escapedNameKey = RegExp.escape(nameKey)
    if(new RegExp(`^${escapedNameKey}(\\.rar|\\.zip|\\.jpg|\\.png|\\.pdf)$`).test(t) || new RegExp(`^(身份证|电子签章|补充资料)${escapedNameKey}(\\.rar|\\.zip|\\.jpg|\\.png|\\.pdf)$`).test(t)){
      !attachments.includes(r)&&(attachments.push(r))
      return true
    }
    return false
  });*/
  (row.borrow_register_date !== "") && (row.borrow_register_date !== undefined) && (row.borrow_register_date = new_borrow_register_date);
  (row.paid_in_capital !== "") && (row.paid_in_capital !== undefined) && (row.paid_in_capital = new_paid_in_capital);
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
