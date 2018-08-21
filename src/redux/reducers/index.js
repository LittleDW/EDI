/**
 * 作者：石奇峰
 * 功能：Edi的reducer，一般一个业务模块一个reducer
 * */

import {ACTIONS} from '../actions'
import {combineReducers} from 'redux'
import corpOrders from './corpOrder'
import corpAuth from './corpAuth'
import fundStatistics from './fundStatistics'
import adminStatistics from './adminStatistics'
import settleMethod from './settleMethod'
import balanceStatistics from './balanceStatistics'
import afterRepaymentStatistics from './afterRepaymentStatistics'
import message from './message'

const _session = (state = null, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_LOGIN.types.request:
      return null
    case ACTIONS.CALL_LOGIN.types.fail:
      return null
    case ACTIONS.CALL_LOGOUT.types.success:
      return null
    case ACTIONS.CALL_LOGIN.types.success:
      return response._session
    case ACTIONS.LOGOUT:
      return null
    case ACTIONS.CALL_USERINFO.types.success:
      return {...state, ...response.data}
    default:
      return state
  }
}

const menuSelection = (state = {entry: undefined, subentry: undefined}, action) => {
  const {type, error, selection} = action
  if (type === "SELECT_MENU") {
    return selection
  } else if (type == ACTIONS.CALL_LOGOUT.types.success) {
    return {entry: undefined, subentry: undefined}
  }
  return state
}

const dictionary = (state = {menu: [], dictionary: [], relatedOrgs: [], deadlineList: [], fundAccounts:[],assetAccounts:[],dependencies:[]}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_DIC.types.success:
      return response
    case ACTIONS.CALL_DIC.types.fail:
      return state
    case ACTIONS.CALL_LOGOUT.types.success:
      return {menu: [], dictionary: [], relatedOrgs: [], fundAccounts:[], assetAccounts:[],dependencies:[]}
    default:
      return state
  }
}

const loginLogs = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_LOGIN_LOG.types.success) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_LOGIN_LOG.types.fail) {
    return state
  }
  return state
}

const operTableLogs = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_OPER_TABLE_LOG_SEARCH.types.success) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_OPER_TABLE_LOG_SEARCH.types.fail) {
    return state
  }
  return state
}

const platformUseFee = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_PLATFORM_USE_FEE_PAY_SEARCH.types.success
    || type === ACTIONS.CALL_PLATFORM_USE_FEE_FEE_SEARCH.types.success) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_PLATFORM_USE_FEE_FEE_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.user_id == row.user_id) && (Object.assign(r, {...row})))
    return {...state}
  } else if (type === ACTIONS.CALL_PLATFORM_USE_FEE_BILL_SEARCH.types.success) {
    return {rows: response.rows, total: response.total, order_fee_total: response.order_fee_total, platform_use_fee_total: response.platform_use_fee_total, finish_pay_fee_total: response.finish_pay_fee_total}
  } else if (type === ACTIONS.CALL_PLATFORM_USE_FEE_EMAIL_SEARCH.types.success) {
    return {...state, emails: response.emails}
  } else if (type === ACTIONS.CALL_PLATFORM_USE_FEE_BILL_REDUCE.types.success) {
    return {...state}
  }
  return state
}

const managedUsers = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_USER_MANAGEMENT_QUERY.types.success)) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_LOGIN_LOG.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_USER_MANAGEMENT_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.user_id == row.user_id) && (Object.assign(r, {...row})))
    return {...state}
  } else if (type === ACTIONS.CALL_USER_MANAGEMENT_AUTH_SEARCH.types.success) {
    return {...state, menus: response.menus, checked: response.checked, expanded: response.expanded}
  } else if (error) {
    return state
  }

  return state
}

const managedSubUsers = (state = {rows: [], total: 0, menus: [], checked: [], restriction:[], restrictionFlag: false}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_SUB_USER_MANAGEMENT_QUERY.types.success)) {
    return {rows: response.rows, total: response.total}
  } else if ((type === ACTIONS.CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY.types.request) || (type === ACTIONS.CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY.types.fail)) {
    return {...state, restrictionData: [], restrictionFlag: false}
  } else if ((type === ACTIONS.CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY.types.success)) {
    return {...state, restrictionData: response.rows, restrictionFlag: response.restrictionFlag}
  } else if (type === ACTIONS.CALL_LOGIN_LOG.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_SUB_USER_MANAGEMENT_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.sub_user_id == row.sub_user_id) && (Object.assign(r, {...row})))
    return {...state}
  }
  else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_FUNC_SEARCH.types.success) {
    return {...state, checked: response.checked };
  } else if (type === ACTIONS.CALL_SUB_USER_MANAGEMENT_AUTH_SEARCH.types.success) {
    return {...state, menus: response.menus, checked: response.checked, expanded: response.expanded}
  } else if (error) {
    return state
  }

  return state
}

