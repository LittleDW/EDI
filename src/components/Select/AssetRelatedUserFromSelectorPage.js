import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import AssetSelector from './AssetSelectorPage'
import Selectors from "../../redux/selectors"


function getAssetRelatedUserFromSelectorPage() {
  class AssetRelatedUserFromSelectorPage extends Component {
    constructor(props){
      super(props)
      this.resetState = this.resetState.bind(this)
    }
    resetState(){
      this.select.getWrappedInstance().resetState()
    }
    render() {
      // 增加allowEmpty标志位，当allowEmpty为true时，返回所有asset列表功能   (modified by zhangjunjie on 2018-04-11)
      const {userFrom, fundOrgCode, relatedOptions, allowEmpty, allAssets} = this.props
      let filterRelatedOptions = relatedOptions.find(r=>(r.value == fundOrgCode)),
        userFromOptions = filterRelatedOptions && filterRelatedOptions.userFrom,
        option = userFromOptions && userFromOptions.find(r=>(r.value == userFrom)).relatedArr || []
      if (allowEmpty && !fundOrgCode) {
        option = allAssets.filter(item => item.userFrom === userFrom)
      }
      return (<AssetSelector {...this.props} options={option} ref={(select)=>{this.select = select}}/>)
    }
  }
  AssetRelatedUserFromSelectorPage.propTypes = {
    userFrom: PropTypes.string,
    fundOrgCode: PropTypes.string,
    relatedOptions: PropTypes.array,
    allAssets: PropTypes.array,
    allowEmpty: PropTypes.bool,
  }

  return AssetRelatedUserFromSelectorPage
}

const mapStateToProps = (state, ownProps) => ({
  relatedOptions: Selectors.getRelatedAssetOrgsWithUserFrom(state),
  allAssets: Selectors.getAssetOrgsWithUserFrom(state)
})
export default connect(mapStateToProps,null,null,{withRef: true})(getAssetRelatedUserFromSelectorPage())
