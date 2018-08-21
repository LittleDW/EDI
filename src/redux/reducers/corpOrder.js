/**
 * 作者：石奇峰
 * 功能：Edi的reducer，负责企业订单
 * 相似：个人订单，企业授信的reducer
 * */

import {ACTIONS} from '../actions'

const corpOrders = (state = {
  orders: {rows: [], total: 0},
  fee: 0,
  contractList: [],
  serviceList: [],
  voucherList: [],
  orderRepayment: {rows: [], total: 0},
  orderPayment: {rows: [], total: 0},
  orderAdvance: {rows: [], total: 0},
  orderAccount: {rows: [], total: 0},
  allVouchers: [],
  orderCredit:[]
}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_CORP_ORDER.types.success:
      return {...state, orders: {rows: response.rows, total: response.total}, fee: response.fee}
    case ACTIONS.CALL_CORP_ORDER.types.fail:
      return {...state, orders: {rows: [], total: 0}, fee: 0}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT.types.success:
      return {...state, contractList: response.rows}
    case ACTIONS.RESET_CORP_ORDER_CONTRACT:
      return {...state, contractList: []}
    case ACTIONS.CALL_CORP_ORDER_SERVICE.types.success:
      return {...state, serviceList: response.rows}
    case ACTIONS.RESET_CORP_ORDER_VOUCHER:
      return {...state, voucherList: []}
    case ACTIONS.CALL_CORP_ORDER_VOUCHER.types.success:
      return {...state, voucherList: response.rows}
    case ACTIONS.RESET_FILTERED_CORP_ORDER_VOUCHER:
      return {...state, allVouchers: []}
    case ACTIONS.CALL_FILTER_CORP_ORDER_VOUCHER.types.success:
      return {...state, allVouchers: response.rows}
    case ACTIONS.RESET_CORP_ORDER_SERVICE:
      return {...state, serviceList: []}
    case ACTIONS.CALL_CORP_ORDER_REPAYMENT.types.success:
      return {...state, orderRepayment: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_CORP_ORDER_REPAYMENT:
      return {...state, orderRepayment: {rows: [], total: 0}}
    case ACTIONS.CALL_CORP_ORDER_PAYMENT.types.success:
      return {...state, orderPayment: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_CORP_ORDER_PAYMENT:
      return {...state, orderPayment: {rows: [], total: 0}}
    case ACTIONS.CALL_CORP_ORDER_ADVANCE.types.success:
      return {...state, orderAdvance: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_CORP_ORDER_ADVANCE:
      return {...state, orderAdvance: {rows: [], total: 0}}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT.types.success:
      return {...state, orderAccount: {rows: response.rows, total: response.total}}
    case ACTIONS.RESET_CORP_ORDER_ACCOUNT:
      return {...state, orderAccount: {rows: [], total: 0}}
    case ACTIONS.CALL_CORP_ORDER_CREDIT.types.success:
      return {...state, orderCredit: response.rows}
    case ACTIONS.RESET_CORP_ORDER_CREDIT:
      return {...state, orderCredit: []}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_MATCH.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_MATCH.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_MATCH.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_CREATE.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_CREATE.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_ORDER_CHECK_RESULT_CREATE.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_MATCH.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_MATCH.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_MATCH.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_CREATE.types.success:
      return {...state, detail: response, working: false}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_CREATE.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_CREATE.types.fail:
      return {...state, working: false}
    case ACTIONS.RESET_CORP_ORDER_UPLOAD_DETAIL:
      return {...state, detail: null}
    default:
      return state
  }
}

export default corpOrders
