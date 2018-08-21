/**
 * 作者：石奇峰
 * EDI Node应用入口
 * */
// https 签名设置，token设置，token暂时用于清理缓存

//let sticky = require("sticky-session"),
let express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  multer = require('multer'),
  session = require('express-session'),
  app = express(),
  compress = require('compression'),
  fs = require('fs'),
  path = require('path'),
  config = require('dotenv').config(),
  setup = require('./setup'),
  {logger} = require('./util'),
  server,
  port,
  cluster = require('cluster');
const configure = require('../config/configure.json')[process.env.NODE_ENV];

/*if (process.env.NODE_ENV === 'production') {
  let privateKey = fs.readFileSync(`${__dirname}/../ssl/ssl.key`, 'utf8'),
    certificate = fs.readFileSync(`${__dirname}/../ssl/ssl.pem`, 'utf8'),
    credentials = {
      key: privateKey,
      cert: certificate
  }
  server = require('https').createServer(credentials, app);
  port = 443
} else if (process.env.NODE_ENV === 'production-stlc'){
  server = require('http').createServer(app);
  port = process.env.port || 8090;
} else {
  server = require('http').createServer(app);
  port = process.env.port || 80
}*/
server = require('http').createServer(app);
port = process.env.port || 80
server.timeout = 3600000
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

app.set('port', port)

// 全局设置
//app.set('views', `${__dirname}/../${constant.viewsPath}`)
//app.set('view engine', 'ejs')
app.use(compress())

app.use("/document", express.static(__dirname + '/../document'));

app.use(express.static(`${__dirname}/../build`, {
  etag: true,
  maxage: '24h',
  index: false,
}))

if (process.env.NODE_ENV !== 'production') {
  app.use('/logs', express.static(`${__dirname}/../logs`));
}

app.use(bodyParser.json({
  limit: '50mb'
})) // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
})) // for parsing application/x-www-form-urlencoded
//app.use(cookieParser('shiqifeng2000@gmail.com'))

if (process.env.NODE_ENV === 'production-stlc'){
  app.use(function(req, res,next) {
    var ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    if (configure.ipwhitelist.includes(ip)){
      next();
    } else {
      res.status(404).send("您无权访问，请联系管理员")
    }
  });
}

setup.setupApp(app,server)

app.use('/', function(req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.sendFile(path.join(`${__dirname}/../build`, 'index.html'));
});
// 全局错误拯救机制
app.use((res, error, html) => {
  if (error) {
    logger.error(error)
    res.send(error)
  } else {
    res.send(html)
  }
})
// 未知错误记录
process.on('uncaughtException', (error) => {
  logger.error(error)
})

process.on('unhandledRejection', error => {
  logger.error(error)
});

server.listen(app.get('port'), () => {
  logger.info("Node 已启动，并开始监听端口")
})
//sticky.listen(server, app.get('port'))
module.exports = server;
