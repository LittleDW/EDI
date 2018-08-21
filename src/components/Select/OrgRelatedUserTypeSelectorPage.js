import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"


function getOrgRelatedUserTypeSelectorPage() {
  class OrgRelatedUserTypeSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {userType, defaultUserTypes, options} = this.props
      let option = options.filter(r=>{
        let resultsMap = new Map()
        resultsMap.set("1", r.value.startsWith("A1501")) // 资产方
        resultsMap.set("2", r.value.startsWith("F1502")) // 资金方
        resultsMap.set("3", r.value.startsWith("O")) // 资产管理方
        resultsMap.set("4", r.value.startsWith("X")) // 系统管理方
        resultsMap.set("5", r.value.startsWith("A1505")) // 外部资产方
        resultsMap.set("6", r.value.startsWith("F1506")) // 外部资金方

        if (userType) {
          return resultsMap.get(userType.toString())
        } else {
          if (defaultUserTypes && defaultUserTypes.length) {
            for (let i=1;i<=6;i++) {
              if (resultsMap.get(i.toString())) {
                return defaultUserTypes.indexOf(i) > -1
              }
            }
          } else {
            return true
          }
        }
        return false
      })
      return (<Select {...this.props} options={option} ref={(select)=>{this.select = select}}/>)
    }
  }
  OrgRelatedUserTypeSelectorPage.propTypes = {
    userType: PropTypes.string,
    defaultUserTypes: PropTypes.array,
    options: PropTypes.array,
  }

  return OrgRelatedUserTypeSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getOrgCodes(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getOrgRelatedUserTypeSelectorPage())
