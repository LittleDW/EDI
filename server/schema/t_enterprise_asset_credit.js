/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_enterprise_asset_credit', {
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    borrow_business_license: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    asset_credit_status: {
      type: DataTypes.CHAR(3),
      allowNull: false
    },
    borrow_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_org_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_account_licence: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_credit_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_tax_registration: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_enterprise_type: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    borrow_type: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    borrow_registered_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    borrow_manage_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    borrow_register_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    borrow_corporate_name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    borrow_corporate_certificate_no: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    borrow_phone: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    borrow_bank: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_branch_bank: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_bank_account_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_bank_account_no: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    borrow_bank_account_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    income: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    paid_in_capital: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    data_from: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'B'
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
    tableName: 't_enterprise_asset_credit',
    chineseTableName:"企业-资产方授信信息表",
    chineseFieldName: {
      asset_org_code: "资产方机构号",
      borrow_business_license: "营业执照号",
      asset_credit_status: "资产方授信状态",
      borrow_name: "借款人名称",
      borrow_org_code: "组织机构代码",
      borrow_account_licence: "开户许可证",
      borrow_credit_code: "信用代码证",
      borrow_tax_registration: "税务登记证",
      borrow_enterprise_type: "企业类型",
      borrow_type: "借款主体类型",
      borrow_registered_address: "注册地址",
      borrow_manage_address: "经营地址",
      borrow_register_date: "成立日期",
      borrow_corporate_name: "法人姓名",
      borrow_corporate_certificate_no: "法人身份证号",
      borrow_phone: "联系人手机号",
      borrow_bank: "开户行",
      borrow_branch_bank: "开户支行",
      borrow_bank_account_name: "开户名称",
      borrow_bank_account_no: "开户银行账号",
      borrow_bank_account_address: "开户地址",
      industry: "行业",
      income: "借款人收入及负债",
      paid_in_capital: "实缴资本",
      data_from: "数据来源",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
