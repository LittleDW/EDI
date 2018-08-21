/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_match_info', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    match_start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    match_end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_success: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    refuse_type: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    refuse_reason: {
      type: DataTypes.STRING(100),
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
    tableName: 't_order_match_info',
    chineseTableName:"订单匹配明细",
    chineseFieldName: {
      order_no: "平台订单号",
      fund_org_code: "资金方机构号",
      match_start_time: "匹配开始时间",
      match_end_time: "匹配结束时间",
      is_success: "匹配结果",
      refuse_type: "拒绝类型",
      refuse_reason: "拒绝原因",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
