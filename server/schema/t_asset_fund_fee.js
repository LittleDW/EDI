/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_asset_fund_fee',
    {
      asset_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      fund_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      match_date: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      asset_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      fund_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      max_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      min_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      asset_data_from: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: 'A',
      },
      fund_data_from: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: 'A',
      },
      finish_max_fee: {
        type: DataTypes.BIGINT,
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
      tableName: 't_asset_fund_fee',
      primaryKeysOrder: ['fund_org_code', 'asset_org_code', 'match_date'],
      chineseTableName: '实际匹配',
      chineseFieldName: {
        asset_org_code: '资产方机构号',
        fund_org_code: '资金方机构号',
        match_date: '匹配日期',
        asset_fee: '资产方供给量',
        fund_fee: '资金方募集量',
        max_fee: '目标匹配量',
        min_fee: '最小匹配量',
        asset_data_from: '资产方数据来源',
        fund_data_from: '资金方数据来源',
        finish_max_fee: '已匹配量',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
    },
  );
};
