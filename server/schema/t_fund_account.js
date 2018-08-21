/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_fund_account',
    {
      asset_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      fund_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      account_purpose: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        defaultValue: '001',
        primaryKey: true,
      },
      gathering_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      gathering_bank: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      gathering_card_no: {
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
      tableName: 't_fund_account',
      primaryKeysOrder: ['fund_org_code', 'asset_org_code', 'account_purpose'],
      chineseTableName: '资金方账号信息',
      chineseFieldName: {
        asset_org_code: '资产方机构号',
        fund_org_code: '资金方机构号',
        account_purpose: '账户用途',
        gathering_name: '资产方放款人',
        gathering_bank: '资产方放款人开户行',
        gathering_card_no: '资产方放款人账户',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['gathering_name', 'gathering_bank', 'gathering_card_no'],
        },
        template: {
          update: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '修改账户信息', this);
        },
      },
    },
  );
};
