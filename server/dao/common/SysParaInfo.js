/*
 * File: SysParaInfo.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri May 18 2018
 * Modified By: Osborn
 */

const _ = require('lodash');

const Model = require('../super');

// "dictionary": "select * from t_sys_para_info where 1=1 and table_name=:?table_name and col_name=:?col_name",
// "dictionaryCreate": "INSERT INTO t_sys_para_info set table_name = :?table_name, col_name=:?col_name, para_key=:?para_key, para_value=:?para_value, rx_insertTime=now(), rx_updateTime=now()",
// "dictionaryUpdate": "update t_sys_para_info set table_name = :?table_name, col_name=:?col_name, para_key=:?para_key, para_value=:?para_value, rx_updateTime=now() where 1=1 and table_name = :?old_table_name and col_name=:?old_col_name and para_key=:?old_para_key and para_value=:?old_para_value",
// "dictionaryDelete": "delete from t_sys_para_info where 1=1 and table_name = :?table_name and col_name=:?col_name and para_key=:?para_key and para_value=:?para_value",

class SysParaInfo extends Model {
  query(params = {}) {
    const where = {};
    if (!_.isEmpty(params.table_name)) {
      _.assign(where, {
        table_name: params.table_name,
      });
    }
    if (!_.isEmpty(params.col_name)) {
      _.assign(where, { col_name: params.col_name });
    }

    return this.dao.findAll({
      where,
    });
  }
  create(values = {}) {
    return this.nativeCreate(values);
  }
  update(values = {}, options = {}) {
    // logic bubble
  }
  delete(options = {}) {
    // logic bubble
  }
}

// const sysParaInfo = new SysParaInfo('t_sys_para_info');
module.exports = (info, accessList = []) => new SysParaInfo('t_sys_para_info', info, accessList);
