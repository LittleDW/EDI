/**
 * @Author zhangjunjie
 * @Date 2018/4/12 15:10
 * @Description: 业务报表FundStatistics Service
 */

const fsDao = require("./fundStatisticsDao");
const { getMySQLFieldValue } = require("../../../util");
const _ = require('lodash')

const total = async req => {
  let { assetOrgCode, fundOrgCode, startDate, endDate, role } = req.body;
  const { profile } = req.session;
  if (profile.user_type === 1) {
    assetOrgCode = profile.org_code;
  } else if (profile.user_type === 2) {
    fundOrgCode = profile.org_code;
  }
  let params = getMySQLFieldValue({
    assetOrgCode,
    startDate,
    fundOrgCode,
    endDate
  });
  let totalList;
  if (role === "1") {
    totalList = await fsDao(req).assetTotal(params);
  } else {
    totalList = await fsDao(req).fundTotal(params);
  }
  return { totalList };
};

const fundOrAsset = async req => {
  let {
    assetOrgCode,
    fundOrgCode,
    startDate,
    endDate,
    deadline_id,
    role
  } = req.body;
  let params = getMySQLFieldValue({
    assetOrgCode,
    fundOrgCode,
    startDate,
    endDate,
    deadline_id
  });
  let orgDataList;
  if (role === "1") {
    orgDataList = await fsDao(req).assetStatis(params);
  } else {
    orgDataList = await fsDao(req).fundStatis(params);
  }
  return { orgDataList };
};

const deadline = async req => {
  let {
    assetOrgCode,
    fundOrgCode,
    startDate,
    endDate,
    deadline_id,
    role
  } = req.body;
  let params = getMySQLFieldValue({
    assetOrgCode,
    fundOrgCode,
    startDate,
    endDate,
    deadline_id
  });
  let deadlineDataList;
  if (role === "2") {
    deadlineDataList = await fsDao(req).assetDeadline(params);
  } else {
    deadlineDataList = await fsDao(req).fundDeadline(params);
  }
  return { deadlineDataList };
};

const platform = async req => {
  const { startDate, endDate } = req.body;
  if (!_.isDate(startDate) || !_.isDate(endDate) ) {
    throw new Error('请选择正确的时间范围')
  }
  const params = getMySQLFieldValue({
    startDate,
    endDate
  })
  const [scaleList, collectList] = await Promise.all([
    fsDao(req).adminStatisticsPlatformScale(params),
    fsDao(req).adminStatisticsPlatformCollect(params),
  ])
  if (_.isEmpty(scaleList) || _.isEmpty(collectList)) {
    throw new Error("无记录")
  }
  return {
    scaleList,
    collectList
  }
};

module.exports = {
  total,
  fundOrAsset,
  deadline,
  platform
};
