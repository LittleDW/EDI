import React, {Component} from 'react'
import PropTypes from 'prop-types'
import NestCustomRowTable from '../Datatable/NewTable'
import {unique} from "../../utils/etc"

export default class NestStatisticsTable extends Component {
  constructor(props) {
    super(props)

    this.handleSetting = (props) => {
      const {data, rowIterator} = props
      let setting = {}
      unique(data, rowIterator).forEach(item => {
        setting[item[rowIterator]] = false
      })
      return {...setting}
    }

    this.state = {
      setting: this.handleSetting(props)
    }

    this.triggle = (e,value) => {
      e.preventDefault()
      e.stopPropagation()
      let {setting} = this.state
      setting[value] = !setting[value]
      this.setState({
        setting: {...setting}
      })
    }

    this.handleData = () => {
      const {setting} = this.state
      const {data, subData, subRowIterator, rowIterator} = this.props
      let _rows = data.slice()
      for (let org in setting) {
        if (setting[org]) {
          let arr = subData.filter(item => item[subRowIterator].includes(org)).map(item => {
            return {...item, [rowIterator]: item[subRowIterator]}
          })
          let index = _rows.map(item => item[rowIterator]).lastIndexOf(org) + 1
          _rows = _rows.slice(0, index).concat(arr, _rows.slice(index))
        }
      }

      return _rows.slice()
    }

    this.renderRow = (row) => {
      const {setting} = this.state
      const {subRowIterator, rowIterator} = this.props
      if (subRowIterator && !row[subRowIterator]) {
        return (<a href="javascript:;" styleName="month-switch" onClick={(e) =>this.triggle(e, row[rowIterator])}><span>{row[rowIterator]}</span><i className={`fa ${setting[row[rowIterator]]? 'fa-caret-down' : 'fa-caret-right'}`} aria-hidden="true"></i></a>)
      } else {
        return (
          <span>{row[rowIterator]}</span>
        )
      }
    }

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      setting: this.handleSetting(nextProps)
    })
  }

  render() {
    return (
      <NestCustomRowTable {...this.props} data={this.handleData()} renderRow={this.renderRow} scroll={false} bodyHeight={"18rem"}/>
    )
  }
}


NestStatisticsTable.propTypes = {
  data: PropTypes.array.isRequired,
  subData: PropTypes.array,
  rowIterator: PropTypes.string.isRequired,
  subRowIterator: PropTypes.string,
  columnIterator: PropTypes.string.isRequired,
  valueIterator: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  renderRow: PropTypes.func,
  renderColumn: PropTypes.func,
  renderValue: PropTypes.func,
  showRowTotal: PropTypes.bool,
  showColumnTotal: PropTypes.bool,
  scroll: PropTypes.bool
}
