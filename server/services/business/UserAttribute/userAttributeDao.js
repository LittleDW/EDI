/*
 * @Author Osborn
 * @File userAttributeDao.js
 * @Created Date 2018-05-03 16-51
 * @Last Modified: 2018-05-03 16-51
 * @Modified By: Osborn
 */

const { User: userDao, Common: commonDao, Fund: fundDao } = require('../../../dao');
const Super = require('../super');

class UserAttribute extends Super {
  // query
  query(options = {}) {
    return userDao.UserAttribute(this.info).queryAll(options);
  }
  // update
  update(values = {}, options = {}) {
    return userDao.UserAttribute(this.info).nativeUpdate(values, options);
  }
  apiCheck(params = {}) {
    return fundDao.FundApi(this.info).nativeQuery(params);
  }
  apiUpdate(values = {}, options = {}) {
    return fundDao.FundApi(this.info).nativeUpdate(values, options);
  }
  apiCreate(values = {}, options = {}) {
    return fundDao.FundApi(this.info).nativeCreate(values, options);
  }
  apiDelete(options = {}) {
    return fundDao.FundApi(this.info).nativeDelete(options);
  }
  count(options = {}) {
    return userDao.UserAttribute(this.info,["admin"]).count(options);
  }
  manageQuery(options = {}, page_index) {
    return userDao.UserAttribute(this.info,["admin"]).query(options, page_index);
  }
}

module.exports = req => new UserAttribute(req);
