/**
 * 作者：石奇峰
 * 功能：Edi的业务级容器，依赖console容器，负责对url和菜单进行匹配，将配对的模块渲染出来
 * 依赖：console
 * */

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {CONTAINERS} from '../redux/configure'
import '../redux/selectors'
import commonCss from '../styles/common.scss'
import {actions} from "../redux/actions";
import {withRouter} from "react-router-dom";

class GenericContainer extends Component {
  constructor(props) {
    super(props)
    this.navigateTo = (path) => {
      if (path && (typeof path == "string")) {
        let {match, history} = this.props
        history.push(`${path}`)
      }
    }
    let {buttons} = this.props
    this._buttons = Array.isArray(buttons) ? buttons.map(r => r.id):[]
  }

  componentDidMount() {
    let {SELECT_MENU, _subentry} = this.props
    SELECT_MENU({subentry: _subentry})
  }

  render() {
    let {_component, _mapSelectorToProps} = this.props,
      extension = {navigateTo: this.navigateTo, _buttons:this._buttons},
      mappedProps = (typeof _mapSelectorToProps == "function") ? {..._mapSelectorToProps(this.props), ...extension} : {...this.props, ...extension}
    return (
      <div className={commonCss["view-frame"]}>
        <_component {...mappedProps}/>
      </div>
    )
  }
}

export default returnConnectedContainer(GenericContainer)

function returnConnectedContainer(container) {
  let newContainers = {}
  Object.keys(CONTAINERS).forEach(key => {
    if (!Array.isArray(CONTAINERS[key].subentry)) {
      newContainers[key] = {...CONTAINERS[key]}
    } else {
      CONTAINERS[key].subentry.forEach((entry, i) => {
        let newKey = `${key}_${i}`
        newContainers[newKey] = {...CONTAINERS[key]}
        newContainers[newKey].subentry = entry
      })
    }
  })

  let connectedContainer = {}
  Object.keys(newContainers).forEach(r => {
    connectedContainer[r] = {
      id: newContainers[r].subentry,
      router: (({subentry, component, mapStateToProps, mapDispatchToProps, mapSelectorToProps}) =>
        withRouter(connect((state, ownProps) => ({
            ...((typeof mapStateToProps == "function") && mapStateToProps(state, ownProps) || mapStateToProps || {}),
            _SESSION: state._session,
            DICTIONARY: state.dictionary.dictionary,
          }),
          /** 暂定所有action injector 都为object 类型*/
         {
            ...(mapDispatchToProps || {}),
            RESET_MESSAGE: actions.RESET_MESSAGE,
            SET_MESSAGE: actions.SET_MESSAGE,
            SELECT_MENU: actions.SELECT_MENU,
            CALL_DIC: actions.CALL_DIC
          },
          (stateProps, dispatchProps, ownProps) => {
            return (Object.assign({
              _mapSelectorToProps: mapSelectorToProps,
              _subentry: subentry,
              _component: component
            }, ownProps, stateProps, dispatchProps))
          })(container)))(newContainers[r])
    }
  })

  return connectedContainer
}