const managedMenus = (state = {menus: [], detail: {}}, action) => {
  const {type, error, response} = action

  if ((type === ACTIONS.CALL_MENU_MANAGEMENT_QUERY.types.success) || (type === ACTIONS.CALL_MENU_MANAGEMENT_CREATE.types.success) || (type === ACTIONS.CALL_MENU_MANAGEMENT_UP.types.success) || (type === ACTIONS.CALL_MENU_MANAGEMENT_DOWN.types.success)) {
    return {...state, menus: response.menus}
  } else if (type === ACTIONS.CALL_LOGIN_LOG.types.fail) {
    return state
  } else if ((type === ACTIONS.CALL_MENU_MANAGEMENT_UPDATE.types.success) || (type === ACTIONS.CALL_MENU_MANAGEMENT_DELETE.types.success)) {
    return {...state, menus: response.menus, detail: response.detail}
  } else if (type === ACTIONS.CALL_MENU_MANAGEMENT_DETAIL.types.success) {
    return {...state, detail: response.detail}
  } else if (error) {
    return state
  }

  return state
}

const cooperatorInfo = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_COOPERATOR_INFO_QUERY.types.success) || (type === ACTIONS.CALL_COOPERATOR_INFO_CREATE.types.success)
    || (type === ACTIONS.CALL_COOPERATOR_INFO_DELETE.types.success) || (type === ACTIONS.CALL_COOPERATOR_INFO_ADD_RELATION.types.success)
    || (type === ACTIONS.CALL_COOPERATOR_INFO_SUPPLY_INFO.types.success)) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_LOGIN_LOG.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_COOPERATOR_INFO_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.fund_org_code == row.fund_org_code && r.asset_org_code == row.asset_org_code) && (Object.assign(r, {...row})))
    return {...state}
  } else if ((type === ACTIONS.CALL_COOPERATOR_INFO_SEARCH_RELATION.types.success) || (type === ACTIONS.CALL_COOPERATOR_INFO_SEARCH_ADDED_RELATION.types.success)) {
    return {...state, relationRows: response.rows}
  } else if (error) {
    return state
  }

  return state
}

const  cooperatorApiAsset = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_COOPERATOR_API_ASSET_QUERY.types.success)) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_COOPERATOR_API_ASSET_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.asset_org_code == row.asset_org_code && r.api_type == row.api_type) && (Object.assign(r, {...row})))
    return {...state}
  }
  else if (error) {
    return state
  }

  return state
}

const cooperatorApiFund = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_COOPERATOR_API_FUND_QUERY.types.success) ) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_COOPERATOR_API_FUND_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.fund_org_code == row.fund_org_code && r.api_type == row.api_type) && (Object.assign(r, {...row})))
    return {...state}
  }
  else if (error) {
    return state
  }

  return state
}
const cooperatorAccount = (state = {rows: [], total: 0, working: true}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  switch(type){
    case ACTIONS.CALL_COOPERATOR_ACCOUNT_INFO_QUERY.types.success:
      return {rows: response.rows, total: response.total, working: false}
    case ACTIONS.CALL_COOPERATOR_ACCOUNT_INFO_QUERY.types.request:
      return {...state, working: true}
    case ACTIONS.RESET_COOPERATOR_ACCOUNT_INFO:
    case ACTIONS.CALL_COOPERATOR_ACCOUNT_INFO_QUERY.types.fail:
      return {rows: [], total: 0, working: false}
    default:
      return state
  }

  return state
}

const userAttribute = (state = {userData: {}, deadline: []}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_USER_ATTRIBUTE_QUERY.types.success)) {
    return {...state, userData: response.rows}
  } else if  (type === ACTIONS.CALL_USER_ATTRIBUTE_PRODUCT_DEADLINE.types.success){
    return {...state, deadline: response.data}
  } else if (error) {
    return state
  }

  return state
}

const userAttributeManagement = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_USER_ATTRIBUTE_MANAGEMENT_QUERY.types.success)) {
    return {...state, rows: response.rows, total: response.total}
  }  else if (error) {
    return state
  }

  return state
}

const managedRoles = (state = {rows: [], total: 0, menus: [], checked: [],userRows:[]}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if ((type === ACTIONS.CALL_ROLE_MANAGEMENT_QUERY.types.success) || (type === ACTIONS.CALL_ROLE_MANAGEMENT_CREATE.types.success) || (type === ACTIONS.CALL_ROLE_MANAGEMENT_DELETE.types.success)) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_LOGIN_LOG.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.role_id == row.role_id) && (Object.assign(r, {...row})))
    return {...state}
  } else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_FUNC_SEARCH.types.success) {
    return {...state, menus: response.menus, checked: response.checked, expanded: response.expanded}
  } else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_USER_SEARCH.types.success) {
    return {...state, userRows: response.userRows}
  } else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_USER_SEARCH.types.request) {
    return {...state, userRows: []}
  }else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_USER_ADD.types.success) {
    return {...state, userRows: response.userRows}
  }else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_USER_ADD.types.request) {
    return {...state, userRows: []}
  }else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_USER_DELETE.types.success) {
    return {...state, userRows: response.userRows}
  }else if (type === ACTIONS.CALL_ROLE_MANAGEMENT_USER_DELETE.types.request) {
    return {...state, userRows: []}
  }
  else if (error) {
    return state
  }

  return state
}

