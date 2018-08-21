import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import FundSelector from './FundSelectorPage'
import Selectors from "../../redux/selectors"


function getFundRelatedUserFromSelectorPage() {
  class FundRelatedUserFromSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      // 增加allowEmpty标志位，当allowEmpty为true时，返回所有asset列表功能   (modified by zhangjunjie on 2018-04-11)
      const {userFrom, assetOrgCode, relatedOptions, allowEmpty, allFunds} = this.props
      let filterRelatedOptions = relatedOptions.find(r=>(r.value == assetOrgCode)),
        userFromOptions = filterRelatedOptions && filterRelatedOptions.userFrom,
        option = userFromOptions && userFromOptions.find(r=>(r.value == userFrom)).relatedArr || []
      if (allowEmpty && !assetOrgCode) {
        option = allFunds.filter(item => item.userFrom === userFrom)
      }
      return (<FundSelector {...this.props} options={option} ref={(select)=>{this.select = select}}/>)
    }
  }
  FundRelatedUserFromSelectorPage.propTypes = {
    userFrom: PropTypes.string,
    assetOrgCode: PropTypes.string,
    relatedOptions: PropTypes.array,
    allFunds: PropTypes.array,
    allowEmpty: PropTypes.bool,
  }

  return FundRelatedUserFromSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedOptions: Selectors.getRelatedFundOrgsWithUserFrom(state),
  allFunds: Selectors.getFundOrgsWithUserFrom(state)
})
export default connect(mapStateToProps,null,null,{withRef: true})(getFundRelatedUserFromSelectorPage())
