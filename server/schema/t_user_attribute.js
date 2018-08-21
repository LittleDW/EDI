/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

const CustomLogs = require('../common/log/customLog');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_user_attribute',
    {
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
      },
      org_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      partner_nature: {
        type: DataTypes.CHAR(3),
        allowNull: true,
        defaultValue: ''
      },
      is_debt_exchange: {
        type: DataTypes.INTEGER(4),
        allowNull: true
      },
      repayment_mode: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      is_deadline_favor: {
        type: DataTypes.INTEGER(4),
        allowNull: true
      },
      product_deadline: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      supervise_bank: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      fund_account_mode: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        defaultValue: '001'
      },
      platform_pay_mode: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        defaultValue: '002'
      },
      platform_use_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: '0.00050'
      },
      adjust_platform_use_rate: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: '0.00050'
      },
      adjust_effect_month: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      platform_pay_scope: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      check_day: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '1'
      },
      raise_day: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: '2'
      },
      is_auto_credit: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
        defaultValue: '0'
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
      tableName: 't_user_attribute',
      primaryKeysOrder: ['user_id'],
      chineseTableName: '系统用户属性',
      chineseFieldName: {
        user_id: '用户ID',
        org_code: '机构编码',
        partner_nature: '合作方性质',
        is_debt_exchange: '是否支持债转',
        repayment_mode: '还款方式',
        is_deadline_favor: '是否有期限偏好',
        product_deadline: '产品期限',
        supervise_bank: '监管银行',
        platform_pay_mode: '平台使用费缴费方式',
        platform_use_rate: '平台使用费率',
        adjust_platform_use_rate: '调整后的平台使用费率',
        adjust_effect_month: '调整后费率的生效年月',
        platform_pay_scope: '平台使用费统计范围',
        fund_account_mode:'资金方开户模式',
        is_auto_credit:'是否自动授信',
        check_day:'审核失败有效天数',
        raise_day:'募集失败有效天数',
        rx_insertTime: '创建时间',
        rx_updateTime: '更新时间',
      },
      log: {
        whiteList: {
          update: [
            'platform_pay_mode',
            'platform_use_rate',
            'is_deadline_favor',
            'adjust_platform_use_rate',
            'adjust_effect_month',
            'platform_pay_scope',
            'fund_account_mode',
            'is_auto_credit',
            'check_day',
            'raise_day'
          ],
          update2: [
            'partner_nature',
            'is_debt_exchange',
            'is_deadline_favor',
            'repayment_mode',
            'product_deadline',
            'supervise_bank',
            'api_url',
          ],

          // create: [
          //   'user_name',
          //   'user_full_name',
          //   'linkman',
          //   'tel',
          //   'mobile',
          //   'email',
          // ],
        },
        template: {
          update: 'default',
        },
        customFieldName: {},
      },
      hooks: {
        // afterCreate(instance, options) {
        //   const customLog = new CustomLogs();
        //   customLog.createLog(instance, options, '', this);
        // },
        afterUpdate(instance, options) {
          const customLog = new CustomLogs();
          customLog.customize = (data) => data.map((d) => {
            if (d.name === 'platform_use_rate' || d.name === 'adjust_platform_use_rate') {
              d.previousData = _.toNumber(d.previousData)
              d.nextData = _.toNumber(d.nextData)
            }
            return d;
          });
          customLog.updateLog(instance, options, '', this);
        },
      },
    },
  );
};
