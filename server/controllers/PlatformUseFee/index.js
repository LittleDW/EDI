/*
 * @Author zhangjunjie
 * @File index.js
 * @Created Date 2018-05-30 15-21
 * @Last Modified: 2018-05-30 15-22
 * @Modified By: zhangjunjie
 */

const _ = require('lodash');
const moment = require('moment');
const commonService = require('../../services/business/BusinessCommon');

const { platformUseFee: platFeeService } = require('../../services').business;
const {
  logger,
  spawning,
  promisify,
  path,
  uuidv4,
  fs,
  getMySQLFieldValue,
  removefileIfExist,
} = require('../../util');
const platformUseFeeService = require('../../services/business/PlatformUseFee/platformUseFeeService');
const configure = require('../../../config/configure.json')[
  process.env.NODE_ENV
];

const billSearch = async (req, res) => {
  const { rows, total, statisticsRows } = await platFeeService.billSearch(req);
  const {
    order_fee_total,
    platform_use_fee_total,
    finish_pay_fee_total,
  } = statisticsRows;
  return res.json({
    success: true,
    rows,
    total,
    order_fee_total,
    platform_use_fee_total,
    finish_pay_fee_total,
  });
};

const emailSearch = async (req, res) => {
  const { emails } = await platFeeService.emailSearch(req);

  return res.json({
    success: true,
    emails,
  });
};

const billReduce = async (req, res) => {
  await platFeeService.billReduce(req);

  return res.json({
    success: true,
  });
};

const payNotice = async (req, res) => {
  await platFeeService.payNotice(req);

  return res.json({
    success: true,
  });
};
const paySearch = async (req, res) => {
  const { rows, total } = await platFeeService.paySearch(req);

  return res.json({
    success: true,
    rows,
    total,
  });
};
const payAdd = async (req, res) => {
  await platFeeService.payAdd(req);

  return res.json({
    success: true,
  });
};

const feeSearch = async (req, res) => {
  const { total, rows } = await platFeeService.feeSearch(req);
  _.forEach(rows, (row) => {
    row.adjust_platform_use_rate = Number.isNaN(
      parseFloat(row.adjust_platform_use_rate),
    )
      ? null
      : parseFloat(row.adjust_platform_use_rate);
    row.platform_use_rate = Number.isNaN(parseFloat(row.platform_use_rate))
      ? null
      : parseFloat(row.platform_use_rate);
  });
  return res.json({
    success: true,
    total,
    rows,
  });
};

const feeUpdate = async (req, res) => {
  const { data } = await platFeeService.feeUpdate(req);
  data.adjust_platform_use_rate = Number.isNaN(
    parseFloat(data.adjust_platform_use_rate),
  )
    ? null
    : parseFloat(data.adjust_platform_use_rate);
  data.platform_use_rate = Number.isNaN(parseFloat(data.platform_use_rate))
    ? null
    : parseFloat(data.platform_use_rate);

  return res.json({
    success: true,
    data,
  });
};

const exportFn = async (req, res) => {
  const outputFile = path.resolve(`${__dirname}/../../../temp/${uuidv4()}`);
  const xslx = path.resolve(`${__dirname}/../../../temp/${uuidv4()}`);
  let ownerUserType = req.session.profile.user_type;
  let ownerOrgCode = req.session.profile.org_code;
  fs.closeSync(fs.openSync(outputFile, 'w'));
  const Download = promisify(res.download);
  try {
    let { billYear, billMonth, userType, orgCode, platformPayMode } = req.query;
    const params = getMySQLFieldValue({
      month: (billYear ? billYear : '%') + '-' + (billMonth ? billMonth : '%'),
      userType: ownerUserType == 3 ? userType : ownerUserType,
      orgCode: ownerUserType == 3 ? orgCode : ownerOrgCode,
      platformPayMode,
    });
    if (req.session.subUserDataRestriction) {
      let {
        assetDataRestriction,
        fundDataRestriction,
      } = req.session.subUserDataRestriction;
      params.restriction = [...assetDataRestriction, ...fundDataRestriction];
    }
    const qList = [];
    const total = await platformUseFeeService(req).ediPayBillCount(params);
    if (!total) {
      throw new Error('无记录');
    }
    const pages = Math.ceil(total / configure.exportLimit);
    for (let i = 0; i < pages; i++) {
      qList.push(
        spawning(
          path.resolve(`${__dirname}/../../spawn/ediPayBillAssist.js`),
          ownerUserType,
          ownerOrgCode,
          billYear,
          billMonth,
          userType,
          orgCode,
          platformPayMode,
          JSON.stringify({ restriction: params.restriction } || {}),
          i * configure.exportLimit,
          outputFile,
        ),
      );
    }
    await Promise.all(qList);
    await spawning(
      path.resolve(`${__dirname}/../../spawn/json2xslx.js`),
      outputFile,
      xslx,
    );
    await Download.call(res, xslx, '平台使用费账单导出.xlsx');
    logger.info(res._headers);

    let from_table = 't_edi_pay_bill',
      oper_log = `动作：导出平台使用费账单 ${total}条, 导出参数 ${JSON.stringify(
        params,
      )}`;

    await commonService.manualTableLog(req, {
      from_table,
      action_type: '导出',
      oper_log,
    });
  } catch (err) {
    if (res.headersSent) {
      logger.error(err);
    } else {
      res.status(404).send((err && err.message) || err || '发生错误');
    }
  } finally {
    removefileIfExist(outputFile);
    removefileIfExist(xslx);
  }
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
  exportFn,
};
