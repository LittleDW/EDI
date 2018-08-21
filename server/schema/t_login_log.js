const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    't_login_log',
    {
      login_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      sub_user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      login_time: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.Now,
      },
      login_type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      login_ip: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      login_proxy_ip: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      login_host_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      login_mac_address: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      login_browser: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      login_system: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      login_source: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      create_user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      rx_insertTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.Now,
        get: function() {
          let value = this.getDataValue('rx_insertTime')
          if(!_.isNil(value) && _.isDate(value)){
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
      rx_updateTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.Now,
        get: function() {
          let value = this.getDataValue('rx_updateTime')
          if(!_.isNil(value) && _.isDate(value)){
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
    },
    {
      tableName: 't_login_log',
      chineseTableName: '系统登录日志',
      chineseFieldName: {
        login_id: '登录ID',
        user_id: '登录主用户ID',
        sub_user_id: '子用户',
        login_time: '登录时间',
        login_type: '登录方式',
        login_ip: '登录IP',
        login_proxy_ip: '登录代理IP',
        login_host_name: '登录机器名称',
        login_mac_address: '登录MAC地址',
        login_browser: '登录浏览器',
        login_system: '操作系统',
        login_source: '登录来源',
        remark: '备注',
        create_user_id: '创建用户',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
    }
  );
};
