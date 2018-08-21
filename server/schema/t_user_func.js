/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');
const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_user_func',
    {
      id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      func_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      func_flag: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: '0',
      },
      use_yn: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'Y',
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
      tableName: 't_user_func',
      primaryKeysOrder: ['id'],
      chineseTableName: '瑞雪服务子账号权限',
      chineseFieldName: {
        id: '子用户ID',
        user_id: '用户ID',
        func_id: '菜单ID',
        func_flag: '菜单Flag',
        use_yn: '是否启用',
        create_user_id: '创建人',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['user_name', 'user_full_name', 'linkman', 'tel', 'mobile', 'email'],
          update2: ['user_name', 'tel', 'mobile', 'email', 'password'],
          create: ['user_name', 'user_full_name', 'linkman', 'tel', 'mobile', 'email'],
        },
        template: {
          update: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        // afterCreate(instance, options) {
        //   const customLog = new CustomLogs();
        //   customLog.createLog(instance, options, '', this);
        // },
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '', this);
        },
      },
    },
  );
};
