/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-03 15-35
 * @Last Modified: 2018-05-03 15-35
 * @Modified By: Osborn
 */

const Dao = require('./operationTableLogDao');

const queryAndCount = (req, params) => {
  const dao = Dao(req);
  const {
    oper_time_start, oper_time_end, user_name, table_name, page_index,
  } = params;
  return Promise.all([
    dao.query({
      oper_time_start, oper_time_end, user_name, table_name, page_index,
    }),
    dao.count({
      oper_time_start, oper_time_end, user_name, table_name,
    }),
  ]);
};
module.exports = {
  queryAndCount,
};
