/*
 * @Author Osborn
 * @File translationDictionary.js
 * @Created Date 2018-04-25 14-33
 * @Last Modified: 2018-04-25 14-33
 * @Modified By: Osborn
 */

module.exports = [
  {
    t: '*', v: 'is_check_stock', key: 0, val: '关',
  },
  {
    t: '*', v: 'is_check_stock', key: 1, val: '开',
  },
  // user
  {
    t: '*', v: 'user_type', key: 1, val: '资产方',
  },
  {
    t: '*', v: 'user_type', key: 2, val: '资金方',
  },
  {
    t: '*', v: 'user_type', key: 3, val: '资产管理员',
  },
  {
    t: '*', v: 'user_type', key: 4, val: '系统管理员',
  },
  {
    t: '*', v: 'user_type', key: 5, val: '外部资产方',
  },
  {
    t: '*', v: 'user_type', key: 6, val: '外部资金方',
  },
  {
    t: '*', v: 'user_from', key: '1', val: '系统内用户',
  },
  {
    t: '*', v: 'user_from', key: '2', val: '系统外用户',
  },
  {
    t: '*', v: 'user_status', key: 0, val: '未审核',
  },
  {
    t: '*', v: 'user_status', key: 1, val: '已审核',
  },
  // Api
  {
    t: '*', v: 'api_type', key: '01', val: '资金方接收个人借款单',
  },
  {
    t: '*', v: 'api_type', key: '02', val: '资金方接收企业授信申请',
  },
  {
    t: '*', v: 'api_type', key: '03', val: '资金方接收企业借款单',
  },
  {
    t: '*',
    v: 'api_type',
    key: '04',
    val: '资金方提供给资产方用于开户、提现、还款和受托支付授权等操作入口',
  },
  {
    t: '*', v: 'api_type', key: '22', val: '资金方接收状态变化通知',
  },
  {
    t: '*', v: 'api_type', key: '23', val: '资金方接收订单凭证变化通知',
  },
  {
    t: '*', v: 'api_type', key: '24', val: '资金方接收企业授信凭证变化通知',
  },
  {
    t: '*', v: 'api_type', key: '26', val: '资金方借款人开户信息查询',
  },
  {
    t: '*', v: 'api_type', key: '21', val: '资产方接收状态变化通知',
  },
  {
    t: '*', v: 'api_type', key: '25', val: '资产方接收合同更新补充通知',
  },
  // task
  {
    t: '*', v: 'task_status', key: '1', val: '已创建',
  },
  {
    t: '*', v: 'task_status', key: '2', val: '处理中',
  },
  {
    t: '*', v: 'task_status', key: '3', val: '已完成',
  },
  // platform
  {
    t: 't_user_attribute', v: 'platform_pay_mode', key: '001', val: '预缴',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_mode', key: '002', val: '月结',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '100', val: '待处理',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '105', val: '待审核',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '110', val: '匹配成功',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '120', val: '开户成功',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '130', val: '垫资完毕',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '140', val: '审核完毕',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '150', val: '上标完毕',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '160', val: '满标完毕',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '170', val: '出账完毕',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '180', val: '资金到账',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '190', val: '还款完毕',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '910', val: '匹配失败',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '920', val: '垫资失败',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '930', val: '审核未通过',
  },
  {
    t: 't_user_attribute', v: 'platform_pay_scope', key: '940', val: '募集失败',
  },
  // repayment
  {
    t: 't_repayment', v: 'repayment_status', key: '00', val: '创建',
  },
  {
    t: 't_repayment', v: 'repayment_status', key: '01', val: '资产方确认',
  },
  {
    t: 't_repayment', v: 'repayment_status', key: '02', val: '资产方还款',
  },
  {
    t: 't_repayment', v: 'repayment_status', key: '03', val: '资金方确认',
  },
  // role
  {
    t: 't_role', v: 'role_type', key: 1, val: '资产方',
  },
  {
    t: 't_role', v: 'role_type', key: 2, val: '资金方',
  },
  {
    t: 't_role', v: 'role_type', key: 3, val: '资产管理员',
  },
  {
    t: 't_role', v: 'role_type', key: 4, val: '系统管理员',
  },
  // asset fund
  {
    t: 't_asset_fund', v: 'interest_mode', key: '001', val: '到账起息',
  },
  {
    t: 't_asset_fund', v: 'interest_mode', key: '002', val: '满标起息',
  },
  {
    t: 't_asset_fund', v: 'service_mode', key: '001', val: '出账次月结算',
  },
  {
    t: 't_asset_fund', v: 'service_mode', key: '002', val: '付息时结算',
  },
  {
    t: 't_asset_fund', v: 'service_mode', key: '003', val: '付息次月结算',
  },
  {
    t: 't_asset_fund', v: 'service_mode', key: '004', val: '还本时结算',
  },
  {
    t: 't_asset_fund', v: 'service_mode', key: '005', val: '还本次月结算',
  },
  {
    t: 't_asset_fund', v: 'service_mode', key: '006', val: '其它',
  },
  // user attribute
  {
    t: 't_user_attribute', v: 'partner_nature', key: '001', val: '网贷平台',
  },
  {
    t: 't_user_attribute', v: 'partner_nature', key: '002', val: '银行',
  },
  {
    t: 't_user_attribute', v: 'partner_nature', key: '003', val: '信托',
  },
  {
    t: 't_user_attribute', v: 'partner_nature', key: '100', val: '其它',
  },
  {
    t: 't_user_attribute', v: 'is_debt_exchange', key: 0, val: '不支持',
  },
  {
    t: 't_user_attribute', v: 'is_debt_exchange', key: 1, val: '支持',
  },
  {
    t: 't_user_attribute', v: 'is_deadline_favor', key: 0, val: '无',
  },
  {
    t: 't_user_attribute', v: 'is_deadline_favor', key: 1, val: '有',
  },
  {
    t: 't_user_attribute',
    v: 'repayment_mode',
    key: '001',
    val: '到期还本付息',
  },
  {
    t: 't_user_attribute',
    v: 'repayment_mode',
    key: '002',
    val: '按月付息到期还本',
  },
  {
    t: 't_user_attribute',
    v: 'repayment_mode',
    key: '003',
    val: '按月等额本息',
  },
  {
    t: 't_user_attribute',
    v: 'repayment_mode',
    key: '004',
    val: '按月等额本金',
  },
  {
    t: 't_user_attribute',
    v: 'repayment_mode',
    key: '005',
    val: '按周付息到期还本',
  },
  {
    t: 't_user_attribute',
    v: 'repayment_mode',
    key: '006',
    val: '按周等额本息',
  },
  {
    t: 't_user_attribute',
    v: 'repayment_mode',
    key: '007',
    val: '按周等额本金',
  },
  {
    t: 't_user_attribute', v: 'repayment_mode', key: '008', val: '其它',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '000',
    val: '0-15天(含)',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '001',
    val: '16-31天(含)',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '002',
    val: '32-62天(含)',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '003',
    val: '63-92天(含)',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '004',
    val: '93-183天(含)',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '005',
    val: '184-365天(含)',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '006',
    val: '366-730天(含)',
  },
  {
    t: 't_user_attribute',
    v: 'product_deadline',
    key: '007',
    val: '＞730天',
  },
  {
    t: 't_role',
    v: 'sub_user_yn',
    key: 'Y',
    val: '子账号',
  },
  {
    t: 't_role',
    v: 'sub_user_yn',
    key: 'N',
    val: '主账号',
  },
];
