import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import AssetSelector from './AssetSelectorPage'
import Selectors from "../../redux/selectors"


function getAssetRelatedSelectorPage() {
  class AssetRelatedSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {fundOrgCode, relatedOptions} = this.props
      let option = relatedOptions.find(r=>(r.value == fundOrgCode))
      return (<AssetSelector {...this.props} options={option && option.relatedArr} ref={(select)=>{this.select = select}}/>)
    }
  }
  AssetRelatedSelectorPage.propTypes = {
    fundOrgCode: PropTypes.string,
    relatedOptions: PropTypes.array,
  }

  return AssetRelatedSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedOptions: Selectors.getRelatedAssetOrgs(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getAssetRelatedSelectorPage())
