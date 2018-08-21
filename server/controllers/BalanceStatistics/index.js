/**
 * @Author zhangjunjie
 * @Date 29/03/2018 15:18
 * @Description: BalanceStatistics Controller
 */

const balanceStatisticsService = require('../../services').business
  .balanceStatistics;

const search = async (req, res) => {
  const {
    monthList,
    dayList,
    balanceList,
  } = await balanceStatisticsService.search(req);

  return res.json({ success: true, monthList, dayList, balanceList });
};

const searchTab4 = async (req, res) => {
  const { balaStaList } = await balanceStatisticsService.searchTab4(req);
  return res.json({ success: true, balaStaList });
};

module.exports = {
  search,
  searchTab4,
};
