import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"

class EnterprimseCreditSelectorPage extends Component {
  constructor(props){
    super(props)
    this.resetState = this.resetState.bind(this)
  }
  resetState(){
    this.select.resetState()
  }
  componentWillReceiveProps(nextProps) {

  }

  render() {
    return (<Select {...this.props} ref={(select)=>{this.select = select}}/>)
  }
}

EnterprimseCreditSelectorPage.propTypes = {
  options: PropTypes.array,
}


const mapStateToProps = (state, ownProps) => {
  let userType = Selectors.getUserType(state), options
  if(userType === 1){
    options = Selectors.getEnterpriseAssetCredit(state)
  } else if (userType === 2){
    options = Selectors.getEnterpriseFundCredit(state)
  } else if (userType === 3){
    options = Selectors.getEnterpriseAssetCredit(state)
  } else {
    options = []
  }
  return {options: ownProps.options||options}
}

export default connect(mapStateToProps,null,null,{withRef: true})(EnterprimseCreditSelectorPage)
