var {getConnectionQ, getWriteConnectionQ, writeOperLog, writeOperTableLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, uuidv4, getMySQLFieldValue, propertyChangeLogger, moment, sendMail, formatNumber,
    spawning, removefileIfExist, fs, path, operLogDictionaryGenerator, operLogDictionaryGeneratorWithSplit} = require("../util"),
  configure = require('../../config/configure.json')[process.env.NODE_ENV],
  router = Router();

/**
 * 作者：马伯骁
 * 模块：平台使用费页面
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("platform_use_fee")){
    res.json({success:false, message:"您没有调用平台使用费页面接口的权限"})
    return
  }
  next();
})

router.post('/billSearch', (req, res, next) => {
  let connection
  let ownerUserType = req.session.profile.user_type, ownerOrgCode = req.session.profile.org_code
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {billYear, billMonth, userType, orgCode, platformPayMode, pageIndex} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = getMySQLFieldValue({
        month:(billYear?billYear:"%") + "-" + (billMonth?billMonth:"%"),
        userType:ownerUserType==3?userType:ownerUserType,
        orgCode:ownerUserType==3?orgCode:ownerOrgCode,
        platformPayMode,
        pageIndex: myPageIndex
      })

    if(req.session.subUserDataRestriction){
      let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
      params.restriction = [...assetDataRestriction,...fundDataRestriction]
    }
    let [[countRows], [rows], [statisticsRows]] = yield [
      Query.call(connection, sqls.ediPayBillCount, params),
      Query.call(connection, sqls.ediPayBillQuery, params),
      Query.call(connection, sqls.ediPayBillStatistics, params)
    ]
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }

    res.json({success: true, rows, total: countRows[0].total, order_fee_total: statisticsRows[0].order_fee_total, platform_use_fee_total: statisticsRows[0].platform_use_fee_total, finish_pay_fee_total: statisticsRows[0].finish_pay_fee_total})
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

router.post('/emailSearch', (req, res, next) => {
  if(!req.session._button.includes("platform_use_fee_bill_notice")){
    next();
    return
  }
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {orgCode} = req.body

    let [[rows]] = yield [
      Query.call(connection, sqls.ediPayEmailQueryByKey, {org_code: orgCode}),
    ]

    res.json({success: true, emails: rows})
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


router.post('/billReduce', (req, res, next) => {
  if(!req.session._button.includes("platform_use_fee_bill_reduce")){
    next();
    return
  }
  let connection, {org_code, month, order_reduce_fee} = req.body,
    old_value
  co(function* () {
    if(!order_reduce_fee){
      throw new Error("减免平台订单金额不能为空")
    } else if(isNaN(order_reduce_fee) || (Math.abs(parseFloat(order_reduce_fee)) > 10000000000) || (!/^-?\d+$/.test(order_reduce_fee))) {
      throw new Error("减免平台订单金额必须为整数，且绝对值不大于100亿")
    }

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.ediPayBillQueryByKey, {org_code, month})
      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("查无此字段")
      }
      old_value = preQueryRows[0]

      let order_reduce_fee_final = order_reduce_fee*100
      let reduce_val = order_reduce_fee_final - old_value.order_reduce_fee

      let [[results]] = yield [
        Query.call(connection, sqls.ediPayBillUpdate, {org_code, month, order_reduce_fee: order_reduce_fee_final})
      ]
      if (results.affectedRows < 1) {
        throw new Error("减免平台订单金额失败")
      }
      let [[reduceResults]] = yield [
        Query.call(connection, sqls.ediPayBillReducePreMonth, {org_code, month, reduce_val})
      ]

      yield Commit.call(connection)


      res.json({success: true})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function* () {
      old_value.order_reduce_fee = old_value.order_reduce_fee ? Number(old_value.order_reduce_fee / 1000).toFixed(2) : 0;
      let from_table = 't_edi_pay_bill',
        logger = propertyChangeLogger(old_value, [{name: "order_reduce_fee", label:"当月减免平台订单金额(元)"}], {order_reduce_fee}),
        from_table_key = `${org_code},${month}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改平台使用费账单表 修改内容：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      yield [
        writeOperLog(connection, {
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id,
          oper_log
        }),
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
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/payNotice', (req, res, next) => {
  if(!req.session._button.includes("platform_use_fee_bill_notice")){
    next();
    return
  }
  let connection, {mail_to, mail_cc} = req.body,  data = req.body
  co(function* () {
    if(!mail_to){
      throw new Error("收件人不能为空")
    }

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let mailToList = mail_to.split(","), mailCcList = mail_cc?mail_cc.split(","):[]
      for (let mailTo of mailToList) {
        let [preQueryRows] = yield Query.call(connection, sqls.ediPayEmailQueryByKey, {org_code: data.org_code, email: mailTo})
        if (!preQueryRows || !preQueryRows[0]) {
          let [[results]] = yield [
            Query.call(connection, sqls.ediPayEmailAdd, {org_code: data.org_code, email: mailTo})
          ]
          if (results.affectedRows < 1) {
            throw new Error("邮箱添加失败")
          }
        }
      }
      for (let mailCc of mailCcList) {
        let [preQueryRows] = yield Query.call(connection, sqls.ediPayEmailQueryByKey, {org_code: data.org_code, email: mailCc})
        if (!preQueryRows || !preQueryRows[0]) {
          let [[results]] = yield [
            Query.call(connection, sqls.ediPayEmailAdd, {org_code: data.org_code, email: mailCc})
          ]
          if (results.affectedRows < 1) {
            throw new Error("邮箱添加失败")
          }
        }
      }
      yield Commit.call(connection)

      let html = ""
      // 预缴
      if (data.platform_pay_mode == "001") {
        html = `${data.user_name}：<br/>` +
          `<span style="margin-left: 15px">您好！</span><br/>` +
          `<span style="margin-left: 15px">以下是贵公司${moment(data.month).format('YYYY年MM月')}融数信息交互平台服务费账单，明细如下：</span><span style="float: right;padding-right: 10px" >单位：元</span><br/>` +
          `<table style="margin-left: 25px;border-collapse:collapse;" border="1" cellspacing="0" cellpadding="3">` +
          `<tr><td>账单截止日</td><td>费用缴纳方式</td><td>平台使用费率</td><td>本月平台个人订单金额</td><td>本月平台企业订单金额</td><td>本月减免平台订单金额</td><td>本月平台使用费</td><td style="background-color: #d5a610">本月缴费金额</td><td style="background-color: #d5a610">上月账户余额</td><td style="background-color: #d5a610">本月账户余额</td><td style="background-color: #985f0d">本月应付总额</td><td>备注</td></tr>` +
          `<tr><td>${data.month}</td><td>预缴</td><td style="text-align: right">${formatNumber(data.platform_use_rate)}%</td><td style="text-align: right">${formatNumber(data.person_order_fee)}</td><td style="text-align: right">${formatNumber(data.enterprise_order_fee)}</td><td style="text-align: right">${formatNumber(data.order_reduce_fee)}</td><td style="text-align: right">${formatNumber(data.platform_use_fee)}</td><td style="text-align: right">${formatNumber(data.finish_pay_fee)}</td><td style="text-align: right">${formatNumber(data.last_balance_fee)}</td><td style="text-align: right">${formatNumber(data.balance_fee)}</td><td style="background-color: #985f0d;text-align: right">${formatNumber(data.need_pay_fee)}</td><td>${data.comment?data.comment:""}</td></tr>` +
          `</table><br/>` +
          `<span style="margin-left: 25px">说明：</span><br/>` +
          `<span style="margin-left: 35px">本月账户余额 = 上月账户余额 + 本月缴费金额</span><br/>` +
          `<span style="margin-left: 35px">本月应付总额 = 本月平台使用费 - 本月账户余额</span><br/><br/>` +
          `<span style="margin-left: 25px">贵公司本月账户余额已不足5万元，请于三个工作日内预缴约一个月的平台使用费${Math.ceil((50000-data.balance_fee+data.platform_use_fee)/10000)}万元至如下账户，以免影响信息交互平台的正常使用，谢谢！</span><br/>` +
          `<span style="margin-left: 35px">账户名称：融数信息科技集团有限公司</span><br/>` +
          `<span style="margin-left: 35px">开户行：平安银行北京分行营业部</span><br/>` +
          `<span style="margin-left: 35px">账号：11015089146001</span><br/><br/>` +
          `<span style="margin-left: 15px">如有疑问，请及时联系：郭兰兰 edi@rongcapital.cn，guolanlan@rongcapital.cn  联系电话：13701223706。</span>`
      } else { // 月结
        html = `${data.user_name}：<br/>` +
          `<span style="margin-left: 15px">您好！</span><br/>` +
          `<span style="margin-left: 15px">以下是贵公司${moment(data.month).format('YYYY年MM月')}融数信息交互平台服务费账单，明细如下：</span><span style="float: right;padding-right: 10px" >单位：元</span><br/>` +
          `<table style="margin-left: 25px;border-collapse:collapse;" border="1" cellspacing="0" cellpadding="3">` +
          `<tr><td>账单月份</td><td>费用缴纳方式</td><td>平台使用费率</td><td>本月平台个人订单金额</td><td>本月平台企业订单金额</td><td>本月减免平台订单金额</td><td>本月平台使用费</td><td style="background-color: #d5a610">本月缴费金额</td><td style="background-color: #d5a610">上月账户余额</td><td style="background-color: #d5a610">本月账户余额</td><td style="background-color: #985f0d">本月应付总额</td><td>结算截止日</td></tr>` +
          `<tr><td>${data.month}</td><td>月结</td><td style="text-align: right">${formatNumber(data.platform_use_rate)}%</td><td style="text-align: right">${formatNumber(data.person_order_fee)}</td><td style="text-align: right">${formatNumber(data.enterprise_order_fee)}</td><td style="text-align: right">${formatNumber(data.order_reduce_fee)}</td><td style="text-align: right">${formatNumber(data.platform_use_fee)}</td><td style="text-align: right">${formatNumber(data.finish_pay_fee)}</td><td style="text-align: right">${formatNumber(data.last_balance_fee)}</td><td style="text-align: right">${formatNumber(data.balance_fee)}</td><td style="background-color: #985f0d;text-align: right">${formatNumber(data.need_pay_fee)}</td><td>${data.pay_deadline_date}</td></tr>` +
          `</table><br/>` +
          `<span style="margin-left: 25px">说明：</span><br/>` +
          `<span style="margin-left: 35px">本月账户余额 = 上月账户余额 + 本月缴费金额</span><br/>` +
          `<span style="margin-left: 35px">本月应付总额 = 本月平台使用费 - 本月账户余额</span><br/><br/>` +
          `<span style="margin-left: 25px">请贵公司于${moment(data.pay_deadline_date).format('YYYY年MM月DD日')}前将足额款项支付至如下账户，以免产生逾期违约金并影响信息交互平台的正常使用：</span><br/>` +
          `<span style="margin-left: 35px">账户名称：融数信息科技集团有限公司</span><br/>` +
          `<span style="margin-left: 35px">开户行：平安银行北京分行营业部</span><br/>` +
          `<span style="margin-left: 35px">账号：11015089146001</span><br/><br/>` +
          `<span style="margin-left: 15px">如有疑问，请及时联系：郭兰兰 edi@rongcapital.cn，guolanlan@rongcapital.cn  联系电话：13701223706。</span>`
      }

      let mailOptions = {
        from: '"EDI系统邮箱" <edi@rongcapital.cn>',
        to: mail_to,
        cc: mail_cc,
        subject: `【结算通知】${moment(data.month).format('YYYY年MM月')}融数信息交互平台服务费账单`,
        html: html
      };

      let sendMailResult = sendMail(mailOptions)

      if (!sendMailResult.success) {
        throw new Error(sendMailResult.message || "邮件发送失败")
      }

      res.json({success: true})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function*() {
      let from_table = 't_edi_pay_bill',
        from_table_key = `${data.org_code},${data.month}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：发送缴费提醒 发送内容：收件人：${mail_to}, 抄送：${mail_cc}, 合作方名称：${data.user_name}, 账单月份：${data.month}`

      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
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
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/paySearch', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {createTimeStart, createTimeEnd, payDateStart, payDateEnd, userType, orgCode, pageIndex} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = getMySQLFieldValue({
        createTimeStart,
        createTimeEnd,
        payDateStart,
        payDateEnd,
        userType,
        orgCode,
        pageIndex: myPageIndex
      })
    if(req.session.subUserDataRestriction){
      let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
      params.restriction = [...assetDataRestriction,...fundDataRestriction]
    }
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.ediPayDetailCount, params),
      Query.call(connection, sqls.ediPayDetailQuery, params)
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

router.post('/payAdd', (req, res, next) => {
  if(!req.session._button.includes("platform_use_fee_pay")){
    next();
    return
  }
  let connection, {org_code, pay_date, pay_fee, comment} = req.body, pay_no = "p" + moment().format("YYYYMMDDHHmmssSSS") + Math.round(1e5*Math.random());
  co(function*() {
    if(!org_code){
      throw new Error("合作方名称不能为空")
    } else if(!pay_date){
      throw new Error("缴费日期不能为空")
    } else if(!pay_fee || isNaN(pay_fee) || (Math.abs(parseInt(pay_fee)) > 1000000000) || (!/^-?\d+$/.test(pay_fee))){
      throw new Error("缴费金额不能为空，必须为整数，且绝对值不大于10亿")
    } else if (comment && comment.length > 255){
      throw new Error("备注字数不能大于255")
    }

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [[results]] = yield [
        Query.call(connection, sqls.ediPayDetailAdd, {pay_no, org_code, pay_date, pay_fee: 100 * pay_fee, comment})
      ]

      if (results.affectedRows < 1) {
        throw new Error("缴费添加失败")
      }

      let [[billResults]] = yield [
        Query.call(connection, sqls.ediPayBillPayFeeUpdate, {org_code, pay_fee: 100 * pay_fee})
      ]

      yield Commit.call(connection)

      let params = {}
      if(req.session.subUserDataRestriction){
        let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
        params.restriction = [...assetDataRestriction,...fundDataRestriction]
      }
      let [[countRows], [rows]] = yield [
        Query.call(connection, sqls.ediPayDetailCount, params),
        Query.call(connection, sqls.ediPayDetailQuery, Object.assign(params, {page_index: 0}))
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
      let from_table = 't_edi_pay_detail',
        from_table_key = `${pay_no}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改平台使用费缴费明细表 修改内容：增加缴费记录：机构号：${org_code}, 缴费日期：${pay_date}, 缴费金额(元)：${pay_fee}, 备注：${comment}`

      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
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

router.post('/feeSearch', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {userType, orgCode, pageIndex} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = getMySQLFieldValue({
        userType,
        orgCode,
        pageIndex: myPageIndex
      })
    if(req.session.subUserDataRestriction){
      let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
      params.restriction = [...assetDataRestriction,...fundDataRestriction]
    }
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.ediFeePatternCount, params),
      Query.call(connection, sqls.ediFeePatternQuery, params)
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

router.post('/feeUpdate', (req, res, next) => {
  if(!req.session._button.includes("platform_use_fee_pattern_update")){
    next();
    return
  }
  let connection, {user_id, platform_pay_mode, platform_use_rate, adjust_platform_use_rate, adjust_effect_month, platform_pay_scope} = req.body,
    old_value
  co(function* () {
    if(!platform_pay_mode){
      throw new Error("费用缴纳方式不能为空")
    }
    if(adjust_platform_use_rate && (isNaN(adjust_platform_use_rate) || (parseInt(adjust_platform_use_rate) > 1000000000) && (!/^[0-9]*(\.\d{1,3})?$/.test(adjust_platform_use_rate)))){
      throw new Error("调整后的平台使用费率必须为数值，且整数部分不可大于10亿，且小数部分最多3位")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.userAttributeQueryForFeePattern, {user_id})
      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("查无此字段")
      }
      old_value = preQueryRows[0]

      /**
       *  旧业务逻辑：
       *    1.如果调整后的使用费率为空，则调整后的使用费率跟当前使用费率一致
       *    2.如果调整后的使用费率跟当前使用费率一致，则月份置空
       *  新业务逻辑：       （modified by zhangjunjie on 2018-04-25）
       *    1.如果调整后的使用费率为'' 或者为 null 或者undefined，则月份数据一并清空
       */
      // if (!adjust_platform_use_rate) {
      //   adjust_platform_use_rate = platform_use_rate
      // }
      //
      // if (adjust_platform_use_rate == platform_use_rate) {
      //   adjust_effect_month = ""
      // }
      let _sql = sqls.userAttributeUpdateForFeePattern
        if (adjust_platform_use_rate === null || adjust_platform_use_rate === undefined || adjust_platform_use_rate === '') {
          adjust_effect_month = null
          adjust_platform_use_rate = null
          _sql = sqls.userAttributeUpdateForFeePatternClearRateAndMonth
        }

      let [[results]] = yield [
        Query.call(connection, _sql, {user_id, platform_pay_mode, platform_use_rate: platform_use_rate/100, adjust_platform_use_rate: adjust_platform_use_rate/100, adjust_effect_month, platform_pay_scope})
      ]
      if (results.affectedRows < 1) {
        throw new Error("费用模版修改失败")
      }
      yield Commit.call(connection)

      let [rows] = yield Query.call(connection, sqls.userAttributeQueryForFeePattern, {user_id})
      if (!rows || !rows[0]) {
        throw new Error("已更新但查无记录")
      }
      res.json({success: true, data: rows[0]})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function* () {
      old_value.platform_pay_scope = old_value.platform_pay_scope.split(';').join(',');
      platform_pay_scope = platform_pay_scope.split(';').join(',');
      old_value = operLogDictionaryGenerator('t_user_attribute', ['platform_pay_mode'], old_value);
      platform_pay_mode = operLogDictionaryGenerator('t_user_attribute', ['platform_pay_mode'], {platform_pay_mode}).platform_pay_mode;
      old_value = operLogDictionaryGeneratorWithSplit('t_user_attribute', ['platform_pay_scope'], old_value);
      platform_pay_scope = operLogDictionaryGeneratorWithSplit('t_user_attribute', ['platform_pay_scope'], {platform_pay_scope}).platform_pay_scope;
      let from_table = 't_user_attribute',
        logger = propertyChangeLogger(old_value,
          [
            {name: "platform_pay_mode", label:"平台使用费缴费方式"},
            {name: "platform_use_rate", label:"平台使用费率(%)"},
            {name: "adjust_platform_use_rate", label:"调整后的平台使用费率(%)"},
            {name: "adjust_effect_month", label:"调整后费率的生效日期"},
            {name: "platform_pay_scope", label:"平台使用费统计范围"},
          ], {platform_pay_mode, platform_use_rate, adjust_platform_use_rate, adjust_effect_month, platform_pay_scope}),
        from_table_key = user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
          if(old_value.adjust_platform_use_rate !== adjust_platform_use_rate && adjust_platform_use_rate === null){
            logger.push({log: '删除 调整后的平台使用费率'});
            logger.push({log: '删除 调整后费率的生效日期'});
          }
      let oper_log = `动作：修改系统用户属性表 修改内容：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      yield [
        writeOperLog(connection, {
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id,
          oper_log
        }),
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
  }).then(() => {
    connection && connection.release();
  });
});

router.get('/export', (req, res, next) => {
  if (!req.session.profile) {
    return res.status(404).send('无权下载')
  }
  if(!req.session._button.includes("platform_use_fee_bill_export")){
    return res.status(403).send("您无权做导出操作，请联系管理员");
  }

  let connection, writeConnection, outputFile = path.resolve(`${__dirname}/../../temp/${uuidv4()}`),
    xslx = path.resolve(`${__dirname}/../../temp/${uuidv4()}`);
  let ownerUserType = req.session.profile.user_type, ownerOrgCode = req.session.profile.org_code
  fs.closeSync(fs.openSync(outputFile, 'w'));
  co(function* () {
    [connection,writeConnection] = yield [getConnectionQ(req), getWriteConnectionQ(req)]
    let Query = promisify(connection.query, {multiArgs: true}), Download = promisify(res.download);

    let {billYear, billMonth, userType, orgCode, platformPayMode} = req.query,
      params = getMySQLFieldValue({
        month:(billYear?billYear:"%") + "-" + (billMonth?billMonth:"%"),
        userType:ownerUserType==3?userType:ownerUserType,
        orgCode:ownerUserType==3?orgCode:ownerOrgCode,
        platformPayMode,
      }), qList = [];
    if(req.session.subUserDataRestriction){
      let {assetDataRestriction,fundDataRestriction} = req.session.subUserDataRestriction
      params.restriction = [...assetDataRestriction,...fundDataRestriction]
    }
    let [countRows] = yield Query.call(connection, sqls.ediPayBillCount, params)
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }
    let {total} = countRows[0], pages = Math.ceil(total / configure.exportLimit);
    for (var i = 0; i < pages; i++) {
      qList.push(spawning(path.resolve(`${__dirname}/../spawn/ediPayBillAssist.js`), ownerUserType, ownerOrgCode, billYear, billMonth, userType, orgCode, platformPayMode, i * configure.exportLimit, configure.exportLimit, outputFile,JSON.stringify({restriction:params.restriction} || {})))
    }
    yield qList
    yield spawning(path.resolve(`${__dirname}/../spawn/json2xslx.js`), outputFile, xslx)
    yield Download.call(res, xslx, '平台使用费账单导出.xlsx')
    return {params, total: countRows[0].total}
  }).catch(function (err) {
    if (res.headersSent) {
      logger.error(err)
    } else {
      res.status(404).send(err && err.message || err || "发生错误");
    }
  }).then((result)=>{
    if(!result){return}
    let {params, total} = result
    return co(function*() {
      let from_table = 't_edi_pay_bill',
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id,
        action_type = '导出';
      let oper_log = `动作：导出平台使用费账单 ${total}条, 导出参数 ${JSON.stringify(params)}`
      return yield writeOperTableLog(writeConnection, {from_table, from_org_code, create_user_id, create_sub_user_id, oper_log, action_type})
    }).catch((err) => {logger.error(err)})
  }).then(() => {
    logger.info(res._headers)
    connection && connection.release();
    writeConnection && writeConnection.release();
    removefileIfExist(outputFile)
    removefileIfExist(xslx)
  });
});
module.exports = router
