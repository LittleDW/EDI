/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_task_person_pi_craw',
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
      task_status: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: '1',
      },
      total_count: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0',
      },
      finish_count: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0',
      },
      fail_count: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0',
      },
      task_createtime: {
        type: DataTypes.DATE,
        allowNull: false,
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
      tableName: 't_task_person_pi_craw',
      primaryKeysOrder: ['org_code', 'task_name'],
      chineseTableName: '任务-爬取个人公示信息',
      chineseFieldName: {
        org_code: '机构编码',
        task_name: '任务名',
        task_status: '任务状态   （ 1--已创建    2--处理中    3--已完成）',
        total_count: '总条数',
        finish_count: '成功条数',
        fail_count: '失败条数',
        task_createtime: '任务创建时间',
        down_url: '下载地址',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          create: ['org_code', 'task_name', 'task_status', 'total_count'],
        },
        template: {
          update: 'default',
          create: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '增加任务', this);
        },
      },
    },
  );
};
