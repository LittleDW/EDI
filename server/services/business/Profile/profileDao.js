/*
 * File: profileDao.js
 * File Created: Friday, 23rd March 2018 4:05:40 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Tue Jun 05 2018
 * Modified By: Osborn
 */

const userDao = require('../../../dao').User;
const Super = require('../super');

class ProfileDao extends Super {
  // query
  userQuery(params = {}) {
    const { user_id } = params;
    return userDao.User(this.info).nativeQuerySingle({ where: { user_id } });
  }
  subUserQuery(params = {}) {
    const { sub_user_id } = params;
    return userDao.SubUser(this.info).nativeQuerySingle({ where: { sub_user_id } });
  }
  // update
  userUpdate(values = {}, options = {}) {
    return userDao.User(this.info).nativeUpdate(values, { ...options, action_type: 'user' });
  }
  subUserUpdate(values = {}, options = {}) {
    return userDao.SubUser(this.info).nativeUpdate(values, { ...options, action_type: 'user' });
  }
}

module.exports = req => new ProfileDao(req);
