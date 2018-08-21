/*
 * @Author Osborn
 * @File super.js
 * @Date 2018-03-28 20-47
 */

const _ = require('lodash');

class BusinessDaoSuper {
  constructor(req) {
    const accessControl = this.getRoleAccessControl(req);
    const logInfo = this.getLogInfoFromSession(req);
    const userType = this.getUserType(req);
    this.info = {
      accessControl,
      logInfo,
      userType,
    };
  }
  getLogInfoFromSession(req = {}) {
    const {
      session: { profile = {} } = {},
      sessionID,
      headers: { 'x-forward-for': remoteAddress } = {},
      connection: { remoteAddress: remoteAddressPlus } = {},
    } = req;
    return {
      profile,
      sessionID,
      IP: remoteAddress || remoteAddressPlus,
    };
  }
  getRoleAccessControl(req = {}) {
    return (req.session && req.session.subUserDataRestriction) || null;
  }
  getUserType(req) {
    return (req.session && req.session.profile && req.session.profile.user_type) || 1;
  }

  bridge(name) {
    return async function (params = {}) {
      return this[name](params);
    };
  }
}

module.exports = BusinessDaoSuper;
