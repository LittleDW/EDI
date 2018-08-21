/*
 * @Author Osborn
 * @File operationTableLogDao.js
 * @Created Date 2018-05-03 15-38
 * @Last Modified: 2018-05-03 15-38
 * @Modified By: Osborn
 */

const Super = require('../super');
const dao = require('../../../dao');

const { Log: logDao } = dao;

class OperationTableLog extends Super {
  count(params) {
    return logDao.OperTableLog(this.info).count(params);
  }
  query(params) {
    const { page_index } = params;
    return logDao.OperTableLog(this.info).query(params, page_index);
  }
}
module.exports = req => new OperationTableLog(req);
