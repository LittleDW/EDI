/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'

export default class Modal extends Component {
  constructor() {
    super()
    this.state = {
      index: 1
    }
    //this.handleSearch = this.handleSearch.bind(this)
    this.renderBlock = this.renderBlock.bind(this)
  }

  componentDidMount() {
    //this.handleSearch()
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.addEventListener("keydown", this.escCloser)
  }

  componentWillUnmount() {
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.removeEventListener("keydown", this.escCloser);
  }

  /*handleSearch(index) {
    //(typeof index != "undefined") && (this.state.index = index)
    this.props.searcher && this.props.searcher({
      orderNo: this.props.orderNo,
    })
  }*/

  renderFormGroup(column, row, key) {
    return (
      <div key={key} className="form-group"><label className="col-sm-3 control-label">{column.text}</label>
        <div
          className="col-sm-9 form-text">{column.renderDom ? column.renderDom(row) : row[column.name]}</div>
      </div>
    )
  }

  renderBlock(row, key) {
    var self = this
    return (
      <div className="block" key={key}>
        {this.props.columns.map((r, i) => self.renderFormGroup(r, row, i))}
      </div>
    )
  }

  render() {
    const {closer, data, title} = this.props
    var self = this;
    return (
      <div className="modal fade fade in" role="dialog">
        <div className="modal-backdrop fade in" onClick={closer}></div>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={closer}><span
                aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <form className="modal-body form-horizontal">
              {
                (data && data.length) ? data.map((r, i) => self.renderBlock(r, i)) : <h2>没有数据！</h2>
              }
            </form>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" onClick={closer}>关闭</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


Modal.propTypes = {
  /*loadingLabel: PropTypes.string.isRequired,
   pageCount: PropTypes.number,
   renderItem: PropTypes.func.isRequired,
   items: PropTypes.array.isRequired,
   isFetching: PropTypes.bool.isRequired,
   onLoadMoreClick: PropTypes.func.isRequired,
   nextPageUrl: PropTypes.string*/
  //type: PropTypes.string.isRequired
  columns: PropTypes.array.isRequired
}
