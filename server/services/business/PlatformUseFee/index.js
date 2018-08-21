/*
 * @Author zhangjunjie
 * @File index.js
 * @Created Date 2018-05-30 17-03
 * @Last Modified: 2018-05-30 17-13
 * @Modified By: zhangjunjie
 */
const {
  getMySQLFieldValue,
  formatNumber,
  sendMail,
  spawning,
  promisify,
  path,
  uuidv4,
} = require('../../../util');
const _ = require('lodash');
const platformUseFeeService = require('./platformUseFeeService');
const commonService = require('../BusinessCommon');
const { sequelizeDB } = require('../../../schema');
const moment = require('moment');

const billSearch = async (req) => {
  const {
    billMonth,
    billYear,
    orgCode,
    pageIndex,
    platformPayMode,
    userType,
  } = req.body;
  const ownerUserType = req.session.profile.user_type;
  const ownerOrgCode = req.session.profile.org_code;
  const myPageIndex =
    !_.isNumber(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    month: `${billYear || '%'}-${billMonth || '%'}`,
    userType: ownerUserType === 3 ? userType : ownerUserType,
    orgCode: ownerUserType === 3 ? orgCode : ownerOrgCode,
    platformPayMode,
    pageIndex: myPageIndex,
  });
  if (req.session.subUserDataRestriction) {
    const {
      assetDataRestriction,
      fundDataRestriction,
    } = req.session.subUserDataRestriction;
    params.restriction = [...assetDataRestriction, ...fundDataRestriction];
  }
  const platFeeService = platformUseFeeService(req);
  const [total, rows, [[statisticsRows]]] = await Promise.all([
    platFeeService.ediPayBillCount(params),
    platFeeService.ediPayBillQuery(params),
    platFeeService.ediPayBillStatistics(params),
  ]);
  return {
    total,
    rows,
    statisticsRows,
  };
};

const emailSearch = async (req) => {
  const { orgCode } = req.body;
  const emails = await platformUseFeeService(req).ediPayEmailSearch({
    org_code: orgCode,
  });

  return {
    emails,
  };
};

const billReduce = async (req) => {
  const { org_code, month, order_reduce_fee } = req.body;
  let old_value;
  if (!order_reduce_fee) {
    throw new Error('减免平台订单金额不能为空');
  } else if (
    isNaN(order_reduce_fee) ||
    Math.abs(parseFloat(order_reduce_fee)) > 10000000000 ||
    !/^-?\d+$/.test(order_reduce_fee)
  ) {
    throw new Error('减免平台订单金额必须为整数，且绝对值不大于100亿');
  }
  const transaction = await sequelizeDB.transaction();
  try {
    const preQueryRows = await platformUseFeeService(req).ediPayBillQueryByKey({
      org_code,
      month,
    });
    if (!preQueryRows || !preQueryRows[0]) {
      throw new Error('查无此字段');
    }
    old_value = preQueryRows[0];
    let order_reduce_fee_final = Number((order_reduce_fee * 100).toFixed(0));
    let reduce_val = order_reduce_fee_final - old_value.order_reduce_fee;

    const [affectedRows] = await platformUseFeeService(req).ediPayBillUpdate(
      {
        org_code,
        month,
        order_reduce_fee: order_reduce_fee_final,
      },
      transaction,
    );
    if (affectedRows < 1) {
      throw new Error('减免平台订单金额失败');
    }

    const reduceResults = await platformUseFeeService(
      req,
    ).ediPayBillReducePreMonth({ org_code, month, reduce_val });

    await transaction.commit();
    return reduceResults;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || '更新失败');
  }
};

