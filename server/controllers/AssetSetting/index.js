/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-28 14-12
 */
const _ = require('lodash');
const moment = require('moment');

const assetSettingService = require('../../services').business.assetSetting;
const smsAPI = require('../../services').common.sms;
const { getMySQLFieldValue } = require('../../util');

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

const search = async (req, res, next) => {
  let { assetOrgCode, fundOrgCode, match_date } = req.body;
  // if (req.session.profile.user_type === 1) {
  //   assetOrgCode = req.session.profile.org_code;
  // } else if (req.session.profile.user_type === 2) {
  //   fundOrgCode = req.session.profile.org_code;
  // }
  let params = getMySQLFieldValue({
    assetOrgCode,
    fundOrgCode,
    match_date,
  });

  try {
    const { assetList, deadlineList } = await assetSettingService.search(
      req,
      params
    );
    if (_.isEmpty(assetList)) {
      throw new Error('无记录');
    }
    return res.json({
      success: true,
      assetList,
      deadlineList,
      enableCaptcha,
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message || '查询失败',
    });
  }
};

const captcha = async (req, res, next) => {
  if (!enableCaptcha) {
    next();
    return;
  }
  const { mobile } = req.session.profile;
  let {
    asset_org_code,
    fund_org_code,
    match_date,
    deadline_id,
    deadline_name,
  } = req.body;
  // if (req.session.profile.user_type === 1) {
  //   asset_org_code = req.session.profile.org_code;
  // } else if (req.session.profile.user_type === 2) {
  //   fund_org_code = req.session.profile.org_code;
  // }
  if (_.isEmpty(asset_org_code) || _.isEmpty(fund_org_code) || _.isEmpty(match_date) || _.isEmpty(deadline_id) || _.isEmpty(deadline_name)) {
    throw new Error('发送验证码失败，缺少关键参数')
  }
  const params = {
    asset_org_code,
    fund_org_code,
    match_date,
    deadline_id,
    mobile,
  };
  let captchaCode = null;
  try {
    captchaCode = await assetSettingService.captcha(req, params);
  } catch (e) {
    throw new Error('更新验证码失败');
  }

  try {
    const result = await smsAPI(0, mobile, captchaCode, deadline_name);
    if (!result.success) {
      throw new Error('验证码发送失败，请稍后重试');
    } else {
      res.json({
        success: true,
      });
    }
  } catch (e) {
    throw new Error('验证码发送失败，请稍后重试');
  }
};

const update = async (req, res, next) => {
  let {
    asset_org_code,
    fund_org_code,
    match_date,
    priority,
    is_check_stock,
    stock_day_count,
    // tarAssetCode,
    // tarFundCode,
  } = req.body;
  // if (req.session.profile.user_type === 1) {
  //   asset_org_code = req.session.profile.org_code;
  //   // tarAssetCode = asset_org_code;
  //   // tarFundCode = '';
  // } else if (req.session.profile.user_type === 2) {
  //   fund_org_code = req.session.profile.org_code;
  //   // tarAssetCode = '';
  //   // tarFundCode = fund_org_code;
  // }
  let params = {
    asset_org_code,
    fund_org_code,
    match_date,
    priority,
    is_check_stock,
    stock_day_count,
  };
  try {
    const effectRows = await assetSettingService.update(req, params);
    if (effectRows === 0) {
      throw new Error('更新失败');
    }
    return res.json({
      success: true,
    });
  } catch (e) {
    res.json({
      success: false,
      message: e.message || '保存失败',
    });
  }
};

const updateDeadline = async (req, res, next) => {
  let {
    asset_fee,
    fund_fee,
    asset_org_code,
    fund_org_code,
    deadline_id,
    match_date,
    captcha,
  } = req.body;
  // if (req.session.profile.user_type === 1) {
  //   asset_org_code = req.session.profile.org_code;
  // } else if (req.session.profile.user_type === 2) {
  //   fund_org_code = req.session.profile.org_code;
  // }
  let params = {
    asset_fee,
    fund_fee,
    asset_org_code,
    fund_org_code,
    match_date,
    deadline_id,
    captcha,
  };

  const deadlineInstance = await assetSettingService.distrDeadlineSettingGet(
    req,
    params
  );
  if (!enableCaptcha) {
    console.log('后门开启，跳过验证码');
  } else if (!deadlineInstance[0].dataValues.verification_code) {
    throw new Error('请先获取新的验证码');
  } else if (
    moment().isAfter(
      moment(deadlineInstance[0].dataValues.verification_valid_time).add(5, 'm')
    )
  ) {
    throw new Error('验证码已过期，请重新获取');
  } else if (deadlineInstance[0].dataValues.verification_code !== captcha) {
    throw new Error('验证码不正确，请重新输入');
  }
  const user_type = req.session.profile.user_type;
  await assetSettingService.updateDeadline(req, params, user_type);
  return res.json({
    success: true,
  });
};

module.exports = {
  search,
  updateDeadline,
  update,
  captcha,
};
