var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, uuidv4, getMySQLFieldValue, propertyChangeLogger, makeTree} = require("../util"),
  router = Router();

/**
 * 作者：马博晓
 * 模块：菜单管理
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("menu_management")){
    res.json({success:false, message:"您没有调用菜单管理页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let [[menusRows]] = yield [
      Query.call(connection, sqls.allMenusSearch)
    ]
    if (!menusRows) {
      throw new Error("无记录")
    }

    res.json({success: true, menus: makeTree(menusRows)})
    return connection
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
});
router.post('/detail', (req, res, next) => {
  let connection, {func_id} = req.body
  if (!func_id) {
    res.json({success: true, detail: {}})
    return
  }
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let [[menusRows]] = yield [
      Query.call(connection, sqls.menuDetailSearch, {func_id})
    ]
    if (!menusRows) {
      throw new Error("无记录")
    }

    res.json({success: true, detail: menusRows[0]})
    return connection
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
  if(!req.session._button.includes("menu_management_create")){
    next();
    return
  }

  let connection, {f_func_id} = req.body, func_id = uuidv4(), user_id = req.session.profile.user_id,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      func_id: func_id,
      use_yn: 'Y',
      create_user_id: user_id,
    }))
  co(function*() {

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)
      if (f_func_id) {
        let [parentMenuRow] = yield Query.call(connection, sqls.menuDetailSearch, {func_id: f_func_id})
        if (!parentMenuRow || !parentMenuRow[0]) {
          throw new Error(`父菜单已不存在，请重新查询`)
        }
        params.func_level = parentMenuRow[0].func_level + 1
        params.func_role_type = 0
      } else {
        params.func_level = 0
      }

      let [maxMenuSortIdRow] = yield Query.call(connection, sqls.maxMenuSortIdSearch, {f_func_id})
      if (Number.isInteger(maxMenuSortIdRow[0].max_sort_id)) {
        params.sort_id = maxMenuSortIdRow[0].max_sort_id + 1
      } else {
        params.sort_id = 0;
      }

      let [[results]] = yield [
        Query.call(connection, sqls.menuManageCreate, params),
      ]
      if (results.affectedRows < 1) {
        throw new Error("菜单添加失败")
      }

      yield Commit.call(connection)

      let [[menusRows]] = yield [
        Query.call(connection, sqls.allMenusSearch)
      ]
      if (!menusRows) {
        throw new Error("无记录")
      }

      res.json({success: true, menus: makeTree(menusRows)})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function*() {
      let from_table = 't_func',
        logger = propertyChangeLogger({}, [
          {name: 'func_id', label: '功能ID'},
          {name: 'f_func_id', label: '父亲ID'},
          {name: 'func_name', label: '功能名称'},
          {name: 'func_path', label: '菜单路径'},
          {name: 'page_id', label: '菜单ID'},
          {name: 'func_level', label: '级别'},
          {name: 'func_role_type', label: '菜单类型'},
          {name: 'func_img', label: '菜单图标'},
          {name: 'sort_id', label: '排序ID'}
        ], params),
        from_table_key = func_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改菜单表 修改内容：添加菜单：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

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
  if(!req.session._button.includes("menu_management_update")){
    next();
    return
  }
  let connection, {func_id} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body)), old_value
  co(function*() {

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.menuDetailSearch, {func_id})
      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("查无此记录")
      }
      old_value = preQueryRows[0]

      let [[results]] = yield [
        Query.call(connection, sqls.menuManageUpdate, params)
      ]
      if (results.affectedRows < 1) {
        throw new Error("菜单修改失败")
      }
      yield Commit.call(connection)

      let [rows] = yield Query.call(connection, sqls.menuDetailSearch, {func_id})
      if (!rows || !rows[0]) {
        throw new Error("已更新但查无记录")
      }

      let [[menusRows]] = yield [
        Query.call(connection, sqls.allMenusSearch)
      ]
      if (!menusRows) {
        throw new Error("无记录")
      }

      res.json({success: true, menus: makeTree(menusRows), detail:rows[0]})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {
      let from_table = 't_func',
        logger = propertyChangeLogger(old_value, [
          {name: 'func_name', label: '功能名称'},
          {name: 'func_path', label: '菜单路径'},
          {name: 'page_id', label: '菜单ID'},
          {name: 'func_role_type', label: '菜单类型'},
          {name: 'func_img', label: '菜单图标'},
        ], params),
        from_table_key = old_value.func_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改菜单表 修改内容：修改菜单：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

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
router.post('/delete', (req, res, next) => {
  if(!req.session._button.includes("menu_management_delete")){
    next();
    return
  }

  let connection, {func_id} = req.body, old_value
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)
      let [queryResults] = yield Query.call(connection, sqls.menuDetailSearch, {func_id})
      if (!queryResults[0]) {
        throw new Error("菜单已不存在，请重新核对")
      }
      old_value = queryResults[0]

      let deleteFuncIdArr = []
      deleteFuncIdArr.push(func_id)
      // delete level2
      let [children1Results] = yield Query.call(connection, sqls.childrenMenuSearch, {func_id})
      if (children1Results) {
        for (let child1 of children1Results) {
          deleteFuncIdArr.push(child1.func_id)
          // delete level3
          let [children2Results] = yield Query.call(connection, sqls.childrenMenuSearch, {func_id: child1.func_id})
          if (children2Results) {
            for (let child2 of children2Results) {
              deleteFuncIdArr.push(child2.func_id)
            }
          }
        }
      }

      let [[results]] = yield [
        Query.call(connection, sqls.menuManageDeleteWithChildren, {func_id_array: deleteFuncIdArr}),
        Query.call(connection, sqls.roleMenuManageDeleteWithChildren, {func_id_array: deleteFuncIdArr}),
        Query.call(connection, sqls.userMenuManageDeleteWithChildren, {func_id_array: deleteFuncIdArr}),
      ]
      if (results.affectedRows < 1) {
        throw new Error("菜单删除失败")
      }
      yield Commit.call(connection)

      let [[menusRows]] = yield [
        Query.call(connection, sqls.allMenusSearch)
      ]
      if (!menusRows) {
        throw new Error("无记录")
      }

      res.json({success: true, menus: makeTree(menusRows), detail:{}})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {
      let from_table = 't_func',
        from_table_key = old_value.func_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改菜单表 修改内容：删除菜单：${old_value.func_id}, 菜单名 ${old_value.func_name}, 菜单路径 ${old_value.func_path}`

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
router.post('/up', (req, res, next) => {
  if(!req.session._button.includes("menu_management_up")){
    next();
    return
  }
  let connection, {func_id} = req.body, old_value
  co(function*() {

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.menuDetailSearch, {func_id})
      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("查无此记录")
      }
      old_value = preQueryRows[0]

      let [closestUpMenuRows] = yield Query.call(connection, sqls.closestUpMenuSearch, {f_func_id: old_value.f_func_id, sort_id: old_value.sort_id})
      if (!closestUpMenuRows || !closestUpMenuRows[0]) {
        throw new Error("已是最顶部菜单，不能上移")
      }
      let closestUpMenuRow = closestUpMenuRows[0]
      let selectMenuParam = {func_id: old_value.func_id, sort_id: closestUpMenuRow.sort_id}
      let upMenuParam = {func_id: closestUpMenuRow.func_id, sort_id: old_value.sort_id}
      let [[selectMenuResults], [upMenuResults]] = yield [
        Query.call(connection, sqls.menuManageUpdateSortId, selectMenuParam),
        Query.call(connection, sqls.menuManageUpdateSortId, upMenuParam)
      ]
      if (selectMenuResults.affectedRows < 1 || upMenuResults.affectedRows < 1) {
        throw new Error("菜单上移失败")
      }
      yield Commit.call(connection)

      let [[menusRows]] = yield [
        Query.call(connection, sqls.allMenusSearch)
      ]
      if (!menusRows) {
        throw new Error("无记录")
      }

      res.json({success: true, menus: makeTree(menusRows)})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {
      let from_table = 't_func',
        from_table_key = old_value.func_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改菜单表 修改内容：上移菜单：${old_value.func_id}, 菜单名 ${old_value.func_name}, 菜单路径 ${old_value.func_path}`

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
router.post('/down', (req, res, next) => {
  if(!req.session._button.includes("menu_management_down")){
    next();
    return
  }
  let connection, {func_id} = req.body, old_value
  co(function*() {

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.menuDetailSearch, {func_id})
      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("查无此记录")
      }
      old_value = preQueryRows[0]

      let [closestDownMenuRows] = yield Query.call(connection, sqls.closestDownMenuSearch, {f_func_id: old_value.f_func_id, sort_id: old_value.sort_id})
      if (!closestDownMenuRows || !closestDownMenuRows[0]) {
        throw new Error("已是最底部菜单，不能下移")
      }
      let closestDownMenuRow = closestDownMenuRows[0]
      let selectMenuParam = {func_id: old_value.func_id, sort_id: closestDownMenuRow.sort_id}
      let downMenuParam = {func_id: closestDownMenuRow.func_id, sort_id: old_value.sort_id}
      let [[selectMenuResults], [downMenuResults]] = yield [
        Query.call(connection, sqls.menuManageUpdateSortId, selectMenuParam),
        Query.call(connection, sqls.menuManageUpdateSortId, downMenuParam)
      ]
      if (selectMenuResults.affectedRows < 1 || downMenuResults.affectedRows < 1) {
        throw new Error("菜单下移失败")
      }
      yield Commit.call(connection)

      let [[menusRows]] = yield [
        Query.call(connection, sqls.allMenusSearch)
      ]
      if (!menusRows) {
        throw new Error("无记录")
      }

      res.json({success: true, menus: makeTree(menusRows)})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {
      let from_table = 't_func',
        from_table_key = old_value.func_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改菜单表 修改内容：下移菜单：${old_value.func_id}, 菜单名 ${old_value.func_name}, 菜单路径 ${old_value.func_path}`

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

module.exports = router
