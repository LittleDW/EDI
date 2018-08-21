/*
 * File: index.js
 * File Created: Friday, 23rd March 2018 4:16:33 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Tue Jun 19 2018
 * Modified By: zhangjunjie
 */

const { authWithMenuAndSubmenu: auth, identitySelector } = require('../middlewares');

const common = require('./common');
const profile = require('./profile');
const assetAccount = require('./assetAccount');
const assetSetting = require('./assetSetting');
const balanceStatistics = require('./balanceStatistics');
const cooperator = require('./cooperator');
const cooperatorAccountInfo = require('./cooperatorAccountInfo');
const cooperatorApiAsset = require('./cooperatorApiAsset');
const cooperatorApiFund = require('./cooperatorApiFund');
const cooperatorBusinessSpecifica = require('./cooperatorBusinessSpecifica');
const distriPlan = require('./distriPlan');
const fundStatistics = require('./fundStatistics');
const order = require('./order');
const enterpriseOrder = require('./enterpriseOrder');
const repaymentPlan = require('./repaymentPlan');
const enterpriseCredit = require('./enterpriseCredit');
const fundSupply = require('./fundSupply');
const settleMethod = require('./settleMethod');
const menu = require('./menu');
const enterprisePublicity = require('./enterprisePublicity');
const personalPublicity = require('./personalPublicity');
const financeLoan = require('./financeLoan');
const financeRepayment = require('./financeRepayment');
const financeService = require('./financeService');
const repayment = require('./repayment');
const platformUseFee = require('./platformUseFee');
const role = require('./role');
const operationTableLog = require('./operationTableLog');
const personalCertificate = require('./personalCertificate');
const userAttribute = require('./userAttribute');
const userAttributeManagement = require('./userAttributeManagement');
const userManagement = require('./userManagement');
const subuserManagement = require('./subuserManagement');
const afterRepayment = require('./afterRepayment');
const afterRepaymentStatistics = require('./afterRepaymentStatistics');
const loginLogs = require('./loginLogs');
const withdraw = require('./withdraw');