const payNotice = async (req) => {
  let { mail_to, mail_cc } = req.body;
  const data = req.body;
  if (!mail_to) {
    throw new Error('收件人不能为空');
  }
  mail_to = _.replace(_.replace(mail_to, /\s/gi, ''), /，/gi, ',');
  mail_cc = _.replace(_.replace(mail_cc, /\s/gi, ''), /，/gi, ',');
  if (_.endsWith(mail_to, ',')) {
    mail_to = mail_to.slice(0, -1);
  }
  if (_.endsWith(mail_cc, ',')) {
    mail_cc = mail_cc.slice(0, -1);
  }
  const transaction = await sequelizeDB.transaction();
  try {
    let list = mail_to + ',' + mail_cc
    let mailList = list.split(',');
    mailList = [...new Set(mailList)]
    for (let mail of mailList) {
      if (mail) {
        const newPayEmail = await platformUseFeeService(req).ediPayEmailAdd(
          { org_code: data.org_code, email: mail },
          transaction,
        )
        if (_.isEmpty(newPayEmail)) {
          throw new Error('邮箱添加失败');
        }
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || '更新失败');
  }
  let html = '';
  // 预缴
  if (data.platform_pay_mode == '001') {
    html =
      `${data.user_name}：<br/>` +
      `<span style="margin-left: 15px">您好！</span><br/>` +
      `<span style="margin-left: 15px">以下是贵公司${moment(data.month).format(
        'YYYY年MM月',
      )}融数信息交互平台服务费账单，明细如下：</span><span style="float: right;padding-right: 10px" >单位：元</span><br/>` +
      `<table style="margin-left: 25px;border-collapse:collapse;" border="1" cellspacing="0" cellpadding="3">` +
      `<tr><td>账单截止日</td><td>费用缴纳方式</td><td>平台使用费率</td><td>本月平台个人订单金额</td><td>本月平台企业订单金额</td><td>本月减免平台订单金额</td><td>本月平台使用费</td><td style="background-color: #d5a610">本月缴费金额</td><td style="background-color: #d5a610">上月账户余额</td><td style="background-color: #d5a610">本月账户余额</td><td style="background-color: #985f0d">本月应付总额</td><td>备注</td></tr>` +
      `<tr><td>${
        data.month
      }</td><td>预缴</td><td style="text-align: right">${formatNumber(
        data.platform_use_rate,
      )}%</td><td style="text-align: right">${formatNumber(
        data.person_order_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.enterprise_order_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.order_reduce_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.platform_use_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.finish_pay_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.last_balance_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.balance_fee,
      )}</td><td style="background-color: #985f0d;text-align: right">${formatNumber(
        data.need_pay_fee,
      )}</td><td>${data.comment ? data.comment : ''}</td></tr>` +
      `</table><br/>` +
      `<span style="margin-left: 25px">说明：</span><br/>` +
      `<span style="margin-left: 35px">本月账户余额 = 上月账户余额 + 本月缴费金额</span><br/>` +
      `<span style="margin-left: 35px">本月应付总额 = 本月平台使用费 - 本月账户余额</span><br/><br/>` +
      `<span style="margin-left: 25px">贵公司本月账户余额已不足5万元，请于三个工作日内预缴约一个月的平台使用费${Math.ceil(
        (50000 - data.balance_fee + data.platform_use_fee) / 10000,
      )}万元至如下账户，以免影响信息交互平台的正常使用，谢谢！</span><br/>` +
      `<span style="margin-left: 35px">账户名称：融数信息科技集团有限公司</span><br/>` +
      `<span style="margin-left: 35px">开户行：平安银行北京分行营业部</span><br/>` +
      `<span style="margin-left: 35px">账号：11015089146001</span><br/><br/>` +
      `<span style="margin-left: 15px">如有疑问，请及时联系：郭兰兰 edi@rongcapital.cn，guolanlan@rongcapital.cn  联系电话：13701223706。</span>`;
  } else {
    // 月结
    html =
      `${data.user_name}：<br/>` +
      `<span style="margin-left: 15px">您好！</span><br/>` +
      `<span style="margin-left: 15px">以下是贵公司${moment(data.month).format(
        'YYYY年MM月',
      )}融数信息交互平台服务费账单，明细如下：</span><span style="float: right;padding-right: 10px" >单位：元</span><br/>` +
      `<table style="margin-left: 25px;border-collapse:collapse;" border="1" cellspacing="0" cellpadding="3">` +
      `<tr><td>账单月份</td><td>费用缴纳方式</td><td>平台使用费率</td><td>本月平台个人订单金额</td><td>本月平台企业订单金额</td><td>本月减免平台订单金额</td><td>本月平台使用费</td><td style="background-color: #d5a610">本月缴费金额</td><td style="background-color: #d5a610">上月账户余额</td><td style="background-color: #d5a610">本月账户余额</td><td style="background-color: #985f0d">本月应付总额</td><td>结算截止日</td></tr>` +
      `<tr><td>${
        data.month
      }</td><td>月结</td><td style="text-align: right">${formatNumber(
        data.platform_use_rate,
      )}%</td><td style="text-align: right">${formatNumber(
        data.person_order_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.enterprise_order_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.order_reduce_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.platform_use_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.finish_pay_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.last_balance_fee,
      )}</td><td style="text-align: right">${formatNumber(
        data.balance_fee,
      )}</td><td style="background-color: #985f0d;text-align: right">${formatNumber(
        data.need_pay_fee,
      )}</td><td>${data.pay_deadline_date}</td></tr>` +
      `</table><br/>` +
      `<span style="margin-left: 25px">说明：</span><br/>` +
      `<span style="margin-left: 35px">本月账户余额 = 上月账户余额 + 本月缴费金额</span><br/>` +
      `<span style="margin-left: 35px">本月应付总额 = 本月平台使用费 - 本月账户余额</span><br/><br/>` +
      `<span style="margin-left: 25px">请贵公司于${moment(
        data.pay_deadline_date,
      ).format(
        'YYYY年MM月DD日',
      )}前将足额款项支付至如下账户，以免产生逾期违约金并影响信息交互平台的正常使用：</span><br/>` +
      `<span style="margin-left: 35px">账户名称：融数信息科技集团有限公司</span><br/>` +
      `<span style="margin-left: 35px">开户行：平安银行北京分行营业部</span><br/>` +
      `<span style="margin-left: 35px">账号：11015089146001</span><br/><br/>` +
      `<span style="margin-left: 15px">如有疑问，请及时联系：郭兰兰 edi@rongcapital.cn，guolanlan@rongcapital.cn  联系电话：13701223706。</span>`;
  }

  let mailOptions = {
    from: '"EDI系统邮箱" <edi@rongcapital.cn>',
    to: mail_to,
    cc: mail_cc,
    subject: `【结算通知】${moment(data.month).format(
      'YYYY年MM月',
    )}融数信息交互平台服务费账单`,
    html: html,
  };

  let sendMailResult = sendMail(mailOptions);

  if (!sendMailResult.success) {
    throw new Error(sendMailResult.message || '邮件发送失败');
  }

  let from_table = 't_edi_pay_bill',
    from_table_key = `${data.org_code},${data.month}`;

  let oper_log = `动作：发送缴费提醒 发送内容：收件人：${mail_to}, 抄送：${mail_cc}, 合作方名称：${
    data.user_name
  }, 账单月份：${data.month}`;

  await commonService.manualLog(req, {
    from_table,
    from_table_key,
    oper_log,
  });
  return sendMailResult;
};

const paySearch = async (req) => {
  const {
    createTimeStart,
    createTimeEnd,
    payDateStart,
    payDateEnd,
    userType,
    orgCode,
    pageIndex,
  } = req.body;
  const myPageIndex =
    isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    createTimeStart,
    createTimeEnd,
    payDateStart,
    payDateEnd,
    userType,
    orgCode,
    pageIndex: myPageIndex,
  });

  const [rows, count] = await Promise.all([
    platformUseFeeService(req).ediPayDetailQuery(params),
    platformUseFeeService(req).ediPayDetailCount(params),
  ]);
  return { rows, total: count };
};

