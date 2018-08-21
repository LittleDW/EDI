import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"

class FinanceServiceSettlementDetailServiceFeeModeSelector extends Component {
  constructor(props){
    super(props)
    this.resetState = this.resetState.bind(this)
  }
  resetState(){
    this.select.resetState()
  }
  render() {
    return (<Select {...this.props} ref={(select)=>{this.select = select}}/>)
  }
}

FinanceServiceSettlementDetailServiceFeeModeSelector.propTypes = {
  options: PropTypes.array,
}

const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getFinanceServiceSettlementDetailServiceFeeMode(state),
})

export default connect(mapStateToProps,null,null,{withRef: true})(FinanceServiceSettlementDetailServiceFeeModeSelector)
