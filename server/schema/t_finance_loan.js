/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_finance_loan',
    {
      loan_code: {
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
      edi_user_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      data_from: {
        type: DataTypes.CHAR(1),
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
      repayment_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      repayment_bank: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      repayment_card_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      loan_status: {
        type: DataTypes.CHAR(3),
        allowNull: true,
      },
      partner_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      create_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      account_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      account_fee: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      receive_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      loan_file_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      pay_channel: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      account_voucher_url: {
        type: DataTypes.STRING(500),
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
      },
      rx_updateTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.Now,
      },
    },
    {
      tableName: 't_finance_loan',
      primaryKeysOrder: ['loan_code'],
      chineseTableName: '放款对账单',
      chineseFieldName: {
        loan_code: '对账单编号',
        fund_org_code: '资金方机构号',
        asset_org_code: '资产方机构号',
        edi_user_id: 'EDI来源用户ID',
        data_from: '数据来源',
        real_gathering_name: '收款账户名称',
        real_gathering_bank: '收款账户开户行',
        real_gathering_card_no: '收款账号',
        repayment_name: '付款账户名称',
        repayment_bank: '付款账户开户行',
        repayment_card_no: '付款账号',
        loan_status: '操作状态',
        partner_name: '合作方名称',
        create_date: '创建日期',
        account_date: '出账日期',
        payment_date: '到账日期',
        account_fee: '出账金额',
        receive_name: '收款方名称',
        loan_file_url: '附件地址',
        pay_channel: '支付渠道',
        account_voucher_url: '出账凭证地址',
        remark: '备注',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['repayment_code','loan_status'],
          // create: ['repayment_code'],
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
