var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue, propertyChangeLogger,} = require("../util"),
  router = Router();

/**
 * 作者：张宝玉
 * 模块：平台属性
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("user_attribute_management")){
    res.json({success:false, message:"您没有调用平台属性页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let body = req.body,
      myPageIndex = (isNaN(body.pageIndex) || (body.pageIndex < 1)) ? 0 : 10 * (body.pageIndex - 1),
      params = getMySQLFieldValue(Object.assign({}, body, {pageIndex: myPageIndex}))
    if(req.session.subUserDataRestriction){
      let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
      params.restriction = [...assetDataRestriction,...fundDataRestriction]
    }
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.userAttributeManagement_Count, params),
      Query.call(connection, sqls.userAttributeManagement_Query, params)
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
  }).then(()=>{
    connection && connection.release();
  });
});

module.exports = router
