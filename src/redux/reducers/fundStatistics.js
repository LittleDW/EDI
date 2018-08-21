import {ACTIONS} from '../actions'

const fundStatistics = (state = {
  fundList: [],
  assetList: [],
  totalList: [],
  orgDataList: [],
  deadlineDataList: []
}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_FUND_STATISTICS_TOTAL.types.success:
      return {...state, totalList: response.totalList}
    case ACTIONS.CALL_FUND_STATISTICS_TOTAL.types.fail:
      return {...state, totalList: []}
    case ACTIONS.CALL_FUND_STATISTICS_FUND_ASSET.types.success:
      return {...state, orgDataList: response.orgDataList}
    case ACTIONS.CALL_FUND_STATISTICS_FUND_ASSET.types.fail:
      return {...state, orgDataList: []}
    case ACTIONS.CALL_FUND_STATISTICS_DEADLINE.types.success:
      return {...state, deadlineDataList: response.deadlineDataList}
    case ACTIONS.CALL_FUND_STATISTICS_DEADLINE.types.fail:
      return {...state, deadlineDataList: []}
    default:
      return state
  }
}

export default fundStatistics
