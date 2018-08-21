/*
 * @Author Osborn
 * @File loginLogsDao.js
 * @Created Date 2018-05-21 15-17
 * @Last Modified: 2018-05-21 15-17
 * @Modified By: Osborn
 */

const Super = require('../super');
const dao = require('../../../dao');

const { Log: logDao } = dao;

class LoginLogs extends Super {
  count(params = {}) {
    const {
      login_time_start, login_time_end, user_name, user_type,
    } = params;
    return logDao.LoginLog(this.info).logCount({
      login_time_start,
      login_time_end,
      user_name,
      user_type,
    });
  }

  query(params = {}) {
    const {
      login_time_start, login_time_end, user_name, user_type, page_index,
    } = params;
    return logDao.LoginLog(this.info).query(
      {
        login_time_start,
        login_time_end,
        user_name,
        user_type,
      },
      page_index,
    );
  }
}
module.exports = req => new LoginLogs(req);
