import React, { Component } from 'react'
import { escCloser } from '../../utils/etc'
import PropTypes from 'prop-types'

export default class Modal extends Component {
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
    const {closer, title, size,label, style} = this.props
    let classNameSize = size || "modal-lg"
    var self = this;
    return (
      <div className="modal fade fade in edi-dialog" role="dialog">
        <div className="modal-backdrop fade in" onClick={ closer }></div>
        <div className={`modal-dialog ${classNameSize}`} role="document" style={style}>
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={ closer }><span aria-hidden="true">×</span></button>
              <h4 className="modal-title">{ title }</h4>
            </div>
            <div className="modal-body" >


              <div className='block' style={{height:'300px'}}>
                {label &&
                <h4 className="modal-title">{ label }</h4>
                }
                { self.props.children }
              </div>
            </div>

          </form>
        </div>
      </div>
    )
  }
}

Modal.propTypes = {
  title: PropTypes.string,
  sizetitle: PropTypes.string,
  closer: PropTypes.func.isRequired,
}
