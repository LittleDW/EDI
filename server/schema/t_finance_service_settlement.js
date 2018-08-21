/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_finance_service_settlement',
    {
      settlement_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true,
      },
      fund_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      asset_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      settlement_status: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      settlement_mode: {
        type: DataTypes.CHAR(3),
        allowNull: true,
      },
      settlement_month: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      settlement_service_fee: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      settlement_file_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      repayment_voucher_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      real_gathering_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      real_gathering_bank: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      real_gathering_card_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      repayment_card_no: {
        type: DataTypes.STRING(50),
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
      edi_user_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING(255),
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
          const value = this.getDataValue('rx_insertTime');
          if (!_.isNil(value) && _.isDate(value)) {
            return moment(this.getDataValue('rx_updateTime')).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
    },
    {
      tableName: 't_finance_service_settlement',
      primaryKeysOrder: ['settlement_code'],
      chineseTableName: '服务费结算单',
      chineseFieldName: {
        settlement_code: '结算单编号',
        fund_org_code: '资金方机构号',
        asset_org_code: '资产方机构号',
        settlement_status: '操作状态',
        settlement_mode: '服务费结算方式',
        settlement_month: '服务费结算月份',
        settlement_service_fee: '应结服务费',
        settlement_file_url: '附件地址',
        repayment_voucher_url: '付款凭证地址',
        real_gathering_name: '资金方收款账户名称',
        real_gathering_bank: '资金方收款账户开户行',
        real_gathering_card_no: '资金方收款账号',
        repayment_card_no: '资产方付款账号',
        repayment_bank: '资产方付款账户开户行',
        repayment_name: '资产方付款账户名称',
        edi_user_id: 'EDI来源用户ID',
        remark: '备注',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['settlement_code','settlement_status'],
          create: ['settlement_code','settlement_status'],
        },
        template: {
          update: 'operator',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          const { profile } = this.options._visitor;
          const { user_name } = profile;
          customLog.customize = data => [
            {
              name: user_name,
              previousData: null,
              nextData: user_name,
            },
          ];
          customLog.updateLog(instance, options, '', this);
        },
        // afterCreate(instance, options) {
        //   const customLog = new CustomLogs();
        //   customLog.createLog(instance, options, '添加API地址', this);
        // },
      },
    },
  );
};
