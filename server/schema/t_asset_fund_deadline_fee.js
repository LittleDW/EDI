/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_asset_fund_deadline_fee',
    {
      fund_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      asset_org_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      deadline_id: {
        type: DataTypes.STRING(10),
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
      verification_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      verification_valid_time: {
        type: DataTypes.DATE,
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
      tableName: 't_asset_fund_deadline_fee',
      primaryKeysOrder: ['fund_org_code', 'asset_org_code', 'deadline_id', 'match_date'],
      chineseTableName: '资金方资产方按期限实际匹配情况',
      chineseFieldName: {
        fund_org_code: '资金方机构号',
        asset_org_code: '资产方机构号',
        deadline_id: '期限编码',
        match_date: '匹配日期',
        asset_fee: '资产方供给量',
        fund_fee: '资金方募集量',
        max_fee: '目标匹配量',
        min_fee: '最小匹配量',
        asset_data_from: '资产方数据来源',
        fund_data_from: '资金方数据来源',
        finish_max_fee: '已匹配量',
        verification_code: '验证码',
        verification_valid_time: '有效期',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: ['asset_fee', 'fund_fee'],
          create: ['asset_fee', 'fund_fee'],
        },
        template: {
          update: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.customize = (data) => {
            const { _modelOptions = {} } = instance;
            const { profile = {} } = _modelOptions._visitor;
            const { user_type = 0 } = profile;
            const filtered = data.filter((d) => {
              switch (user_type) {
                case 1:
                  return d.name === 'asset_fee';
                case 2:
                  return d.name === 'fund_fee';
                default:
                  return d.name === 'asset_fee' || d.name === 'fund_fee';
              }
            });
            return filtered.map((f) => {
              f.previousData = `${Number(f.previousData / 1000000).toFixed(2)} (万元)`;
              f.nextData = `${Number(f.nextData / 1000000).toFixed(2)} (万元)`;
              return f;
            });
          };
          customLog.updateLog(instance, options, '修改分配设置', this);
        },
      },
    },
  );
};
