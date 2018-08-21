/**
 * 作者：石奇峰
 * 功能：Edi系统路由
 * */

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./Root.prod')
} else {
  module.exports = require('./Root.dev')
}
