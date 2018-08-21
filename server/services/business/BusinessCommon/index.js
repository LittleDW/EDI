/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-08 15-57
 * @Last Modified: 2018-05-08 15-57
 * @Modified By: Osborn
 */

const Dao = require('./businessCommon');
const { logger } = require('../../../util');

const manualLog = async (req, params) => {
  const dao = Dao(req);
  const { action_type="", from_table, from_table_key, oper_log } = params;
  const { org_code, user_id, sub_user_id } = req.session.profile;
  return dao
    .manualLog(action_type,from_table, from_table_key, org_code, user_id, sub_user_id, oper_log)
    .catch((e) => {
      logger.error((e && e.message) || '日志操作失败');
    });
};
const manualTableLog = (req, params) => {
  const dao = Dao(req);
  const { action_type, from_table, oper_log } = params;
  const { org_code, user_id, sub_user_id } = req.session.profile;
  return dao
    .manualTableLog(action_type, from_table, org_code, user_id, sub_user_id, oper_log)
    .catch((e) => {
      logger.error((e && e.message) || '表日志操作失败');
    });
};
module.exports = {
  manualLog,
  manualTableLog,
};
