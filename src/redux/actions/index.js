/**
 * 作者：石奇峰
 * 功能：Edi的action，记录了所有用户行为
 * */

import Selectors from "../selectors";

function typeCreator(name) {
  return {
    request: Symbol(`[${name}]: Request`),
    success: Symbol(`[${name}]: Success`),
    fail: Symbol(`[${name}]: Fail`)
  }
}

export const ACTIONS = {
  CALL_LOGIN: {
    endpoint: "login",
    types: typeCreator("CALL_LOGIN")
  },
  CALL_DIC: {
    endpoint: "dictionary",
    types: typeCreator("CALL_DIC")
  },
  CALL_ORDER: {
    endpoint: "order/search",
    types: typeCreator("CALL_ORDER")
  },
  CALL_ORDER_REPAYMENT: {
    endpoint: "order/orderRepayment",
    types: typeCreator("CALL_ORDER_REPAYMENT")
  },
  CALL_ORDER_PAYMENT: {
    endpoint: "order/orderPayment",
    types: typeCreator("CALL_ORDER_PAYMENT")
  },
  CALL_ORDER_ACCOUNT: {
    endpoint: "order/orderAccount",
    types: typeCreator("CALL_ORDER_ACCOUNT")
  },
  CALL_ORDER_ADVANCE: {
    endpoint: "order/orderAdvance",
    types: typeCreator("CALL_ORDER_ADVANCE")
  },
  CALL_ORDER_VOUCHER: {
    endpoint: "order/orderVoucher",
    types: typeCreator("CALL_ORDER_VOUCHER")
  },
  CALL_ORDER_CONTRACT: {
    endpoint: "order/orderContract",
    types: typeCreator("CALL_ORDER_CONTRACT")
  },
  CALL_ORDER_SERVICE: {
    endpoint: "order/orderService",
    types: typeCreator("CALL_ORDER_SERVICE")
  },
  CALL_ORDER_CREDIT: {
    endpoint: "order/orderCredit",
    types: typeCreator("CALL_ORDER_CREDIT")
  },
  CALL_MATCH_ASSET_ORDER: {
    endpoint: "order/match",
    types: typeCreator("CALL_MATCH_ASSET_ORDER")
  },
  CALL_CREATE_ASSET_ORDER: {
    endpoint: "order/create",
    types: typeCreator("CALL_CREATE_ASSET_ORDER")
  },
  CALL_MATCH_SUPPLEMENT_ASSET_ORDER: {
    endpoint: "order/matchSupplement",
    types: typeCreator("CALL_MATCH_SUPPLEMENT_ASSET_ORDER")
  },
  CALL_SUPPLEMENT_ASSET_ORDER: {
    endpoint: "order/supplement",
    types: typeCreator("CALL_SUPPLEMENT_ASSET_ORDER")
  },
  CALL_SUPPLEMENT_FUND_CONTRACT: {
    endpoint: "order/supplementFundContract",
    types: typeCreator("CALL_SUPPLEMENT_FUND_CONTRACT")
  },
  CALL_ORDER_CHECK_RESULT_MATCH: {
    endpoint: "order/checkResultMatch",
    types: typeCreator("CALL_ORDER_CHECK_RESULT_MATCH")
  },
  CALL_ORDER_CHECK_RESULT_CREATE: {
    endpoint: "order/checkResultCreate",
    types: typeCreator("CALL_ORDER_CHECK_RESULT_CREATE")
  },
  CALL_ORDER_ACCOUNT_DETAIL_MATCH: {
    endpoint: "order/accountDetailMatch",
    types: typeCreator("CALL_ORDER_ACCOUNT_DETAIL_MATCH")
  },
  CALL_ORDER_ACCOUNT_DETAIL_CREATE: {
    endpoint: "order/accountDetailCreate",
    types: typeCreator("CALL_ORDER_ACCOUNT_DETAIL_CREATE")
  },
  CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH:{
    endpoint: "order/contractSupplymentMatch",
    types: typeCreator("CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH")
  },
  CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE: {
    endpoint: "order/contractSupplymentCreate",
    types: typeCreator("CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE")
  },
  CALL_REPAYMENT: {
    endpoint: "repayment/search",
    types: typeCreator("CALL_REPAYMENT")
  },
  CALL_REPAYMENT_UPDATE: {
    endpoint: "repayment/update",
    types: typeCreator("CALL_REPAYMENT_UPDATE")
  },
  CALL_USERINFO: {
    endpoint: "profile/update",
    types: typeCreator("CALL_USERINFO")
  },
  CALL_REQWEEK: {
    endpoint: "requirementPlan/reqWeekly/search",
    types: typeCreator("CALL_REQWEEK")
  },
  CALL_REQWEEK_HISTORY: {
    endpoint: "requirementPlan/reqHisWeekly/search",
    types: typeCreator("CALL_REQWEEK_HISTORY")
  },
  CALL_REQWEEK_UPDATE: {
    endpoint: "requirementPlan/reqWeekly/update",
    types: typeCreator("CALL_REQWEEK_UPDATE")
  },
  CALL_COLWEEK: {
    endpoint: "collectionPlan/colWeekly/search",
    types: typeCreator("CALL_COLWEEK")
  },
  CALL_COLWEEK_UPDATE: {
    endpoint: "collectionPlan/colWeekly/update",
    types: typeCreator("CALL_COLWEEK_UPDATE")
  },
  CALL_COLWEEK_HISTORY: {
    endpoint: "collectionPlan/colHisWeekly/search",
    types: typeCreator("CALL_COLWEEK_HISTORY")
  },

  //ToDo 每周需求计划（新）和每周募集计划（新）统一整合到一个组件DistriPlan
  CALL_DISTRIPLAN: {
    endpoint: "distriPlan/search",
    types: typeCreator("CALL_REQWEEK")
  },
  CALL_DISTRIPLAN_HISTORY: {
    endpoint: "distriPlan/searchHistory",
    types: typeCreator("CALL_REQWEEK_HISTORY")
  },
  CALL_DISTRIPLAN_UPDATE: {
    endpoint: "distriPlan/update",
    types: typeCreator("CALL_REQWEEK_UPDATE")
  },

  CALL_ASSET_ACCOUNT: {
    endpoint: "assetAccount/search",
    types: typeCreator("CALL_ASSET_ACCOUNT")
  },
  CALL_ASSET_ACCOUNT_UPDATE: {
    endpoint: "assetAccount/update",
    types: typeCreator("CALL_ASSET_ACCOUNT_UPDATE")
  },
  CALL_REPAYMENT_PLAN: {
    endpoint: "repaymentPlan/search",
    types: typeCreator("CALL_REPAYMENT_PLAN")
  },
  CALL_ASSET_SETTING: {
    endpoint: "assetSetting/search",
    types: typeCreator("CALL_ASSET_SETTING")
  },
  CALL_ASSET_SETTING_CAPTCHA: {
    endpoint: "assetSetting/captcha",
    types: typeCreator("CALL_ASSET_SETTING_CAPTCHA")
  },
  CALL_ASSET_SETTING_UPDATE: {
    endpoint: "assetSetting/update",
    types: typeCreator("CALL_ASSET_SETTING_UPDATE")
  },
  CALL_ASSET_SETTING_UPDATE_DEADLINE: {
    endpoint: "assetSetting/updateDeadline",
    types: typeCreator("CALL_ASSET_SETTING_UPDATE_DEADLINE")
  },
  CALL_FUND_SETTING: {
    endpoint: "fundSetting/search",
    types: typeCreator("CALL_FUND_SETTING")
  },
  CALL_FUND_SETTING_UPDATE: {
    endpoint: "fundSetting/update",
    types: typeCreator("CALL_FUND_SETTING_UPDATE")
  },
  CALL_ADMIN_SETTING: {
    endpoint: "adminSetting/search",
    types: typeCreator("CALL_ADMIN_SETTING")
  },
  CALL_ADMIN_SETTING_UPDATE: {
    endpoint: "adminSetting/update",
    types: typeCreator("CALL_ADMIN_SETTING_UPDATE")
  },
  CALL_FUND_SUPPLY_DAILY: {
    endpoint: "fundSupply/daily",
    types: typeCreator("CALL_FUND_SUPPLY_DAILY")
  },
  CALL_FUND_SUPPLY_WEEKLY: {
    endpoint: "fundSupply/weekly",
    types: typeCreator("CALL_FUND_SUPPLY_WEEKLY")
  },
  CALL_OPER_LOG: {
    endpoint: "operLog",
    types: typeCreator("CALL_OPER_LOG")
  },
  CALL_OPER_LOG_SEARCH: {
    endpoint: "finance/operLog/search",
    types: typeCreator("CALL_OPER_LOG_SEARCH")
  },
  CALL_LOGIN_LOG: {
    endpoint: "loginLogs/search",
    types: typeCreator("CALL_LOGIN_LOG")
  },
  CALL_OPER_TABLE_LOG_SEARCH: {
    endpoint: "operTableLogs/search",
    types: typeCreator("CALL_OPER_TABLE_LOG_SEARCH")
  },
  CALL_SIMPLY_LOG_IT: {
    endpoint: "simplyLogIt",
    types: typeCreator("CALL_SIMPLY_LOG_IT")
  },
  CALL_SIMPLY_LOG_TABLE: {
    endpoint: "simplyLogTable",
    types: typeCreator("CALL_SIMPLY_LOG_TABLE")
  },
  CALL_PLATFORM_USE_FEE_BILL_SEARCH: {
    endpoint: "platformUseFee/billSearch",
    types: typeCreator("CALL_PLATFORM_USE_FEE_BILL_SEARCH")
  },
  CALL_PLATFORM_USE_FEE_BILL_REDUCE: {
    endpoint: "platformUseFee/billReduce",
    types: typeCreator("CALL_PLATFORM_USE_FEE_BILL_REDUCE")
  },
  CALL_PLATFORM_USE_FEE_EMAIL_SEARCH: {
    endpoint: "platformUseFee/emailSearch",
    types: typeCreator("CALL_PLATFORM_USE_FEE_EMAIL_SEARCH")
  },
  CALL_PLATFORM_USE_FEE_PAY_NOTICE: {
    endpoint: "platformUseFee/payNotice",
    types: typeCreator("CALL_PLATFORM_USE_FEE_PAY_NOTICE")
  },
  CALL_PLATFORM_USE_FEE_PAY_SEARCH: {
    endpoint: "platformUseFee/paySearch",
    types: typeCreator("CALL_PLATFORM_USE_FEE_PAY_SEARCH")
  },
  CALL_PLATFORM_USE_FEE_PAY_ADD: {
    endpoint: "platformUseFee/payAdd",
    types: typeCreator("CALL_PLATFORM_USE_FEE_PAY_ADD")
  },
  CALL_PLATFORM_USE_FEE_FEE_SEARCH: {
    endpoint: "platformUseFee/feeSearch",
    types: typeCreator("CALL_PLATFORM_USE_FEE_FEE_SEARCH")
  },
  CALL_PLATFORM_USE_FEE_FEE_UPDATE: {
    endpoint: "platformUseFee/feeUpdate",
    types: typeCreator("CALL_PLATFORM_USE_FEE_FEE_UPDATE")
  },
  CALL_USER_MANAGEMENT_QUERY: {
    endpoint: "userManagement/search",
    types: typeCreator("CALL_USER_MANAGEMENT_QUERY")
  },
  CALL_USER_MANAGEMENT_UPDATE: {
    endpoint: "userManagement/update",
    types: typeCreator("CALL_USER_MANAGEMENT_UPDATE")
  },
  CALL_USER_MANAGEMENT_CREATE: {
    endpoint: "userManagement/create",
    types: typeCreator("CALL_USER_MANAGEMENT_CREATE")
  },
  CALL_USER_MANAGEMENT_DELETE: {
    endpoint: "userManagement/delete",
    types: typeCreator("CALL_USER_MANAGEMENT_DELETE")
  },
  CALL_USER_MANAGEMENT_AUTH_SEARCH: {
    endpoint: "userManagement/authSearch",
    types: typeCreator("CALL_USER_MANAGEMENT_AUTH_SEARCH")
  },
  CALL_USER_MANAGEMENT_AUTH: {
    endpoint: "userManagement/auth",
    types: typeCreator("CALL_USER_MANAGEMENT_AUTH")
  },
  CALL_USER_MANAGEMENT_ATTRIBUTE_FIND: {
    endpoint: "userManagement/userAttributeFind",
    types: typeCreator("CALL_USER_MANAGEMENT_ATTRIBUTE_FIND")
  },
  CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE: {
    endpoint: "userManagement/userAttributeUpdate",
    types: typeCreator("CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE")
  },
  CALL_SUB_USER_MANAGEMENT_QUERY: {
    endpoint: "subuserManagement/search",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_QUERY")
  },
  CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY: {
    endpoint: "subuserManagement/getRestriction",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY")
  },
  CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE: {
    endpoint: "subuserManagement/updateRestriction",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE")
  },
  CALL_SUB_USER_MANAGEMENT_CREATE: {
    endpoint: "subuserManagement/create",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_CREATE")
  },
  CALL_SUB_USER_MANAGEMENT_DELETE: {
    endpoint: "subuserManagement/delete",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_DELETE")
  },
  CALL_SUB_USER_MANAGEMENT_UPDATE: {
    endpoint: "subuserManagement/update",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_UPDATE")
  },
  CALL_SUB_USER_MANAGEMENT_AUTH_SEARCH: {
    endpoint: "subuserManagement/authSearch",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_AUTH_SEARCH")
  },
  CALL_SUB_USER_MANAGEMENT_AUTH: {
    endpoint: "subuserManagement/auth",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_AUTH")
  },
  CALL_CORP_ORDER: {
    endpoint: "corpOrder/search",
    types: typeCreator("CALL_CORP_ORDER")
  },
  CALL_CORP_ORDER_REPAYMENT: {
    endpoint: "corpOrder/repayment",
    types: typeCreator("CALL_CORP_ORDER_REPAYMENT")
  },
  CALL_CORP_ORDER_VOUCHER: {
    endpoint: "corpOrder/voucher",
    types: typeCreator("CALL_CORP_ORDER_VOUCHER")
  },
  CALL_CORP_ORDER_CONTRACT: {
    endpoint: "corpOrder/contract",
    types: typeCreator("CALL_CORP_ORDER_CONTRACT")
  },
  CALL_CORP_ORDER_SERVICE: {
    endpoint: "corpOrder/service",
    types: typeCreator("CALL_CORP_ORDER_SERVICE")
  },
  CALL_CORP_ORDER_PAYMENT: {
    endpoint: "corpOrder/payment",
    types: typeCreator("CALL_CORP_ORDER_PAYMENT")
  },
  CALL_CORP_ORDER_ACCOUNT: {
    endpoint: "corpOrder/account",
    types: typeCreator("CALL_CORP_ORDER_ACCOUNT")
  },
  CALL_CORP_ORDER_ADVANCE: {
    endpoint: "corpOrder/advance",
    types: typeCreator("CALL_CORP_ORDER_ADVANCE")
  },
  CALL_CORP_ORDER_CREDIT: {
    endpoint: "corpOrder/credit",
    types: typeCreator("CALL_CORP_ORDER_CREDIT")
  },
  CALL_MATCH_CORP_ASSET_ORDER: {
    endpoint: "corpOrder/match",
    types: typeCreator("CALL_MATCH_CORP_ASSET_ORDER")
  },
  CALL_CREATE_CORP_ASSET_ORDER: {
    endpoint: "corpOrder/create",
    types: typeCreator("CALL_CREATE_CORP_ASSET_ORDER")
  },
  CALL_CORP_SUPPLEMENT_ASSET_ORDER: {
    endpoint: "corpOrder/supplement",
    types: typeCreator("CALL_CORP_SUPPLEMENT_ASSET_ORDER")
  },
  CALL_CORP_ORDER_CHECK_RESULT_MATCH: {
    endpoint: "corpOrder/checkResultMatch",
    types: typeCreator("CALL_CORP_ORDER_CHECK_RESULT_MATCH")
  },
  CALL_CORP_ORDER_CHECK_RESULT_CREATE: {
    endpoint: "corpOrder/checkResultCreate",
    types: typeCreator("CALL_CORP_ORDER_CHECK_RESULT_CREATE")
  },
  CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH: {
    endpoint: "corpOrder/accountDetailMatch",
    types: typeCreator("CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH")
  },
  CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE: {
    endpoint: "corpOrder/accountDetailCreate",
    types: typeCreator("CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE")
  },
  CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_MATCH:{
    endpoint: "corpOrder/contractSupplymentMatch",
    types: typeCreator("CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH")
  },
  CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_CREATE: {
    endpoint: "corpOrder/contractSupplymentCreate",
    types: typeCreator("CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE")
  },
  CALL_CORP_AUTH: {
    endpoint: "corpAuth/search",
    types: typeCreator("CALL_CORP_AUTH")
  },
  CALL_CORP_AUTH_DETAIL: {
    endpoint: "corpAuth/detail",
    types: typeCreator("CALL_CORP_AUTH_DETAIL")
  },
  CALL_CORP_AUTH_CREDIT_DETAIL: {
    endpoint: "corpAuth/creditDetail",
    types: typeCreator("CALL_CORP_AUTH_CREDIT_DETAIL")
  },
  CALL_CREATE_CORP_CREDIT: {
    endpoint: "corpAuth/create",
    types: typeCreator("CALL_CREATE_CORP_CREDIT")
  },
  CALL_FILTER_CORP_AUTH_VOUCHER: {
    endpoint: "corpAuth/filterCorpAuthVoucher",
    types: typeCreator("CALL_FILTER_CORP_AUTH_VOUCHER")
  },
  CALL_CORP_AUTH_VOUCHER: {
    endpoint: "corpAuth/corpAuthVoucher",
    types: typeCreator("CALL_CORP_AUTH_VOUCHER")
  },
  CALL_MATCH_CORP_CREDIT: {
    endpoint: "corpAuth/match",
    types: typeCreator("CALL_MATCH_CORP_CREDIT")
  },
  CALL_MATCH_SUPPLEMENT_CORP_CREDIT: {
    endpoint: "corpAuth/matchSupplement",
    types: typeCreator("CALL_MATCH_SUPPLEMENT_CORP_CREDIT")
  },
  CALL_SUPPLEMENT_CORP_CREDIT: {
    endpoint: "corpAuth/supplement",
    types: typeCreator("CALL_SUPPLEMENT_CORP_CREDIT")
  },
  CALL_CORP_AUTH_AUTH_RESULT_MATCH: {
    endpoint: "corpAuth/authResultMatch",
    types: typeCreator("CALL_CORP_AUTH_AUTH_RESULT_MATCH")
  },
  CALL_CORP_AUTH_AUTH_RESULT_CREATE: {
    endpoint: "corpAuth/authResultCreate",
    types: typeCreator("CALL_CORP_AUTH_AUTH_RESULT_CREATE")
  },
  CALL_DEADLINE: {
    endpoint: "deadline",
    types: typeCreator("CALL_DEADLINE")
  },
  CALL_FUND_STATISTICS_TOTAL: {
    endpoint: "fundStatistics/total",
    types: typeCreator("CALL_FUND_STATISTICS_TOTAL")
  },
  CALL_FUND_STATISTICS_FUND_ASSET: {
    endpoint: "fundStatistics/fundOrAsset",
    types: typeCreator("CALL_FUND_STATISTICS_FUND_ASSET")
  },
  CALL_FUND_STATISTICS_DEADLINE: {
    endpoint: "fundStatistics/deadline",
    types: typeCreator("CALL_FUND_STATISTICS_DEADLINE")
  },
  CALL_AFTER_REPAYMENT_STATISTICS:{
    endpoint: "afterRepaymentStatistics/search",
    types: typeCreator("CALL_AFTER_REPAYMENT_STATISTICS")
  },
  CALL_SETTLE_METHOD_SEARCH: {
    endpoint: "settleMethod/search",
    types: typeCreator("CALL_SETTLE_METHOD_SEARCH")
  },
  CALL_SETTLE_METHOD_UPDATE: {
    endpoint: "settleMethod/update",
    types: typeCreator("CALL_SETTLE_METHOD_UPDATE")
  },
  CALL_BALANCE_STATISTICS_SEARCH: {
    endpoint: "balanceStatistics/search",
    types: typeCreator("CALL_BALANCE_STATISTICS_SEARCH")
  },
  CALL_BALANCE_STATISTICS_SEARCH_TAB4: {
    endpoint: "balanceStatistics/searchTab4",
    types: typeCreator("CALL_BALANCE_STATISTICS_SEARCH_TAB4")
  },
  CALL_FUND_SUPPLY_COLLECT: {
    endpoint: "fundSupply/collect",
    types: typeCreator("CALL_FUND_SUPPLY_COLLECT")
  },
  CALL_FUND_SUPPLY_REQUIRE: {
    endpoint: "fundSupply/require",
    types: typeCreator("CALL_FUND_SUPPLY_REQUIRE")
  },
  CALL_FILTER_ORDER_VOUCHER: {
    endpoint: "order/filterOrderVoucher",
    types: typeCreator("CALL_FILTER_ORDER_VOUCHER")
  },
  CALL_FILTER_CORP_ORDER_VOUCHER: {
    endpoint: "corpOrder/filterOrderVoucher",
    types: typeCreator("CALL_FILTER_CORP_ORDER_VOUCHER")
  },
  CALL_ADMIN_STATISTICS_PLATFORM: {
    endpoint: "fundStatistics/platform",
    types: typeCreator("CALL_ADMIN_STATISTICS_PLATFORM")
  },
  CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER: {
    endpoint: "corpOrder/matchSupplement",
    types: typeCreator("CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER")
  },
  CALL_MENU_MANAGEMENT_QUERY: {
    endpoint: "menu/search",
    types: typeCreator("CALL_MENU_MANAGEMENT_QUERY")
  },
  CALL_MENU_MANAGEMENT_CREATE: {
    endpoint: "menu/create",
    types: typeCreator("CALL_MENU_MANAGEMENT_CREATE")
  },
  CALL_MENU_MANAGEMENT_DELETE: {
    endpoint: "menu/delete",
    types: typeCreator("CALL_MENU_MANAGEMENT_DELETE")
  },
  CALL_MENU_MANAGEMENT_UPDATE: {
    endpoint: "menu/update",
    types: typeCreator("CALL_MENU_MANAGEMENT_UPDATE")
  },
  CALL_MENU_MANAGEMENT_UP: {
    endpoint: "menu/up",
    types: typeCreator("CALL_MENU_MANAGEMENT_UP")
  },
  CALL_MENU_MANAGEMENT_DOWN: {
    endpoint: "menu/down",
    types: typeCreator("CALL_MENU_MANAGEMENT_DOWN")
  },
  CALL_MENU_MANAGEMENT_DETAIL: {
    endpoint: "menu/detail",
    types: typeCreator("CALL_MENU_MANAGEMENT_DETAIL")
  },
  CALL_COOPERATOR_INFO_QUERY: {
    endpoint: "cooperator/search",
    types: typeCreator("CALL_COOPERATOR_INFO_QUERY")
  },
  CALL_COOPERATOR_INFO_CREATE: {
    endpoint: "cooperator/create",
    types: typeCreator("CALL_COOPERATOR_INFO_CREATE")
  },
  CALL_COOPERATOR_INFO_DELETE: {
    endpoint: "cooperator/delete",
    types: typeCreator("CALL_COOPERATOR_INFO_DELETE")
  },
  CALL_COOPERATOR_INFO_UPDATE: {
    endpoint: "cooperator/update",
    types: typeCreator("CALL_COOPERATOR_INFO_UPDATE")
  },
  CALL_COOPERATOR_INFO_SEARCH_RELATION: {
    endpoint: "cooperator/searchRelation",
    types: typeCreator("CALL_COOPERATOR_INFO_SEARCH_RELATION")
  },
  CALL_COOPERATOR_INFO_ADD_RELATION: {
    endpoint: "cooperator/addRelation",
    types: typeCreator("CALL_COOPERATOR_INFO_ADD_RELATION")
  },
  CALL_COOPERATOR_INFO_SEARCH_ADDED_RELATION: {
    endpoint: "cooperator/searchAddedRelation",
    types: typeCreator("CALL_COOPERATOR_INFO_SEARCH_ADDED_RELATION")
  },
  CALL_COOPERATOR_INFO_SUPPLY_INFO: {
    endpoint: "cooperator/supplyInfo",
    types: typeCreator("CALL_COOPERATOR_INFO_SUPPLY_INFO")
  },
  CALL_COOPERATOR_ACCOUNT_INFO_QUERY: {
    endpoint: "cooperatorAccountInfo/accountInfo",
    types: typeCreator("CALL_COOPERATOR_ACCOUNT_INFO_QUERY")
  },
  CALL_ROLE_MANAGEMENT_QUERY: {
    endpoint: "role/search",
    types: typeCreator("CALL_ROLE_MANAGEMENT_QUERY")
  },
  CALL_ROLE_MANAGEMENT_CREATE: {
    endpoint: "role/create",
    types: typeCreator("CALL_ROLE_MANAGEMENT_CREATE")
  },
  CALL_ROLE_MANAGEMENT_DELETE: {
    endpoint: "role/delete",
    types: typeCreator("CALL_ROLE_MANAGEMENT_DELETE")
  },
  CALL_ROLE_MANAGEMENT_UPDATE: {
    endpoint: "role/update",
    types: typeCreator("CALL_ROLE_MANAGEMENT_UPDATE")
  },
  CALL_ROLE_MANAGEMENT_FUNC_SEARCH: {
    endpoint: "role/funcSearch",
    types: typeCreator("CALL_ROLE_MANAGEMENT_FUNC_SEARCH")
  },
  CALL_ROLE_MANAGEMENT_FUNC_UPDATE: {
    endpoint: "role/funcUpdate",
    types: typeCreator("CALL_ROLE_MANAGEMENT_FUNC_UPDATE")
  },
  CALL_ROLE_MANAGEMENT_USER_SEARCH: {
    endpoint: "role/userSearch",
    types: typeCreator("CALL_ROLE_MANAGEMENT_USER_SEARCH")
  },
  CALL_ROLE_MANAGEMENT_USER_ADD_SEARCH: {
    endpoint: "role/userAddSearch",
    types: typeCreator("CALL_ROLE_MANAGEMENT_USER_ADD_SEARCH")
  },
  CALL_ROLE_MANAGEMENT_USER_ADD: {
    endpoint: "role/userAdd",
    types: typeCreator("CALL_ROLE_MANAGEMENT_USER_ADD")
  },
  CALL_ROLE_MANAGEMENT_USER_DELETE: {
    endpoint: "role/userDelete",
    types: typeCreator("CALL_ROLE_MANAGEMENT_USER_DELETE")
  },
  CALL_OPER_LOG_MODAL: {
    endpoint: "operlog/search",
    types: typeCreator("CALL_OPER_LOG_MODAL")
  },
  CALL_OPER_LOG_COMBINED_MODAL: {
    endpoint: "operlog/combinedSearch",
    types: typeCreator("CALL_OPER_LOG_COMBINED_MODAL")
  },
  CALL_FINANCE_LOAN_SEARCH: {
    endpoint: "financeLoan/search",
    types: typeCreator("CALL_FINANCE_LOAN_SEARCH")
  },
  CALL_FINANCE_LOAN_MATCH_DETAIL: {
    endpoint: "financeLoan/matchDetail",
    types: typeCreator("CALL_FINANCE_LOAN_MATCH_DETAIL")
  },
  CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL: {
    endpoint: "financeLoan/createHistoricalDetail",
    types: typeCreator("CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL")
  },
  CALL_FINANCE_LOAN_CREATE_NEW_DETAIL: {
    endpoint: "financeLoan/createNewDetail",
    types: typeCreator("CALL_FINANCE_LOAN_CREATE_NEW_DETAIL")
  },
  CALL_FINANCE_LOAN_CHANGE_STATUS: {
    endpoint: "financeLoan/changeStatus",
    types: typeCreator("CALL_FINANCE_LOAN_CHANGE_STATUS")
  },
  CALL_FINANCE_REPAYMENT_CHANGE_STATUS: {
    endpoint: "financeRepayment/changeStatus",
    types: typeCreator("CALL_FINANCE_REPAYMENT_CHANGE_STATUS")
  },
  CALL_FINANCE_SERVICE_SETTLEMENT_CHANGE_STATUS: {
    endpoint: "financeService/changeStatus",
    types: typeCreator("CALL_FINANCE_SERVICE_SETTLEMENT_CHANGE_STATUS")
  },
  CALL_FINANCE_REPAYMENT_SEARCH: {
    endpoint: "financeRepayment/search",
    types: typeCreator("CALL_FINANCE_REPAYMENT_SEARCH")
  },
  CALL_FINANCE_REPAYMENT_MATCH_DETAIL: {
    endpoint: "financeRepayment/matchDetail",
    types: typeCreator("CALL_FINANCE_REPAYMENT_MATCH_DETAIL")
  },
  CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL: {
    endpoint: "financeRepayment/createNewDetail",
    types: typeCreator("CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL")
  },
  CALL_FINANCE_SERVICE_SEARCH: {
    endpoint: "financeService/search",
    types: typeCreator("CALL_FINANCE_SERVICE_SEARCH")
  },
  CALL_FINANCE_SERVICE_MATCH_DETAIL: {
    endpoint: "financeService/matchDetail",
    types: typeCreator("CALL_FINANCE_SERVICE_MATCH_DETAIL")
  },
  CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL: {
    endpoint: "financeService/createNewDetail",
    types: typeCreator("CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL")
  },
  CALL_AFTER_REPAYMENT_ORDER_CHANGE_STATUS: {
    endpoint: "afterRepaymentOrder/changeStatus",
    types: typeCreator("CALL_AFTER_REPAYMENT_ORDER_CHANGE_STATUS")
  },
  CALL_AFTER_REPAYMENT_ORDER_SEARCH: {
    endpoint: "afterRepaymentOrder/search",
    types: typeCreator("CALL_AFTER_REPAYMENT_ORDER_SEARCH")
  },
  CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL: {
    endpoint: "afterRepaymentOrder/matchDetail",
    types: typeCreator("CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL")
  },
  CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL: {
    endpoint: "afterRepaymentOrder/createNewDetail",
    types: typeCreator("CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL")
  },
  CALL_CERTIFICATE_HOST_GET: {
    endpoint: "personalCertificate/get",
    types: typeCreator("CALL_CERTIFICATE_HOST_GET")
  },
  CALL_ENTERPRISE_PUBLICITY_SEARCH: {
    endpoint: "enterprisePublicity/search",
    types: typeCreator("CALL_ENTERPRISE_PUBLICITY_SEARCH")
  },
  CALL_ENTERPRISE_PUBLICITY_SEARCH_EXPORT: {
    endpoint: "enterprisePublicity/searchExport",
    types: typeCreator("CALL_ENTERPRISE_PUBLICITY_SEARCH_EXPORT")
  },
  CALL_MATCH_ENTERPRISE_PUBLICITY: {
    endpoint: "enterprisePublicity/match",
    types: typeCreator("CALL_MATCH_ENTERPRISE_PUBLICITY")
  },
  CALL_CREATE_ENTERPRISE_PUBLICITY: {
    endpoint: "enterprisePublicity/create",
    types: typeCreator("CALL_CREATE_ENTERPRISE_PUBLICITY")
  },
  CALL_PERSONAL_PUBLICITY_SEARCH: {
    endpoint: "personalPublicity/search",
    types: typeCreator("CALL_PERSONAL_PUBLICITY_SEARCH")
  },
  CALL_PERSONAL_PUBLICITY_SEARCH_EXPORT: {
    endpoint: "personalPublicity/searchExport",
    types: typeCreator("CALL_PERSONAL_PUBLICITY_SEARCH_EXPORT")
  },
  CALL_MATCH_PERSONAL_PUBLICITY: {
    endpoint: "personalPublicity/match",
    types: typeCreator("CALL_MATCH_PERSONAL_PUBLICITY")
  },
  CALL_CREATE_PERSONAL_PUBLICITY: {
    endpoint: "personalPublicity/create",
    types: typeCreator("CALL_CREATE_PERSONAL_PUBLICITY")
  },
  CALL_COOPERATOR_API_ASSET_QUERY: {
    endpoint: "cooperatorApiAsset/search",
    types: typeCreator("CALL_COOPERATOR_API_ASSET_QUERY")
  },
  CALL_COOPERATOR_API_ASSET_DELETE: {
    endpoint: "cooperatorApiAsset/delete",
    types: typeCreator("CALL_COOPERATOR_API_ASSET_DELETE")
  },
  CALL_COOPERATOR_API_ASSET_UPDATE: {
    endpoint: "cooperatorApiAsset/update",
    types: typeCreator("CALL_COOPERATOR_API_ASSET_UPDATE")
  },
  CALL_COOPERATOR_API_ASSET_CREATE: {
    endpoint: "cooperatorApiAsset/create",
    types: typeCreator("CALL_COOPERATOR_API_ASSET_CREATE")
  },
  CALL_COOPERATOR_API_FUND_QUERY: {
    endpoint: "cooperatorApiFund/search",
    types: typeCreator("CALL_COOPERATOR_API_FUND_QUERY")
  },
  CALL_COOPERATOR_API_FUND_DELETE: {
    endpoint: "cooperatorApiFund/delete",
    types: typeCreator("CALL_COOPERATOR_API_FUND_DELETE")
  },
  CALL_COOPERATOR_API_FUND_UPDATE: {
    endpoint: "cooperatorApiFund/update",
    types: typeCreator("CALL_COOPERATOR_API_FUND_UPDATE")
  },
  CALL_COOPERATOR_API_FUND_CREATE: {
    endpoint: "cooperatorApiFund/create",
    types: typeCreator("CALL_COOPERATOR_API_FUND_CREATE")
  },
  CALL_USER_ATTRIBUTE_QUERY: {
    endpoint: "userAttribute/search",
    types: typeCreator("CALL_USER_ATTRIBUTE_QUERY")
  },
  CALL_USER_ATTRIBUTE_SAVE: {
    endpoint: "userAttribute/save",
    types: typeCreator("CALL_USER_ATTRIBUTE_SAVE")
  },
  CALL_USER_ATTRIBUTE_PRODUCT_DEADLINE: {
    endpoint: "userAttribute/productDeadline",
    types: typeCreator("CALL_USER_ATTRIBUTE_PRODUCT_DEADLINE")
  },
  CALL_USER_ATTRIBUTE_MANAGEMENT_QUERY: {
    endpoint: "userAttributeManagement/search",
    types: typeCreator("CALL_USER_ATTRIBUTE_MANAGEMENT_QUERY")
  },
  CALL_GET_CAPTCHA: {
    endpoint: "getCaptcha",
    types: typeCreator("CALL_GET_CAPTCHA")
  },
  CALL_LOGOUT: {
    endpoint: "logout",
    types: typeCreator("CALL_LOGOUT")
  },
  CALL_COOPERATOR_BUSINESS_SPECIFICA_QUERY: {
    endpoint: "cooperatorBusinessSpecifica/search",
    types: typeCreator("CALL_COOPERATOR_BUSINESS_SPECIFICA_QUERY")
  },
  CALL_SUB_USER_MANAGEMENT_ROLE_QUERY: {
    endpoint: "subuserManagement/roleSearch",
    types: typeCreator("CALL_SUB_USER_MANAGEMENT_ROLE_QUERY")
  },
  CALL_WITHDRAW: {
    endpoint: "withdraw/search",
    types: typeCreator("CALL_WITHDRAW")
  },
  /*CALL_CHECK_USER_INFO_INTEGRITY: {
    endpoint: "checkUserInfoIntegrity",
    types: typeCreator("CALL_CHECK_USER_INFO_INTEGRITY")
  },*/
  RESET_SUPPLEMENT_ASSET_ORDER: Symbol("RESET_SUPPLEMENT_ASSET_ORDER"),
  RESET_CORP_SUPPLEMENT_ASSET_ORDER: Symbol("RESET_CORP_SUPPLEMENT_ASSET_ORDER"),
  RESET_SUPPLEMENT_CORP_ASSET_ORDER: Symbol("RESET_SUPPLEMENT_CORP_ASSET_ORDER"),
  RESET_ASSET_ORDER: Symbol("RESET_ASSET_ORDER"),
  RESET_CORP_ASSET_ORDER: Symbol("RESET_CORP_ASSET_ORDER"),
  RESET_CORP_CREDIT: Symbol("RESET_CORP_CREDIT"),
  RESET_SUPPLEMENT_CORP_CREDIT: Symbol("RESET_SUPPLEMENT_CORP_CREDIT"),
  RESET_CORP_AUTH_DETAIL: Symbol("RESET_CORP_AUTH_DETAIL"),
  RESET_CORP_AUTH_CREDIT_DETAIL: Symbol("RESET_CORP_AUTH_CREDIT_DETAIL"),
  RESET_FILTERED_CORP_AUTH_VOUCHER: Symbol("RESET_FILTERED_CORP_AUTH_VOUCHER"),
  RESET_CORP_AUTH_VOUCHER: Symbol("RESET_CORP_AUTH_VOUCHER"),
  RESET_CORP_ORDER_REPAYMENT: Symbol("RESET_CORP_ORDER_REPAYMENT"),
  RESET_CORP_ORDER_VOUCHER: Symbol("RESET_CORP_ORDER_VOUCHER"),
  RESET_CORP_ORDER_CONTRACT: Symbol("RESET_CORP_ORDER_CONTRACT"),
  RESET_CORP_ORDER_SERVICE: Symbol("RESET_CORP_ORDER_SERVICE"),
  RESET_CORP_ORDER_PAYMENT: Symbol("RESET_CORP_ORDER_PAYMENT"),
  RESET_CORP_ORDER_ADVANCE: Symbol("RESET_CORP_ORDER_ADVANCE"),
  RESET_CORP_ORDER_ACCOUNT: Symbol("RESET_CORP_ORDER_ACCOUNT"),
  RESET_FILTERED_CORP_ORDER_VOUCHER: Symbol("RESET_FILTERED_CORP_ORDER_VOUCHER"),
  RESET_MATCH_FEE: Symbol("RESET_MATCH_FEE"),
  FUND_WEEK_RESET: Symbol("FUND_WEEK_RESET"),
  RESET_CERTIFICATE: Symbol("RESET_CERTIFICATE"),
  RESET_MESSAGE: Symbol("RESET_MESSAGE"),
  RESET_OPER_LOG: Symbol("RESET_OPER_LOG"),
  RESET_ORDER_REPAYMENT: Symbol("RESET_ORDER_REPAYMENT"),
  RESET_ORDER_VOUCHER: Symbol("RESET_ORDER_VOUCHER"),
  RESET_ORDER_CONTRACT: Symbol("RESET_ORDER_CONTRACT"),
  RESET_ORDER_SERVICE: Symbol("RESET_ORDER_SERVICE"),
  RESET_ORDER_PAYMENT: Symbol("RESET_ORDER_PAYMENT"),
  RESET_ORDER_ADVANCE: Symbol("RESET_ORDER_ADVANCE"),
  RESET_ORDER_UPLOAD_DETAIL: Symbol("RESET_ORDER_UPLOAD_DETAIL"),
  RESET_CORP_ORDER_UPLOAD_DETAIL: Symbol("RESET_CORP_ORDER_UPLOAD_DETAIL"),
  RESET_CORP_AUTH_UPLOAD_DETAIL: Symbol("RESET_CORP_AUTH_UPLOAD_DETAIL"),
  RESET_FILTERED_ORDER_VOUCHER: Symbol("RESET_FILTERED_ORDER_VOUCHER"),
  RESET_ORDER_ACCOUNT: Symbol("RESET_ORDER_ACCOUNT"),
  RESET_ORDER_CREDIT: Symbol("RESET_ORDER_CREDIT"),
  RESET_CORP_ORDER_CREDIT: Symbol("RESET_CORP_ORDER_CREDIT"),
  RESET_ENTERPRISE_PUBLICITY: Symbol("RESET_ENTERPRISE_PUBLICITY"),
  RESET_PERSONAL_PUBLICITY: Symbol("RESET_PERSONAL_PUBLICITY"),
  RESET_COOPERATOR_ACCOUNT_INFO: Symbol("RESET_COOPERATOR_ACCOUNT_INFO"),
  RESET_FINANCE_SERVICE: Symbol("RESET_FINANCE_SERVICE"),
  RESET_FINANCE_REPAYMENT: Symbol("RESET_FINANCE_REPAYMENT"),
  RESET_FINANCE_LOAN: Symbol("RESET_FINANCE_LOAN"),
  RESET_AFTER_REPAYMENT_ORDER: Symbol("RESET_AFTER_REPAYMENT_ORDER"),
  LOGOUT: "LOGOUT",
  PROCESS_ACTION: "PROCESS_ACTION",
}

