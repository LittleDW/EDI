var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'),
  sqls = require("../../config/sqls.json"), ropAPI = require("../ropAPI"),
  {logger, promisify, co, Router, getMySQLFieldValue, propertyChangeLogger,uuidv4, operLogDictionaryGenerator} = require("../util"),
  router = Router();

/**
 * 作者：马伯骁
 * 模块：合作方管理
 * 修改：石奇峰，添加了了必填项node二次验证的信息
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("cooperator_info")){
    res.json({success:false, message:"您没有调用合作方管理页面接口的权限"})
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
      params = getMySQLFieldValue(Object.assign({...req.session.subUserDataRestriction}, body, {pageIndex: myPageIndex}))
    if (req.session.profile.user_type == 2) {
      params.order_column = "asset_user_from, asset_org_code, fund_org_code"
      params = Object.assign({}, params, {fund_org_code: req.session.profile.org_code})
    } else if (req.session.profile.user_type == 1) {
      params.order_column = "fund_user_from, fund_org_code, asset_org_code"
      params = Object.assign({}, params, {asset_org_code: req.session.profile.org_code})
    } else {
      params.order_column = "fund_user_from, fund_org_code, asset_org_code"
    }
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.cooperatorInfoCount, params),
      Query.call(connection, sqls.cooperatorInfoQuery, params)
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

router.post('/create', (req, res, next) => {
  if(!req.session._button.includes("cooperator_info_create")){
    next();
    return
  }
  let connection, {user_type, user_name,user_full_name,linkman,mobile,email} = req.body, user_id = uuidv4(),
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      user_id,
      user_from: 2,
      user_status: 1,
      user_account: user_id,
      password: user_id.md5(),
    })), addUserFlag = false, searchParams, asset_org_code, fund_org_code
  co(function*() {
    if(req.session.profile.user_type == 1) {
      if(!user_full_name){
        throw new Error("资金方名称不能为空")
      } else if (!user_name){
        throw new Error("资金方简称不能为空")
      } else if (!linkman){
        throw new Error("资金方联系人不能为空")
      } else if (!mobile){
        throw new Error("资金方联系方式不能为空")
      } else if (!email){
        throw new Error("资金方联系邮箱不能为空")
      }
    } else if (req.session.profile.user_type == 2){
      if(!user_full_name){
        throw new Error("资产方名称不能为空")
      } else if (!user_name){
        throw new Error("资产方简称不能为空")
      } else if (!linkman){
        throw new Error("资产方联系人不能为空")
      } else if (!mobile){
        throw new Error("资产方联系方式不能为空")
      } else if (!email){
        throw new Error("资产方联系邮箱不能为空")
      }
    } else {
      if(!user_full_name){
        throw new Error("名称不能为空")
      } else if (!user_name){
        throw new Error("简称不能为空")
      } else if (!linkman){
        throw new Error("联系人不能为空")
      } else if (!mobile){
        throw new Error("联系方式不能为空")
      } else if (!email){
        throw new Error("联系邮箱不能为空")
      }
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)
      let [userRow] = yield Query.call(connection, sqls.userSearchByUserFullName, params)
      let cooperatorOrgCode
      if (user_type == 5) {
        cooperatorOrgCode = "A1505"
      } else {
        cooperatorOrgCode = "F1506"
      }
      if (!userRow || !userRow[0]) {
        let newOrgCode
        let [maxOrgCodeRow] = yield Query.call(connection, sqls.maxOrgCodeSearchByUserType, params)
        if (!maxOrgCodeRow || !maxOrgCodeRow[0] || !maxOrgCodeRow[0].max_org_code) {
          newOrgCode = `${cooperatorOrgCode}001`
        } else {
          let maxOrgCode = maxOrgCodeRow[0].max_org_code
          let orgNum = (parseInt(maxOrgCode.slice(6)) + 1).toString()
          while (orgNum.length < 3) {
            orgNum = "0" + orgNum
          }
          newOrgCode = `${cooperatorOrgCode}${orgNum}`
        }

        params.org_code = newOrgCode

        let [[results], [dicResults]] = yield [
          Query.call(connection, sqls.userManageCreate, params),
          Query.call(connection, sqls.dictionaryCreate, {
            table_name: "t_user",
            col_name: "org_code",
            para_key: newOrgCode,
            para_value: user_name
          })
        ]

        cooperatorOrgCode = newOrgCode
        if (results.affectedRows < 1) {
          throw new Error("用户添加失败")
        }
        if (dicResults.affectedRows < 1) {
          throw new Error("字典添加失败")
        }
        addUserFlag = true
      } else {
        cooperatorOrgCode = userRow[0].org_code
      }

      if (user_type == 5) {
        asset_org_code = cooperatorOrgCode
        fund_org_code = req.session.profile.org_code
        searchParams = {fund_org_code: fund_org_code, order_column: "asset_user_from, asset_org_code"}
      } else {
        asset_org_code = req.session.profile.org_code
        fund_org_code = cooperatorOrgCode
        searchParams = {asset_org_code: asset_org_code, order_column: "fund_user_from, fund_org_code"}
      }

      let [preCountRows] = yield Query.call(connection, sqls.cooperatorInfoPreCount, {asset_org_code, fund_org_code})
      if (preCountRows[0] && (preCountRows[0].total > 0)) {
        throw new Error(`合作方[${params.user_full_name}]已存在`)
      }

      let [[assetAccountCreateResults]] = yield [
        Query.call(connection, sqls.assetAccountCreate, {asset_org_code, fund_org_code, account_purpose: '001'}),
      ]

      if (assetAccountCreateResults.affectedRows < 1) {
        throw new Error("资产方账号添加失败")
      }

      let [[fundAccountCreaterResults002]] = yield [
        Query.call(connection, sqls.fundAccountCreate, {asset_org_code, fund_org_code, account_purpose: '002'}),
      ]

      if (fundAccountCreaterResults002.affectedRows < 1) {
        throw new Error("资金方账号添加失败")
      }

      let [[fundAccountCreaterResults003]] = yield [
        Query.call(connection, sqls.fundAccountCreate, {asset_org_code, fund_org_code, account_purpose: '003'}),
      ]

      if (fundAccountCreaterResults003.affectedRows < 1) {
        throw new Error("资金方账号添加失败")
      }

      let [[results]] = yield [
        Query.call(connection, sqls.cooperatorInfoCreate, {asset_org_code, fund_org_code}),
      ]

      if (results.affectedRows < 1) {
        throw new Error("合作关系添加失败")
      }

      yield Commit.call(connection)

      let [[countRows], [rows]] = yield [
        Query.call(connection, sqls.cooperatorInfoCount, getMySQLFieldValue({...searchParams,...req.session.subUserDataRestriction})),
        Query.call(connection, sqls.cooperatorInfoQuery, getMySQLFieldValue({...searchParams,page_index:0,...req.session.subUserDataRestriction}))
      ]
      if (!countRows || !countRows[0] || (countRows[0].total < 1)) {
        throw new Error("已创建，但查找失败")
      }
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows, total: countRows[0].total})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function*() {
      if (addUserFlag) {
        params = operLogDictionaryGenerator('*', ['user_type', 'user_from', 'user_status'], params);
        let from_table = 't_user',
          logger = propertyChangeLogger({},[
            {name: 'user_id', label: '用户编码'},
            {name: 'user_type', label: '用户类型'},
            {name: 'user_from', label: '机构编码'},
            {name: 'user_status', label: '用户状态'},
            {name: 'user_account', label: '用户账号'},
            {name: 'password', label: '用户密码'},
            {name: 'user_name', label: '用户简称'},
            {name: 'user_full_name', label: '用户全称'},
            {name: 'rop_user_id', label: '绑定ROP平台的用户编码'},
            {name: 'tel', label: '用户电话'},
            {name: 'mobile', label: '用户手机'},
            {name: 'email', label: '用户邮箱'}
          ], params),
          from_table_key = user_id,
          from_org_code = req.session.profile.org_code,
          create_user_id = req.session.profile.user_id,
          sub_user_id = req.session.profile.sub_user_id;
        let oper_log = `动作：修改用户表 修改内容：添加用户：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

        let from_dic_table = 't_sys_para_info',
          from_dic_table_key = `org_code,${params.user_name},${params.org_code},t_user`,
          from_dic_org_code = req.session.profile.org_code,
          create_dic_user_id = req.session.profile.user_id,
          create_dic_sub_user_id = req.session.profile.sub_user_id;
        let oper_dic_log = `动作：修改字典表 修改内容：增加词条：${from_dic_table_key}`
        yield [
          writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
          writeOperLog(connection, {
            from_table:from_dic_table,
            from_table_key:from_dic_table_key,
            from_org_code:from_dic_org_code,
            create_user_id:create_dic_user_id,
            sub_user_id: create_dic_sub_user_id,
            oper_log:oper_dic_log
          })
        ]
      }

      let from_table = 't_asset_fund',
        from_table_key = `${asset_org_code},${fund_org_code}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改资金方产品表 修改内容：增加合作方关联：资产方：${asset_org_code}, 资金方：${fund_org_code}`

      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
      ]

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

router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("cooperator_info_update")){
    next();
    return
  }
  let connection, {org_code, user_full_name, user_name,linkman,mobile,email} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      password: req.body.new_password ? req.body.new_password.md5() : '',
    })), old_value
  co(function*() {
    if(req.session.profile.user_type == 1) {
      if(!user_full_name){
        throw new Error("资金方名称不能为空")
      } else if (!user_name){
        throw new Error("资金方简称不能为空")
      } else if (!linkman){
        throw new Error("资金方联系人不能为空")
      } else if (!mobile){
        throw new Error("资金方联系方式不能为空")
      } else if (!email){
        throw new Error("资金方联系邮箱不能为空")
      }
    } else if (req.session.profile.user_type == 2){
      if(!user_full_name){
        throw new Error("资产方名称不能为空")
      } else if (!user_name){
        throw new Error("资产方简称不能为空")
      } else if (!linkman){
        throw new Error("资产方联系人不能为空")
      } else if (!mobile){
        throw new Error("资产方联系方式不能为空")
      } else if (!email){
        throw new Error("资产方联系邮箱不能为空")
      }
    } else {
      if(!user_full_name){
        throw new Error("名称不能为空")
      } else if (!user_name){
        throw new Error("简称不能为空")
      } else if (!linkman){
        throw new Error("联系人不能为空")
      } else if (!mobile){
        throw new Error("联系方式不能为空")
      } else if (!email){
        throw new Error("联系邮箱不能为空")
      }
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});

    let [preQueryRows] = yield Query.call(connection, sqls.userSearchByOrgCode, params)
    if (!preQueryRows || !preQueryRows[0]) {
      throw new Error("查无此用户")
    }
    old_value = preQueryRows[0]
    params.user_id = old_value.user_id
    let [userFullNameRows] = yield Query.call(connection, sqls.userFullNameCheck, {user_full_name: user_full_name, user_type: old_value.user_type, org_code: old_value.org_code})
    if (userFullNameRows && userFullNameRows[0]) {
      throw new Error("资产方全称已存在，请改变资产方全称")
    }
    try {
      yield  Transaction.call(connection)

      let [[results], [dicResults]] = yield [
        Query.call(connection, sqls.userManageUpdate, params),
        (old_value.org_code != org_code) || (old_value.user_name != user_name) ? Query.call(connection, sqls.dictionaryUpdate, {
          table_name: "t_user",
          col_name: "org_code",
          para_key: org_code,
          para_value: user_name,
          old_table_name: "t_user",
          old_col_name: "org_code",
          old_para_key: preQueryRows[0].org_code,
          old_para_value: preQueryRows[0].user_name,
        }) : Promise.resolve([])
      ]
      if (results.affectedRows < 1) {
        throw new Error("用户修改失败")
      }
      if (dicResults && (dicResults.affectedRows < 1)) {
        throw new Error("字典修改失败")
      }
      yield Commit.call(connection)

      let asset_org_code, fund_org_code
      if (old_value.user_type == 5) {
        asset_org_code = org_code
        fund_org_code = req.session.profile.org_code
      } else {
        asset_org_code = req.session.profile.org_code
        fund_org_code = org_code
      }

      let [rows] = yield Query.call(connection, sqls.cooperatorInfoQueryOne, {asset_org_code, fund_org_code})
      if (!rows || !rows[0]) {
        throw new Error("已更新但查无记录")
      }
      res.json({success: true, data: rows[0]})

      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {
      let from_table = 't_user',
        logger = propertyChangeLogger(old_value,[
          {name: 'user_name', label: '资金方简称'},
          {name: 'user_full_name', label: '资金方名称'},
          {name: 'linkman', label: '联系人'},
          {name: 'tel', label: '用户电话'},
          {name: 'mobile', label: '联系方式'},
          {name: 'email', label: '联系人邮箱'}
        ], params),
        from_table_key = old_value.user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改用户表 修改内容：修改用户：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      let from_dic_table = 't_sys_para_info',
        from_dic_table_key = `org_code,${params.user_name},${params.org_code},t_user`,
        from_dic_org_code = req.session.profile.org_code,
        create_dic_user_id = req.session.profile.user_id,
        create_dic_sub_user_id = req.session.profile.sub_user_id;

      let oper_dic_log = `动作：修改字典表 修改内容：修改词条：${from_dic_table_key}`
      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
        writeOperLog(connection, {
          from_table:from_dic_table,
          from_table_key:from_dic_table_key,
          from_org_code: from_dic_org_code,
          create_user_id: create_dic_user_id,
          sub_user_id: create_dic_sub_user_id,
          oper_log: oper_dic_log
        })
      ]
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

router.post('/delete', (req, res, next) => {
  if(!req.session._button.includes("cooperator_info_delete")){
    next();
    return
  }
  let connection, params = getMySQLFieldValue(req.body), old_value
  co(function*() {
    if(req.session.profile.user_type == 1) {
      if(!params.fund_org_code){
        throw new Error("资金方不能为空")
      }
    } else if (req.session.profile.user_type == 2){
      if(!params.asset_org_code){
        throw new Error("资产方名称不能为空")
      }
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield Transaction.call(connection)
      let searchParams
      if (req.session.profile.user_type == 2) {
        searchParams = {fund_org_code: req.session.profile.org_code, order_column: "asset_user_from, asset_org_code"}
        params = Object.assign({}, params, {fund_org_code: req.session.profile.org_code})
      } else {
        searchParams = {asset_org_code: req.session.profile.org_code, order_column: "fund_user_from, fund_org_code"}
        params = Object.assign({}, params, {asset_org_code: req.session.profile.org_code})
      }

      let [assetAccountDeleteResults] = yield Query.call(connection, sqls.assetAccountDelete, Object.assign({}, params, {account_purpose: '001'}))
      if (assetAccountDeleteResults.affectedRows < 1) {
        throw new Error("资产方账号删除失败")
      }
      let [fundAccountDeleteResults002] = yield Query.call(connection, sqls.fundAccountDelete, Object.assign({}, params, {account_purpose: '002'}))
      if (fundAccountDeleteResults002.affectedRows < 1) {
        throw new Error("资金方账号删除失败")
      }
      let [fundAccountDeleteResults003] = yield Query.call(connection, sqls.fundAccountDelete, Object.assign({}, params, {account_purpose: '003'}))
      if (fundAccountDeleteResults003.affectedRows < 1) {
        throw new Error("资金方账号删除失败")
      }
      let [results] = yield Query.call(connection, sqls.cooperatorInfoDelete, params)
      if (results.affectedRows < 1) {
        throw new Error("合作方删除失败")
      }
      yield Commit.call(connection)

      let [[countRows], [rows]] = yield [
        /*Query.call(connection, sqls.cooperatorInfoCount, searchParams),
        Query.call(connection, sqls.cooperatorInfoQuery, Object.assign({},searchParams, {page_index: 0}))*/
        Query.call(connection, sqls.cooperatorInfoCount, getMySQLFieldValue({...searchParams,...req.session.subUserDataRestriction})),
        Query.call(connection, sqls.cooperatorInfoQuery, getMySQLFieldValue({...searchParams,page_index:0,...req.session.subUserDataRestriction}))
      ]

      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows, total: countRows[0].total})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function*() {
      let from_table = 't_asset_fund',
        from_table_key = `${params.asset_org_code},${params.fund_org_code}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改资金方产品表 修改内容：删除合作方：资产方：${params.asset_org_code}, 资金方：${params.fund_org_code}`

      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
      ]
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

