/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import style from './style.scss'
import Datatable from '../Datatable'
import {escCloser} from '../../utils/etc'
export default class TableMode extends Component {
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

  render() {
    const {closer, title, columns, data} = this.props
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
            <div className="modal-body">
              {data.length !== 0 ?
                <Datatable columns={columns} rows={data}
                           noPgaging={true}/> : <h2>没有数据！</h2>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" onClick={closer}>关闭</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

TableMode.propTypes = {
  closer: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
}
