/**
 * 作者：石奇峰
 * EDI系统的Store配置
 * */

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./configureStore.prod')
} else {
  module.exports = require('./configureStore.dev')
}
