/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_edi_pay_detail',
    {
      pay_no: {
        type: DataTypes.CHAR(60),
        allowNull: false,
        defaultValue: '1',
        primaryKey: true,
      },
      org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      pay_date: {
        type: DataTypes.DATE,
        allowNull: false,
        get() {
          return moment(this.getDataValue('pay_date')).format('YYYY-MM-DD');
        },
      },
      pay_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
      tableName: 't_edi_pay_detail',
      primaryKeysOrder: ['pay_no'],
      chineseTableName: '平台使用费缴费明细',
      chineseFieldName: {
        pay_no: '缴费单号',
        org_code: '机构号',
        pay_date: '缴费日期',
        pay_fee: '缴费金额',
        comment: '备注',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          create: ['org_code', 'pay_date', 'pay_fee', 'comment'],
        },
        template: {
          create: 'default',
        },
        customFieldName: {
          pay_fee: '缴费金额(元)',
        },
      },
      hooks: {
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '增加缴费记录', this);
        },
      },
    },
  );
};
