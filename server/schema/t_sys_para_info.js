/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_sys_para_info',
    {
      table_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      col_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      para_key: {
        type: DataTypes.STRING(10),
        allowNull: false,
        primaryKey: true,
      },
      para_value: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
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
      tableName: 't_sys_para_info',
      primaryKeysOrder: ['table_name', 'col_name', 'para_key', 'para_value'],
      chineseTableName: '数据字典',
      chineseFieldName: {
        table_name: '表名',
        col_name: '列名',
        para_key: 'key编码',
        para_value: '含义',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          create: ['table_name', 'col_name', 'para_key', 'para_value'],
          update: ['table_name', 'col_name', 'para_key', 'para_value'],
          delete: ['table_name', 'col_name', 'para_key', 'para_value'],
        },
        template: {
          update: 'dictionary',
          create: 'dictionary',
          delete: 'dictionary',
        },
        customFieldName: {},
      },
      hooks: {
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '增加词条', this);
        },
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '修改词条', this);
        },
        afterDestroy(instance, options) {
          const customLog = new CustomLogs();
          customLog.deleteLog(instance, options, '删除词条', this);
        },
      },
    },
  );
};
