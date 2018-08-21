/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-28 14-19
 */
const _ = require('lodash');
const moment = require('moment');
const { sequelizeDB } = require('../../../schema');
const Dao = require('./assetSettingDao');
const { generateCaptcha } = require('../../../util');

const search = async (req, params) => {
  const dao = Dao(req);
  const [assetList, deadlineList] = await Promise.all([
    dao.distrSettingGet(params),
    dao.distrDeadlineSettingGet(params),
  ]);
  return {
    assetList,
    deadlineList,
  };
};

const captcha = async (req, params) => {
  const dao = Dao(req);

  const [deadlineInstance] = await dao.distrDeadlineSettingGet(params);
  if (_.isEmpty(deadlineInstance)) {
    throw new Error('无该条产品期限记录，请重试');
  }
  let captcha = null;
  if (
    deadlineInstance.dataValues.verification_code &&
    deadlineInstance.dataValues.verification_valid_time &&
    moment().isBefore(moment(deadlineInstance.dataValues.verification_valid_time).add(5, 'm'))
  ) {
    captcha = deadlineInstance.dataValues.verification_code;
  } else {
    // 验证码已过期，需要重新生成
    captcha = generateCaptcha();
    const [affectedCount] = await dao.distrDeadlineSettingCaptchaUpdate(
      { verification_code: captcha, verification_valid_time: moment.now() },
      params,
    );
    if (affectedCount === 0) {
      throw new Error('发送验证码失败，请重试！');
    }
  }
  return captcha;
};

const update = async (req, params) => {
  const dao = Dao(req);
  const [affectedRows] = await dao.distrSettingUpdatePriority(params);
  return affectedRows;
};

const distrDeadlineSettingGet = (req, params) => {
  const dao = Dao(req);
  return dao.distrDeadlineSettingGet(params);
};

const updateDeadline = async (req, params, user_type) => {
  const dao = Dao(req);
  let func = null;
  switch (user_type) {
    case 1:
      func = dao.distrDeadlineAssetSettingUpdate.bind(dao);
      break;
    case 2:
      func = dao.distrDeadlineFundSettingUpdate.bind(dao);
      break;
    default:
      func = dao.distrDeadlineAdminSettingUpdate.bind(dao);
  }

  const t = await sequelizeDB.transaction();
  try {
    //更新目标匹配量和最小匹配量之前，需要先获取数据库中的资金方资产方数据（fixed by zhangjunjie on 2018-06-10）
    const [affectedCount, [newFeeResult]] = await func(params, t)
    if (affectedCount < 1 || _.isEmpty(newFeeResult)) {
      throw new Error('更新失败，请重试')
    }
    params.fund_fee = newFeeResult.fund_fee
    params.asset_fee = newFeeResult.asset_fee
    const otherFeeResult = await  dao.distrDeadlineSettingUpdateOtherFee(params, t);
    const updateResult = await dao.distrDeadlineSettingCollectFee(params, t);
    if (updateResult[0] === 0) {
      throw new Error('汇总匹配量更新失败');
    }
    await t.commit();
  } catch (e) {
    console.error(e);
    await t.rollback();
    throw new Error(e.message || '更新错误');
  }
};
module.exports = {
  search,
  captcha,
  update,
  distrDeadlineSettingGet,
  updateDeadline,
};