const payAdd = async (req) => {
  const { org_code, pay_date, pay_fee, comment } = req.body;
  const pay_no =
    'p' +
    moment().format('YYYYMMDDHHmmssSSS') +
    Math.round(1e5 * Math.random());

  if (!org_code) {
    throw new Error('合作方名称不能为空');
  } else if (!pay_date) {
    throw new Error('缴费日期不能为空');
  } else if (
    !pay_fee ||
    isNaN(pay_fee) ||
    Math.abs(parseInt(pay_fee)) > 1000000000 ||
    !/^-?\d+$/.test(pay_fee)
  ) {
    throw new Error('缴费金额不能为空，必须为整数，且绝对值不大于10亿');
  } else if (comment && comment.length > 255) {
    throw new Error('备注字数不能大于255');
  }

  const transaction = await sequelizeDB.transaction();
  try {
    const affectedRows = await platformUseFeeService(req).ediPayDetailAdd(
      { pay_no, org_code, pay_date, pay_fee: 100 * pay_fee, comment },
      transaction
    );

    if (_.isEmpty(affectedRows)) {
      throw new Error('缴费添加失败');
    }

    const billResult = await platformUseFeeService(req).ediPayBillPayFeeUpdate(
      { org_code, pay_fee: 100 * pay_fee },
      transaction,
    );

    await transaction.commit();
    return billResult;
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || '添加失败');
  }
};

