import React, {Component} from 'react'
import {connect} from 'react-redux'
import Selectors from "../../redux/selectors"

class FormatOrgCodePage extends Component {
  constructor() {
    super()
  }
  render() {
    let {value, item} = this.props, option = item.find(r=>r.value === String(value))
    return (<span>{option && option.label || "未知"}</span>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  item: Selectors.getOrgCodes(state),
})

export default connect(mapStateToProps)(FormatOrgCodePage)
