import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import FundSelector from './FundSelectorPage'
import Selectors from "../../redux/selectors"


function getFundRelatedAccountPurposeSelectorPage() {
  class FundRelatedAccountPurposeSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {assetAccountPurpose, fundAccountPurpose, assetOrgCode, relatedAssetOptions, relatedFundOptions} = this.props

      let filterRelatedFundOptions = relatedFundOptions.find(r=>(r.value == assetOrgCode)),
        fundPurposeOptions = filterRelatedFundOptions && filterRelatedFundOptions.purpose,
        fundOption = fundPurposeOptions && fundPurposeOptions.find(r=>(r.value == fundAccountPurpose)).relatedArr || []

      let filterRelatedAssetOptions = relatedAssetOptions.find(r=>(r.value == assetOrgCode)),
        assetPurposeOptions = filterRelatedAssetOptions && filterRelatedAssetOptions.purpose,
        assetOption = assetPurposeOptions && assetPurposeOptions.find(r=>(r.value == assetAccountPurpose)).relatedArr || []

      let option = fundOption.map(r=>{
        let assetTarget = assetOption.find(s=> (s.value==r.value))
        if(assetTarget){
          return {...r, assetAccount: assetTarget.assetAccount}
        }
        return r
      })

      return (<FundSelector {...this.props} options={option && option.length ? option : undefined} ref={(select)=>{this.select = select}}/>)
    }
  }
  FundRelatedAccountPurposeSelectorPage.propTypes = {
    assetAccountPurpose: PropTypes.string,
    fundAccountPurpose: PropTypes.string,
    assetOrgCode: PropTypes.string,
    relatedAssetOptions: PropTypes.array,
    relatedFundOptions: PropTypes.array,
  }

  return FundRelatedAccountPurposeSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedAssetOptions: Selectors.getRelatedFundOrgsWithAssetAccountPurpose(state),
  relatedFundOptions: Selectors.getRelatedFundOrgsWithFundAccountPurpose(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getFundRelatedAccountPurposeSelectorPage())