/**
 * 作者：石奇峰
 * 功能：Edi的reducer，负责个人订单
 * 相似：企业订单，企业授信的reducer
 * */
const orders = (state = {
  orders: {rows: [],
    total: 0,
    fee: 0,
    detail: null,
    contractList: [],
    serviceList: [],
    voucherList: [],
    deadLines: [],},
  allVouchers: [],
  orderRepayment: {rows: [], total: 0},
  orderPayment: {rows: [], total: 0},
  orderAdvance: {rows: [], total: 0},
  orderAccount: {rows: [], total: 0},
  orderCredit: [],
}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_ORDER.types.success:
      return {...state, orders:{rows: response.rows, total: response.total, fee: response.fee, deadLines: response.deadLines}}
    case ACTIONS.CALL_ORDER.types.fail:
      return {...state, orders:{rows: [], total: 0, fee: 0, deadLines: []}}
    case ACTIONS.CALL_ORDER_CONTRACT.types.success:
      return {...state, contractList: response.rows}
    case ACTIONS.CALL_ORDER_SERVICE.types.success:
      return {...state, serviceList: response.rows}
    case ACTIONS.RESET_ORDER_VOUCHER:
      return {...state, voucherList: []}
    case ACTIONS.CALL_ORDER_VOUCHER.types.success:
      return {...state, voucherList: response.rows}
    case ACTIONS.CALL_FILTER_ORDER_VOUCHER.types.success:
      return {...state, allVouchers: response.rows}
    case ACTIONS.CALL_FILTER_ORDER_VOUCHER.types.request:
      return {...state, allVouchers: []}
    case ACTIONS.RESET_FILTERED_ORDER_VOUCHER:
      return {...state, allVouchers: []}
    case ACTIONS.RESET_ORDER_CONTRACT:
      return {...state, contractList: []}
    case ACTIONS.RESET_ORDER_SERVICE:
      return {...state, serviceList: []}
    case ACTIONS.CALL_ORDER_REPAYMENT.types.success:
      return {...state, orderRepayment: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_ORDER_REPAYMENT:
      return {...state, orderRepayment: {rows: [], total: 0}}
    case ACTIONS.CALL_ORDER_PAYMENT.types.success:
      return {...state, orderPayment: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_ORDER_PAYMENT:
      return {...state, orderPayment: {rows: [], total: 0}}
    case ACTIONS.CALL_ORDER_ADVANCE.types.success:
      return {...state, orderAdvance: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_ORDER_ADVANCE:
      return {...state, orderAdvance: {rows: [], total: 0}}
    case ACTIONS.CALL_ORDER_ACCOUNT.types.success:
      return {...state, orderAccount: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_ORDER_ACCOUNT:
      return {...state, orderAccount: {rows: [], total: 0}}
    case ACTIONS.CALL_ORDER_CREDIT.types.success:
      return {...state, orderCredit: response.rows}
    case ACTIONS.RESET_ORDER_CREDIT:
      return {...state, orderCredit: []}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_MATCH.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_MATCH.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_MATCH.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_CREATE.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_CREATE.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_ORDER_CHECK_RESULT_CREATE.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_MATCH.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_MATCH.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_MATCH.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_CREATE.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_CREATE.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_ORDER_ACCOUNT_DETAIL_CREATE.types.fail:
      return {...state, working: false}
    case ACTIONS.RESET_ORDER_UPLOAD_DETAIL:
      return {...state, detail: null}
    default:
      return state
  }
}
//edit by zby 20171215
const assetAccount = (state = {assetRows: [], fundRows: []}, action) => {
  const {type, error, response} = action
  // 搜索时候不清空
  if (type === ACTIONS.CALL_ASSET_ACCOUNT.types.success) {
    return {...response}
  } else if (type === ACTIONS.CALL_ASSET_ACCOUNT.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_ASSET_ACCOUNT_UPDATE.types.success) {

    var row = response.data;

    if (response.user_type=='1')
    {
      row && state.assetRows.map(r => (r.asset_org_code == row.asset_org_code) && (r.fund_org_code == row.fund_org_code) && (r.account_purpose == row.account_purpose) && (Object.assign(r, {...row})))
    }
    else
    {
      row && state.fundRows.map(r => (r.asset_org_code == row.asset_org_code) && (r.fund_org_code == row.fund_org_code) && (r.account_purpose == row.account_purpose) && (Object.assign(r, {...row})))
    }

    return {...state}
  } else if (error) {
    return state
  }

  return state
}

const repaymentPlan = (state = {rows: []}, action) => {
  const {type, error, response} = action
  // 搜索时候不清空
  if (type === ACTIONS.CALL_REPAYMENT_PLAN.types.success) {
    return {...response}
  } else if (type === ACTIONS.CALL_REPAYMENT_PLAN.types.fail || type === ACTIONS.CALL_REPAYMENT_PLAN.types.request) {
    return state
  } else if (error) {
    return state
  }

  return state
}

const operLogModal = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action
  // 搜索时候不清空
  if ((type === ACTIONS.CALL_OPER_LOG_MODAL.types.success)||(type === ACTIONS.CALL_OPER_LOG_COMBINED_MODAL.types.success)) {
    return {...response}
  } else if ((type === ACTIONS.CALL_OPER_LOG_MODAL.types.fail) || (type === ACTIONS.CALL_OPER_LOG_COMBINED_MODAL.types.success)) {
    return state
  } else if (type === ACTIONS.RESET_OPER_LOG) {
    return {rows: [], total: 0}
  } else if (error) {
    return state
  }

  return state
}

const require = (state = {
  readOnly: true,
  data: [],
  deadlineData: [],
  hisList: [],
  total: 0
}, action) => {
  const {type, error, response} = action
  // 搜索时候不清空
  if (type === ACTIONS.CALL_REQWEEK.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_REQWEEK_HISTORY.types.success) {
    const {hisList, total} = response
    return {...state, hisList, total}
  } else if (type === ACTIONS.CALL_REQWEEK.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_REQWEEK_HISTORY.types.fail) {
    return state
  }
  return state
}

const collect = (state = {
  readOnly: true,
  data: [],
  deadlineData: [],
  total: 0,
  hisList: []
}, action) => {
  const {type, error, response} = action
  // 搜索时候不清空
  if (type === ACTIONS.CALL_COLWEEK.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_COLWEEK_HISTORY.types.success) {
    const {hisList, total} = response
    return {...state, hisList, total}
  } else if (type === ACTIONS.CALL_COLWEEK.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_COLWEEK_HISTORY.types.fail) {
    return state
  }

  return state
}

const distriPlan = (state = {
  readOnly: true,
  userAttr: {},
  data: [],
  deadlineData: [],
  total: 0,
  hisList: []
}, action) => {
  const {type, error, response} = action
  // 搜索时候不清空
  if (type === ACTIONS.CALL_DISTRIPLAN.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_DISTRIPLAN.types.fail) {
    return {...state, data: [], deadlineData: []}
  } else if (type === ACTIONS.CALL_USER_ATTRIBUTE_QUERY.types.success) {
    const {rows} = response
    return {...state, userAttr: {...rows}}
  } else if (type === ACTIONS.CALL_DISTRIPLAN_UPDATE.types.success) {
    return {...state}
  } else if (type === ACTIONS.CALL_DISTRIPLAN_HISTORY.types.success) {
    const {hisList, total} = response
    return {...state, hisList, total}
  }
  return state
}

const fundSupply = (state = {
  weekList: [],
  dailyList: [],
  assetList: [],
  fundList: []
}, action) => {
  const {type, error, response} = action
  // 搜索时候不清空
  if (type === ACTIONS.CALL_FUND_SUPPLY_WEEKLY.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_FUND_SUPPLY_DAILY.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_FUND_SUPPLY_REQUIRE.types.success) {
    return {...state, assetList: response.deadlineData}
  } else if (type === ACTIONS.CALL_FUND_SUPPLY_REQUIRE.types.fail) {
    return {...state, assetList: []}
  } else if (type === ACTIONS.CALL_FUND_SUPPLY_COLLECT.types.success) {
    return {...state, fundList: response.deadlineData}
  } else if (type === ACTIONS.CALL_FUND_SUPPLY_COLLECT.types.fail) {
    return {...state, fundList: []}
  }

  return state
}

const feeSetting = (state = {assetList: [], fundList: [], adminList: [], deadlineList: [], enableCaptcha: true}, action) => {
  const {type, error, response} = action
  if (type === ACTIONS.CALL_ASSET_SETTING.types.success) {
    return {...state, assetList: response.assetList, deadlineList: response.deadlineList, enableCaptcha: response.enableCaptcha}
  } else if (type === ACTIONS.CALL_ASSET_SETTING_UPDATE.types.success) {
    return {...state}
  } else if (type === ACTIONS.CALL_ASSET_SETTING_UPDATE_DEADLINE.types.success) {
    return {...state}
  } else if (type === ACTIONS.CALL_FUND_SETTING.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_ADMIN_SETTING.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_ADMIN_SETTING_UPDATE.types.success) {
    return {...state, ...response}
  } else if (type === ACTIONS.CALL_FUND_SETTING_UPDATE.types.success) {
    return {...state, ...response}
  }
  return state
}

const repayment = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_REPAYMENT.types.success) {
    return {rows: response.rows, total: response.total}
  } else if (type === ACTIONS.CALL_REPAYMENT.types.fail) {
    return state
  } else if (type === ACTIONS.CALL_REPAYMENT_UPDATE.types.success) {
    var row = response.data;
    row && state.rows.map(r => (r.fund_org_code == row.fund_org_code) && (r.asset_org_code == row.asset_org_code) && (r.repayment_date == row.repayment_date) && (Object.assign(r, {...row})))
    return {...state}
  } else if (error) {
    return state
  }

  return state
}

