import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"

class FinanceLoanDetailServiceFeeModeSelector extends Component {
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

FinanceLoanDetailServiceFeeModeSelector.propTypes = {
  options: PropTypes.array,
}

const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getFinanceLoanDetailServiceFeeMode(state),
})

export default connect(mapStateToProps,null,null,{withRef: true})(FinanceLoanDetailServiceFeeModeSelector)
