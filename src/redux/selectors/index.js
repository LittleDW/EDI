/**
 * 作者：石奇峰
 * 功能：对所有前端不常变动的数据做缓存，每次业务模块又需要就注入的预处理
 * */

import {normalize, schema} from 'normalizr'
import {createSelector} from 'reselect'
import {ACTIONS} from "../actions";

const pageButtonSchema = new schema.Entity('pagebutton', {}, {
  idAttribute:"func_id",
  processStrategy: (value, parent, key) => ({
    ...value,
    parent: parent.id
  })
});
const submenuSchema = new schema.Entity('submenu', {children: [pageButtonSchema]}, {
  processStrategy: (value, parent, key) => ({
    ...value,
    parent: parent.id
  })
});
const menuSchema = new schema.Entity('menu', {children: [submenuSchema]});

const getSession = (state) => state._session
const getDictionary = (state) => state.dictionary

const selectors = {}
/** 取得当前用户类型*/
selectors.getUserType = createSelector(getSession, (_session) => (_session && _session.user_type || -1))
/** 取得字典里所有用户*/
selectors.getUsers = createSelector(getDictionary, (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user')))
/** 取得所有菜单*/
selectors.getMenuEntities = createSelector(getDictionary, (dictionary) => normalize(dictionary.menu, [menuSchema]))
/** 取得所有期限数据*/
selectors.getDeadlineList = createSelector(getDictionary, (dictionary) => dictionary.deadlineList)

// 取得下周是哪年第几周，起始和结束日期
selectors.getNextWeek = createSelector(getDictionary, (dictionary) => dictionary.nextWeek)
// 取得去年到未来两年的所有周对应的起始结束日期
selectors.getWeekAndDate = createSelector(getDictionary, (dictionary) => dictionary.dateRange)
/** 取得所有期限数据并格式化为Select组件可用数据*/
selectors.getDeadlines = createSelector(selectors.getDeadlineList, (deadlineList) => deadlineList.map(r=>({...r, label:r.deadline_name, value:r.deadline_id})))
/** 取得所有机构，格式化为Select组件可用数据*/
selectors.getOrgCodes = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user') && (r.col_name == "org_code")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得缺省资产方机构*/
selectors.getDefaultAssetOrgCodes = createSelector(selectors.getUserType, getSession, (user_type, _session) => (user_type === 1)&&_session ? _session.org_code : "")

/** 取得缺省资产方机构*/
selectors.getDefaultFundOrgCodes = createSelector(selectors.getUserType, getSession, (user_type, _session) => (user_type === 2)&&_session ? _session.org_code : "")

/** 取得所有资产企业授信状态*/
selectors.getEnterpriseAssetCredit = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_asset_credit') && (r.col_name == "asset_credit_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得所有资金企业授信状态*/
selectors.getEnterpriseFundCredit = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_fund_credit') && (r.col_name == "fund_credit_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得所有企业订单状态*/
selectors.getEnterpriseOrderStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "order_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单信用卡类型*/
selectors.getOrderBorrowCardType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "borrow_card_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单证件类型*/
selectors.getOrderBorrowCertificateType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "borrow_certificate_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单借款支付模式*/
selectors.getOrderBorrowPayMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "borrow_pay_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单借款期限单位*/
selectors.getOrderBorrowPeriod = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "borrow_period")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单借款主体类型*/
selectors.getOrderBorrowType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "borrow_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单业务类型*/
selectors.getOrderBusinessType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "business_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订数据来源*/
selectors.getOrderDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单状态*/
selectors.getOrderStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "order_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单拒绝类型*/
selectors.getOrderRefuseType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "refuse_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得个人订单还款方式*/
selectors.getOrderRepaymentMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order') && (r.col_name == "repayment_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得订单合同类型*/
selectors.getOrderContractType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order_contract') && (r.col_name == "contract_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得订单授信机构*/
selectors.getOrderCreditOrgs = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order_credit') && (r.col_name == "credit_org")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得订单授信机构*/
selectors.getEnterpriseCreditCreditOrgs = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_credit_credit') && (r.col_name == "credit_org")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得兑付状态*/
selectors.getRepaymentStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_repayment') && (r.col_name == "repayment_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得用户状态*/
selectors.getUserStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user') && (r.col_name == "user_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得用户类型*/
selectors.getUserTypes = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user') && (r.col_name == "user_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得用户来源*/
selectors.getUserFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user') && (r.col_name == "user_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产方担保类型*/
selectors.getUserAssetRiskCompensationType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_asset') && (r.col_name == "risk_compensation_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得是否需要平台验证类型*/
selectors.getUserFundCheckType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_fund') && (r.col_name == "is_check")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得募集资金方式时效*/
selectors.getUserFundRealtimePaymentType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_fund') && (r.col_name == "is_realtime_payment")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得募集机构性质*/
selectors.getUserFundOrgTypes = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_fund') && (r.col_name == "org_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得募集放款对象*/
selectors.getUserFundPaymentObject = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_fund') && (r.col_name == "payment_object")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资金募集方式*/
selectors.getUserFundPlacementChannel = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_fund') && (r.col_name == "placement_channel")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得兑付模式*/
selectors.getAssetAccountRepaymentMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_account') && (r.col_name == "repayment_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产方订单状态*/
selectors.getAssetAPIType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_api') && (r.col_name == "api_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产方日计划数据来源*/
selectors.getAssetDayPlanDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_day_plan') && (r.col_name == "data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产方期限日数据来源*/
selectors.getAssetDeadlineDayPlanDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_deadline_day_plan') && (r.col_name == "data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单数据来源*/
selectors.getEnterpriseOrderDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资金日计划数据来源*/
selectors.getFundDayPlanDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_fund_day_plan') && (r.col_name == "data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资金期限日计划数据来源*/
selectors.getFundDeadlineDayPlanDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_fund_deadline_day_plan') && (r.col_name == "data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产资金匹配状态资产数据来源*/
selectors.getAssetFundFeeAssetDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_fund_fee') && (r.col_name == "asset_data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产资金匹配状态资金数据来源*/
selectors.getAssetFundFeeFundDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_fund_fee') && (r.col_name == "fund_data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业资产信用借款主体类型*/
selectors.getEnterpriseAssetCreditBorrowType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_asset_credit') && (r.col_name == "borrow_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单借款主体类型*/
selectors.getEnterpriseOrderBorrowType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "borrow_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业资产信用企业类型*/
selectors.getEnterpriseAssetCreditBorrowEnterpriseType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_asset_credit') && (r.col_name == "borrow_enterprise_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单借款期限单位*/
selectors.getEnterpriseOrderBorrowPriod = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "borrow_period")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单借款支付方式*/
selectors.getEnterpriseOrderBorrowPayMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "borrow_pay_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单收款人信息来源*/
selectors.getEnterpriseOrderGatheringFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "gathering_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单还款方式来源*/
selectors.getEnterpriseOrderRepaymentModeFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "repayment_mode_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单业务类型*/
selectors.getEnterpriseOrderBusinessType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "business_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单还款方式*/
selectors.getEnterpriseOrderRepaymentMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "repayment_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单资金方是否指定*/
selectors.getEnterpriseOrderIsFixedFundOrg = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "is_fixed_fund_org")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业订单拒绝类型*/
selectors.getEnterpriseOrderRefuseType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_enterprise_order') && (r.col_name == "refuse_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得登陆日志登录类型*/
selectors.getLoginLogLoginType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_login_log') && (r.col_name == "login_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得登陆日志登录来源*/
selectors.getLoginLogLoginType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_login_log') && (r.col_name == "login_source")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产账户用途*/
selectors.getAssetAccountAccountPurpose = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_account') && (r.col_name == "account_purpose")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资金账户用途*/
selectors.getFundAccountAccountPurpose = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_fund_account') && (r.col_name == "account_purpose")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产资金计息模式*/
selectors.getAssetFundInterestMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_fund') && (r.col_name == "interest_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资产资金服务模式*/
selectors.getAssetFundServiceMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_asset_fund') && (r.col_name == "service_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得对账数据来源*/
selectors.getFinanceLoanDataFrom = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_loan') && (r.col_name == "data_from")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得对账单状态*/
selectors.getFinanceLoanStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_loan') && (r.col_name == "loan_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得付款明细计息模式*/
selectors.getFinanceLoanDetailInterestMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_loan_detail') && (r.col_name == "interest_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得付款明细还款模式*/
selectors.getFinanceLoanDetailRepaymentMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_loan_detail') && (r.col_name == "repayment_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得付款明细服务计费模式*/
selectors.getFinanceLoanDetailServiceFeeMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_loan_detail') && (r.col_name == "service_fee_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得还款出账状态*/
selectors.getFinanceRepaymentStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_repayment') && (r.col_name == "repayment_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得还款明细计息模式*/
selectors.getFinanceRepaymentDetailInterestMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_repayment_detail') && (r.col_name == "interest_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得还款明细还款模式*/
selectors.getFinanceRepaymentDetailRepaymentMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_repayment_detail') && (r.col_name == "repayment_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得还款明细服务计费模式*/
selectors.getFinanceRepaymentDetailServiceFeeMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_repayment_detail') && (r.col_name == "service_fee_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得服务费结算方式*/
selectors.getFinanceServiceSettlementMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_service_settlement') && (r.col_name == "settlement_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得服务费状态*/
selectors.getFinanceServiceSettlementStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_service_settlement') && (r.col_name == "settlement_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得服务明细计息模式*/
selectors.getFinanceServiceSettlementDetailInterestMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_service_settlement_detail') && (r.col_name == "interest_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得服务明细还款模式*/
selectors.getFinanceServiceSettlementDetailRepaymentMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_service_settlement_detail') && (r.col_name == "repayment_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得服务明细服务计费模式*/
selectors.getFinanceServiceSettlementDetailServiceFeeMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_service_settlement_detail') && (r.col_name == "service_fee_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得服务对象类别*/
selectors.getFinanceTargetType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_finance_target') && (r.col_name == "type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得资金方api类别*/
selectors.getFundAPIType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_fund_api') && (r.col_name == "api_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得订单匹配是否成功*/
selectors.getOrderMatchInfoSuccess = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order_match_info') && (r.col_name == "is_success")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得机构模板类型*/
selectors.getOrgModeType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_org_mode') && (r.col_name == "mode_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业征信信息状态 */
selectors.getTaskEnterprisePICrawStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_task_enterprise_pi_craw') && (r.col_name == "task_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得企业征信信息明细状态*/
selectors.getTaskEnterprisePICrawDetailStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_task_enterprise_pi_craw_detail') && (r.col_name == "task_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得费用缴纳方式*/
selectors.getPlatformPayMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_edi_pay_bill') && (r.col_name == "platform_pay_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))

