/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-03 16-05
 * @Last Modified: 2018-05-03 16-05
 * @Modified By: Osborn
 */

const CONFIGURATION = require('../../../config/configure.json')[process.env.NODE_ENV];

const get = async (req, res, next) => {
  const certificateHost = CONFIGURATION.certificate.host;
  const user_account = req.session.profile.user_account;
  const timestamp = Date.now();
  const token = `${user_account}${timestamp}`.md5();
  const url = `${certificateHost}/?user=${user_account}&timestamp=${timestamp}&token=${token}`;
  return res.json({ success: true, certificateUrl: url });
};

module.exports = {
  get,
};
