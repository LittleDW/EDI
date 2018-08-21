/**
 * 作者：石奇峰
 * 功能：Edi的reducer，负责企业授信
 * 相似：企业订单，个人订单的reducer
 * */

import {ACTIONS} from '../actions'

const corpAuth = (state = {rows: [], total: 0, detail: [],creditDetail: [],voucherList: [],allVouchers: []}, action) => {
  const {type, error, response} = action

  switch(type) {
    case ACTIONS.CALL_CORP_AUTH.types.success:
      return {...state,rows: response.rows, total: response.total}
    case ACTIONS.CALL_CORP_AUTH.types.fail:
      return {...state,rows: [], total: 0}
    case ACTIONS.CALL_CORP_AUTH_DETAIL.types.success:
      return {...state, detail: response.rows}
    case ACTIONS.CALL_CORP_AUTH_DETAIL.types.fail:
      return state
    case ACTIONS.CALL_CORP_AUTH_CREDIT_DETAIL.types.success:
      return {...state, creditDetail: response.rows}
    case ACTIONS.CALL_CORP_AUTH_CREDIT_DETAIL.types.fail:
      return state
    case ACTIONS.RESET_CORP_AUTH_DETAIL:
      return {...state, detail: []}
    case ACTIONS.RESET_CORP_AUTH_CREDIT_DETAIL:
      return {...state, creditDetail: []}
    case ACTIONS.RESET_CORP_AUTH_VOUCHER:
      return {...state, voucherList: []}
    case ACTIONS.CALL_CORP_AUTH_VOUCHER.types.success:
      return {...state, voucherList: response.rows}
    case ACTIONS.RESET_FILTERED_CORP_AUTH_VOUCHER:
      return {...state, allVouchers: []}
    case ACTIONS.CALL_FILTER_CORP_AUTH_VOUCHER.types.success:
      return {...state, allVouchers: response.rows}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_MATCH.types.success:
      return {...state, uploadDetail: response, working: false}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_MATCH.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_MATCH.types.fail:
      return {...state, working: false}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_CREATE.types.success:
      return {...state, uploadDetail: response, working: false}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_CREATE.types.request:
      return {...state, working: true}
    case ACTIONS.CALL_CORP_AUTH_AUTH_RESULT_CREATE.types.fail:
      return {...state, working: false}
    case ACTIONS.RESET_CORP_AUTH_UPLOAD_DETAIL:
      return {...state, uploadDetail: null}
    default:
      return state
  }
}

export default corpAuth
