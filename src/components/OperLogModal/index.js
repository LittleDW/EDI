/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import Select from '../Select'
import style from './style.scss'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import CSSModules from 'react-css-modules'

@CSSModules(style, {allowMultiple: true})
class OperLogModal extends Component {
  constructor() {
    super()
    this.state = {
      data:{}
    }
    this.formInputs = {}
    //this.handleSearch = this.handleSearch.bind(this)
    //this.renderBlock = this.renderBlock.bind(this)
    this.renderFormGroup = this.renderFormGroup.bind(this)
    this.renderTimeline = this.renderTimeline.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
  }

  componentDidMount() {
    this.handleSearch()
  }

  componentWillReceiveProps(nextProps) {

  }
  componentWillMount(){
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.addEventListener("keydown", this.escCloser)
  }
  componentWillUnmount() {
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.removeEventListener("keydown", this.escCloser);
  }
  renderFormGroup(column, row, key) {
    let {data} = this.state, self = this, {message,data:defaultData}=this.props, {labelClassName, text, readOnly, type,
      handleChange, name, options,getOptions, noEmpty, dom, renderDom, placeholder} = column, control

    if (readOnly){
      control = (<div className="col-sm-5 form-text">{renderDom? renderDom(row): row[name]}</div>)
    } else if (type == "select"){
      control = (<div className="col-sm-5"><Select onChange={handleChange} defaultValue={defaultData[name]}
                                                   options={options || getOptions && getOptions().map((r, i) => ((typeof r == "object") && r.hasOwnProperty("value")? r: {label: r.para_value, value: r.para_key})) || []} noEmpty={noEmpty}/></div>)
    } else if (type == "custom"){
      control = (
        <div className="col-sm-5">
          {dom}
        </div>
      )
    } else {
      control = (<div className="col-sm-5">
        <input type={type || 'text'} value={data[name]} defaultValue={defaultData[name]} placeholder={placeholder||''} ref={(input) => {
        self.formInputs[name] = {input}
      }} onChange={(e) => {
        self.formInputs[name].pristine = true
        handleChange(e)
        }}/></div>)
    }
    return (
      <div key={key} className="form-group"><label className={`col-sm-4 control-label ${labelClassName||''}`}>{text}</label>
        {control}
        {message && message[name] && <div className="col-sm-3">
          <span className="help-block">{message[name]}</span>
        </div>}
      </div>
    )
  }

  handleSearch() {
    const {CALL_OPER_LOG_SEARCH, fromTable, fromTableKey} = this.props
    CALL_OPER_LOG_SEARCH({fromTable, fromTableKey})
  }

  renderTimeline(row, key) {
    return (
      <article key={key} styleName="timeline-entry">
        <div styleName="timeline-entry-inner">
          <div styleName="timeline-time"><span>{row.action_type}</span></div>

          <div styleName="timeline-icon bg-success">
          </div>

          <div styleName="timeline-label">
            操作人:{row.user_name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.oper_time}
          </div>
        </div>
      </article>
    )
  }

  render() {
    const {closer, title, rows, error, customRender} = this.props
    var self = this;
    return (
    <div className="modal fade fade in" role="dialog">
      <div className="modal-backdrop fade in" onClick={closer}></div>
      <div className="modal-dialog modal-lg" role="document">
        <form className="modal-content form-horizontal" >
          <div className="modal-header">
            <button type="button" className="close" aria-label="Close" onClick={closer}><span
              aria-hidden="true">&times;</span></button>
            <h4 className="modal-title">{title}</h4>
          </div>
          <div className="modal-body" styleName="operLogModal">
            {customRender && customRender()}
            {rows && rows.length > 0 &&
              <div styleName="timeline-centered">
                {rows.map((row, key) => self.renderTimeline(row, key))}
                <article styleName="timeline-entry end">
                  <div styleName="timeline-entry-inner">
                    <div styleName="timeline-icon">
                    </div>
                  </div>
                </article>
              </div>
            }
            {rows && rows.length == 0 &&
            <article styleName="timeline-entry end">
              <div styleName="timeline-entry-inner">
                无记录
              </div>
            </article>
            }
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default pull-right" onClick={closer}>关闭</button>
            {error && error.text && (error.type == "FAIL") && <p className="dialog-message text-danger"><i className="fa fa-warning"></i> {error.text}</p>}
            {error && error.text && (error.type == "INFO") && <p className="dialog-message text-info"><i className="fa fa-warning"></i> {error.text}</p>}
            {error && error.text && (error.type == "SUCCESS") && <p className="dialog-message text-success"><i className="fa fa-warning"></i> {error.text}</p>}
          </div>
        </form>
      </div>
    </div>
    )
  }
}

OperLogModal.propTypes = {
  fromTable: PropTypes.string.isRequired,
  fromTableKey: PropTypes.string.isRequired,
  message: PropTypes.object,
  error: PropTypes.object,
  RESET_MESSAGE:PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  rows: state.operLog.rows,
  message: ownProps.message,
  error: state.message})

export default connect(mapStateToProps, {
  RESET_MESSAGE:actions.RESET_MESSAGE,
  CALL_OPER_LOG_SEARCH: actions.CALL_OPER_LOG_SEARCH
})(OperLogModal)
