/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_asset_api',
    {
      asset_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      api_type: {
        type: DataTypes.CHAR(2),
        allowNull: false,
        primaryKey: true,
      },
      api_url: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      api_token: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
      tableName: 't_asset_api',
      primaryKeysOrder: ['asset_org_code', 'api_type'],
      chineseTableName: 'api定义',
      chineseFieldName: {
        asset_org_code: '资产方机构号',
        api_type: 'API类型',
        api_url: 'API地址',
        api_token: '握手token',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['api_url', 'api_token'],
          create: ['asset_org_code', 'api_type', 'api_url', 'api_token'],
        },
        template: {
          update: 'default',
          create: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '修改API地址', this);
        },
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '添加API地址', this);
        },
      },
    },
  );
};
