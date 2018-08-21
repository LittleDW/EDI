/**
 * 作者：石奇峰
 * EDI单页系统入口
 * */

import React from 'react'
import {render} from 'react-dom'
import {AppContainer} from 'react-hot-loader';
import Root from './containers/Root'
import configureStore from './store/configureStore'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Cookies from "js-cookie/src/js.cookie";
import {getSession} from "./redux/middleware/agent"

//const preloadedState = window.__PRELOADED_STATE__
if (Window && document && Navigator && Storage && WebSocket) {
  getSession()
    .then(({store: serializedStore}) => {
      const store = configureStore(serializedStore)

      renderEdi(Root, store)

      if (module.hot) {
        module.hot.accept('./containers/Root', () => {
          const NewRoot = require('./containers/Root').default;
          renderEdi(NewRoot, store)
        });
      }
    }, (err) => {
      if (window.confirm("页面初始化失败，请重试")) {
        window.location.reload()
      }
    })
}

function renderEdi(Root, store) {
  render(
    <AppContainer warnings={false}>
      <Root store={store}/>
    </AppContainer>,
    document.getElementById('root')
  )
}
