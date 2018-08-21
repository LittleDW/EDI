import React, {Component} from 'react'
import PropTypes from 'prop-types'
import CSSModules from 'react-css-modules'
import style from './style.scss'
import {unique} from "../../utils/etc";
// import Datatable from './index'
import Datatable from './DatatableScroll'

@CSSModules(style)
export default class CustomRowTable extends Component {
  constructor(props) {
    super(props)
    this.handleProps = (props) =>{
      const {data, rowIterator, columnIterator, valueIterator, renderRow, renderColumn, renderValue, title, showRowTotal, showColumnTotal} = props
      let _data = []
      let _columns = unique(data, columnIterator)
      let _rows = unique(data, rowIterator)
      let rowSymbol = Symbol()
      let totalSum = 0
      _rows.forEach(_row => {
        let row = {}, sum = 0
        row['iter'] = renderRow ? renderRow(_row) : _row[rowIterator]
        _columns.forEach(_columns => {
          let columnIter = _columns[columnIterator]
          let value = data.find(item => item[rowIterator] === _row[rowIterator] && item[columnIterator] === columnIter)
          sum += parseFloat(value[valueIterator])
          row[columnIter] = value && renderValue? renderValue(value[valueIterator]) : value[valueIterator]
        })
        if (showRowTotal === true) {
          row[rowSymbol] = renderValue? renderValue(sum) : sum
        }
        totalSum += sum
        _data.push(row)
      })
      if (showColumnTotal === true) {
        let totalRow = {
          'iter': '合计'
        }
        _columns.forEach(column => {
          let totalValue = data.filter(item => item[columnIterator] === column[columnIterator]).map(item => item[valueIterator]).reduce((a, b) => parseFloat(a) + parseFloat(b), 0)
          totalRow[column[columnIterator]] = renderValue ? renderValue(totalValue) : totalValue
        })
        if (showRowTotal === true) {
          totalRow[rowSymbol] = renderValue? renderValue(totalSum) : totalSum
        }
        _data.push(totalRow)
      }
      let columns = [{text: title, name: 'iter', style: {"textAlign": "center", maxWidth: '100px', minWidth: '100px',overflow: 'hidden', textOverflow: 'ellipsis'}}].concat(_columns.map(column => {return {text: renderColumn ? renderColumn(column[columnIterator]):column[columnIterator], name: column[columnIterator], withTitle: true, style: {textAlign: "right", maxWidth: '120px', minWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis'}}}))
      if (showRowTotal === true) {
        columns.push({text: '合计', name: rowSymbol, style: {backgroundColor: '#f0f0f0', "textAlign": "right",maxWidth: '120px', minWidth: '120px'}})
      }
      return {rows: _data, columns: columns.slice()}
    }
  }
  render() {
    const {bodyHeight} = this.props
    return (
      <div styleName={this.props.scroll === false? "" : "datatable__custom-row"}>
        <Datatable {...this.handleProps(this.props)} bodyHeight={bodyHeight}/>
      </div>
    )
  }
}

CustomRowTable.propTypes = {
  data: PropTypes.array.isRequired,
  rowIterator: PropTypes.string.isRequired,
  columnIterator: PropTypes.string.isRequired,
  valueIterator: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  renderRow: PropTypes.func,
  renderColumn: PropTypes.func,
  renderValue: PropTypes.func,
  showRowTotal: PropTypes.bool,
  showColumnTotal: PropTypes.bool,
  scroll: PropTypes.bool,
}
