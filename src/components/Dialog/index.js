import React, { Component } from 'react'
import { escCloser } from '../../utils/etc'
import PropTypes from 'prop-types'

export default class Dialog extends Component {
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
    const {closer, title, confirm,size, disabled, message, style} = this.props
    let classNameSize = size || "modal-lg"
    var self = this;
    return (
      <div className="modal fade fade in edi-dialog" role="dialog">
        <div className="modal-backdrop fade in" onClick={ closer }></div>
        <div className={`modal-dialog ${classNameSize}`} role="document" style={style}>
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={ closer } disabled={disabled}><span aria-hidden="true">×</span></button>
              <h4 className="modal-title">{ title }</h4>
            </div>
            <div className="modal-body">
              <div className='block'>
              {self.props.children}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary pull-right" onClick={ confirm } disabled={disabled}>确定</button>
              <button type="button" className="btn btn-default pull-right" onClick={ closer } disabled={disabled}>关闭</button>
              {message && message.text && (message.type === "INFO") && <p className="dialog-message text-info"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type === "FAIL") && <p className="dialog-message text-danger"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type === "SUCCESS") && <p className="dialog-message text-success"><i className="fa fa-warning"></i> {message.text}</p>}
            </div>
          </form>
        </div>
      </div>
    )
  }
}

Dialog.propTypes = {
  title: PropTypes.string,
  sizetitle: PropTypes.string,
  confirm: PropTypes.func.isRequired,
  closer: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}
