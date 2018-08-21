/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import Datatable from '../Datatable'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import Dialog from '../Dialog'

/**
 * 作者：张宝玉
 * 模块：操作日志弹窗
 * */

class OperLogModal extends Component {
  constructor() {
    super()
    this.state = {
      index: 1,
      _loading: true,
      data: {}
    }

    this.handleSearch = this.handleSearch.bind(this)

    let self = this
    this.rowColumns = [

      {
        text: '动作',
        name: 'oper_log',
        withTitle: true,
        style: {overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px'}
      },
      {
        text: '操作人',
        name: 'user_name',
        style: {width: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
        //renderDom: row => row.sub_user_name=='' ? row.user_name : row.sub_user_name
      },
      {
        text: '操作时间',
        name: 'oper_time',
        style: {width: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}
      }
    ]

  }

  componentDidMount() {
    this.handleSearch()
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

  handleSearch(index) {
    let myIndex = (typeof index == 'undefined') ? 1 : index,
      {searcher, combindSearcher, type} = this.props
    this.setState({index: myIndex, _loading: true}, () => {
      if(type === 1){
        combindSearcher({
          pageIndex: this.state.index,
          from_table_collection: this.props.fromTableCollection
        }).promise.then(() => {
          this.setState({_loading: false})
        })
      } else {
        searcher({
          pageIndex: this.state.index,
          from_table: this.props.tableName,
          from_table_key: this.props.tableKey,
          action_type: this.props.actionType || '',
        }).promise.then(() => {
          this.setState({_loading: false})
        })
      }
    })
  }

  resetOperlog = () => {
    this.props.resetOperlog()
    this.props.closer()
  }

  render() {
    const {title, operLog} = this.props
    var self = this;
    return (
      <div className="modal fade fade in" role="dialog">
        <div className="modal-backdrop fade in" onClick={this.resetOperlog}></div>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={this.resetOperlog}><span
                aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              <div className="block">
                <Datatable columns={this.rowColumns} rows={operLog && operLog.rows} index={this.state.index}
                           searcher={this.handleSearch} total={operLog.total} />
                {this.state._loading && <div style={{'position': 'absolute', 'bottom': '48%', 'left': '48%'}}><i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" onClick={this.resetOperlog}>关闭</button>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

OperLogModal.propTypes = {
  closer: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  tableName: PropTypes.string.isRequired,
  tableKey: PropTypes.string.isRequired,
  actionType: PropTypes.string,
}


const mapStateToProps = (state, ownProps) => ({
  operLog: state.operLogModal
})

export default connect(mapStateToProps, {
  searcher: actions.CALL_OPER_LOG_MODAL,
  combindSearcher: actions.CALL_OPER_LOG_COMBINED_MODAL,
  resetOperlog: actions.RESET_OPER_LOG
})(OperLogModal)
