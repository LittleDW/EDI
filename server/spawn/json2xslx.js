/**
 * 作者：石奇峰
 * 功能：用于将json转为excel，为了防止阻塞特意做成 spawn
 * */

var {logger, fs, XLSX} = require("../util")

process.on('uncaughtException', (err) => {
  logger.error(err)
  if (process.send) {
    process.send({
      success: false,
      message: err&&err.message||"服务器出错"
    });
  }
});
let [jsonfile, xslx] = process.argv.slice(2), wb = XLSX.utils.book_new();
let buffer = fs.readFileSync(jsonfile)
let serializedData = buffer.toString()
let pieces = serializedData.split("@@$$**##@@").map(r=>{
  let item
  if(r){
    try{
      item = JSON.parse(r)
    }catch(e){}
  }
  return item
}).filter(r=>Array.isArray(r))

serializedData = [].concat.apply([], pieces);
//serializedData = JSON.parse(mergedSerializedData)
let ws = XLSX.utils.json_to_sheet(serializedData)

logger.info(`读出文件${jsonfile}`)
XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
XLSX.writeFile(wb, xslx)
logger.info(`已写入${xslx}`)

process.send({
  success: true
});

setTimeout(function () {
  process.exit()
}, 200)