/** 取得用户平台属性*/
selectors.getUserAttributePartnerNature = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_attribute') && (r.col_name == "partner_nature")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))

/** 取得用户平台属性是否支持债转*/
selectors.getUserAttributeIsDebtExchange = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_attribute') && (r.col_name == "is_debt_exchange")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得用户平台属性资金方开户模式*/
selectors.getUserAttributeFundAccountMode = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_attribute') && (r.col_name == "fund_account_mode")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得用户平台属性是否自动授信*/
selectors.getUserAttributeIsAutoCredit = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_user_attribute') && (r.col_name == "is_auto_credit")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))

/** 取得贷后订单状态*/
selectors.getAfterRepaymentStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_after_repayment_order') && (r.col_name == "order_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得贷后订单明细逾期状态*/
selectors.getAfterRepaymentOrderDetailOverdueStatus = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_after_repayment_order_detail') && (r.col_name == "overdue_status")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得贷后订单明细业务类型*/
selectors.getAfterRepaymentOrderDetailBizType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_after_repayment_order_detail') && (r.col_name == "business_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 取得贷后订单明细借款主体类型*/
selectors.getAfterRepaymentOrderDetailBorrowType = createSelector(getDictionary,
  (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_after_repayment_order_detail') && (r.col_name == "borrow_type")).map(r => ({
    label: r.para_value,
    value: r.para_key
  })))
