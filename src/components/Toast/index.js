/* eslint-disable no-undef */

import React, {Component} from 'react'
import myStyle from "./style.scss"
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {actions} from '../../redux/actions'

class ToastPage extends Component {
  constructor() {
    super()
    this.getClassNames = this.getClassNames.bind(this)
  }

  componentWillReceiveProps(nextProps){
    const {message} = nextProps;
    setTimeout(()=>{
      var {message:currentMessage} = this.props;
      if(currentMessage  === message){
        this.props.RESET_MESSAGE()
      }
    }, 10000)
  }

  getClassNames = () => {
    const {message} = this.props
    let type = message && message.type
    switch (type) {
      case 'SUCCESS':
        return 'alert-success'
      case 'FAIL':
        return 'alert-danger'
      case 'WARN':
        return 'alert-warning'
      default:
        return 'alert-info'
    }
  }

  render() {
    const {message,RESET_MESSAGE, style} = this.props;
    return (
      <div>
        {message && <div style={style} className={`alert alert-dismissable ${this.getClassNames()} ${myStyle.toast}`}>
          <button className="close" type="button" onClick={RESET_MESSAGE}>×</button>
          {message && message.text}
        </div>}
      </div>
    )
  }
}

ToastPage.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE:PropTypes.func,
}


const mapStateToProps = (state, ownProps) => {
  return {
    message: state.message,
  }
}

export default connect(mapStateToProps, {
  RESET_MESSAGE:actions.RESET_MESSAGE
})(ToastPage)
