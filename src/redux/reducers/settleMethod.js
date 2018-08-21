import {ACTIONS} from '../actions'

const settleMethod = (state = {
  methodList: []
}, action) => {
  const {type, error, response} = action

  switch (type) {
    case ACTIONS.CALL_SETTLE_METHOD_SEARCH.types.success:
      return {...state, methodList: response.methodList}
    case ACTIONS.CALL_SETTLE_METHOD_SEARCH.types.fail:
      return {...state, methodList: []}
    default:
      return state
  }
}

export default settleMethod