router.post('/searchRelation', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {org_code} = req.body, rows = []
    let sql = org_code && org_code.startsWith("F")?sqls.notAddRelationAssetOrgQuery:sqls.notAddRelationFundOrgQuery
    if (!org_code) {
      res.json({success: true, rows})
    } else {
      let [[rows]] = yield [
        Query.call(connection, sql, {org_code})
      ]
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows})
    }
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

router.post('/addRelation', (req, res, next) => {
  if(!req.session._button.includes("cooperator_info_add_relation")){
    next();
    return
  }
  let connection, {orgCode, relationOrgCodes, assetOrgCode: asset_org_code, fundOrgCode: fund_org_code} = req.body, user_id = uuidv4(),searchParams = {order_column: "fund_user_from, fund_org_code", asset_org_code, fund_org_code}
  co(function*() {
    if(!relationOrgCodes){
      throw new Error("合作方不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      for (let r of relationOrgCodes) {
        let asset_org_code, fund_org_code

        if (orgCode.startsWith("F")) {
          fund_org_code = orgCode
          asset_org_code = r
        } else {
          fund_org_code = r
          asset_org_code = orgCode
        }
        let [[results]] = yield [
          Query.call(connection, sqls.cooperatorInfoCreate, {asset_org_code, fund_org_code})
        ]

        if (results.affectedRows < 1) {
          throw new Error("合作关系添加失败")
        }
      }

      yield Commit.call(connection)

      let [[countRows], [rows]] = yield [
        /*Query.call(connection, sqls.cooperatorInfoCount, searchParams),
        Query.call(connection, sqls.cooperatorInfoQuery, Object.assign({},searchParams, {page_index: 0}))*/
        Query.call(connection, sqls.cooperatorInfoCount, getMySQLFieldValue({...searchParams,...req.session.subUserDataRestriction})),
        Query.call(connection, sqls.cooperatorInfoQuery, getMySQLFieldValue({...searchParams,page_index:0,...req.session.subUserDataRestriction}))
      ]
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows, total: countRows[0].total})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function*() {
      for (let r of relationOrgCodes) {
        let asset_org_code, fund_org_code

        if (orgCode.startsWith("F")) {
          fund_org_code = orgCode
          asset_org_code = r
        } else {
          fund_org_code = r
          asset_org_code = orgCode
        }
        let from_table = 't_asset_fund',
          from_table_key = `${asset_org_code},${fund_org_code}`,
          from_org_code = req.session.profile.org_code,
          create_user_id = req.session.profile.user_id,
          sub_user_id = req.session.profile.sub_user_id;
        let oper_log = `动作：修改资金方产品表 修改内容：增加合作方关联：资产方：${asset_org_code}, 资金方：${fund_org_code}`

        yield [
          writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
        ]
      }

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

router.post('/searchAddedRelation', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {org_code} = req.body, rows = []
    let sql = org_code && org_code.startsWith("F")?sqls.addedRelationAssetOrgQuery:sqls.addedRelationFundOrgQuery
    if (!org_code) {
      res.json({success: true, rows})
    } else {
      let [[rows]] = yield [
        Query.call(connection, sql, getMySQLFieldValue({org_code,...req.session.subUserDataRestriction}))
      ]
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows})
    }
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

router.post('/supplyInfo', (req, res, next) => {
  if(!req.session._button.includes("cooperator_info_supply_info")){
    next();
    return
  }
  let connection, connectionR
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    connectionR = yield getConnectionQ(req)
    let body = req.body,
      params = getMySQLFieldValue(Object.assign({}, body, {pageIndex: 0}))
    if (req.session.profile.user_type == 2) {
      params.order_column = "asset_user_from, asset_org_code, fund_org_code"
      params = Object.assign({}, params, {fund_org_code: req.session.profile.org_code})
    } else if (req.session.profile.user_type == 1) {
      params.order_column = "fund_user_from, fund_org_code, asset_org_code"
      params = Object.assign({}, params, {asset_org_code: req.session.profile.org_code})
    } else {
      params.order_column = "fund_user_from, fund_org_code, asset_org_code"
    }
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      //TODO 为调用存储过程留口
      yield Query.call(connection, sqls.cooperatorInfoSupplyment)

      yield Commit.call(connection)

      let [[countRows], [rows]] = yield [
        Query.call(connectionR, sqls.cooperatorInfoCount, getMySQLFieldValue({...params,...req.session.subUserDataRestriction})),
        Query.call(connectionR, sqls.cooperatorInfoQuery, getMySQLFieldValue({...params,...req.session.subUserDataRestriction}))
      ]
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows, total: countRows[0].total})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, connectionR}
  }).then(({connection, connectionR}) => {
    return co(function*() {

      return {connection, connectionR}
    }).catch((err) => {
      logger.info(err)
      return {connection, connectionR}
    })
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "更新失败"
    });
  }).then(()=>{
    connection && connection.release();
    connectionR && connectionR.release();
  });
});

module.exports = router
