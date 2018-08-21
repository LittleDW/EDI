/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_resource_crawler_config', {
    resource_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    user_seq: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    app_seq: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    scenario_index: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    rule_index: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    account_index: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    retry: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    retry_time: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    use_yn: {
      type: DataTypes.CHAR(1),
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
    tableName: 't_resource_crawler_config',
    chineseTableName:"爬虫任务配置表",
    chineseFieldName: {
      resource_name: "资源块名称",
      user_seq: "用户编码",
      app_seq: "应用编码",
      scenario_index: "环境索引",
      rule_index: "规则索引",
      account_index: "账户索引",
      retry: "失败重试次数",
      retry_time: "重试间隔时间",
      use_yn: "逻辑标识符",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
