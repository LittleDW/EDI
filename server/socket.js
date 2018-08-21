/**
 * 作者：石奇峰
 * 功能：提供第三方socket服务器，但是共用couchbase
 * */

//let sticky = require("sticky-session"),
let express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  app = express(),
  compress = require('compression'),
  fs = require('fs'),
  path = require('path'),
  {logger} = require('./util'),
  server,{killSession, session} = require('./session'),
  port,socket = require('socket.io'),
  config = require("../config/configure.json")[process.env.NODE_ENV];

server = require('http').createServer(app);

let io = socket(server)

port = process.env.port || 80

server.timeout = 3600000
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

app.set('port', port)
app.use(compress())
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}))
app.use(cookieParser('shiqifeng2000@gmail.com'));
app.use(session)


let servers = {}, clients = {}
let serverNSP = io.of('/edi-message-broker'),clientNSP = io.of('/edi-message-broker-client');
serverNSP.on('connection', (socket) => {
  let sessionId = socket.handshake.headers['x-edi-session'], pid = socket.handshake.headers['x-edi-pid'];
  servers[socket.id] = {socket, session: sessionId, pid}
  let ondisconnect = () => {
    logger.info(`Socket: 服务端节点 ${pid} 已断开`)
    if(servers.hasOwnProperty(socket.id)){
      delete servers[socket.id]
    }
    socket.conn.close();
  }
  logger.info(`Socket: 服务端节点 ${pid} 已连接socket`)
  socket.on('disconnect', ondisconnect)
  socket.on('close', ondisconnect);
  socket.on('message', opt=>{
    let {target, broadcast, topic, message, debug} = opt
    // target 是目标session id
    // 发送消息给客户端，发送给服务器无意义，如果target不指定则选择session一致的客户端，如果没有的话则不发，如果是广播模式则发给所有人
    if(target){
      let targetSocket = Object.values(clients).find(r=>(r.socket.id == target))
      if(targetSocket){
        logger.info(`Socket: 服务端节点 指定模式，发送给 [${target}]`)
        targetSocket.socket.emit(topic || "message",message)
      }
    } else if(broadcast){
      logger.info("Socket: 服务端节点 广播模式，发送给所有客户端")
      clientNSP.emit(topic || "message",message);
    } else {
      let targetSocket = Object.values(clients).filter(r=>(r.session == sessionId))
      if(targetSocket.length){
        logger.info(`Socket: 默认发送给 session 一致的目标`)
        targetSocket.forEach(r=>{r.socket.emit(topic || "message",message)})
      } else {
        logger.info("Socket: 服务端节点 没有任何消息发送")
      }
    }
  });
})
//clientNSP.use((socket, next) => session(socket.request, {}, next))
clientNSP.on("connection",(socket, next) => {
  session(socket.request, {}, ()=>{
    if(!socket.request.session || !socket.request.session.profile){
      logger.info(`Socket: 用户${socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress || socket.request.sessionID}已断开}`)
      socket.conn.close()
      return
    }
    let user_account = socket.request.session.profile.user_account, sessionID = socket.request.sessionID,
      ondisconnect = () => {
        logger.info(`Socket: 用户${user_account}已断开`)
        if(clients.hasOwnProperty(socket.id)){
          delete clients[socket.id]
        }
        socket.conn.close();
      }
    clients[socket.id] = {socket, session: sessionID}
    logger.info(`Socket: 用户${user_account}已连接socket`)
    socket.on('disconnect', ondisconnect)
    socket.on('close', ondisconnect);
    // 和服务端模式不同，前端不需要发送给所有后台服务器的节点，只需要发送给一个即可, 客户端的广播模式是广播给除自已以外的所有客户端
    socket.on('message', opt=>{
      let {target, broadcast, topic, message} = opt
      if(target){
        let targetSocket = Object.values(clients).filter(r=>(r.socket.id == target))
        if(targetSocket){
          logger.info(`Socket: 指定模式，发送给 [${target}]`)
          //targetSocket.forEach(r=>{r.socket.emit("message", message)})
          targetSocket.socket.emit(topic || "message",message)
        }
      } else if(broadcast){
        logger.info("Socket: 广播模式，发送给所有客户端")
        Object.values(clients).filter(r=>(r.socket.id != socket.id)).forEach(r=>{r.socket.emit(topic || "message", message)});
      } else {
        let targetSocket = Object.values(servers).find(r=>(r.session == sessionID))
        if(targetSocket){
          logger.info(`Socket: 默认发送给 session 一致的服务端目标`)
          targetSocket.socket.emit(topic || "message", message)
        } else {
          logger.info("Socket: 没有任何消息发送")
        }
      }
    })
  })
})

// 未知错误记录
process.on('uncaughtException', (error) => {
  logger.error(error)
})

server.listen(app.get('port'), () => {logger.info("Socket: 服务器已启动，并开始监听端口")})
//sticky.listen(server, app.get('port'))