const operLog = (state = {rows: [], total: 0}, action) => {
  const {type, error, response} = action

  if (type === ACTIONS.CALL_OPER_LOG_SEARCH.types.success) {
    return {rows: response.rows}
  } else if (type === ACTIONS.CALL_OPER_LOG_SEARCH.types.fail) {
    return {rows: []}
  } else if (type === ACTIONS.RESET_OPER_LOG) {
    return {rows: [], total: 0}
  } else if (error) {
    return state
  }

  return state
}

const assetOrders = (state = {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}, action) => {
  const {type, error, response, progress} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_ASSET_ORDER.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_ASSET_ORDER.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
        attachments: response.attachments,
        succeed: [],
        failed: []
      }
    }
    return {matched: [], unmatched: response && response.unmatched, attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_MATCH_ASSET_ORDER.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
      attachments: [],
      succeed: state.succeed,
      failed: state.failed
    }
  } else if (type === ACTIONS.RESET_ASSET_ORDER) {
    return {...state, matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_CREATE_ASSET_ORDER.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_CREATE_ASSET_ORDER.types.success) {
    if (response.succeed && response.succeed.length) {
      return {
        matched: [],
        unmatched: [],
        attachments: [],
        succeed: response.succeed,
        failed: response.failed
      }
    }
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: response.failed
    }
  } else if (type === ACTIONS.CALL_CREATE_ASSET_ORDER.types.fail) {
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: []
    }
  } /*else if (type === ActionTypes.CREATE_ASSET_ORDER_UPLOADING){
   return {...state,progress, ropProgress:false}
   } else if (type === ActionTypes.CREATE_ASSET_ORDER_UPLOADING_FINISH){
   return {...state, ropProgress:true}
   }  */ else if (error) {
    return state
  }

  return state
}
const corpAssetOrders = (state = {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}, action) => {
  const {type, error, response, progress} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_CORP_ASSET_ORDER.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_CORP_ASSET_ORDER.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
        attachments: response.attachments,
        succeed: [],
        failed: []
      }
    }
    return {matched: [], unmatched: response.unmatched, attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_MATCH_CORP_ASSET_ORDER.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
      attachments: [],
      succeed: state.succeed,
      failed: state.failed
    }
  } else if (type === ACTIONS.RESET_CORP_ASSET_ORDER) {
    return {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_CREATE_CORP_ASSET_ORDER.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_CREATE_CORP_ASSET_ORDER.types.success) {
    if (response.succeed && response.succeed.length) {
      return {
        matched: [],
        unmatched: [],
        attachments: [],
        succeed: response.succeed,
        failed: response.failed
      }
    }
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: response.failed
    }
  } else if (type === ACTIONS.CALL_CREATE_CORP_ASSET_ORDER.types.fail) {
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: []
    }
  } else if (error) {
    return state
  }

  return state
}

