/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_user',
    {
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      user_type: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      user_from: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: '1',
      },
      org_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      user_status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      user_account: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      user_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      user_full_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      rop_user_id: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      linkman: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      tel: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
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
      tableName: 't_user',
      primaryKeysOrder: ['user_id'],
      chineseTableName: '系统用户表',
      chineseFieldName: {
        user_id: '用户编码',
        user_type: '用户类型',
        user_from: '用户来源',
        org_code: '机构编码',
        user_status: '用户状态',
        user_account: '用户账号',
        password: '用户密码',
        user_name: '机构名',
        user_full_name: '机构名全称',
        rop_user_id: 'ROP用户编码',
        linkman: '联系人',
        tel: '电话',
        mobile: '手机',
        email: '邮箱',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          // cooperator
          update: ['rop_user_id', 'user_account', 'password', 'user_name', 'user_full_name', 'linkman', 'tel', 'mobile', 'email'],
          update2: ['user_name', 'tel', 'mobile', 'email', 'password'],
          update3: [
            'user_type',
            'org_code',
            'user_status',
            'user_account',
            'password',
            'user_name',
            'rop_user_id',
            'tel',
            'mobile',
            'email',
          ],
          create: ['rop_user_id', 'user_account', 'user_name', 'user_full_name', 'linkman', 'tel', 'mobile', 'email'],
          // cooperator
          create2: [
            'user_type',
            'org_code',
            'user_status',
            'user_account',
            'user_name',
            'rop_user_id',
            'tel',
            'mobile',
            'email',
          ],
          delete: ['user_id', 'user_name'],
        },
        template: {
          update: 'default',
          create: 'default',
          delete: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '添加用户', this);
        },
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '修改用户', this);
        },
        afterDestroy(instance, options) {
          const customLog = new CustomLogs();
          customLog.deleteLog(instance, options, '删除用户', this);
        },
      },
    },
  );
};
