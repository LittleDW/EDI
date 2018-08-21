import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import FundSelector from './FundSelectorPage'
import Selectors from "../../redux/selectors"


function getFundRelatedAccountPurposeWithFundUserFromSelectorPage() {
  class FundRelatedAccountPurposeWithFundUserFromSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {userFrom, assetAccountPurpose, fundAccountPurpose, assetOrgCode, relatedAssetOptions,
        relatedFundOptions, relatedUserFromOptions} = this.props

      let filterRelatedFundOptions = relatedFundOptions.find(r=>(r.value == assetOrgCode)),
        fundPurposeOptions = filterRelatedFundOptions && filterRelatedFundOptions.purpose,
        fundOption = fundPurposeOptions && fundPurposeOptions.find(r=>(r.value == fundAccountPurpose)).relatedArr || []

      let filterRelatedAssetOptions = relatedAssetOptions.find(r=>(r.value == assetOrgCode)),
        assetPurposeOptions = filterRelatedAssetOptions && filterRelatedAssetOptions.purpose,
        assetOption = assetPurposeOptions && assetPurposeOptions.find(r=>(r.value == assetAccountPurpose)).relatedArr || []

      let filterRelatedUserFromOptions = relatedUserFromOptions.find(r=>(r.value == assetOrgCode)),
        userFromOptions = filterRelatedUserFromOptions && filterRelatedUserFromOptions.userFrom,
        fundUserFromOption = userFromOptions && userFromOptions.find(r=>(r.value == userFrom)).relatedArr || []

      let option = fundUserFromOption.map(r=>{
        let assetTarget = assetOption.find(s=> (s.value==r.value)),
          fundTarget = fundOption.find(s=> (s.value==r.value)), target = {...r}
        if(assetTarget){
          target.assetAccount = assetTarget.assetAccount
        }
        if(fundTarget){
          target.fundAccount = fundTarget.fundAccount
        }
        return target
      }).filter(r=>r.assetAccount || r.fundAccount)

      return (<FundSelector {...this.props} options={option && option.length ? option : undefined} ref={(select)=>{this.select = select}}/>)
    }
  }
  FundRelatedAccountPurposeWithFundUserFromSelectorPage.propTypes = {
    userFrom: PropTypes.string,
    assetAccountPurpose: PropTypes.string,
    fundAccountPurpose: PropTypes.string,
    assetOrgCode: PropTypes.string,
    relatedAssetOptions: PropTypes.array,
    relatedFundOptions: PropTypes.array,
  }

  return FundRelatedAccountPurposeWithFundUserFromSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedUserFromOptions: Selectors.getRelatedFundOrgsWithUserFrom(state),
  relatedAssetOptions: Selectors.getRelatedFundOrgsWithAssetAccountPurpose(state),
  relatedFundOptions: Selectors.getRelatedFundOrgsWithFundAccountPurpose(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getFundRelatedAccountPurposeWithFundUserFromSelectorPage())
