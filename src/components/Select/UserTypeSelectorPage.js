import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"

class UserTypeSelectorPage extends Component {
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
    let {options,allowedType} = this.props
    if (allowedType && Array.isArray(allowedType) && allowedType.length > 0) {
      let newOptions = []
      newOptions = options.filter(option => allowedType.includes(option.value) ||  allowedType.includes(Number(option.value)))
      options = newOptions.slice()
    }
    return (<Select {...this.props} ref={(select)=>{this.select = select}} options={options}/>)
  }
}

UserTypeSelectorPage.propTypes = {
  options: PropTypes.array,
  allowedType: PropTypes.array // 需要显示哪些用户类型
}


const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getUserTypes(state),
})

export default connect(mapStateToProps,null,null,{withRef: true})(UserTypeSelectorPage)
