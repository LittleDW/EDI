/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_task_person_pi_craw_detail',
    {
      org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      task_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true,
      },
      borrow_certificate_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      borrow_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      borrow_phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      borrow_card_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      order_no: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      asset_order_no: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      task_status: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: '1',
      },
      down_url: {
        type: DataTypes.STRING(500),
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
      tableName: 't_task_person_pi_craw_detail',
      primaryKeysOrder: ['org_code', 'task_name', 'borrow_certificate_no'],
      chineseTableName: '任务-详情-爬取个人公示信息',
      chineseFieldName: {
        org_code: '机构编码',
        task_name: '任务名',
        borrow_certificate_no: '借款人证件号',
        borrow_name: '借款人',
        borrow_phone: '借款人银行预留手机号',
        borrow_card_no: '借款人银行卡号',
        order_no: '平台订单号',
        asset_order_no: '资产方订单号',
        task_status: '任务状态   （ 1--已创建    2--成功    3--失败）',
        down_url: '下载地址',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          // update: ['company_name', 'org_code', 'task_name', 'task_status'],
          create: ['borrow_certificate_no', 'org_code', 'task_name', 'task_status'],
        },
        template: {
          update: 'default',
          create: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        // afterUpdate(instance, options) {
        //   const customLog = new CustomLogs();
        //   customLog.updateLog(instance, options, '修改API地址', this);
        // },
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '增加任务明细', this);
        },
      },
    },
  );
};
