import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import AssetSelector from './AssetSelectorPage'
import Selectors from "../../redux/selectors"


function getAssetRelatedFundAccountPurposeWithUserFromSelectorPage() {
  class AssetRelatedFundAccountPurposeWithUserFromSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {userFrom, assetAccountPurpose, fundAccountPurpose, fundOrgCode, relatedAssetOptions,
        relatedFundOptions, relatedUserFromOptions} = this.props

      let filterRelatedFundOptions = relatedFundOptions.find(r=>(r.value == fundOrgCode)),
        fundPurposeOptions = filterRelatedFundOptions && filterRelatedFundOptions.purpose,
        fundOption = fundPurposeOptions && fundPurposeOptions.find(r=>(r.value == fundAccountPurpose)).relatedArr || []

      let filterRelatedAssetOptions = relatedAssetOptions.find(r=>(r.value == fundOrgCode)),
        assetPurposeOptions = filterRelatedAssetOptions && filterRelatedAssetOptions.purpose,
        assetOption = assetPurposeOptions && assetPurposeOptions.find(r=>(r.value == assetAccountPurpose)).relatedArr || []

      let filterRelatedUserFromOptions = relatedUserFromOptions.find(r=>(r.value == fundOrgCode)),
        userFromOptions = filterRelatedUserFromOptions && filterRelatedUserFromOptions.userFrom,
        assetUserFromOption = userFromOptions && userFromOptions.find(r=>(r.value == userFrom)).relatedArr || []

      let option = assetUserFromOption.map(r=>{
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

      return (<AssetSelector {...this.props} options={option && option.length ? option : undefined} ref={(select)=>{this.select = select}}/>)
    }
  }
  AssetRelatedFundAccountPurposeWithUserFromSelectorPage.propTypes = {
    userFrom: PropTypes.string,
    assetAccountPurpose: PropTypes.string,
    fundAccountPurpose: PropTypes.string,
    fundOrgCode: PropTypes.string,
    relatedAssetOptions: PropTypes.array,
    relatedFundOptions: PropTypes.array,
  }

  return AssetRelatedFundAccountPurposeWithUserFromSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedUserFromOptions: Selectors.getRelatedAssetOrgsWithUserFrom(state),
  relatedAssetOptions: Selectors.getRelatedAssetOrgsWithAssetAccountPurpose(state),
  relatedFundOptions: Selectors.getRelatedAssetOrgsWithFundAccountPurpose(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getAssetRelatedFundAccountPurposeWithUserFromSelectorPage())