const feeSearch = async (req) => {
  const { userType, orgCode, pageIndex } = req.body;
  const myPageIndex =
    isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    userType,
    orgCode,
    pageIndex: myPageIndex,
  });
  const [total, rows] = await Promise.all([
    platformUseFeeService(req).ediFeePatternCount(params),
    platformUseFeeService(req).ediFeePatternQuery(params),
  ]);
  if (_.isEmpty(rows)) {
    throw new Error('无记录');
  }
  return { total, rows };
};

const feeUpdate = async (req) => {
  let {
    user_id,
    platform_pay_mode,
    platform_use_rate,
    adjust_platform_use_rate,
    adjust_effect_month,
    platform_pay_scope,
  } = req.body;
  if (!platform_pay_mode) {
    throw new Error('费用缴纳方式不能为空');
  }
  if (
    adjust_platform_use_rate &&
    (isNaN(adjust_platform_use_rate) ||
      (parseInt(adjust_platform_use_rate) > 1000000000 &&
        !/^[0-9]*(\.\d{1,3})?$/.test(adjust_platform_use_rate)))
  ) {
    throw new Error(
      '调整后的平台使用费率必须为数值，且整数部分不可大于10亿，且小数部分最多3位',
    );
  }
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

  if (
    adjust_platform_use_rate === null ||
    adjust_platform_use_rate === undefined ||
    adjust_platform_use_rate === ''
  ) {
    adjust_effect_month = null;
    adjust_platform_use_rate = null;
  }
  const transaction = await sequelizeDB.transaction();

  try {
    const [affectedRows, results] = await platformUseFeeService(
      req,
    ).userAttributeUpdateForFeePattern(
      {
        user_id,
        platform_pay_mode,
        platform_use_rate: platform_use_rate === null ? null : Number(platform_use_rate / 100).toFixed(5),
        adjust_platform_use_rate:
          adjust_platform_use_rate === null
            ? null
            : Number(adjust_platform_use_rate / 100).toFixed(5),
        adjust_effect_month,
        platform_pay_scope,
      },
      transaction,
    );

    if (affectedRows < 1) {
      throw new Error('费用模版修改失败');
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || '更新失败');
  }

  const rows = await platformUseFeeService(req).userAttributeQueryForFeePattern(
    { user_id },
  );

  if (_.isEmpty(rows)) {
    throw new Error('已更新但查无记录');
  }
  return { data: rows[0] };
};

module.exports = {
  billSearch,
  emailSearch,
  billReduce,
  payNotice,
  paySearch,
  payAdd,
  feeSearch,
  feeUpdate,
};