const corpCredit = (state = {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}, action) => {
  const {type, error, response, progress} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_CORP_ASSET_ORDER.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_CORP_CREDIT.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
        attachments: response.attachments,
        succeed: [],
        failed: []
      }
    }
    return {matched: [], unmatched: response.unmatched, attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_MATCH_CORP_CREDIT.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
      attachments: [],
      succeed: state.succeed,
      failed: state.failed
    }
  } else if (type === ACTIONS.RESET_CORP_CREDIT) {
    return {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_CREATE_CORP_CREDIT.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_CREATE_CORP_CREDIT.types.success) {
    if (response.succeed && response.succeed.length) {
      return {
        matched: [],
        unmatched: [],
        attachments: [],
        succeed: response.succeed,
        failed: response.failed,
        job_done: true
      }
    }
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: response.failed,
      job_done: true
    }
  } else if (type === ACTIONS.CALL_CREATE_CORP_CREDIT.types.fail) {
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: [],
      job_done: true
    }
  } else if (error) {
    return state
  }

  return state
}

const supplementAssetOrder = (state = {
  matched: [],
  unmatched: [],
  attachments: [],
  succeed: [],
  failed: []
}, action) => {
  const {type, error, response, progress} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_ASSET_ORDER.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_ASSET_ORDER.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
        attachments: response.attachments,
        succeed: [],
        failed: []
      }
    }
    return {matched: [], unmatched: response.unmatched, attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_ASSET_ORDER.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
      attachments: [],
      succeed: state.succeed,
      failed: state.failed
    }
  } else if (type === ACTIONS.RESET_SUPPLEMENT_ASSET_ORDER) {
    return {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.RESET_SUPPLEMENT_CORP_ASSET_ORDER) {
    return {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_SUPPLEMENT_ASSET_ORDER.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_SUPPLEMENT_ASSET_ORDER.types.success) {
    if (response.succeed && response.succeed.length) {
      return {
        matched: [],
        unmatched: state.unmatched,
        attachments: [],
        succeed: response.succeed,
        failed: response.failed,
        job_done: true
      }
    }
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: response.failed,
      job_done: true
    }
  } else if (type === ACTIONS.CALL_SUPPLEMENT_ASSET_ORDER.types.fail) {
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: [],
      job_done: true
    }
  } else if (error) {
    return state
  }

  return state
}

