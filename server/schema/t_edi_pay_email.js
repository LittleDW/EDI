/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');


module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_edi_pay_email',
    {
      org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true,
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
      tableName: 't_edi_pay_email',
      chineseTableName: '平台使用费催缴邮箱',
      chineseFieldName: {
        org_code: '机构号',
        email: '催缴邮箱',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
    },
  );
};
