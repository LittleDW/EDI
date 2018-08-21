/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Datatable from '../Datatable'
import {escCloser} from '../../utils/etc'
export default class TableMode extends Component {
  constructor() {
    super()
    this.state = {
      tab: 0
    }
    this.selectTab = this.selectTab.bind(this)
  }

  componentDidMount() {
    //this.handleSearch()
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

  selectTab(tab){
    this.setState({tab})
  }
  render() {
    const {closer, title, columns, data, matched, unmatched, submit, message} = this.props
    let {tab} = this.state

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
              <ul className="nav nav-tabs">
                <li role="presentation" className={(tab == 0)?'active':''} onClick={()=>{this.selectTab(0)}}><a href="javascript:">匹配成功结果</a></li>
                <li role="presentation" className={(tab == 1)?'active':''} onClick={()=>{this.selectTab(1)}}><a href="javascript:">匹配失败结果</a></li>
              </ul>
              {(tab == 0) && <div className="wrapper__tab-area"><Datatable columns={columns} rows={matched} withCheckbox={true} noPgaging={true}/></div>}
              {(tab == 1) && <div className="wrapper__tab-area"><Datatable columns={columns} rows={unmatched} noPgaging={true}/></div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary pull-right" onClick={submit}>确认并创建</button>
              <button type="button" className="btn btn-default pull-right" onClick={closer}>关闭</button>
              {message && message.text && (message.type == "FAIL") && <p className="text-danger"><i className="fa fa-warning"></i> {message.text}</p>}
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
