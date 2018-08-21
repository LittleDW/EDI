/**
 * 作者：石奇峰
 * 功能：Edi系统路由
 * */

import React from 'react'
import PropTypes from 'prop-types'
import {Provider} from 'react-redux'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import DevTools from './DevTools'
import LoginPage from '../components/Login'
import ConsolePage from './ConsolePage'
import '../styles/common.scss'
import '../styles/modules.scss'
import "../utils/etc"

const Root = ({store}) => {
  return (
    <Router>
      <Provider store={store}>
        <div>
          <Switch>
            <Route path="/" exact component={LoginPage}/>
            <Route path="/console" component={ConsolePage}/>
            <Route path="*" component={LoginPage}/>
          </Switch>
          <DevTools/>
        </div>
      </Provider>
    </Router>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
}

export default Root
