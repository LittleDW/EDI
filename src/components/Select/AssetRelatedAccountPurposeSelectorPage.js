import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import AssetSelector from './AssetSelectorPage'
import Selectors from "../../redux/selectors"


function getAssetdRelatedAccountPurposeSelectorPage() {
  class AssetdRelatedAccountPurposeSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {assetAccountPurpose, fundAccountPurpose, fundOrgCode, relatedAssetOptions, relatedFundOptions} = this.props

      let filterRelatedFundOptions = relatedFundOptions.find(r=>(r.value == fundOrgCode)),
        fundPurposeOptions = filterRelatedFundOptions && filterRelatedFundOptions.purpose,
        fundOption = fundPurposeOptions && fundPurposeOptions.find(r=>(r.value == fundAccountPurpose)).relatedArr || []

      let filterRelatedAssetOptions = relatedAssetOptions.find(r=>(r.value == fundOrgCode)),
        assetPurposeOptions = filterRelatedAssetOptions && filterRelatedAssetOptions.purpose,
        assetOption = assetPurposeOptions && assetPurposeOptions.find(r=>(r.value == assetAccountPurpose)).relatedArr || []

      let option = fundOption.map(r=>{
        let assetTarget = assetOption.find(s=> (s.value==r.value))
        if(assetTarget){
          return {...r, assetAccount: assetTarget.assetAccount}
        }
        return r
      })

      return (<AssetSelector {...this.props} options={option && option.length ? option : undefined} ref={(select)=>{this.select = select}}/>)
    }
  }
  AssetdRelatedAccountPurposeSelectorPage.propTypes = {
    assetAccountPurpose: PropTypes.string,
    fundAccountPurpose: PropTypes.string,
    fundOrgCode: PropTypes.string,
    relatedAssetOptions: PropTypes.array,
    relatedFundOptions: PropTypes.array,
  }

  return AssetdRelatedAccountPurposeSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedAssetOptions: Selectors.getRelatedAssetOrgsWithAssetAccountPurpose(state),
  relatedFundOptions: Selectors.getRelatedAssetOrgsWithFundAccountPurpose(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getAssetdRelatedAccountPurposeSelectorPage())
