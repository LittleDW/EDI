/* eslint-disable no-undef */

import React, {Component} from 'react'
import Pagination from '../Pagination'
import PropTypes from 'prop-types'
import CSSModules from 'react-css-modules'
import myStyle from "./style.scss"

@CSSModules(myStyle, {allowMultiple: true})
export default class Datatable extends Component {
  constructor(props) {
    super(props)
    this.renderRows = this.renderRows.bind(this)
    this.renderCheckbox = this.renderCheckbox.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.handleCheckAll = this.handleCheckAll.bind(this)
    this.checkAllChecked = this.checkAllChecked.bind(this)
  }

  renderTHColumns(column, i) {
    return (
      <th style={column.style} key={i}>{column.text}</th>
    )
  }

  renderTDColumns(row, column, j) {
    return (
      <td key={j} style={column.style}
          title={column.withTitle ? row[column.name] : ""}>{column.renderDom ? column.renderDom(row) : row[column.name]}</td>
    )
  }
  handleCheckboxChange(e, row){
    row._checked = !row._checked
    this.forceUpdate()
  }
  handleRadioChange(e, row, data){
    data._selected = row
    this.forceUpdate()
  }
  handleCheckAll(e){
    const {rows} = this.props
    var unchecked = rows.filter(r=>!r._checked)
    if(unchecked.length){
      rows.map(r=>{r._checked = true})
    } else {
      rows.map(r=>{r._checked = false})
    }
    this.forceUpdate()
  }
  checkAllChecked(e){
    const {rows} = this.props
    return rows.filter(r=>!r._checked).length == 0
  }
  renderCheckbox(row) {
    var self = this
    return (
      <input type="checkbox" onChange={(e)=>self.handleCheckboxChange(e, row)} checked={row._checked}/>
    )
  }

  renderRadio(row, data) {
    var self = this
    return (
      <input type="radio" onChange={(e)=>{self.handleRadioChange(e,row,data)}} checked={data._selected === row}/>
    )
  }

  renderRows(row, columns, i) {
    const {withCheckbox, withRadio, rows} = this.props

    return (
      <tr key={i} >
        {withCheckbox && <td className="text-center">{this.renderCheckbox(row)}</td>}
        {withRadio && <td className="text-center">{this.renderRadio(row, rows)}</td>}
        {columns.map((r, j) => this.renderTDColumns(row, r, j))}
      </tr>
    )
  }

  render() {
    const {columns, rows, searcher, style, index, total, noPgaging, withCheckbox, withRadio,} = this.props
    var self = this
    //const total = rows && rows[0] && rows[0].SQL_CALC_FOUND_ROWS || 0
    return (
      <div style={style}>
        <table className={myStyle.datatable}>
          <thead>
          <tr>
            {withCheckbox && <th className="text-center" style={{width:"40px",minWidth:"40px"}}><input type="checkbox" onChange={self.handleCheckAll} checked={self.checkAllChecked()}/></th>}
            {withRadio && <th className="text-center" style={{width:"40px",minWidth:"40px"}}>操作</th>}
            {columns.map(this.renderTHColumns)}</tr>
          </thead>
          <tbody>
          {rows && rows.map((row, i) => {
            return this.renderRows(row, columns, i)
          })}
          </tbody>
        </table>

        {!noPgaging && <Pagination searcher={searcher} index={index} total={total}/>}
      </div>
    )
  }
}

Datatable.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  searcher: PropTypes.func,
  noPgaging: PropTypes.bool,
  withCheckbox: PropTypes.bool,
  withRadio: PropTypes.bool,
  style: PropTypes.object
}

