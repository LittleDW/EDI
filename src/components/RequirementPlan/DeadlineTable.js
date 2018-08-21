import React, { Component } from 'react'
import Proptypes from 'prop-types'
import CSSModules from 'react-css-modules'
import style from './style.scss'
import { formatNumber, unique } from '../../utils/etc'

@CSSModules(style, {allowMultiple: true})
export default class DeadlineTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      columnArr: [],
      rowArr: []
    }
    this.handleProps = this.handleProps.bind(this)
    this.valueChange = this.valueChange.bind(this)
    this.renderColumns = this.renderColumns.bind(this)
    this.renderTotalColumn = this.renderTotalColumn.bind(this)
    this.renderTotalRow = this.renderTotalRow.bind(this)
  }

  componentDidMount() {
    this.handleProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.deadlineData !== nextProps.deadlineData) {
      this.handleProps(nextProps)
    }
  }

  handleProps(props) {
    const data = [...props.deadlineData]
    let columnArr = unique(data, 'plan_date').map(item => {
      return { week_name: item.week_name, plan_date: item.plan_date }
    })
    data.forEach(item => {
      if (item.plan_fee === null) {
        item.plan_fee = 0
      }
    })
    let rowArr = unique(data, 'deadline_name').map(item => item.deadline_name)
    this.setState({ data, columnArr, rowArr })
  }

  valueChange(e, index) {
    e.preventDefault();
    e.stopPropagation();
    if (isNaN(e.target.value)) {
      return
    }
    if (Number(e.target.value) < 0) {
      e.target.value *= -1
    } else if (Number(e.target.value) > 1000000) {
      e.target.value = 1000000
    }
    let value = !e.target.value
      ? 0
      : Number(e.target.value) * 1000000
    this.props.valueChange(value, index)
  }


  renderColumns(row, column, columnIndex) {
    const { data } = this.state
    if (this.props.readOnly) {
      let sum = data.filter((item => item.plan_date === column.plan_date && item.deadline_name === row)).map(item => item.plan_fee).reduce((a, b) => a + b)
      return <td key={String(columnIndex)}><span>{formatNumber(parseInt(Number(sum)))}</span></td>
    } else {
      let index = -1
      for (let i = 0; i < data.length; i++) {
        if (data[i].plan_date === column.plan_date && data[i].deadline_name === row) {
          index = i
          break
        }
      }
      if (index >= 0) {
        return <td key={String(index)}><input type="text" styleName="table-input" value={data[index].plan_fee !== ''
          ? data[index].plan_fee / 1000000
          : ''} maxLength="6" onChange={e => this.valueChange(e, index)} />
        </td>
      } else {
        return <td key={String(columnIndex)}></td>
      }
    }

  }

  renderTotalColumn(row) {
    let sum = 0
    for (let data of this.state.data) {
      if (data.deadline_name === row) {
        sum += Number(data.plan_fee)
      }
    }
    if (this.props.readOnly) {
      return <td className="edi-table__sumrow">
        {formatNumber(sum.toFixed(0))}
      </td>
    } else {
      return <td className="edi-table__sumrow">
        {formatNumber(sum / 1000000)}
      </td>
    }
  }

  renderTotalRow() {
    if (this.props.readOnly) {
      return <tr className="edi-table__sumrow">
        <td>总计</td>
        {this.state.columnArr.map((col, i) => <td key={Number(i)}>{formatNumber(this.state.data.filter(item => item.plan_date === col.plan_date).map(item => item.plan_fee).reduce((a, b) => a + b).toFixed(0))}</td>)}
        <td>{
          formatNumber(
            this.state.data.length > 0
              ? (this.state.data.map(item => item.plan_fee).reduce((a, b) => a + b))
              : 0)
        }</td>
      </tr>
    } else {
      return <tr className="edi-table__sumrow">
        <td>总计</td>
        {this.state.columnArr.map((col, i) => <td key={Number(i)}>{formatNumber(this.state.data.filter(item => item.plan_date === col.plan_date).map(item => item.plan_fee).reduce((a, b) => a + b) / 1000000)}</td>)}
        <td>{
          formatNumber(
            this.state.data.length > 0
              ? (this.state.data.map(item => item.plan_fee).reduce((a, b) => a + b) / 1000000)
              : 0)
        }</td>
      </tr>
    }
  }

  render() {
    const { columnArr, rowArr } = this.state
    return (
      <table styleName="datatable-input">
        <thead>
          <tr>
            <th>日期/产品期限</th>
            {columnArr.map((col, i) => <th key={i}>{col.week_name}</th>)}
            <th style={{minWidth: '80px'}}>总计</th>
          </tr>
        </thead>
        <tbody>
          {rowArr.map((row, i) =>
            <tr key={i}><td>{row}</td>
              {columnArr.map((column, columnIndex) => this.renderColumns(row, column, columnIndex))}
              {this.renderTotalColumn(row)}
            </tr>)}
          {this.renderTotalRow()}
        </tbody>
      </table>
    )
  }
}

DeadlineTable.propTypes = {
  deadlineData: Proptypes.array.isRequired,
  valueChange: Proptypes.func,
  readOnly: Proptypes.bool
}
