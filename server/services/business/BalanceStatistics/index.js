/**
 * @Author zhangjunjie
 * @Date 29/03/2018 15:58
 * @Description: BalanceStatistics Service
 */
const moment = require('moment');
const Dao = require('./balanceStatisticsDao');
const { getMySQLFieldValue } = require('../../../util');

const search = async (req) => {
  const { user_type } = req && req.session && req.session.profile;
  let { startDate, endDate, orgType, fundOrgCode, assetOrgCode } = req.body;
  const params = getMySQLFieldValue({
    startDate,
    endDate,
    orgType,
    fundOrgCode,
    assetOrgCode,
  });
  const dao = Dao(req);
  const monthList = await (user_type === 3
    ? dao.monthForAdmin(params)
    : user_type === 1
      ? dao.monthForAsset(params)
      : dao.monthForFund(params));
  monthList.forEach((item) => {
    item.loan_fee = parseFloat(item.loan_fee);
    item.repayment_fee = parseFloat(item.repayment_fee);
  });
  params.start_date = moment(startDate, 'YYYY-MM').format('YYYY-MM-DD');
  const preferredEndDate = moment(endDate, 'YYYY-MM').add(1, 'month').subtract(1, 'day')
  const _endDate = preferredEndDate.isBefore(moment()) && preferredEndDate || moment()
  params.end_date = _endDate.format('YYYY-MM-DD')

  const dayList = await (user_type === 3
    ? dao.dayForAdmin(params)
    : user_type === 1
      ? dao.dayForAsset(params)
      : dao.dayForFund(params));
  dayList.forEach((item) => {
    item.loan_fee = parseFloat(item.loan_fee);
    item.repayment_fee = parseFloat(item.repayment_fee);
  });

  params.start_date = moment()
    .subtract(1, 'month')
    .format('YYYY-MM-DD');
  params.end_date = moment()
    .subtract(1, 'day')
    .format('YYYY-MM-DD');
  const balanceList = await (user_type === 3
    ? dao.balanceForAdmin(params)
    : user_type === 1
      ? dao.balanceForAsset(params)
      : dao.balanceForFund(params));
  balanceList.forEach((item) => {
    item.balance_fee = parseFloat(item.balance_fee);
  });
  return {
    monthList,
    dayList,
    balanceList,
  };
};

const searchTab4 = async (req) => {
  let { assetList, fundList } = req.body;
  assetList = !assetList
    ? ''
    : `${assetList
        .split(',')
        .map((item) => "'" + item + "'")
        .join(',')}`;
  fundList = !fundList
    ? ''
    : `${fundList
        .split(',')
        .map((item) => "'" + item + "'")
        .join(',')}`;
  const params = {
    assetList,
    fundList,
  };

  const balaStaList = await Dao(req).balanceStatisticsTab4(params);
  return { balaStaList };
};

module.exports = {
  search,
  searchTab4,
};
