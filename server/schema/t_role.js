/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_role',
    {
      role_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      role_code: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      role_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      role_type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      sys_yn: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
      },
      use_yn: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'Y',
      },
      sub_user_yn: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
      },
      remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      create_user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      rx_insertTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.Now,
        get() {
          const value = this.getDataValue('rx_insertTime');
          if (!_.isNil(value) && _.isDate(value)) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
      rx_updateTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.Now,
        get() {
          const value = this.getDataValue('rx_updateTime');
          if (!_.isNil(value) && _.isDate(value)) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
    },
    {
      tableName: 't_role',
      primaryKeysOrder: ['role_id'],
      chineseTableName: '系统角色',
      chineseFieldName: {
        role_id: '角色GUID',
        role_code: '角色编码',
        role_name: '角色名称',
        role_type: '角色类型',
        sys_yn: '系统默认保留',
        use_yn: '是否启用',
        remark: '备注',
        sub_user_yn: '账号类型',
        create_user_id: '创建人',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['role_name', 'role_type', 'remark'],
          create: ['role_name', 'role_type', 'sub_user_yn', 'remark'],
        },
        template: {
          update: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '修改角色', this);
        },
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '添加角色', this);
        },
      },
    },
  );
};