/** 假如用户不是资产方，返回所有资产方，否则为自己*/
selectors.getAssetOrgCodes = createSelector([getDictionary, selectors.getUserType, selectors.getOrgCodes, getSession],
  (dictionary, user_type, orgCodes, _session) => ((user_type != 1) ? orgCodes.filter(r => (r.value && r.value.startsWith("A") && dictionary.relatedOrgs.map(item => item.asset_org_code).includes(r.value))) : orgCodes.filter(r => (r.value === _session.org_code))))
/** 假如用户不是资金方，返回所有资金方，否则为自己*/
selectors.getFundOrgCodes = createSelector([getDictionary, selectors.getUserType, selectors.getOrgCodes, getSession],
  (dictionary, user_type, orgCodes, _session) => ((user_type != 2) ? orgCodes.filter(r => (r.value && r.value.startsWith("F") && dictionary.relatedOrgs.map(item => item.fund_org_code).includes(r.value))) : orgCodes.filter(r => (r.value === _session.org_code))))
/** 取得关联资金方*/
selectors.getRelatedFundOrgs = createSelector(selectors.getOrgCodes, getDictionary, (orgCodes, dictionary) => {
  let assetOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.asset_org_code))];
  return assetOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r)
    let relatedOrgCodes = dictionary.relatedOrgs.filter(t => (t.asset_org_code == r)).map(s => orgCodes.find(t => (t.value == s.fund_org_code)));
    return {...entry, relatedArr: relatedOrgCodes}
  });
})
/** 取得带来源的资金方*/
selectors.getFundOrgsWithUserFrom = createSelector(selectors.getOrgCodes, selectors.getUserFrom, getDictionary, (orgCodes, userFrom, dictionary) => {
  let fundOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.fund_org_code))];
  return fundOrgCodes.map(r => {
    let data = dictionary.relatedOrgs.find(t=> t.fund_org_code === r), userFrom = data.fund_user_from, entry = orgCodes.find(t => t.value == r);
    return {...entry, userFrom}
  });
})

