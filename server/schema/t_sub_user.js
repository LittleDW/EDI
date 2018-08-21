/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_sub_user',
    {
      sub_user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      user_account: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      user_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      tel: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      qq: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      use_yn: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'Y',
      },
      remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      create_user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      is_data_func: {
        type: DataTypes.INTEGER(4),
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
      tableName: 't_sub_user',
      primaryKeysOrder: ['sub_user_id'],
      chineseTableName: '主账户对应的子账号',
      chineseFieldName: {
        sub_user_id: '子用户ID',
        user_id: '用户ID',
        user_account: '账号',
        password: '密码',
        user_name: '姓名',
        company: '公司',
        department: '部门',
        tel: '电话',
        mobile: '手机',
        email: '邮箱',
        qq: 'QQ',
        use_yn: '使用标记',
        remark: '备注',
        create_user_id: '创建人',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['user_account', 'password', 'user_name', 'tel', 'mobile', 'email'],
          create: [
            'user_account',
            'user_name',
            'tel',
            'mobile',
            'email',
          ],
          delete: ['sub_user_id', 'user_account'],
        },
        template: {
          update: 'default',
          create: 'default',
          delete: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.updateLog(instance, options, '修改子用户：', this);
        },
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '添加子用户', this);
        },
        afterDestroy(instance, options) {
          const customLog = new CustomLogs();
          customLog.deleteLog(instance, options, '删除用户', this);
        },
      },
    },
  );
};
