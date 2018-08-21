/**
 * 作者：石奇峰
 * 功能：git更新自启动模块，用于实现免jenkins用git的webhook使服务器在每次git push之后自行build并重启
 * */

var {spawn,exec} = require('child_process')
var {logger, path, co} = require("../util")

process.on('uncaughtException', (err) => {
  logger.build(err)
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
logger.build(`子进程启动，pid = ${process.pid}, argv = ${JSON.stringify(process.argv)}`)

const options = {stdio: ['pipe', 'pipe', 'pipe', 'ipc']}
let script, errors
if(process.env.NODE_ENV == "production"){
  script = path.resolve(`${__dirname}/../../shell/pm2-production.sh`)
} else if (process.env.NODE_ENV == "uat"){
  script = path.resolve(`${__dirname}/../../shell/pm2-uat.sh`)
} else {
  script = path.resolve(`${__dirname}/../../shell/pm2.sh`)
}

const sendWarning = data=>{
  exec(`echo \"${data}\" | mail -s 测试环境编译出错 shiqifeng@rongcapital.cn,zhangjunjie@rongcapital.cn,zhangcheng@rongcapital.cn`)
}
co(function*(){
  yield new Promise((res, rej) => {
    let child = spawn("bash", [script], options)
    child.stdout.on('data', (data) => {
      logger.build(data.toString())
    });

    child.stderr.on('data', (data) => {
      if(!errors){
        errors = (data+"\n")
      } else {
        errors += (data+"\n")
      }
      logger.build(data.toString())
    });
    child.on('close', res);
    child.on('error', rej);
  })
  process.send && (typeof process.send == "function") && process.send({success: true});
}).catch(error=>{
  process.send && (typeof process.send == "function") && process.send({success: false, error});
}).then(()=>{
  if(errors){
    sendWarning(errors)
  }
  setTimeout(function () {
    process.exit()
  }, 200)
})
