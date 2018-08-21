/*
 * @Author Osborn
 * @File FormatOrderStatusPage.1.js
 * @Created Date 2018-04-23 13-38
 * @Last Modified: 2018-04-23 13-38
 * @Modified By: Osborn
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Selectors from "../../redux/selectors"

class FormatOrderDataFromPage extends Component {
  render() {
    let {value, item} = this.props, option = item.filter(r=>r.value === String(value))[0]
    return (<span>{option && option.label || "未知"}</span>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  item: Selectors.getOrderDataFrom(state),
})

export default connect(mapStateToProps)(FormatOrderDataFromPage)
