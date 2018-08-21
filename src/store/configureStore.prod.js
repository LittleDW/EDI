/**
 * 作者：石奇峰
 * EDI系统的Store配置
 * */

import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import agent from '../redux/middleware/agent'
import rootReducer from '../redux/reducers'

const configureStore = preloadedState => createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(thunk, ...agent)
)

export default configureStore
