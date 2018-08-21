import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import FundSelector from './FundSelectorPage'
import Selectors from "../../redux/selectors"


function getFundRelatedSelectorPage() {
  class FundRelatedSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {assetOrgCode, relatedOptions} = this.props
      let option = relatedOptions.find(r=>(r.value == assetOrgCode))
      return (<FundSelector {...this.props} options={option && option.relatedArr} ref={(select)=>{this.select = select}}/>)
    }
  }
  FundRelatedSelectorPage.propTypes = {
    assetOrgCode: PropTypes.string,
    relatedOptions: PropTypes.array,
  }

  return FundRelatedSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedOptions: Selectors.getRelatedFundOrgs(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getFundRelatedSelectorPage())
