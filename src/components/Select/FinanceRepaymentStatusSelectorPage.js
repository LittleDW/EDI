import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"

class FinanceRepaymentStatusSelectorPage extends Component {
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

FinanceRepaymentStatusSelectorPage.propTypes = {
  options: PropTypes.array,
}


const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getFinanceRepaymentStatus(state),
})

export default connect(mapStateToProps,null,null,{withRef: true})(FinanceRepaymentStatusSelectorPage)
