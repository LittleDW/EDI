/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-21 15-17
 * @Last Modified: 2018-05-21 15-17
 * @Modified By: Osborn
 */

const Dao = require('./loginLogsDao');

const queryAndCount = (req, params) => {
  const dao = Dao(req);
  const {
    login_time_start, login_time_end, user_type, user_name, page_index,
  } = params;
  return Promise.all([
    dao.query({
      login_time_start,
      login_time_end,
      user_type,
      user_name,
      page_index,
    }),
    dao.count({
      login_time_start,
      login_time_end,
      user_name,
      user_type,
    }),
  ]);
};
module.exports = {
  queryAndCount,
};
