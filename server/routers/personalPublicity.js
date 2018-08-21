var {getConnectionQ, getWriteConnectionQ,writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, upload, fs, path, spawning ,hasDuplicate, getMySQLFieldValue,userDiffer,promisifyTimeout,operLogDictionaryGenerator} = require("../util"),
  ropAPI = require("../ropAPI"), sms = require("../sms"), router = Router();

/**
 * 作者：石奇峰，张俊杰
 * 模块：个人征信信息模块
 * */
router.use((req, res, next) => {
  if(!req.session._submenu.includes("personal_publicity")){
    res.json({success:false, message:"您没有调用个人征信信息页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  if(!req.session._button.includes("personal_publicity_search")){
    next();
    return
  }
  let connection
  (async () => {
    connection = await getConnectionQ()
    const Query = promisify(connection.query, {
      multiArgs: true
    });
    let {startDate="", endDate="", taskName="", pageIndex, orgCode} = req.body
    const {profile} = req.session
    if (!profile) {
      throw new Error("检测到异常用户，请重新登录！")
    }
    switch (profile.user_type) {
      case 1:
        orgCode = profile.org_code
        break;
      case 2:
        orgCode = profile.org_code
        break;
      case 3:
        break;
      default:
        throw new Error('只允许资产方、资金方和资产管理员查询数据')
    }
    pageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1)
    let params = getMySQLFieldValue({
      orgCode,
      startDate,
      endDate,
      pageIndex,
      taskName
    })
    if(req.session.subUserDataRestriction){
      let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
      params.restriction = [...assetDataRestriction,...fundDataRestriction]
    }
    let [[countRows], [rows]] = await Promise.all([Query.call(connection, sqls.publicityPersonalSearchCount, params), Query.call(connection, sqls.publicityPersonalSearch, params)])
    if (!countRows || !countRows[0] || !rows || !rows[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      rows,
      totalItemCount: countRows[0].total,
      totalCount: countRows[0].total_count,
      successCount: countRows[0].finish_count,
      failCount: countRows[0].fail_count
    })
    return connection
  })().catch(err => {
    res.json({success: false, message: err.message || "查询失败"});
  }).then(connection => {
    connection && connection.release()
  })
});

router.post('/create', (req, res, next) => {
  if(!req.session._button.includes("personal_publicity_create")){
    next();
    return
  }
  let connection, writeConnection
  co(function* () {
    connection = yield getConnectionQ()
    writeConnection = yield getWriteConnectionQ()
    let Query = promisify(connection.query, {multiArgs: true}).bind(connection),
      writeQuery = promisify(writeConnection.query, {multiArgs: true}).bind(writeConnection);
    let {task_name, data} = req.body, param = {task_name, org_code:req.session.profile.org_code},
      userDif = {[userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}
    if (!Array.isArray(data) || !data.length) {
      throw new Error("无数据")
    } else {
      let asset_order_nos = data.filter(r=>r.asset_order_no).map(r=>r.asset_order_no),
        borrow_certificate_nos = data.filter(r=>r.borrow_certificate_no).map(r=>r.borrow_certificate_no),
        order_no = data.filter(r=>r.order_no).map(r=>r.order_no)
      if(hasDuplicate(asset_order_nos) || hasDuplicate(borrow_certificate_nos) || hasDuplicate(order_no)){
        throw new Error("数据有重复")
      }
    }

    let queryCollection = yield [].concat.apply([],data.map(r=>{
      let {order_no, asset_order_no} = r, qs = []
      if(r.borrow_name || r.borrow_certificate_no || r.borrow_name || r.borrow_name){
        qs.push(Promise.resolve([{
          borrow_name:r.borrow_name,borrow_certificate_no:r.borrow_certificate_no,
          borrow_phone:r.borrow_phone,borrow_card_no:r.borrow_card_no
        }]))
      }

      if (order_no){
        qs.push(Query(sqls.ordersForPublicity, {order_no, ...userDif}).then(([rows])=>rows.map(j=>({
          borrow_name:j.borrow_name,borrow_certificate_no:j.borrow_certificate_no,
          borrow_phone:j.borrow_phone,borrow_card_no:j.borrow_card_no
        }))))
      }

      if (asset_order_no){
        qs.push(Query(sqls.ordersForPublicity, {asset_order_no, ...userDif}).then(([rows])=>rows.map(j=>({
          borrow_name:j.borrow_name,borrow_certificate_no:j.borrow_certificate_no,
          borrow_phone:j.borrow_phone,borrow_card_no:j.borrow_card_no
        }))))
      }

      return qs
    }))
    let mergedCollection = [].concat.apply([],queryCollection)
    let queryData = [...new Set(mergedCollection.map(r=>r.borrow_certificate_no))].map(r=>mergedCollection.find(j=>j.borrow_certificate_no === r));

    let [countCollection,[piCount]] = yield [
      queryData.map(r=>Query(sqls.countSimplePersonalPublicityTaskDetail, {...r,...param})),
      Query(sqls.countPersonalPublicityTasks, param)
    ];
    let countResult = countCollection.find(r=>(!Array.isArray(r) || !Array.isArray(r[0]) || !r[0][0] || r[0][0].total))
    if (!piCount || !piCount[0] || (piCount[0].total > 0)){
      throw new Error("任务名重复或数据异常")
    } else if (countResult){
      throw new Error("任务明细重复")
    }

    let Transaction = promisify(writeConnection.beginTransaction).bind(writeConnection),
      Commit = promisify(writeConnection.commit).bind(writeConnection),
      RollBack = promisify(writeConnection.rollback).bind(writeConnection)

    let piDetails, detailParam = queryData.map(r=>({...r, ...param, task_status: "1"})),
      piParam =  {...param, task_status: "1", total_count: data.length}
    try {
      yield Transaction()
      piDetails = yield [
        ...detailParam.map(r=>writeQuery(sqls.createPersonalPublicityTaskDetail, r)),
        writeQuery(sqls.createPersonalPublicityTask, piParam)
      ];
      yield Commit()
    } catch (e) {
      yield RollBack()
      throw new Error(e.message || "更新失败")
    }
    let ngDetail = piDetails.find(r=>{
      return !Array.isArray(r) || !r[0] || !r[0].affectedRows || (r[0].affectedRows > 1)
    })
    if(ngDetail){
      throw new Error("插入个人征信信息爬取附表明细失败")
    }
    let pi = {...piParam};
    let row = yield ropAPI("ruixue.edi.individual.crawler.information", param)
    if(row.success){
      //yield writeQuery(sqls.updatePersonalPublicityTaskStatus, {...param, task_status: "2"})
      res.json({success:true, succeed: pi})
    } else {
      if(row.error_code !== 2){
        let statusUpdater = function* (count) {
          try {
            yield Transaction()
            yield [
              ...detailParam.map(r=>writeQuery(sqls.updatePersonalPublicityTaskDetailStatus, {...r, task_status: "3"})),
              writeQuery(sqls.updatePersonalPublicityTaskStatus, {...param, task_status: "3"})
            ];
            yield Commit()
          } catch (e) {
            yield RollBack()
            yield promisifyTimeout(1000)
            if (isNaN(count) || (count<1)) {
              // yield sms(1, ["15640985683","18624420365"], `任务名：${param.task_name}，机构编码：${param.org_code},`)
              logger.error(e.message || "调用ROP发生异常")
              //throw new Error(e)
            } else {
              yield* statusUpdater(count - 1)
            }
          }
        }
        yield* statusUpdater(10)
      }
      res.json({success:true, failed: pi, reason: row.data._reason})
      yield writeQuery(sqls.updatePublicityTaskStatus, {...param, task_status: "3"})
    }
    return {pi, detail: detailParam}
  }).then(({detail,pi}) => {
    return co(function*() {
      pi = operLogDictionaryGenerator('*', ['task_status'], pi);
      let profilePart = {
        from_org_code: req.session.profile.org_code,
        create_user_id: req.session.profile.user_id,
        sub_user_id: req.session.profile.sub_user_id
      }, piLog = {
        from_table: "t_task_person_pi_craw",
        from_table_key: `${pi.org_code},${pi.task_name}`,
        ...profilePart,
        oper_log: `动作：插入个人征信信息爬取主表 新建内容：增加任务：机构编码：${pi.org_code}，任务名：${pi.task_name}，任务状态：${pi.task_status}，查询数量：${pi.total_count}`
      }, detailLog = detail.map(r=>{
        r = operLogDictionaryGenerator('*', ['task_status'], r);
        return {
          from_table: "t_task_person_pi_craw_detail",
          from_table_key: `${r.org_code},${r.task_name},${r.borrow_certificate_no}`,
          ...profilePart,
          oper_log: `动作：插入个人征信信息爬取辅表 新建内容：增加任务明细：身份证号：${r.borrow_certificate_no}，机构编码：${r.org_code}，任务名：${r.task_name}，任务状态：${r.task_status}，`
          }
        })

      yield [
        writeOperLog(writeConnection, piLog),
        ...detailLog.map(r=>writeOperLog(writeConnection, r))
      ]
    }).catch((err) => {
      logger.info(err && err.stack || "记录个人信息查询操作任务发生错误")
    })
  }).catch(function (err) {
    logger.error(err)
    res.json({
      success: false,
      message: err.message || "任务创建失败"
    });
  }).then(() => {
    connection && connection.release();
    writeConnection && writeConnection.release();
  });
});

router.post('/match', upload.any(), (req, res, next) => {
  if(!req.session._button.includes("personal_publicity_create")){
    next();
    return
  }
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传征信信息"});
    return;
  }
  co(function* () {
    let resultFile = yield spawning(path.resolve(`${__dirname}/../spawn/personalPublicityMatcher.js`), req.files[0].path,
      JSON.stringify({[userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code}))
    let resultData = JSON.parse(fs.readFileSync(resultFile, {encoding: "utf8"}))
    res.json(Object.assign({success: true}, resultData))
    fs.unlinkSync(req.files[0].path)
    fs.unlinkSync(resultFile)
  }).catch(e => {
    res.json({success: false, message: e && e.message || "未知异常"});
  })
});

router.post('/searchExport', (req, res, next) => {
  if(!req.session._button.includes("personal_publicity_search")){
    next();
    return
  }
  let connection
  (async () => {
    connection = await getConnectionQ()
    const Query = promisify(connection.query, {
      multiArgs: true
    });
    let {startDate="", endDate="", taskName="", orgCode} = req.body
    const {profile} = req.session
    if (!profile) {
      throw new Error("检测到异常用户，请重新登录！")
    }
    switch (profile.user_type) {
      case 1:
        orgCode = profile.org_code
        break;
      case 2:
        orgCode = profile.org_code
        break;
      case 3:
        break;
      default:
        throw new Error('只允许资产方、资金方和资产管理员查询数据')
    }
    let params = getMySQLFieldValue({
      orgCode,
      startDate,
      endDate,
      taskName
    })
    if(req.session.subUserDataRestriction){
      let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
      params.restriction = [...assetDataRestriction,...fundDataRestriction]
    }
    let [rows] = await Query.call(connection, sqls.publicityPersonalSearchWithoutPagination, params)
    if (!rows || !rows[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      rows,
    })
    return connection
  })().catch(err => {
    res.json({success: false, message: err.message || "查询失败"});
  }).then(connection => {
    connection && connection.release()
  })
});

module.exports = router
