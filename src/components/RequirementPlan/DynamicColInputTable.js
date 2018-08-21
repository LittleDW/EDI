import React, {Component} from "react";
import PropTypes from "prop-types";
import CSSModules from 'react-css-modules'
import style from './style.scss'
import { formatNumber, unique } from '../../utils/etc'

@CSSModules(style, {allowMultiple: true})
class DynamicColInputTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      columnArr: [],
      rowArr: []
    }
  }

  componentDidMount() {
    this.handleProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.handleProps(nextProps)
    }
  }

  handleProps = (props) => {
    let data = []
    props.data.forEach(item => {
      let obj = {...item}
      data.push(obj)
    })
    const {columnIterator, rowIterator, valueIterator} = props
    let columnArr = unique(data, columnIterator).map(item => {
      return { [columnIterator]: item[columnIterator], [rowIterator]: item[rowIterator] }
    })
    data.forEach(item => {
      if (item[valueIterator] === null) {
        item[valueIterator] = 0
      }
    })
    if (props.readOnly) {
      data.forEach(item => item[valueIterator] = item[valueIterator] / 1000000)
    }
    let rowArr = unique(data, rowIterator)
    this.setState({ data, columnArr, rowArr })
  }

  valueChange = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const {columnIterator, rowIterator, valueIterator} = this.props
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
    let _data = this.state.data.slice()
    _data[index][valueIterator] = value
    this.props.valueChange(_data)
  }


  // render每一列
  renderColumns = (row, column, columnIndex) => {
    const { data } = this.state
    const {columnIterator, rowIterator, valueIterator} = this.props
    if (this.props.readOnly) {
      let sum = data.filter((item => item[columnIterator] === column[columnIterator] && item[rowIterator] === row[rowIterator])).map(item => item[valueIterator]).reduce((a, b) => a + b, 0)
      return <td key={String(columnIndex)}><span>{formatNumber(parseInt(Number(sum)))}</span></td>
    } else {
      let index = -1
      for (let i = 0; i < data.length; i++) {
        if (data[i][columnIterator] === column[columnIterator] && data[i][rowIterator] === row[rowIterator]) {
          index = i
          break
        }
      }
      if (index >= 0) {
        return <td key={String(index)}><input type="text" styleName="table-input" value={data[index][valueIterator] !== ''
          ? data[index][valueIterator] / 1000000
          : ''} maxLength="6" onChange={e => this.valueChange(e, index)} />
        </td>
      } else {
        return <td key={String(columnIndex)}></td>
      }
    }

  }

  renderTotalColumn = (row) => {
    const {columnIterator, rowIterator, valueIterator} = this.props
    let sum = 0
    for (let data of this.state.data) {
      if (data[rowIterator] === row[rowIterator]) {
        sum += Number(data[valueIterator])
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

  renderTotalRow = () => {
    const {columnIterator, rowIterator, valueIterator, showTotalColumn, filterRow} = this.props
    if (this.props.readOnly) {
      return <tr className="edi-table__sumrow">
        {showTotalColumn && <td>总计</td>}
        {this.state.columnArr.map((col, i) => <td key={Number(i)}>{formatNumber(this.state.data.filter(item => item[columnIterator] === col[columnIterator] && (filterRow ? filterRow(item) : true)).map(item => item[valueIterator]).reduce((a, b) => a + b, 0).toFixed(0))}</td>)}
        <td>{
          formatNumber(
            this.state.data.length > 0
              ? (this.state.data.map(item => item[valueIterator]).reduce((a, b) => a + b))
              : 0)
        }</td>
      </tr>
    } else {
      return <tr className="edi-table__sumrow">
        {showTotalColumn && <td>总计</td>}
        {this.state.columnArr.map((col, i) => <td key={Number(i)}>{formatNumber(this.state.data.filter(item => item[columnIterator] === col[columnIterator] && (filterRow ? filterRow(item) : true)).map(item => item[valueIterator]).reduce((a, b) => a + b) / 1000000)}</td>)}
        <td>{
          formatNumber(
            this.state.data.length > 0
              ? (this.state.data.map(item => item[valueIterator]).reduce((a, b) => a + b) / 1000000)
              : 0)
        }</td>
      </tr>
    }
  }

  render() {
    const { columnArr, rowArr } = this.state
    const {title, columnIterator, rowIterator, renderRow, showTotalRow, showTotalColumn, filterRow} = this.props
    return (
      <table styleName="datatable-input">
        <thead>
        <tr>
          <th>{title}</th>
          {columnArr.map((col, i) => <th key={i}>{col[columnIterator]}</th>)}
          {showTotalColumn && <th style={{minWidth: '80px'}}>总计</th>}
        </tr>
        </thead>
        <tbody>
        {rowArr.map((row, i) =>
          (filterRow ? filterRow(row) : true) && <tr key={i}><td>{renderRow ? renderRow(row) : row[rowIterator]}</td>
            {columnArr.map((column, columnIndex) => this.renderColumns(row, column, columnIndex))}
            {showTotalColumn && this.renderTotalColumn(row)}
          </tr>)}
        {showTotalRow && this.renderTotalRow()}
        </tbody>
      </table>
    )
  }
}

DynamicColInputTable.defaultProps = {
  showTotalRow: true,
  showTotalColumn: true,
}

DynamicColInputTable.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  rowIterator: PropTypes.string.isRequired,
  renderRow: PropTypes.func,
  filterRow: PropTypes.func,
  columnIterator: PropTypes.string.isRequired,
  valueIterator: PropTypes.string.isRequired,
  valueChange: PropTypes.func,
  showTotalRow: PropTypes.bool.isRequired,
  showTotalColumn: PropTypes.bool.isRequired,
};

export default DynamicColInputTable;
