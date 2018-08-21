import React, {Component} from 'react'
import {connect} from 'react-redux'
import Selectors from "../../redux/selectors"

class FormatDeadline extends Component {
  constructor() {
    super()
  }
  render() {
    let {value, item} = this.props, option = item.filter(r=>r.deadline_id === String(value))[0]
    return (<span>{option && option.deadline_name || "未知"}</span>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  item: Selectors.getDeadlineList(state),
})

export default connect(mapStateToProps)(FormatDeadline)
