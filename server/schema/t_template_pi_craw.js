/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_template_pi_craw', {
    template_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    template_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    template_dec: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    validity_date: {
      type: DataTypes.INTEGER(20),
      allowNull: false
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
    tableName: 't_template_pi_craw',
    chineseTableName:"公示信息爬虫模板",
    chineseFieldName: {
      template_id: "主键",
      template_name: "模板名称",
      template_dec: "模板描述",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