module.exports = (router) => {
  router.use(common);

  router.use(
    '/afterRepaymentOrder',
    auth('_submenu', 'after_repayment_order', '您没有调用贷后订单页面接口的权限'),
    afterRepayment,
  );
  router.use('/afterRepaymentStatistics', afterRepaymentStatistics);
  router.use(
    '/userManagement',
    auth('_submenu', 'user_management', '您没有调用用户管理页面接口的权限'),
    userManagement,
  );
  router.use(
    '/subuserManagement',
    auth('_submenu', 'sub_user_management', '您没有调用子用户信息页面接口的权限'),
    subuserManagement,
  );
  router.use(
    '/fundStatistics',
    auth(
      '_submenu',
      [
        'fund_collection_daily',
        'fund_collection_weekly',
        'fund_collection_monthly',
        'fund_supply_daily',
        'fund_supply_weekly',
        'fund_supply_monthly',
      ],
      '您没有调用业务报表的权限',
    ),
    fundStatistics,
  );
  router.use(
    '/loginLogs',
    auth('_submenu', 'oper_table_logs', '您没有调用操作信息页面接口的权限'),
    loginLogs,
  );
  router.use(
    '/menu',
    auth('_submenu', 'menu_management', '您没有调用菜单管理页面接口的权限'),
    menu,
  );

  router.use(
    '/role',
    auth(
      '_submenu',
      ['role_management', 'sub_user_management'],
      '您没有调用角色管理页面接口的权限',
    ),
    role,
  );

  router.use('/profile', auth('_submenu', 'profile', '您没有调用账号信息页面接口的权限'), profile);

  router.use(
    '/userAttribute',
    auth(
      '_submenu',
      ['user_attribute', 'requirement_plan_new', 'collection_plan_new'],
      '您没有调用平台属性页面接口的权限',
    ),
    userAttribute,
  );
  router.use(
    '/userAttributeManagement',
    auth('_submenu', 'user_attribute_management', '您没有调用平台属性页面接口的权限'),
    userAttributeManagement,
  );

  router.use(
    '/personalPublicity',
    auth('_submenu', 'personal_publicity', '您没有调用个人征信信息页面接口的权限'),
    personalPublicity,
  );

  router.use(
    '/enterprisePublicity',
    auth('_submenu', 'enterprise_publicity', '您没有调用企业征信信息页面接口的权限'),
    enterprisePublicity,
  );

  router.use(
    '/repayment',
    auth('_submenu', 'repayment', '您没有调用兑付单列表页面接口的权限'),
    repayment,
  );
  router.use(
    '/distriPlan',
    auth('_submenu', ['requirement_plan_new', 'collection_plan_new'], '您没有调用该页面接口的权限'),
    distriPlan,
  );
  router.use(
    '/fundSupply',
    auth('_submenu', 'fund_supply_plan', '您没有调用供需计划页面接口的权限'),
    fundSupply,
  );

  router.use(
    '/financeLoan',
    auth('_submenu', 'finance_loan', '您没有调用放款对账单页面接口的权限'),
    financeLoan,
  );

  router.use(
    '/financeRepayment',
    auth('_submenu', 'finance_repayment', '您没有调用还款对账单页面接口的权限'),
    financeRepayment,
  );

  router.use(
    '/financeService',
    auth('_submenu', 'finance_service_settlement', '您没有调用服务费结算单页面接口的权限'),
    financeService,
  );

  router.use(
    '/settleMethod',
    auth('_submenu', 'settle_method', '您没有调用结算方式页面接口的权限'),
    settleMethod,
  );

  router.use(
    '/balanceStatistics',
    auth('_submenu', 'balance_statistics', '您没有调用余额统计表接口的权限'),
    identitySelector(),
    balanceStatistics,
  );

  router.use(
    '/repaymentPlan',
    auth('_submenu', 'repayment_plan', '您没有调用还款计划表页面接口的权限'),
    repaymentPlan,
  );

  router.use('/order', auth('_submenu', 'orders', '您没有调用个人订单列表页面接口的权限'), order);

  router.use(
    '/corpOrder',
    auth('_submenu', 'corp_orders', '您没有调用企业订单列表页面接口的权限'),
    enterpriseOrder,
  );
  router.use(
    '/corpAuth',
    auth('_submenu', 'corp_auth', '您没有调用企业授信列表页面接口的权限'),
    enterpriseCredit,
  );

  router.use(
    '/platformUseFee',
    auth('_submenu', 'platform_use_fee', '您没有调用平台使用费页面接口的权限'),
    platformUseFee,
  );


  router.use('/profile', auth('_submenu', 'profile', '您没有调用账号信息页面接口的权限'), profile);

  router.use(
    '/assetAccount',
    auth('_submenu', 'asset_account', '您没有调用账户信息页面接口的权限'),
    assetAccount,
  );

  router.use(
    '/assetSetting',
    auth(
      '_submenu',
      ['asset_setting', 'fund_setting', 'admin_setting'],
      '您没有调用资产分配设置页面接口的权限',
    ),
    identitySelector(),
    assetSetting,
  );

  // Cooperator
  router.use(
    '/cooperator',
    auth('_submenu', 'cooperator_info', '您没有调用合作方管理页面接口的权限'),
    cooperator,
  );
  router.use(
    '/cooperatorAccountInfo',
    auth('_submenu', 'cooperator_account_info', '您没有调用开户信息页面接口的权限'),
    cooperatorAccountInfo,
  );

  router.use(
    '/cooperatorApiAsset',
    auth('_submenu', 'cooperator_api_asset', '您没有调用API地址管理页面接口的权限'),
    cooperatorApiAsset,
  );
  router.use(
    '/cooperatorApiFund',
    auth('_submenu', 'cooperator_api_fund', '您没有调用API地址管理页面接口的权限'),
    cooperatorApiFund,
  );

  router.use(
    '/cooperatorBusinessSepcifica',
    auth('_submenu', 'cooperator_business_specifica', '您没有调用合作方管理业务端口的权限'),
    cooperatorBusinessSpecifica,
  );
  /**
  router.use('/order', auth('_submenu', 'orders', '您没有调用个人订单列表页面接口的权限'), order);

  router.use(
    '/corpOrder',
    auth('_submenu', 'corp_orders', '您没有调用企业订单列表页面接口的权限'),
    enterpriseOrder,
  );
  router.use(
    '/corpAuth',
    auth('_submenu', 'corp_auth', '您没有调用企业授信列表页面接口的权限'),
    enterpriseCredit,
  );
*/
  router.use(
    '/operTableLogs',
    auth('_submenu', 'oper_table_logs', '您没有调用操作信息页面接口的权限'),
    operationTableLog,
  );

  router.use(
    '/personalCertificate',
    auth(
      '_submenu',
      ['personal_certificate', 'enterprise_certificate', 'mixed_certificate'],
      '您没有调用个人签章页面接口的权限',
    ),
    personalCertificate,
  );

  router.use('/withdraw', withdraw);
  return router;
};