const supplementCorpAssetOrder = (state = {
  matched: [],
  unmatched: [],
  attachments: [],
  succeed: [],
  failed: []
}, action) => {
  const {type, error, response, progress} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
        attachments: response.attachments,
        succeed: [],
        failed: []
      }
    }
    return {matched: [], unmatched: response.unmatched, attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
      attachments: [],
      succeed: state.succeed,
      failed: state.failed
    }
  } else if (type === ACTIONS.RESET_CORP_SUPPLEMENT_ASSET_ORDER) {
    return {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  }  else if (type === ACTIONS.RESET_SUPPLEMENT_CORP_ASSET_ORDER) {
    return {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_CORP_SUPPLEMENT_ASSET_ORDER.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_CORP_SUPPLEMENT_ASSET_ORDER.types.success) {
    if (response.succeed && response.succeed.length) {
      return {
        matched: [],
        unmatched: state.unmatched,
        attachments: [],
        succeed: response.succeed,
        failed: response.failed,
        job_done: true
      }
    }
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: response.failed,
      job_done: true
    }
  } else if (type === ACTIONS.CALL_CORP_SUPPLEMENT_ASSET_ORDER.types.fail) {
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: [],
      job_done: true
    }
  } else if (error) {
    return state
  }

  return state
}

const supplementCorpCredit = (state = {
  matched: [],
  unmatched: [],
  attachments: [],
  succeed: [],
  failed: []
}, action) => {
  const {type, error, response, progress} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_CREDIT.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_CREDIT.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
        attachments: response.attachments,
        succeed: [],
        failed: []
      }
    }
    return {matched: [], unmatched: response.unmatched, attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_MATCH_SUPPLEMENT_CORP_CREDIT.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
      attachments: [],
      succeed: state.succeed,
      failed: state.failed
    }
  } else if (type === ACTIONS.RESET_SUPPLEMENT_CORP_CREDIT) {
    return {matched: [], unmatched: [], attachments: [], succeed: [], failed: []}
  } else if (type === ACTIONS.CALL_SUPPLEMENT_CORP_CREDIT.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_SUPPLEMENT_CORP_CREDIT.types.success) {
    if (response.succeed && response.succeed.length) {
      return {
        matched: [],
        unmatched: state.unmatched,
        attachments: [],
        succeed: response.succeed,
        failed: response.failed,
        job_done: true
      }
    }
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: response.failed,
      job_done: true
    }
  } else if (type === ACTIONS.CALL_SUPPLEMENT_CORP_CREDIT.types.fail) {
    return {
      matched: state.matched,
      unmatched: state.unmatched,
      attachments: state.attachments,
      succeed: [],
      failed: [],
      job_done: true
    }
  } else if (error) {
    return state
  }

  return state
}

const financeLoan = (state = {rows: [], total: 0, logs: [],detail:null, working:false}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_FINANCE_LOAN_SEARCH.types.success:
      return {rows: response.rows, total: response.total, logs:[], detail:null, working: false}
    case ACTIONS.CALL_FINANCE_LOAN_SEARCH.types.fail:
    case ACTIONS.RESET_FINANCE_LOAN:
      return {...state, logs:[], detail:null, working: false}
    case ACTIONS.CALL_FINANCE_LOAN_SEARCH.types.request:
      return {...state, logs:[], detail:null, working: true}
    case ACTIONS.CALL_FINANCE_LOAN_MATCH_DETAIL.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_FINANCE_LOAN_MATCH_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_FINANCE_LOAN_MATCH_DETAIL.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL.types.success:
      return {...state, detail: null, working: false}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_NEW_DETAIL.types.success:
      return {...state, detail: null, working: false}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_NEW_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_FINANCE_LOAN_CREATE_NEW_DETAIL.types.fail:
      return {...state, working: false}
    default:
      return state
  }
}

const financeRepayment = (state = {rows: [], total: 0, logs: [],detail:null, working:false}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_FINANCE_REPAYMENT_SEARCH.types.success:
      return {rows: response.rows, total: response.total, logs:[], detail:null, working: false}
    case ACTIONS.CALL_FINANCE_REPAYMENT_SEARCH.types.fail:
    case ACTIONS.RESET_FINANCE_REPAYMENT:
      return {...state, logs:[], detail:null, working: false}
    case ACTIONS.CALL_FINANCE_REPAYMENT_SEARCH.types.request:
      return {...state, logs:[], detail:null, working: true}
    case ACTIONS.CALL_FINANCE_REPAYMENT_MATCH_DETAIL.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_FINANCE_REPAYMENT_MATCH_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_FINANCE_REPAYMENT_MATCH_DETAIL.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL.types.success:
      return {...state, detail: null, working: false}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL.types.fail:
      return {...state, working: false}
    default:
      return state
  }
}

