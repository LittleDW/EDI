/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-03 15-30
 * @Last Modified: 2018-05-03 15-30
 * @Modified By: Osborn
 */

const _ = require('lodash');

const { getMySQLFieldValue } = require('../../util');
const operationTableLogService = require('../../services').business.operationTableLog;

const search = async (req, res, next) => {
  const {
    operTimeStart, operTimeEnd, userName, tableName, pageIndex,
  } = req.body;
  const myPageIndex = _.isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    operTimeStart,
    operTimeEnd,
    userName,
    tableName,
    pageIndex: myPageIndex,
  });

  const [resultSet, count] = await operationTableLogService.queryAndCount(req, params);
  return res.json({ success: true, rows: resultSet, total: count });
};

module.exports = {
  search,
};
