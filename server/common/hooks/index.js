/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-27 11-27
 */

const SystemLog = require('../log/systemLog');
const AccessControl = require('../accessControl').AccessControlHookLevel;

const hooks = {
  // bulk
  beforeBulkCreate(instances, options) {
    return SystemLog.defaultLog(this.options._visitor, '批量创建');
  },
  beforeBulkDestroy(options) {
    return SystemLog.defaultLog(this.options._visitor, '批量删除');
  },
  beforeBulkUpdate(options) {
    return SystemLog.defaultLog(this.options._visitor, '批量更新');
  },
  // validate
  beforeValidate(instance, options) {
    return SystemLog.defaultLog(this.options._visitor, '执行验证');
  },
  afterValidate(instance, options) {
    return SystemLog.defaultLog(this.options._visitor, '验证成功');
  },
  validationFailed(instance, options, error) {
    return SystemLog.defaultLog(this.options._visitor, '验证失败');
  },
  // default log
  beforeFind(options) {
    const accessControl = new AccessControl(
      this.options.accessControl,
      this.options.accessList,
      this.options.userType,
      options,
      this,
    );
    accessControl.executeQuery();
    return SystemLog.defaultLog(this.options._visitor, '查询');
  },
  // beforeFindAfterExpandIncludeAll(a) {
  //   const b = this;
  // },
  // beforeFindAfterOptions(a) {
  //   const b = this;
  // },
  beforeCreate() {
    return SystemLog.defaultLog(this.options._visitor, '创建');
  },
  beforeUpdate() {
    return SystemLog.defaultLog(this.options._visitor, '更新');
  },
  beforeDestroy() {
    return SystemLog.defaultLog(this.options._visitor, '删除');
  },
  beforeUpsert(values, options) {
    return SystemLog.defaultLog(this.options._visitor, '更新或者插入');
  },
  beforeCount(options) {
    const accessControl = new AccessControl(
      this.options.accessControl,
      this.options.accessList,
      this.options.userType,
      options,
      this,
    );
    accessControl.executeQuery();
    return SystemLog.defaultLog(this.options._visitor, '计数查询');
  },
};

module.exports = hooks;