const selectMenu = (body) => {
  return {
    type: "SELECT_MENU",
    selection: body
  }
}

// 将set message和select menu单独提出来，不参与业务架构
const _ACTIONS = {
  ...ACTIONS,
  SET_MESSAGE: (message, messageType) =>  (dispatch, getState) => (dispatch({type: "SET_MESSAGE", message, messageType})),
  SELECT_MENU: (Selectors => (body) => (dispatch, getState) => {
    if (!body) {
      return
    }
    const state = getState()
    const {dictionary} = state
    const {menu} = dictionary
    if (!menu || !menu.length) {
      return dispatch(selectMenu({entry: undefined, subentry: undefined, subentryParent: undefined}))
    } else if (body.subentry) {
      let id = body.subentry.includes(".") ? body.subentry.split(".")[0] : body.subentry
      let subentry = Selectors.getMenuEntities(state).entities.submenu[id]
      let entry = Selectors.getMenuEntities(state).entities.menu[subentry.parent]
      if (!body.entry) {
        return dispatch(selectMenu({entry: entry.id, subentry: subentry.id, entryEntity: entry, subentryEntity: subentry}))
      } else if (body.entry == -1) {
        return dispatch(selectMenu({entry: undefined, subentry: body.subentry, entryEntity: entry, subentryEntity: subentry}))
      } else {
        return dispatch(selectMenu({...body, entryEntity: entry, subentryEntity: subentry}))
      }
    }
  })(Selectors),
}

// 利用redux thunk对action做各种处理
var _actions = {}
Object.keys(_ACTIONS).forEach(r => {
  if (_ACTIONS[r] && _ACTIONS[r].types && _ACTIONS[r].types.request) {
    /** 使用redux thunk来生成action*/
    _actions[r] = ((r, a) => (body, opt) => {
      return (dispatch) => {
        return dispatch({
          [r]: {
            types: Object.keys(a[r].types).map(t => a[r].types[t]),
            endpoint: a[r].endpoint,
            body: body,
            opt
            //schema: Schemas.USER,opt
          }
        })
      }
    })(r, _ACTIONS)
  } else if (typeof _ACTIONS[r] === "string" || typeof _ACTIONS[r] === 'symbol') {
    /** 纯类型型action*/
    _actions[r] = () => ({
      type: _ACTIONS[r]
    })
  } else if (typeof _ACTIONS[r] === "function") {
    /** 自定义action*/
    _actions[r] = _ACTIONS[r]
  }
})
export const actions = _actions
