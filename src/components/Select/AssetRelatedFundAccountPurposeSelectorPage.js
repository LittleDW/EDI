import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import AssetSelector from './AssetSelectorPage'
import Selectors from "../../redux/selectors"


function getAssetRelatedAccountPurposeSelectorPage() {
  class AssetRelatedAccountPurposeSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {accountPurpose, fundOrgCode, relatedOptions} = this.props
      let filterRelatedOptions = relatedOptions.find(r=>(r.value == fundOrgCode)),
        purposeOptions = filterRelatedOptions && filterRelatedOptions.purpose,
        option = purposeOptions && purposeOptions.find(r=>(r.value == accountPurpose)).relatedArr || []
      return (<AssetSelector {...this.props} options={option && option.length ? option : undefined} ref={(select)=>{this.select = select}}/>)
    }
  }
  AssetRelatedAccountPurposeSelectorPage.propTypes = {
    accountPurpose: PropTypes.string,
    fundOrgCode: PropTypes.string,
    relatedOptions: PropTypes.array,
  }

  return AssetRelatedAccountPurposeSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedOptions: Selectors.getRelatedAssetOrgsWithFundAccountPurpose(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getAssetRelatedAccountPurposeSelectorPage())
