/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import Select from '../Select'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import Dialog from '../Dialog'

class Modal extends Component {
  constructor() {
    super()
    this.state = {
      data:{}
    }
    this.formInputs = {}
    //this.handleSearch = this.handleSearch.bind(this)
    //this.renderBlock = this.renderBlock.bind(this)
    this.renderFormGroup = this.renderFormGroup.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  componentDidMount() {
    //this.handleSearch()
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
    let {data} = this.state, self = this, {message,data:defaultData}=this.props, {labelClassName, entryClassName, text, readOnly, type,
      handleChange, name, options,getOptions, noEmpty, dom, renderDom, placeholder} = column, control

    if (renderDom){
      control = (<div className={`col-sm-5 ${entryClassName || ""}`}>{renderDom(row)}</div>)
    } else if (readOnly){
      control = (<div className="col-sm-5 form-text">{row[name]}</div>)
    } else if (type == "select"){
      control = (<div className={`col-sm-5 ${entryClassName || ""}`}><Select onChange={handleChange} defaultValue={defaultData[name]}
                                                   options={options || getOptions && getOptions().map((r, i) => ((typeof r == "object") && r.hasOwnProperty("value")? r: {label: r.para_value, value: r.para_key})) || []} noEmpty={noEmpty}/></div>)
    } else if (type == "custom"){
      control = (
        <div className={`col-sm-5 ${entryClassName || ""}`}>
          {dom}
        </div>
      )
    } else {
      control = (<div className={`col-sm-5 ${entryClassName || ""}`}>
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
        {message && message[name] && <div className="col-sm-3 form-text">
          <span className="help-block">{message[name]}</span>
        </div>}
      </div>
    )
  }
  renderTitle(column, row, key) {
    return (
      <div key={key} className="form-group">
        <h4 className={`col-sm-4 control-label ${column.titleClassName||''}`}>{column.title}:</h4>
      </div>
    )
  }

  handleConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    const {confirm} = this.props
    confirm(e)
  }

  render() {
    const {closer, title,columns, data, error, customRender} = this.props
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
            <div className="modal-body">
              <div className="block">
                {columns.map((r, i) => r.title? self.renderTitle(r,data,i) : self.renderFormGroup(r, data, i))}
              </div>
            </div>
            {customRender && customRender()}
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary pull-right" onClick={this.handleConfirm}>确定</button>
              <button type="button" className="btn btn-default pull-right" onClick={closer}>关闭</button>
              {error && error.text && (error.type == "FAIL") && <p className="text-danger dialog-message"><i className="fa fa-warning"></i> {error.text}</p>}
              {error && error.text && (error.type == "INFO") && <p className="text-info dialog-message"><i className="fa fa-warning"></i> {error.text}</p>}
              {error && error.text && (error.type == "SUCCESS") && <p className="text-success dialog-message"><i className="fa fa-warning"></i> {error.text}</p>}
            </div>
          </form>
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  columns: PropTypes.array.isRequired,
  message: PropTypes.object,
  error: PropTypes.object,
  RESET_MESSAGE:PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message,
  error: state.message})

export default connect(mapStateToProps, {
  RESET_MESSAGE:actions.RESET_MESSAGE
})(Modal)
