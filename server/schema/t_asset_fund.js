/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_asset_fund',
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
      priority: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0',
      },
      is_check_stock: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: '0',
      },
      stock_day_count: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '0',
      },
      fund_stock_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: '0',
      },
      fund_day_raise_fee: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: '0',
      },
      total_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: '0.0000',
      },
      interest_mode: {
        type: DataTypes.CHAR(3),
        allowNull: true,
      },
      service_mode: {
        type: DataTypes.CHAR(3),
        allowNull: true,
      },
      due_diligence_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      cooperative_agreements_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      guarantee_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      borrow_agreements_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      other_agreements_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      match_desc: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      use_yn: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: '1',
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
      tableName: 't_asset_fund',
      primaryKeysOrder: ['fund_org_code', 'asset_org_code'],
      chineseTableName: '资金方产品',
      chineseFieldName: {
        asset_org_code: '资产方机构号',
        fund_org_code: '资金方机构号',
        priority: '匹配优先级',
        is_check_stock: '存量资产上限验证',
        stock_day_count: '存量资产上限',
        fund_stock_fee: '资金方存量',
        fund_day_raise_fee: '资金方每日募集金额',
        total_rate: '综合费率',
        interest_mode: '计息方式',
        service_mode: '服务费结算方式',
        due_diligence_url: '尽调报告地址',
        cooperative_agreements_url: '合作协议地址',
        guarantee_url: '担保函地址',
        borrow_agreements_url: '借款服务协议样本地址',
        other_agreements_url: '其它协议地址',
        match_desc: '描述',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: [
            'priority',
            'stock_day_count',
            'is_check_stock',
            'total_rate',
            'interest_mode',
            'guarantee_url',
            'borrow_agreements_url',
            'cooperative_agreements_url',
            'due_diligence_url',
            'other_agreements_url',
            'service_mode',
          ],
          update2: [
            'total_rate',
            'interest_mode',
            'guarantee_url',
            'borrow_agreements_url',
            'cooperative_agreements_url',
            'due_diligence_url',
            'other_agreements_url',
            'service_mode',
          ],
          create: ['asset_org_code', 'fund_org_code'],
          delete: ['asset_org_code', 'fund_org_code'],
        },
        template: {
          update: 'default',
          create: 'default',
          delete: 'default',
        },
        customFieldName: {
          asset_org_code: '资产方',
          fund_org_code: '资金方',
        },
      },
      hooks: {
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.customize = (data) => data.map((d) => {
            if (d.name === 'total_rate') {
              d.previousData = Number(d.previousData).toFixed(2);
              d.nextData = Number(d.nextData).toFixed(2);
            }
            return d;
          });
          customLog.updateLog(instance, options, '修改分配设置', this);
        },
        afterCreate(instance, options) {
          const customLog = new CustomLogs();
          customLog.createLog(instance, options, '增加合作方关联', this);
        },
        afterDestroy(instance, options) {
          const customLog = new CustomLogs();
          customLog.deleteLog(instance, options, '删除合作方', this);
        },
      },
    },
  );
};
