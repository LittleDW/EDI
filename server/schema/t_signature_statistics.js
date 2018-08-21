/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_signature_statistics',
    {
      org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      template_type: {
        type: DataTypes.INTEGER(2),
        allowNull: false,
        primaryKey: true,
      },
      template_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        primaryKey: true,
      },
      file_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        primaryKey: true,
      },
      template_person_num: {
        type: DataTypes.INTEGER(50),
        allowNull: false,
      },
      template_enterprise_num: {
        type: DataTypes.INTEGER(50),
        allowNull: false,
      },
      expect_num: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0',
      },
      actual_num: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0',
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
      tableName: 't_signature_statistics',
      chineseTableName: '签章统计',
      chineseFieldName: {
        org_code: '机构编码',
        template_type: '模板类型',
        template_name: '模板名',
        file_name: '文件名',
        template_person_num: '模板个人签章数',
        template_enterprise_num: '模板企业签章数',
        expect_num: '预期生成文件数量',
        actual_num: '实际生成文件数量',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
    },
  );
};
