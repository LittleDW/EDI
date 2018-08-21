import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import FundSelector from './FundSelectorPage'
import Selectors from "../../redux/selectors"


function getFundUserFromSelectorPage() {
  class FundUserFromSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      const {userFrom, options} = this.props;
      let userFromOptions
      if(Array.isArray(options)){
        userFromOptions = options.filter(r=>r.userFrom === String(userFrom));
      }
      return (<FundSelector {...this.props} options={userFromOptions} ref={(select)=>{this.select = select}}/>)
    }
  }
  FundUserFromSelectorPage.propTypes = {
    userFrom: PropTypes.string,
    //assetOrgCode: PropTypes.string,
    options: PropTypes.array,
  }

  return FundUserFromSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  options: Selectors.getFundOrgsWithUserFrom(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getFundUserFromSelectorPage())
