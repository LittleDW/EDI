/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_finance_repayment',
    {
      repayment_code: {
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
      repayment_status: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      partner_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      repayment_from_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      repayment_closing_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      repayment_principal_fee: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      repayment_interest_fee: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      repayment_total_fee: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      repayment_file_url: {
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
      repayment_voucher_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      edi_user_id: {
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
      tableName: 't_finance_repayment',
      primaryKeysOrder: ['repayment_code'],
      chineseTableName: '还款对账单',
      chineseFieldName: {
        repayment_code: '对账单编号',
        fund_org_code: '资金方机构号',
        asset_org_code: '资产方机构号',
        repayment_status: '操作状态',
        partner_name: '合作方名称',
        repayment_from_date: '起始还款日',
        repayment_closing_date: '截止还款日',
        repayment_principal_fee: '应付本金',
        repayment_interest_fee: '应付利息',
        repayment_total_fee: '应付总额',
        repayment_file_url: '附件地址',
        real_gathering_name: '资金方收款账户名称',
        real_gathering_bank: '资金方收款账户开户行',
        real_gathering_card_no: '资金方收款账号',
        repayment_card_no: '资产方付款账号',
        repayment_bank: '资产方付款账户开户行',
        repayment_name: '资产方付款账户名称',
        repayment_voucher_url: '付款凭证地址',
        remark: '备注',
        edi_user_id: 'EDI来源用户ID',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['repayment_code','repayment_status'],
          create: ['repayment_code','repayment_status'],
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
