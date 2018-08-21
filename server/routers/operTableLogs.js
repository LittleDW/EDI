var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, uuidv4, getMySQLFieldValue, propertyChangeLogger,} = require("../util"),
  router = Router();

/**
 * 作者：马伯骁
 * 模块：操作信息页面
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("oper_table_logs")){
    res.json({success:false, message:"您没有调用操作信息页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {operTimeStart, operTimeEnd, userName, tableName, pageIndex} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = getMySQLFieldValue({
        operTimeStart,
        operTimeEnd,
        userName,
        tableName,
        pageIndex: myPageIndex
      })
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.operTableLogCount, params),
      Query.call(connection, sqls.operTableLogQuery, params)
    ]
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }
    res.json({success: true, rows, total: countRows[0].total})
    return rows
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});
module.exports = router
