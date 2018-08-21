import React, {Component} from 'react'
import {connect} from 'react-redux'
import Selectors from "../../redux/selectors"

class FormatAfterRepaymentOrderDetailOverdueStatusPage extends Component {
  render() {
    let {value, item} = this.props, option = item.filter(r=>r.value === String(value))[0]
    return (<span>{option && option.label || value}</span>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  item: Selectors.getAfterRepaymentOrderDetailOverdueStatus(state),
})

export default connect(mapStateToProps)(FormatAfterRepaymentOrderDetailOverdueStatusPage)