const financeService = (state = {rows: [], total: 0, logs: [],detail:null, working:false}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_FINANCE_SERVICE_SEARCH.types.success:
      return {rows: response.rows, total: response.total, logs:[], detail:null, working: false}
    case ACTIONS.CALL_FINANCE_SERVICE_SEARCH.types.fail:
    case ACTIONS.RESET_FINANCE_SERVICE:
      return {...state, logs:[], detail:null, working: false}
    case ACTIONS.CALL_FINANCE_SERVICE_SEARCH.types.request:
      return {...state, logs:[], detail:null, working: true}
    case ACTIONS.CALL_FINANCE_SERVICE_MATCH_DETAIL.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_FINANCE_SERVICE_MATCH_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_FINANCE_SERVICE_MATCH_DETAIL.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL.types.success:
      return {...state, detail: null, working: false}
    case ACTIONS.CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL.types.fail:
      return {...state, working: false}
    default:
      return state
  }
}

const afterRepaymentOrder = (state = {rows: [], total: 0, logs: [],detail:null, working:false}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_SEARCH.types.success:
      return {rows: response.rows, total: response.total, logs:[], detail:null, working: false}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_SEARCH.types.fail:
    case ACTIONS.RESET_AFTER_REPAYMENT_ORDER:
      return {...state, logs:[], detail:null, working: false}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_SEARCH.types.request:
      return {...state, logs:[], detail:null, working: true}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL.types.success:
      return {...state, detail: null, working: false}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL.types.fail:
      return {...state, working: false}
    default:
      return state
  }
}

const certificate = (state = {certificateUrl: null}, action) => {
  const {type, error, response} = action

  if (type === ACTIONS.CALL_CERTIFICATE_HOST_GET.types.success) {
    return {certificateUrl: response.certificateUrl}
  } else if (type === ACTIONS.RESET_CERTIFICATE) {
    return {certificateUrl: null}
  } else {
    return {certificateUrl: null}
  }
}

const enterprisePublicity = (state ={data: {rows: [], totalRow: 0, totalCount: 0, success: 0, fail: 0}}, action) => {
  const {type, error, response} = action

  if (type === ACTIONS.CALL_ENTERPRISE_PUBLICITY_SEARCH.types.success) {
    return {data: {rows: response.rows, totalRow: response.totalItemCount, totalCount: response.totalCount, success: response.successCount, fail: response.failCount}}
  } else if (type === ACTIONS.CALL_ENTERPRISE_PUBLICITY_SEARCH.types.fail) {
    return {data: {rows: [], totalRow: 0, totalCount: 0, success: 0, fail: 0}}
  } else {
    return state
  }
}

const personalPublicity = (state ={data: {rows: [], totalRow: 0, totalCount: 0, success: 0, fail: 0}}, action) => {
  const {type, error, response} = action

  if (type === ACTIONS.CALL_PERSONAL_PUBLICITY_SEARCH.types.success) {
    return {data: {rows: response.rows, totalRow: response.totalItemCount, totalCount: response.totalCount, success: response.successCount, fail: response.failCount}}
  } else if (type === ACTIONS.CALL_PERSONAL_PUBLICITY_SEARCH.types.fail) {
    return {data: {rows: [], totalRow: 0, totalCount: 0, success: 0, fail: 0}}
  } else {
    return state
  }
}

const enterprisePublicityDetail = (state = {matched: [], unmatched: [],}, action) => {
  const {type, error, response, progress} = action

  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_ENTERPRISE_PUBLICITY.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_ENTERPRISE_PUBLICITY.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
      }
    }
    return {matched: [], unmatched: response.unmatched}
  } else if (type === ACTIONS.CALL_MATCH_ENTERPRISE_PUBLICITY.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
    }
  } else if (type === ACTIONS.RESET_ENTERPRISE_PUBLICITY) {
    return {matched: [], unmatched: []}
  } else if (type === ACTIONS.CALL_CREATE_ENTERPRISE_PUBLICITY.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_CREATE_ENTERPRISE_PUBLICITY.types.success) {
    return {
      matched: [],
      unmatched: [],
      succeed: response.succeed,
      failed: response.failed,
      reason: response.reason,
      job_done: true
    }
    /*return {
      matched: [],
      unmatched: [],
      failed: response.failed,
      job_done: true
    }*/
  } else if (type === ACTIONS.CALL_CREATE_ENTERPRISE_PUBLICITY.types.fail) {
    return {
      matched: [],
      unmatched: [],
      job_done: true
    }
  } else if (error) {
    return state
  }

  return state
}
/*
const dependencyModules = (state = {dependencies:[]}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_CHECK_USER_INFO_INTEGRITY.types.success:
      return {dependencies: response.dependencies}
    default:
      return state
  }
}*/
const cooperatorBusinessSpecifica = (
  state = { rows: [], total: 0 },
  action
) => {
  const { type, error, response } = action;
  if (type === ACTIONS.CALL_COOPERATOR_BUSINESS_SPECIFICA_QUERY.types.success) {
    return { rows: response.data || [], total: response.total || 1 };
  } else if (
    type === ACTIONS.CALL_COOPERATOR_BUSINESS_SPECIFICA_QUERY.types.fail
  ) {
    return { rows: [] };
  } else if (error) {
    return state;
  }
  return state;
};

