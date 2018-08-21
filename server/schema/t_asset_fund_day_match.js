/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_asset_fund_day_match', {
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    match_date: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    deadline_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    match_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    raise_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    raise_count: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    expend_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    account_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    total_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    total_count: {
      type: DataTypes.BIGINT,
      allowNull: false,
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
    tableName: 't_asset_fund_day_match',
    chineseTableName:"【统计汇总】—-资金方资产方日匹配统计",
    chineseFieldName: {
      asset_org_code: "资产方机构号",
      fund_org_code: "资金方机构号",
      match_date: "匹配日期",
      deadline_id: "期限编码",
      match_fee: "匹配成功量",
      raise_fee: "实际满标量",
      raise_count: "满编单数",
      expend_fee: "出账完毕量",
      account_fee: "资金到账量",
      total_fee: "资金总额",
      total_count: "总单数",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
