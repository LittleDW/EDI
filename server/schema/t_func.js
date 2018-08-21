/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');
const { Op } = require('sequelize');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_func',
    {
      func_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      f_func_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      func_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      func_desc: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      func_path: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      page_id: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      func_level: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '1',
      },
      func_type: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      func_role_type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: '0',
      },
      func_img: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      sort_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: '0',
      },
      use_yn: {
        type: DataTypes.CHAR(1),
        allowNull: true,
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
      tableName: 't_func',
      primaryKeysOrder: ['func_id'],
      chineseTableName: '系统功能菜单',
      chineseFieldName: {
        func_id: '节点ID',
        f_func_id: '父节点ID',
        func_name: '菜单名称',
        func_desc: '菜单描述',
        func_path: '菜单路径',
        page_id: '页面ID',
        func_level: '菜单级别',
        func_type: '菜单类型',
        func_role_type: '菜单角色类型',
        func_img: '菜单图标',
        sort_id: '排序ID',
        use_yn: '是否使用',
        remark: '备注',
        create_user_id: '创建人',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['func_name', 'func_path', 'page_id', 'func_role_type', 'func_img'],
          create: [
            'func_id',
            'f_func_id',
            'func_name',
            'func_path',
            'page_id',
            'func_level',
            'func_role_type',
            'func_img',
            'sort_id',
          ],
          delete: ['func_id', 'func_name', 'func_path'],
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
          customLog.updateLog(instance, options, '修改菜单：', this);
        },
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '添加菜单', this);
        },
        afterDestroy(instance, options) {
          const customLog = new CustomLogs();
          customLog.deleteLog(instance, options, '删除菜单', this);
        },
      },
    },
  );
};
