/*
 * @Author Osborn
 * @File systemLog.js
 * @Created Date 2018-04-27 14-03
 * @Last Modified: 2018-04-27 14-03
 * @Modified By: Osborn
 */
const { logger } = require('../../util');

class SystemLog {
  static defaultLog(logInfo, action) {
    const {
      profile: {
        user_account = '',
        sub_account: { user_account: sub_user_account = '' } = {},
      } = {},
      sessionID = '',
      IP = '',
    } = logInfo;
    logger.info(`用户: ${user_account}，批量执行${action}类SQL，子用户: ${sub_user_account}, sessionID: ${sessionID}, IP: ${IP}`);
  }
}

module.exports = SystemLog;
