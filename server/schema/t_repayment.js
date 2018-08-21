/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_repayment',
    {
      fund_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      asset_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      repayment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
      },
      repayment_status: {
        type: DataTypes.CHAR(5),
        allowNull: true,
      },
      repayment_bank: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      repayment_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      repayment_card_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      repayment_original_fee: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      repayment_interest_fee: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      repayment_end_date: {
        type: DataTypes.DATE,
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
      tableName: 't_repayment',
      primaryKeysOrder: ['fund_org_code', 'asset_org_code', 'repayment_date'],
      chineseTableName: '兑付指令',
      chineseFieldName: {
        fund_org_code: '资金方机构编码',
        asset_org_code: '资产方机构编码',
        repayment_date: '兑付日期',
        repayment_status: '兑付状态',
        repayment_bank: '兑付开户行',
        repayment_name: '兑付户名',
        repayment_card_no: '兑付账户',
        repayment_original_fee: '兑付本金',
        repayment_interest_fee: '兑付利息',
        repayment_end_date: '兑付到期日',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['repayment_status'],
          // create: ['repayment_status'],
        },
        template: {
          update: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '状态由', this);
        },
        // afterCreate(instance, options) {
        //   const customLog = new CustomLogs();
        //   customLog.createLog(instance, options, '状态由:', this);
        // },
      },
    },
  );
};
