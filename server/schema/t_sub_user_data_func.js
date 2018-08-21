/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_sub_user_data_func',
    {
      sub_user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      partner_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      user_type: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
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
          const value = this.getDataValue('rx_updateTime');
          if (!_.isNil(value) && _.isDate(value)) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
    },
    {
      tableName: 't_sub_user_data_func',
      chineseTableName: '子账号数据权限',
      chineseFieldName: {
        sub_user_id: '子用户id',
        partner_org_code: '伙伴机构编码',
        user_type: '用户类型',
        remark: '备注',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
    },
  );
};
