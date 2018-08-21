/**
 * 作者：石奇峰
 * 功能：Edi的中间件，负责所有的对后台的接口调度
 * */

import {ACTIONS} from '../actions'
import {schema} from 'normalizr'
import request from '../../utils/request'

let API_ROOT = ''
if (process.env.NODE_ENV === 'production') {
  API_ROOT = '/'
} else {
  API_ROOT = '/api/'
}


const callRequest = (endpoint, body, opt) => {
  const fullUrl = API_ROOT + endpoint
  let result = request("POST", fullUrl, body, opt)
  return {
    promise: result.promise.then(json => (json.success ? json : Promise.reject(json))),
    xhr: result.xhr
  }
}

export const getSession = () => {
  const fullUrl = API_ROOT + "getStore"
  let result = request("POST", fullUrl)
  return result.promise.then(json => (json.success ? json : Promise.reject(json)))
}

let actionMidware = store => next => action => {
  let myActionName = Object.keys(ACTIONS).find(r=>action.hasOwnProperty(r))
  if (myActionName === undefined) {
    return next(action)
  }
  const _action = action[myActionName]
  if (_action === undefined) {
    return next(action)
  }

  let {endpoint, body, /*schema,*/ types, opt} = _action

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string' || typeof type === 'symbol')) {
    throw new Error('Expected action types to be strings.')
  }

  const actionWith = data => {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[myActionName]
    return finalAction
  }

  const [requestType, successType, failureType] = types
  next(actionWith({type: requestType}))

  //const token = Date.now()
  //next({type: ACTIONS.PROCESS_ACTION, _action: myActionName, token, stat: 1})

  let result = callRequest(endpoint, body, opt, schema)
  return {
    promise: result.promise.then(
      response => {
        return next(actionWith({
          response,
          type: successType
        }))
      },
      error => {
        return next(actionWith({
          type: failureType,
          error: error.message || '异常',
          error_response: error
        }))
      }
    )/*.then((data)=>{
      next({type: ACTIONS.PROCESS_ACTION, _action: myActionName, token, stat: 0})
      return data
    })*/,
    xhr: result.xhr
  }
}

/*let result = []
for (let actionName in ACTIONS) {
  result.push((() => {
    let myActionName = actionName
    return store => next => action => {
      const _action = action[myActionName]
      if (typeof _action === 'undefined') {
        return next(action)
      }

      let {endpoint, body, /!*schema,*!/ types, opt} = _action

      if (typeof endpoint !== 'string') {
        throw new Error('Specify a string endpoint URL.')
      }
      if (!Array.isArray(types) || types.length !== 3) {
        throw new Error('Expected an array of three action types.')
      }
      if (!types.every(type => typeof type === 'string' || typeof type === 'symbol')) {
        throw new Error('Expected action types to be strings.')
      }

      const actionWith = data => {
        const finalAction = Object.assign({}, action, data)
        delete finalAction[myActionName]
        return finalAction
      }

      const [requestType, successType, failureType] = types
      next(actionWith({type: requestType}))

      let result = callRequest(endpoint, body, opt, schema)
      return {
        promise: result.promise.then(
          response => {
            return next(actionWith({
              response,
              type: successType
            }))
          },
          error => next(actionWith({
            type: failureType,
            error: error.message || '异常'
          }))
        ),
        xhr: result.xhr
      }
    }
  })())
}*/
export default [actionMidware]//result
