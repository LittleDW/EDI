import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import AssetSelector from './AssetSelectorPage'
import Selectors from "../../redux/selectors"


function getAssetUserFromSelectorPage() {
  class AssetUserFromSelectorPage extends Component {
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
      return (<AssetSelector {...this.props} options={userFromOptions} ref={(select)=>{this.select = select}}/>)
    }
  }
  AssetUserFromSelectorPage.propTypes = {
    userFrom: PropTypes.string,
    //assetOrgCode: PropTypes.string,
    options: PropTypes.array,
  }

  return AssetUserFromSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  options: Selectors.getAssetOrgsWithUserFrom(state),
})
export default connect(mapStateToProps,null,null,{withRef: true})(getAssetUserFromSelectorPage())