/** 取得带来源的资产方*/
selectors.getAssetOrgsWithUserFrom = createSelector(selectors.getOrgCodes, selectors.getUserFrom, getDictionary, (orgCodes, userFrom, dictionary) => {
  let assetOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.asset_org_code))];
  return assetOrgCodes.map(r => {
    let data = dictionary.relatedOrgs.find(t=> t.asset_org_code === r), userFrom = data.asset_user_from, entry = orgCodes.find(t => t.value == r);
    return {...entry, userFrom}
  });
})

/** 取得关联资金方并将其按用户来源分组*/
selectors.getRelatedFundOrgsWithUserFrom = createSelector(selectors.getOrgCodes, selectors.getUserFrom, getDictionary, (orgCodes, userFrom, dictionary) => {
  let assetOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.asset_org_code))];
  return assetOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r),
      userFromMap = userFrom.map(v=>({...v, relatedArr: dictionary.relatedOrgs.filter(t => (v.value == t.fund_user_from) && (t.asset_org_code == r)).map(s => orgCodes.find(t => (t.value == s.fund_org_code)))}))
    return {...entry, userFrom: userFromMap}
  });
})
/** 取得关联资产方*/
selectors.getRelatedAssetOrgs = createSelector(selectors.getOrgCodes, getDictionary, (orgCodes, dictionary) => {
  let fundOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.fund_org_code))];
  return fundOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r)
    let relatedOrgCodes = dictionary.relatedOrgs.filter(t => (t.fund_org_code == r)).map(s => orgCodes.find(t => (t.value == s.asset_org_code)));
    return {...entry, relatedArr: relatedOrgCodes}
  });
})
/** 取得关联资产方并将其按用户来源分组*/
selectors.getRelatedAssetOrgsWithUserFrom = createSelector(selectors.getOrgCodes, selectors.getUserFrom, getDictionary, (orgCodes, userFrom, dictionary) => {
  let fundOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.fund_org_code))];
  return fundOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r),
      userFromMap = userFrom.map(v=>({...v, relatedArr: dictionary.relatedOrgs.filter(t => (v.value == t.asset_user_from) && (t.fund_org_code == r)).map(s => orgCodes.find(t => (t.value == s.asset_org_code)))}))
    return {...entry, userFrom: userFromMap}
  });
})
/** 取得关联资金方并将其按资金方账户用途分组，取得不同目的的资产方*/
selectors.getRelatedAssetOrgsWithFundAccountPurpose = createSelector(selectors.getOrgCodes, selectors.getFundAccountAccountPurpose, getDictionary, (orgCodes, fundAccountAccountPurpose, dictionary) => {
  let fundOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.fund_org_code))];
  return fundOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r),
      purpose = fundAccountAccountPurpose.map(v=>({...v, relatedArr: dictionary.fundAccounts.filter(t=> (v.value == t.account_purpose) && (t.fund_org_code == r)).map(s => ({...orgCodes.find(t => (t.value == s.asset_org_code)), fundAccount: s}))}))
    return {...entry, purpose}
  });
})
/** 取得关联资产方并将其按资金方账户用途分组，取得不同目的的资金方*/
selectors.getRelatedFundOrgsWithFundAccountPurpose = createSelector(selectors.getOrgCodes, selectors.getFundAccountAccountPurpose, getDictionary, (orgCodes, fundAccountAccountPurpose, dictionary) => {
  let assetOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.asset_org_code))];
  return assetOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r),
      purpose = fundAccountAccountPurpose.map(v=>({...v, relatedArr: dictionary.fundAccounts.filter(t=> (v.value == t.account_purpose) && (t.asset_org_code == r)).map(s => ({...orgCodes.find(t => (t.value == s.fund_org_code)), fundAccount: s}))}))
    return {...entry, purpose}
  });
})
/** 取得关联资金方并将其按资产方账户用途分组，取得不同目的的资产方*/
selectors.getRelatedAssetOrgsWithAssetAccountPurpose = createSelector(selectors.getOrgCodes, selectors.getAssetAccountAccountPurpose, getDictionary, (orgCodes, assetAccountAccountPurpose, dictionary) => {
  let fundOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.fund_org_code))];
  return fundOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r),
      purpose = assetAccountAccountPurpose.map(v=>({...v, relatedArr: dictionary.assetAccounts.filter(t=> (v.value == t.account_purpose) && (t.fund_org_code == r)).map(s => ({...orgCodes.find(t => (t.value == s.asset_org_code)), assetAccount: s}))}))
    return {...entry, purpose}
  });
})
/** 取得关联资产方并将其按资产方账户用途分组，取得不同目的的资金方*/
selectors.getRelatedFundOrgsWithAssetAccountPurpose = createSelector(selectors.getOrgCodes, selectors.getAssetAccountAccountPurpose, getDictionary, (orgCodes, assetAccountAccountPurpose, dictionary) => {
  let assetOrgCodes = [...new Set(dictionary.relatedOrgs.map(r => r.asset_org_code))];
  return assetOrgCodes.map(r => {
    let entry = orgCodes.find(t => t.value == r),
      purpose = assetAccountAccountPurpose.map(v=>({...v, relatedArr: dictionary.assetAccounts.filter(t=> (v.value == t.account_purpose) && (t.asset_org_code == r)).map(s => ({...orgCodes.find(t => (t.value == s.fund_org_code)), assetAccount: s}))}))
    return {...entry, purpose}
  });
})