const personalPublicityDetail = (state = {matched: [], unmatched: [],}, action) => {
  const {type, error, response, progress} = action
  // 搜索时候不清空
  if (type === ACTIONS.CALL_MATCH_PERSONAL_PUBLICITY.types.request) {
    return {...state, matching: true}
  } else if (type === ACTIONS.CALL_MATCH_PERSONAL_PUBLICITY.types.success) {
    if (response.matched && response.matched.length) {
      return {
        matched: response.matched,
        unmatched: response.unmatched,
      }
    }
    return {matched: [], unmatched: response.unmatched}
  } else if (type === ACTIONS.CALL_MATCH_PERSONAL_PUBLICITY.types.fail) {
    return {
      matched: [],
      unmatched: response && response.unmatched || [],
    }
  } else if (type === ACTIONS.RESET_PERSONAL_PUBLICITY) {
    return {matched: [], unmatched: []}
  } else if (type === ACTIONS.CALL_CREATE_PERSONAL_PUBLICITY.types.request) {
    return {...state, creating: true}
  } else if (type === ACTIONS.CALL_CREATE_PERSONAL_PUBLICITY.types.success) {
    return {
      matched: [],
      unmatched: [],
      succeed: response.succeed,
      failed: response.failed,
      reason: response.reason,
      job_done: true
    }
  } else if (type === ACTIONS.CALL_CREATE_PERSONAL_PUBLICITY.types.fail) {
    return {
      matched: [],
      unmatched: [],
      job_done: true
    }
  } else if (error) {
    return state
  }

  return state
}

const workingAction = (state = { _actions: [] }, action) => {
  const { type, _action, token, stat } = action;

  let { _actions } = state;
  // 搜索时候不清空
  if (type === ACTIONS.PROCESS_ACTION && stat === 1) {
    if (!_actions.find(r => r.token === token)) {
      return { _actions: [..._actions, action] };
    }
    return state;
  } else if (type === ACTIONS.PROCESS_ACTION && stat === 0) {
    let target = _actions.find(r => r.token === token);
    if (target) {
      _actions.splice(_actions.indexOf(target), 1);
      return { _actions };
    }
    return state;
  }
  return state;
};

const subUserManagementRole = (
  state = { rows: [], total: 0 },
  action
) => {
  const { type, error, response } = action;
  if (type === ACTIONS.CALL_SUB_USER_MANAGEMENT_ROLE_QUERY.types.success) {
    return { rows: response.rows || [], total: response.total || 1 };
  } else if (
    type === ACTIONS.CALL_SUB_USER_MANAGEMENT_ROLE_QUERY.types.fail
  ) {
    return { rows: [] };
  } else if (error) {
    return state;
  }
  return state;
};

const withDraw = (state = {
  rows: [],
  total: 0,
  fee: 0,
  detail: null,
}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_WITHDRAW.types.success:
      return {...state, ...{rows: response.rows, total: response.total, fee: response.fee}}
    // case ACTIONS.CALL_ORDER_WITHDRAW.types.fail:
    //   return {...state, contractList: response.rows}

    default:
      return state
  }
}

const rootReducer = combineReducers({
  message,
  _session,
  orders,
  corpOrders,
  corpAuth,
  managedUsers,
  managedSubUsers,
  assetAccount,
  repayment,
  require,
  collect,
  distriPlan,
  fundSupply,
  feeSetting,
  operLog,
  menuSelection,
  dictionary,
  loginLogs,
  operTableLogs,
  platformUseFee,
  assetOrders,
  corpAssetOrders,
  corpCredit,
  supplementAssetOrder,
  supplementCorpCredit,
  fundStatistics,
  adminStatistics,
  afterRepaymentStatistics,
  settleMethod,
  balanceStatistics,
  supplementCorpAssetOrder,
  managedMenus,
  cooperatorInfo,
  cooperatorApiAsset,
  cooperatorApiFund,
  cooperatorAccount,
  userAttribute,
  userAttributeManagement,
  managedRoles,
  financeLoan,
  financeRepayment,
  financeService,
  afterRepaymentOrder,
  repaymentPlan,
  operLogModal,
  certificate,
  enterprisePublicity,
  enterprisePublicityDetail,
  personalPublicity,
  personalPublicityDetail,
  cooperatorBusinessSpecifica,
  subUserManagementRole,
  withDraw,
  //  workingAction
});

export default rootReducer;

