/*
 * @Author Osborn
 * @File SubUserDataFunc.js
 * @Created Date 2018-05-10 17-01
 * @Last Modified: 2018-05-10 17-01
 * @Modified By: Osborn
 */

const Model = require('../super');

class SubUserDataFunc extends Model {}

module.exports = (info, accessList = []) => new SubUserDataFunc('t_sub_user_data_func', info, accessList);
