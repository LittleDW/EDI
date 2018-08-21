import {ACTIONS} from '../actions'

const balanceStatistics = (state = {
  monthList: [], dayList: [], balanceList: [], balaStaList: []
}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_BALANCE_STATISTICS_SEARCH.types.success:
      return {...state, monthList: response.monthList, dayList: response.dayList, balanceList: response.balanceList}
    case ACTIONS.CALL_BALANCE_STATISTICS_SEARCH_TAB4.types.success:
      return {...state, balaStaList: response.balaStaList}
    case ACTIONS.CALL_BALANCE_STATISTICS_SEARCH.types.fail:
      return {...state, monthList: [], dayList: [], balanceList: []}
    default:
      return state
  }
}

export default balanceStatistics
