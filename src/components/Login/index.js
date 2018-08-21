/* eslint-disable no-undef */


import style from './style.scss'

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../redux/middleware/agent'
import '../../redux/actions'
import {actions} from '../../redux/actions'
import ToastPage from '../../components/Toast'

class LoginPage extends Component {
  static propTypes = {
    CALL_LOGIN: PropTypes.func.isRequired,
    children: PropTypes.node
  }

  constructor(){
    super()
    this.state={
      userAccountError:false,
      passwordError:false,
      captchaError: false,
      submitting: false,
      captchaSvg: undefined
    }
    this.autoForward = this.autoForward.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.validateUserAccount = this.validateUserAccount.bind(this)
    this.validatePassword = this.validatePassword.bind(this)
  }

  handleSubmit(e){
    e.preventDefault()
    const {CALL_LOGIN,CALL_DIC,SET_MESSAGE} = this.props
    var {value:userAccount} = this.userAccountInput
    var {value:password} = this.passwordInput
    var captcha
    if(this.captchaInput){
      captcha = this.captchaInput.value
    }
    if(!userAccount || !password){
      SET_MESSAGE("用户名密码不能为空","FAIL")
      return
    }
    // bug fix 需要在登录时设置session storage因为它不会过期
    this.setState({submitting: true},()=>{
      CALL_LOGIN({userAccount, password, captcha}).promise.then(({response,error_response})=>{
        if(response && response.success){
          return CALL_DIC().promise.then(({response})=>{
            //window.sessionStorage.setItem("edi.dictionary", JSON.stringify(response))
            this.autoForward(this.props)
          })
        } else if(error_response){
          this.setState({captchaSvg: error_response && error_response.captcha,submitting: false})
        }
      }).catch(()=>{
        this.setState({submitting: false})
      })
    })

  }

  validateUserAccount(e){
    const {userAccountError} = this.state
    var {value} = this.userAccountInput
    if(!value && !userAccountError){
      this.setState({userAccountError:true})
    } else if (value && userAccountError){
      this.setState({userAccountError:false})
    }
  }

  validatePassword(e){
    const {passwordError} = this.state
    var {value} = this.passwordInput
    if(!value && !passwordError){
      this.setState({passwordError:true})
    } else if (value && passwordError){
      this.setState({passwordError:false})
    }
  }

  validateCaptcha=()=>{
    const {captchaError} = this.state
    var {value} = this.captchaInput
    if(!value && !captchaError){
      this.setState({captchaError:true})
    } else if (value && captchaError){
      this.setState({captchaError:false})
    }
  }
  autoForward(nextProps){
    var {_session, match, history} = nextProps || this.props
    if (_session && match.isExact) {
      history.push("/console")
    }
  }

  refreshCaptcha = (e)=>{
    e.preventDefault();
    e.stopPropagation();
    var {CALL_GET_CAPTCHA} = this.props, self = this
    return CALL_GET_CAPTCHA().promise.then(({response})=>{
      if(response && response.success){
        self.setState({captchaSvg: response.captcha})
      }
    })
  }
  componentWillMount() {
    var {CALL_GET_CAPTCHA} = this.props, self = this
    this.setState({submitting: true},()=>{
      return CALL_GET_CAPTCHA().promise.then(({response,error_response})=>{
        if(response && response.success){
          self.setState({captchaSvg: response.captcha})
        }
      }).then(()=>{
        this.setState({submitting: false})
      })
    })
  }
  componentDidMount() {
    this.autoForward()
  }

  /*componentWillUpdate = (nextProps) => {
    this.autoForward(nextProps)
  }*/

  render() {
    const {userAccountError, passwordError, captchaError, captchaSvg, submitting} = this.state

    return (
      <div>
        <ToastPage />
        <div className={style.wrapper}>
          <div className={style.bg}></div>
          <form onSubmit={this.handleSubmit} className={style["login-form"]}>
            <h2 className={style["project-title"]}>EDI数据交互平台</h2>
            <div className="form-group">
              <input name="userAccount" type="text" placeholder="请输入用户名" className={style["login-text"]}
                     onChange={this.validateUserAccount} ref={(input) => {this.userAccountInput = input}}/>
              {userAccountError && <span className="help-block">用户名不能为空</span>}
            </div>
            <div className="form-group">
              <input name="password" type="password" placeholder="请输入密码" className={style["login-text"]}
                     onChange={this.validatePassword} ref={(input) => {this.passwordInput = input}}/>
              {passwordError && <span className="help-block">密码不能为空</span>}
            </div>
            {
              captchaSvg && <div className="form-group" >
                <div className={style["captcha"]}>
                  <input name="captcha" type="text" placeholder="请输入验证码" className={style["login-text"]}
                         onChange={this.validateCaptcha} ref={(input) => {this.captchaInput = input}}/>
                  <img src={captchaSvg} onClick={this.refreshCaptcha}/>
                </div>
                {captchaError && <span className="help-block">验证码不能为空</span>}
              </div>
            }
            <button type="submit" disabled={submitting} className={`${style["login-submit"]} ${style["mg-1rem"]} btn btn-block btn-primary`}>登录</button>
            {/*<a href="javascript:"><small>忘记密码</small></a>
            <br/>*/}
            <p style={{color: '#8A6D3B'}}><i className="fa fa-warning"></i> <small>推荐您使用Chrome、Firefox、Safari等现代浏览器</small></p>
          </form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  _session: state._session
})

export default withRouter(connect(mapStateToProps, {
  CALL_LOGIN:actions.CALL_LOGIN,
  CALL_DIC: actions.CALL_DIC,
  CALL_GET_CAPTCHA: actions.CALL_GET_CAPTCHA,
  SET_MESSAGE: actions.SET_MESSAGE,
})(LoginPage))
