/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-21 15-13
 * @Last Modified: 2018-05-21 15-13
 * @Modified By: Osborn
 */

const _ = require('lodash');

const { getMySQLFieldValue } = require('../../util');
const loginLogsService = require('../../services').business.loginLogs;

const search = async (req, res, next) => {
  const {
    loginTimeStart, loginTimeEnd, userName, userType, pageIndex,
  } = req.body;
  const myPageIndex = _.isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue({
    loginTimeStart,
    loginTimeEnd,
    userName,
    userType,
    pageIndex: myPageIndex,
  });
  const [resultSet, count] = await loginLogsService.queryAndCount(req, params);
  return res.json({ success: true, rows: resultSet, total: count });
};

module.exports = {
  search,
};
