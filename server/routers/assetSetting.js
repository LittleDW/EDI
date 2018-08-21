var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require("../pool"), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, propertyChangeLogger, generateCaptcha, getMySQLFieldValue, operLogDictionaryGenerator} = require("../util"),
  router = Router(),
  smsAPI = require("../sms"), moment = require("moment");

let enableCaptcha;
if (process.env.NODE_ENV !== "production") {
  // 本地开发环境、dev和uat环境需配置环境变量CAPTCHA为'true'，验证码功能才可开启，默认为关闭
  enableCaptcha = process.env.CAPTCHA === "true"
} else if (process.env.NODE_ENV === "production") {
  // 生产环境需配置环境变量CAPTCHA为'false'，验证码功能才可关闭，默认为开启
  enableCaptcha = process.env.CAPTCHA !== "false"
} else {
  enableCaptcha = false
}

/**
 * 作者：张俊杰
 * 模块：资产分配设置
 * */

router.use((req, res, next) => {
  if (!req.session._submenu.includes("asset_setting") && !req.session._submenu.includes("fund_setting") && !req.session._submenu.includes("admin_setting")) {
    res.json({success: false, message: "您没有调用资产分配设置页面接口的权限"});
    return;
  }
  next();
});

router.post("/search", (req, res) => {
  let connection;
  co(function* () {
    connection = yield getConnectionQ(req);
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let {assetOrgCode, fundOrgCode, match_date} = req.body;
    if (req.session.profile.user_type === 1) {
      assetOrgCode = req.session.profile.org_code;
    } else if (req.session.profile.user_type === 2) {
      fundOrgCode = req.session.profile.org_code;
    }
    let params = getMySQLFieldValue({
      assetOrgCode,
      fundOrgCode,
      match_date
    });
    let [[assetList], [deadlineList]] = yield [Query.call(connection, sqls.distrSettingGet, params), Query.call(connection, sqls.distrDeadlineSettingGet, params)];

    if (!assetList) {
      throw new Error("无记录");
    }
    res.json({
      success: true,
      assetList,
      deadlineList,
      enableCaptcha
    });
    return assetList;
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

router.post("/captcha", (req, res, next) => {
  if (!req.session._button.includes("distribution_setting_update")) {
    next();
    return;
  }
  if (!enableCaptcha) {
    next();
    return;
  }
  let {asset_org_code, fund_org_code, match_date, deadline_id, deadline_name} = req.body;
  if (req.session.profile.user_type === 1) {
    asset_org_code = req.session.profile.org_code;
  } else if (req.session.profile.user_type === 2) {
    fund_org_code = req.session.profile.org_code;
  }
  const {mobile} = req.session.profile;
  let params = {asset_org_code, fund_org_code, match_date, deadline_id, mobile};
  let connection, connectionW;
  const run = async () => {
    connection = await getConnectionQ(req);
    connectionW = await getWriteConnectionQ(req);
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let QueryW = promisify(connectionW.query, {
      multiArgs: true
    });
    try {
      let [[deadlineData]] = await Query.call(connection, sqls.distrDeadlineSettingGet, params);
      if (!deadlineData) {
        throw new Error("无该条产品期限记录，请重试");
      }
      let captcha = "";
      if (deadlineData.verification_code && deadlineData.verification_valid_time && moment().isBefore(moment(deadlineData.verification_valid_time).add(5, "m"))) {
        captcha = deadlineData.verification_code;
      } else {
        // 验证码已过期，需要重新生成
        captcha = generateCaptcha();
        params.verification_code = captcha;
        let [result] = await QueryW.call(connectionW, sqls.distrDeadlineSettingCaptchaUpdate, params);
        if (result.affectedRows === 0) {
          throw new Error("发送验证码失败，请重试！");
        }
      }
      smsAPI(0, mobile, captcha, deadline_name).then(data => {
        if (!data.success) {
          throw new Error("验证码发送失败，请稍后重试");
        } else {
          res.json({
            success: true
          });
        }
      }).catch(e => {
        res.json({
          success: false,
          message: e.message || "验证码发送失败，请重试"
        });
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message || "验证码发送失败，请重试"
      });
    }
    return {connection, connectionW};
  };
  run().then(({connection, connectionW}) => {
    connection && connection.release();
    connectionW && connectionW.release();
  });
});

router.post("/update", (req, res, next) => {
  if (!req.session._button.includes("distribution_setting_update")) {
    next();
    return;
  }
  let {asset_org_code, fund_org_code, match_date, priority, is_check_stock, stock_day_count, tarAssetCode, tarFundCode} = req.body;
  if (req.session.profile.user_type === 1) {
    asset_org_code = req.session.profile.org_code;
    tarAssetCode = asset_org_code;
    tarFundCode = "";
  } else if (req.session.profile.user_type === 2) {
    fund_org_code = req.session.profile.org_code;
    tarAssetCode = "";
    tarFundCode = fund_org_code;
  }
  let params = {asset_org_code, fund_org_code, match_date, priority, is_check_stock, stock_day_count};
  co(function* () {
    let connectionW = yield getWriteConnectionQ(req);
    let connectionQ = yield getConnectionQ(req);
    let Commit = promisify(connectionW.commit).bind(connectionW),
      RollBack = promisify(connectionW.rollback),
      Query = promisify(connectionW.query, {
        multiArgs: true
      }),

      QueryR = promisify(connectionQ.query, {
        multiArgs: true
      });
    try {
      let [[old_value]] = yield QueryR.call(connectionQ, sqls.distrSettingGet, params);
      let [priorityFeeResult] = yield Query.call(connectionW, sqls.distrSettingUpdatePriority, params);

      if (!priorityFeeResult || priorityFeeResult.affectedRows == 0) {
        throw new Error("更新失败");
      }
      yield Commit();
      res.json({
        success: true
      });
      return {connectionQ, connectionW, params, old_value};
    } catch (e) {
      yield RollBack.call(connectionW);
      logger.error(e);
      throw new Error(e.message || "保存失败");
    }
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "保存失败"
    });
    logger.error(err);
  }).then(({connectionW, connectionQ, old_value, params}) => {
    old_value = operLogDictionaryGenerator('', ['is_check_stock'], old_value);
    params = operLogDictionaryGenerator('', ['is_check_stock'], params);
    let writeLog = async () => {
      let from_table = "t_asset_fund_fee",
        logger = propertyChangeLogger(old_value, [{name: "priority", label: "优先级"}, {
          name: "stock_day_count",
          label: "存量资产上限"
        }, {name: "is_check_stock", label: "存量资产上限验证"}], params),
        from_table_key = `${params.fund_org_code},${params.asset_org_code},${params.match_date}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改分配设置 修改内容：${!logger.some(log => log.log) ? "未更新任何新值" : [].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`;
      await writeOperLog(connectionW, {
        from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log
      });
      return {connectionW, connectionQ};
    };
    return writeLog();
  }).then(({connectionW, connectionQ}) => {
    connectionW
    && connectionW
      .release();
    connectionQ && connectionQ.release();
  });
});


router.post("/updateDeadline", (req, res, next) => {
  if (!req.session._button.includes("distribution_setting_update")) {
    next();
    return;
  }
  let {asset_fee, fund_fee, asset_org_code, fund_org_code, deadline_id, match_date, captcha} = req.body;
  if (req.session.profile.user_type === 1) {
    asset_org_code = req.session.profile.org_code;
  } else if (req.session.profile.user_type === 2) {
    fund_org_code = req.session.profile.org_code;
  }
  let params = {asset_fee, fund_fee, asset_org_code, fund_org_code, match_date, deadline_id, captcha};
  co(function* () {
    let connectionW = yield getWriteConnectionQ(req);
    let connectionQ = yield getConnectionQ(req);
    let Commit = promisify(connectionW.commit).bind(connectionW),
      RollBack = promisify(connectionW.rollback),
      Query = promisify(connectionW.query, {
        multiArgs: true
      }),

      QueryR = promisify(connectionQ.query, {
        multiArgs: true
      });
    try {
      let [[old_value]] = yield QueryR.call(connectionQ, sqls.distrDeadlineSettingGet, params);
      if (!enableCaptcha) {
        console.log("后门开启，跳过验证码");
      } else if (!old_value.verification_code) {
        throw new Error("请先获取新的验证码");
      } else if (moment().isAfter(moment(old_value.verification_valid_time).add(5, "m"))) {
        throw new Error("验证码已过期，请重新获取");
      } else if (old_value.verification_code != captcha) {
        throw new Error("验证码不正确，请重新输入");
      }
      let [[assetFeeResult], [otherFeeResult]] = yield [Query.call(connectionW, req.session.profile.user_type === 1 ? sqls.distrDeadlineAssetSettingUpdate : req.session.profile.user_type === 2 ? sqls.distrDeadlineFundSettingUpdate : sqls.distrDeadlineAdminSettingUpdate, params), Query.call(connectionW, sqls.distrDeadlineSettingUpdateOtherFee, params)];
      if (!assetFeeResult || assetFeeResult.affectedRows == 0) {
        throw new Error("期限分配设置更新失败");
      }
      if (!otherFeeResult || otherFeeResult.affectedRows == 0) {
        throw new Error("匹配供给量更新失败");
      }
      let [feeCollectionResult] = yield Query.call(connectionW, sqls.distrDeadlineSettingCollectFee, params);
      if (!feeCollectionResult || feeCollectionResult.affectedRows == 0) {
        throw new Error("汇总匹配量更新失败");
      }
      yield Commit();
      res.json({
        success: true
      });
      return {connectionW, connectionQ, old_value, params};
    } catch (e) {
      yield RollBack.call(connectionW);
      logger.error(e);
      throw new Error(e.message || "保存失败");
    }
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "保存失败"
    });
    logger.error(err);
  }).then(({connectionW, connectionQ, old_value, params}) => {
    const {user_type} = req.session.profile;
    let writeLog = async () => {
      old_value.asset_fee = old_value.asset_fee ? Number(old_value.asset_fee / 1000000).toFixed(2) + "（万元）" : 0;
      old_value.fund_fee = old_value.fund_fee ? Number(old_value.fund_fee / 1000000).toFixed(2) + "（万元）" : 0;
      params.asset_fee = params.asset_fee ? Number(params.asset_fee / 1000000).toFixed(2) + "（万元）" : 0;
      params.fund_fee = params.fund_fee ? Number(params.fund_fee / 1000000).toFixed(2) + "（万元）" : 0;
      let from_table = "t_asset_fund_deadline_fee",
        logger = propertyChangeLogger(old_value, user_type === 1 ? [{
          name: "asset_fee",
          label: "资产方供给量"
        }] : user_type === 2 ? [{name: "fund_fee", label: "资金方募集量"}] : [{
          name: "asset_fee",
          label: "资产方供给量"
        }, {name: "fund_fee", label: "资金方募集量"}], params),
        from_table_key = `${params.fund_org_code},${params.asset_org_code},${params.deadline_id},${params.match_date}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改分配设置 修改内容：${!logger.some(log => log.log) ? "未更新任何新值" : [].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`;
      await writeOperLog(connectionW, {
        from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log
      });
      return {connectionW, connectionQ};
    };
    return writeLog();
  }).then(({connectionW, connectionQ}) => {
    connectionW && connectionW.release();
    connectionQ && connectionQ.release();
  });
});

module.exports = router;
