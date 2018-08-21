import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"

class TaskEnterprisePICrawStatusSelectorPage extends Component {
  constructor(props){
    super(props)
    this.resetState = this.resetState.bind(this)
  }
  render() {
    return (<Select {...this.props} ref={(select)=>{this.select = select}}/>)
  }

  resetState(){
    this.select.resetState()
  }
}

TaskEnterprisePICrawStatusSelectorPage.propTypes = {
  options: PropTypes.array,
}


const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getTaskEnterprisePICrawStatus(state)
})

export default connect(mapStateToProps,null,null,{withRef: true})(TaskEnterprisePICrawStatusSelectorPage)
