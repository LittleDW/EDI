import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Select from './index'
import Selectors from "../../redux/selectors"

class OrgSelectorPage extends Component {
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
      if (allowedType.includes(1) || allowedType.includes('1')) {
        newOptions = newOptions.concat(options.filter(dic => dic.value && dic.value.startsWith('A1501')))
      }
      if (allowedType.includes(2) || allowedType.includes('2')) {
        newOptions = newOptions.concat(options.filter(dic => dic.value && dic.value.startsWith('F1502')))
      }
      if (allowedType.includes(3) || allowedType.includes('3')) {
        newOptions = newOptions.concat(options.filter(dic => dic.value && dic.value.startsWith('O1503')))
      }
      if (allowedType.includes(4) || allowedType.includes('4')) {
        newOptions = newOptions.concat(options.filter(dic => dic.value && dic.value.startsWith('X1504')))
      }
      if (allowedType.includes(5) || allowedType.includes('5')) {
        newOptions = newOptions.concat(options.filter(dic => dic.value && dic.value.startsWith('A1505')))
      }
      if (allowedType.includes(6) || allowedType.includes('6')) {
        newOptions = newOptions.concat(options.filter(dic => dic.value && dic.value.startsWith('F1506')))
      }
      options = newOptions.slice()
    }
    return (<Select {...this.props} ref={(select)=>{this.select = select}} options={options}/>)
  }
}

OrgSelectorPage.propTypes = {
  options: PropTypes.array,
  allowedType: PropTypes.array // 允许显示的用户类型  例如： ['1', '2', '3', '4', '5', '6'] 表示只允许显示资产方、资金方、平台管理员、资产管理员、外部资产方、外部资金方
}


const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getOrgCodes(state),
})

export default connect(mapStateToProps,null,null,{withRef: true})(OrgSelectorPage)
