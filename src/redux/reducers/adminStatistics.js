import {ACTIONS} from '../actions'

const adminStatistics = (state = {
  platformList: {collectList: [], scaleList: []},
}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_ADMIN_STATISTICS_PLATFORM.types.success:
      return {...state, platformList: response.platformList}
    case ACTIONS.CALL_ADMIN_STATISTICS_PLATFORM.types.fail:
      return {...state, platformList: []}
    default:
      return state
  }
}

export default adminStatistics
