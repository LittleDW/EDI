/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_template_pi_craw_details', {
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    template_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    interface_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    template_section: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    interface_all_data: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    validity_time: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
      defaultValue: '0'
    },
    interface_priority: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '0'
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
    tableName: 't_template_pi_craw_details',
    chineseTableName:"公示信息爬虫模板明细",
    chineseFieldName: {
      id: "ID",
      template_name: "模板名称",
      interface_name: "接口名称",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