/** 取得用户数据权限*/
selectors.getRestrictedRelatedOrgs = createSelector(selectors.getUserType, selectors.getDefaultAssetOrgCodes,
  selectors.getDefaultFundOrgCodes,selectors.getRelatedAssetOrgs, selectors.getRelatedFundOrgs,
  selectors.getAssetOrgCodes, selectors.getFundOrgCodes,
  (user_type, defaultAssetOrgCodes, defaultFundOrgCodes, relatedAssetOrgs, relatedFundOrgs, assetOrgCodes, fundOrgCodes) => {
    let result = {relatedAssetOrgs:[],relatedFundOrgs:[]}
    switch (user_type) {
      case 1:
        result.relatedFundOrgs = relatedFundOrgs.find(r=>r.value === defaultAssetOrgCodes).relatedArr;
        break;
      case 2:
        result.relatedAssetOrgs = relatedAssetOrgs.find(r=>r.value === defaultFundOrgCodes).relatedArr;
        break;
      case 3:
      case 4:
        result.relatedAssetOrgs = assetOrgCodes;
        result.relatedFundOrgs = fundOrgCodes;
        break;
    }
    return result
  })
  selectors.getOrderWithdrawStatus = createSelector(getDictionary,
    (dictionary) => dictionary.dictionary.filter(r => (r.table_name == 't_order_withdraw') && (r.col_name == "withdraw_status")).map(r => ({
      label: r.para_value,
      value: r.para_key
    })))
export default selectors
