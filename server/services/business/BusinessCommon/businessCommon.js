/*
 * @Author Osborn
 * @File common.js
 * @Date 2018-03-29 16-50
 */
const sequelize = require('sequelize');

const Super = require('../super');
const { OperLog, OperTableLog } = require('../../../dao').Log;
const { logger } = require('../../../util');

class BusinessCommon extends Super {
  manualLog(action_type, from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log) {
    return OperLog()
      .nativeCreate(
        {
          action_type,
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id,
          oper_log,
          rx_insertTime: sequelize.fn('NOW'),
          rx_updateTime: sequelize.fn('NOW'),
          oper_time:sequelize.fn('NOW'),
        },
        { hooks: false},
      )
      .catch((err) => {
        console.error(`log error: ${err}`);
        logger.error(`记录操作日志时发生错误，${err}`);
      });
  }
  manualTableLog(action_type, from_table, from_org_code, create_user_id, sub_user_id, oper_log) {
    return OperTableLog()
      .nativeCreate(
        {
          action_type,
          from_table,
          from_org_code,
          create_user_id,
          sub_user_id,
          oper_log,
          rx_insertTime: sequelize.fn('NOW'),
          rx_updateTime: sequelize.fn('NOW'),
          oper_time:sequelize.fn('NOW'),
        },
        {
          hooks: false,
        },
      )
      .catch((err) => {
        console.error(`log error: ${err}`);
        logger.error(`记录操作日志时发生错误，${err}`);
      });
  }
}

module.exports = req => new BusinessCommon(req);
