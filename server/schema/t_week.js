/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_week', {
    year: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    week: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true
    },
    start_date: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    end_date: {
      type: DataTypes.STRING(10),
      allowNull: true
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
  }, {
    tableName: 't_week',
    chineseTableName:"【基础信息】--周",
    chineseFieldName: {
      year: "年份",
      week: "周",
      start_date: "开始日期",
      end_date: "结束日期",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
