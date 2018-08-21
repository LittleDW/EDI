/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');
const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_edi_pay_bill',
    {
      org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      month: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: '',
        primaryKey: true,
      },
      platform_pay_mode: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        defaultValue: '001',
      },
      platform_use_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: '0.00050',
      },
      person_order_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: '0',
      },
      enterprise_order_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: '0',
      },
      order_reduce_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: '0',
      },
      finish_pay_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: '0',
      },
      last_balance_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: '0',
      },
      person_order_count: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        defaultValue: '0',
      },
      enterprise_order_count: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        defaultValue: '0',
      },
      comment: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rx_insertTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.Now,
        get() {
          const value = this.getDataValue('rx_insertTime');
          return moment(value).format('YYYY-MM-DD HH-mm-ss');
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
      tableName: 't_edi_pay_bill',
      primaryKeysOrder: ['org_code', 'month'],
      chineseTableName: '平台使用费账单',
      chineseFieldName: {
        org_code: '机构号',
        month: '月份',
        platform_pay_mode: '平台使用费缴费方式',
        platform_use_rate: '平台使用费率',
        person_order_fee: '本月平台个人订单金额',
        enterprise_order_fee: '本月平台企业订单金额',
        order_reduce_fee: '本月减免平台订单金额',
        finish_pay_fee: '本月缴费金额',
        last_balance_fee: '上月账号余额',
        person_order_count: '本月平台个人订单数',
        enterprise_order_count: '本月平台个人订单数',
        comment: '备注',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['order_reduce_fee'],
        },
        template: {
          update: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.customize = (data) => data.map((d) => {
            if (d.name === 'order_reduce_fee') {
              d.previousData = _.toNumber(d.previousData / 100)
              d.nextData = _.toNumber(d.nextData / 100)
            }
            return d;
          });
          customLog.updateLog(instance, options, '', this);
        },
      },
    },
  );
};
