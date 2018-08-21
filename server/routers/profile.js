var {getConnectionQ,getWriteConnectionQ,writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue, propertyChangeLogger,} = require("../util"),
  {sessionSaver,sessionReloader} = require('../session'),
  router = Router();

/**
 * 作者：石奇峰
 * 模块：账号信息
 * */
router.use((req, res, next) => {
  if(!req.session._submenu.includes("profile")){
    res.json({success:false, message:"您没有调用账号信息页面接口的权限"})
    return
  }
  next();
})

/** 用户都是可以更新自己的信息的，故不设权限 */
router.post('/update', (req, res, next) => {
  let connection, {user_id, sub_account} = req.session.profile,
    sub_user_id = sub_account && sub_account.sub_user_id || '',
    params = getMySQLFieldValue({...req.body,
      user_id: req.session.profile.user_id,
      sub_user_id: req.session.profile.sub_user_id,
      password: req.body.new_password ? req.body.new_password.md5() : '',
      oldPassword: req.body.new_password && (req.body.old_password ? req.body.old_password.md5() : '')
      || sub_account&& sub_account.password || req.session.profile.password
    });
  co(function*() {
    if(!params.linkman){
      throw new Error("联系人不能为空")
    } else if(!params.mobile){
      throw new Error("联系人手机不能为空")
    } else if(!params.email){
      throw new Error("联系人email不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    let old_value = '', rows = [], _session
    try {
      yield  Transaction.call(connection);
      if(sub_user_id){
        let [[countRows],[mainUserRows]] = yield [
          Query.call(connection, sqls.subUserQuery, {sub_user_id}),
          Query.call(connection, sqls.userQuery, {user_id})
        ]
        if (!countRows || !countRows[0]) {
          throw new Error("查无此子用户")
        }
        if (!mainUserRows || !mainUserRows[0]) {
          throw new Error("查无此主用户")
        }
        old_value = countRows[0]
        let [results] = yield Query.call(connection, sqls.subUserUpdate, params)
        if (results.affectedRows < 1) {
          throw new Error("旧密码不正确，更新失败")
        }
        yield Commit.call(connection)
        if (results.changedRows < 1) {
          throw new Error("无需更新")
        }
        [rows] = yield Query.call(connection, sqls.subUserQuery, {sub_user_id})
        if (!rows || !rows[0]) {
          throw new Error("已更新但查无记录")
        }
        _session = Object.assign({},req.session.profile,{sub_account: rows[0]},mainUserRows[0]);
      } else {
        let [countRows] = yield Query.call(connection, sqls.userQuery, {user_id})
        if (!countRows || !countRows[0]) {
          throw new Error("查无此用户")
        }
        old_value = countRows[0]
        let [results] = yield Query.call(connection, sqls.userUpdate, params)
        if (results.affectedRows < 1) {
          throw new Error("旧密码不正确，更新失败")
        }
        yield Commit.call(connection)
        if (results.changedRows < 1) {
          throw new Error("无需更新")
        }
        [rows] = yield Query.call(connection, sqls.userQuery, {user_id})
        if (!rows || !rows[0]) {
          throw new Error("已更新但查无记录")
        }
        _session = Object.assign({},req.session.profile,rows[0]);
      }
      req.session.profile = _session
      //res.cookie('_edi_session', JSON.stringify(_session))
      res.json({success: true, data: _session})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {
      let from_table = 't_user',
        logger = propertyChangeLogger(old_value, [
          {name: 'user_name', label: '机构名'},
          {name: 'tel', label: '用户电话'},
          {name: 'mobile', label: '用户手机'},
          {name: 'email', label: '用户邮箱'},
          {name: 'password', label: '用户密码'},
        ], params),
        from_table_key = `${req.session.profile.user_id}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改用户自身资料 修改内容：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`
      yield writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
      return connection
    }).catch((err) => {
      logger.info(err)
      return connection
    })
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "更新失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
});

module.exports = router
