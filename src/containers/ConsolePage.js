/**
 * 作者：石奇峰
 * 功能：Edi的页面容器，在用户登录后要显示，显示内容包括左边的菜单，上面的状态栏这2部分
 * */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Route, Switch} from 'react-router-dom'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {actions} from '../redux/actions'
import ToastPage from '../components/Toast'
import Dialog from '../components/Dialog'
import Cookies from "js-cookie/src/js.cookie";
import logo from '../assets/logo.png'
import Selectors from '../redux/selectors'
import GenericContainer from './GenericContainer'
import {camelize} from 'humps'

import 'moment/locale/zh-cn'
import moment from 'moment'
import {escCloser,isMobile} from "../utils/etc";
import CSSModules from "react-css-modules/dist/index";
import style from "../styles/modules.scss"

moment.locale('zh-cn');

@CSSModules(style, {allowMultiple: true})
class ConsolePage extends Component {
  static propTypes = {
    dictionary: PropTypes.object.isRequired,
    menuSelection: PropTypes.object.isRequired,
    CALL_DIC: PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {
      routers: [],
      showHint: false,
      confirmDependencies: false
    }
    this.isMobile = isMobile();
    this.navigateTo = this.navigateTo.bind(this);
    this.renderMenus = this.renderMenus.bind(this);
    this.renderSubMenus = this.renderSubMenus.bind(this);
    this.logout = this.logout.bind(this)
    this.renderNavHead = this.renderNavHead.bind(this)
    this.toggleNavCollapse = this.toggleNavCollapse.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.updateDimensions = this.updateDimensions.bind(this)
    this.processing = this.processing.bind(this)
    this.renderRoute = this.renderRoute.bind(this)
    this.selectMenu = this.selectMenu.bind(this)
    this.escCloser = escCloser(this.closeHint)
  }

  componentWillMount() {
    window.addEventListener("click", this.closeHint)
    window.addEventListener("keydown", this.escCloser)
    // 临时修改，用于增进手机端的使用体验，手机版利用 isLeftNavCollapse 字段，不过正好反过来，正式的edi手机版后续会增加以替换掉当前设置
    if(this.isMobile){
      this.setState({isLeftNavCollapse: false})
    } else {
      this.setState({isLeftNavCollapse: (window.innerWidth < 1650)})
    }
  }

  componentDidMount() {
    let {_session, history, dictionary, CALL_DIC} = this.props, {menu} = dictionary, self = this
    if (!_session) {
      history.push("/")
    } else if (!menu || !menu.length) {
      CALL_DIC().promise.then(({response}) => {
        //window.sessionStorage.setItem("edi.dictionary", JSON.stringify(response))
        self.processing().then(() => {
          self.selectMenu(response)
        })
      })
    } else {
      self.processing().then(() => {
        self.selectMenu(dictionary)
      })
    }
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps._session) {
      this.props.history.push("/")
    }
    let {dependencies} = this.props, {dependencies: nextDependencies} = nextProps
    if(dependencies !== nextDependencies){
      this.setState({confirmDependencies: false},this.selectMenu)
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
    window.removeEventListener("click", this.closeHint);
    window.removeEventListener("keydown", this.escCloser);
  }

  selectMenu() {
    const {match, history, menuSelection, menuEntities, dictionary, SET_MESSAGE} = this.props
    const {submenu} = menuEntities.entities
    const {dependencies} = dictionary
    //let {menu} = dictionary

    if (dependencies[0]){
      var {submenu:id} = dependencies[0], target = Object.values(submenu).find(r=>r.id == id)
      if(target){
        history.push(`/console/${camelize(target.id)}`.replace(/\/+/, "/"))
      } else {
        SET_MESSAGE("用户信息不完整，且没有信息补完页面权限，请联系管理员","FAIL")
      }
    } else if (match.isExact) {
      if ((menuSelection.subentryEntity) && (typeof menuSelection.subentryEntity == "string")) {
        history.push(menuSelection.subentryEntity.path)
      } else if (dependencies[0]){
        var {id, path} = dependencies[0], target = Object.values(submenu).find(r=>r.id == id)
        if(target){
          history.push(`${match.url}/${camelize(target.id)}`.replace(/\/+/, "/"))
        } else {
          SET_MESSAGE("用户信息不完整，且没有信息补完页面权限，请联系管理员","FAIL")
        }
      } else if (submenu && Object.keys(submenu).length) {
        history.push(`${match.url}/${camelize(Object.values(submenu)[0].id)}`.replace(/\/+/, "/"))
      }
    }
  }

  updateDimensions() {
    if(this.isMobile){
      this.setState({isLeftNavCollapse: false})
    } else {
      this.setState({isLeftNavCollapse: (window.innerWidth < 1650)})
    }
  }

  logout() {
    var {LOGOUT, history, CALL_LOGOUT} = this.props
    CALL_LOGOUT().promise.then(()=>{
      //Cookies.remove('_edi_session');
      //window.sessionStorage.removeItem("edi.dictionary")
      LOGOUT()
      history.push("/")
    })
  }

  navigateTo(entry, subentry, path) {
    var {history} = this.props
    if (this.props._session) {
      history.push(path)
    } else {
      history.push("/")
    }
  }

  toggleMenu(entry) {
    var {menuSelection, SELECT_MENU, menuEntities} = this.props
    const {submenu} = menuEntities.entities
    if (entry.id != menuSelection.entry) {
      SELECT_MENU({entry: entry.id, subentry: menuSelection.subentry || (submenu && Object.keys(submenu).length? Object.values(submenu)[0].id: "")})
    } else {
      SELECT_MENU({entry: -1, subentry: menuSelection.subentry})
    }

  }

  toggleNavCollapse(e) {
    e.preventDefault();
    this.setState({isLeftNavCollapse: !this.state.isLeftNavCollapse})
  }

  renderSubMenus(entryName, subentry, i) {
    var self = this
    const {name, id} = subentry
    const {menuSelection, match, dictionary} = this.props
    const {dependencies} = dictionary
    let dependencyBlocker = (dependencies.length > 0)
    return (
      <li key={i} className={(menuSelection.subentry == id) ? 'active' : ''} onClick={() => {
        !dependencyBlocker && self.navigateTo(entryName, name, `${match.url}/${camelize(id)}`)
      }}><a href="javascript:">{name}</a></li>
    )
  }


  renderMenus(entry, j) {
    var self = this
    const {children, id} = entry
    const {menuSelection} = this.props

    return (
      <li className={(menuSelection.entry == id) ? 'active' : ''} key={j}>
        <a href="javascript:" className="submenu-title" onClick={() => {
          this.toggleMenu(entry)
        }}>
          <i className={`fa fa-lg fa-fw ${entry.iconClassName}`}></i>
          {!self.state.isLeftNavCollapse && <span className="nav-label">{entry.name}</span>}
        </a>
        <ul className="submenu-content">
          {children.map((r, i) => {
            return self.renderSubMenus(entry.name, r, i)
          })}
        </ul>
      </li>
    )
  }

  renderNavHead() {
    if (this.state.isLeftNavCollapse) {
      return (
        <div className="menu-head">
          <img src={logo}/>
        </div>
      )
    } else {
      return (
        <div className="menu-head">
          <h4 className="menu-head-title">EDI数据交互平台</h4>
          <p className="menu-head-desc">一个走心的平台</p>
        </div>
      )
    }

  }

  processing() {
    const {menuEntities} = this.props;
    const {submenu, pagebutton} = menuEntities.entities
    if (submenu) {
      let submenuIDs = Object.values(submenu).map(value => value.id);
      let agents = Object.values(GenericContainer).filter(value => submenuIDs.includes(value.id)).map((value, i) => {
        let container = value, subentry = container.id, submenuItem = submenu[subentry],
          path = camelize(subentry),
          children = (typeof pagebutton == "object")?Object.values(pagebutton).filter(value => submenuItem.id == value.parent):[]
        return {path, router: container.router, children}
      })
      let subAgents = Object.values(GenericContainer).filter(value => {
        let subentry = value.id
        return (typeof subentry == "string") && subentry.includes(".") && submenuIDs.includes(subentry.split(".")[0])
      }).map((value, i) => {
        let container = value, subentry = container.id, path = camelize(subentry.split(".")[1])
        return {path, router: container.router}
      })
      return new Promise((res, rej) => {
        try {
          this.setState({routers: [...agents, ...subAgents]}, res)
        } catch (e) {
          rej(e)
        }
      })
    }
    return Promise.resolve()
  }

  renderRoute(route, index) {
    const {match} = this.props;
    const {path, router: Component, children} = route
    return (
      <Route key={index} path={`${match.url}/${path}`} render={props => (<Component {...props} buttons={children}/>)}/>)
  }

  toggleHint = (e)=>{
    e.preventDefault();
    e.stopPropagation();
    this.setState({showHint: !this.state.showHint})
  }

  closeHint = ()=>{
    if(this.state.closeHint){
      this.setState({showHint: false})
    }
  }

  closeDependencyHints = ()=>{
    if(!this.state.confirmDependencies){
      this.setState({confirmDependencies: true})
    }
  }
  render() {
    const {_session, match, menuSelection, dictionary} = this.props;
    const {menu, dependencies} = dictionary;
    const {routers, showHint, confirmDependencies, isLeftNavCollapse} = this.state
    let surviving_days = " 未知 ", user_name = "", dependencyBlocker = dependencies[0];
    if(_session){
      surviving_days = _session.surviving_days
      user_name = _session.sub_account && _session.sub_account.user_name || _session.user_name
    }
    var self = this,
      breadcumbEntry = menuSelection.entryEntity,
      breadcumbSubentry = menuSelection.subentryEntity, breadcumb = {
        entry: breadcumbEntry || -1,
        subentry: breadcumbSubentry || -1
      };

    return (
      <section id="section-main" className={`${this.state.isLeftNavCollapse ? `collapse-menu` : ''}`}>
        <ToastPage/>
        <section id='section-content'>
          <header id='header'>
            <ul className="nav-icons pull-left">
              <li><a href="javascript: " title="" className="btn btn-primary" onClick={this.toggleNavCollapse}>
                <i className="fa fa-bars"></i></a></li>
            </ul>

            <ul className="nav-icons header-right  pull-right">
              <li><a href="javascript:"><i className="fa fa-line-chart"></i> <span
                className="text">{`已安全运行${surviving_days}天`}</span></a></li>
              <li><a href="https://edi.rongcapital.cn/document/api/" target="_blank" title="对接文档">
                <i className="fa fa-book"></i> <span className="text">对接文档</span></a></li>
              {false && <li className="dropdown open drop-down-alert edi-message has-badge">
                <span className="badge">3</span>
                <a href="javascript:" onClick={this.toggleHint}>
                  <i className="fa fa-bell"></i> <span className="text">消息提示</span>
                </a>
                {showHint && <ul className="dropdown-menu">
                  <li>
                    <a href="mailbox.html">
                      <i className="fa fa-suitcase fa-fw" styleName="edi-mr-sm"></i> 您有 16 条待办
                      <span className="pull-right text-muted small">4 分钟前</span>
                    </a>
                  </li>
                  <li className="divider"></li>
                  <li>
                    <a href="profile.html">
                      <i className="fa fa-bar-chart fa-fw" styleName="edi-mr-sm"></i> 您有 3 条待办
                      <span className="pull-right text-muted small">12 小时前</span>
                    </a>
                  </li>
                  <li className="divider"></li>
                  <li>
                    <a href="grid_options.html">
                      <i className="fa fa-user-circle fa-fw" styleName="edi-mr-sm"></i> 服务器重置成功
                      <span className="pull-right text-muted small">4 天前</span>
                    </a>
                  </li>
                  <li className="divider"></li>
                  <li>
                    <div className="text-center link-block">
                      <a href="notifications.html">
                        <strong className="edi-mr">查看所有消息</strong>
                        <i className="fa fa-angle-right"></i>
                      </a>
                    </div>
                  </li>
                </ul>}
              </li>}
              <li>
                <a href="javascript: " title="" onClick={() => {
                  this.navigateTo(1, "10", `${match.url}/profile`)
                }}>
                  <span className="text">{user_name}</span>
                  <i className="fa fa-user-circle"></i>
                </a>
              </li>
              <li><a href="javascript: " title="" onClick={this.logout}><i className="fa fa- fa-sign-out"></i><span
                className="text">登出</span></a></li>
            </ul>
            <div className="breadcumb-inner pull-left">
              <ol className="breadcrumb">
                {breadcumb.entry && breadcumb.entry.name && <li><a href="javascript:">
                  <i className={`fa fa-fw ${breadcumb.entry.iconClassName}`}></i>
                  <span>{breadcumb.entry && breadcumb.entry.name || ''}</span></a>
                </li>}
                {breadcumb.subentry && breadcumb.subentry.name &&
                <li className="active"><span><strong>{breadcumb.subentry && breadcumb.subentry.name}</strong></span>
                </li>}
              </ol>
            </div>
          </header>
          <section id='content-container'>
            {_session &&
              <div className="content">
                <Switch>
                  {routers.map((r, i) => self.renderRoute(r, i))}
                </Switch>
              </div>
            }
          </section>
        </section>
        <aside id="menu">
          {
            this.renderNavHead()
          }
          <ul className="menu-content nav">
            {_session && menu && menu.map((r, i) => {
              return self.renderMenus(r, i)
            })
            }
          </ul>
        </aside>
        {!confirmDependencies && dependencyBlocker && <Dialog confirm={this.closeDependencyHints} title="提示" closer={this.closeDependencyHints} size="modal-md">
          {dependencyBlocker.hint}
        </Dialog>}
      </section>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    _session: state._session,
    menuSelection: state.menuSelection,
    dictionary: state.dictionary,
    menuEntities: Selectors.getMenuEntities(state)
  }
}

export default withRouter(connect(mapStateToProps, {
  SELECT_MENU: actions.SELECT_MENU,
  LOGOUT: actions.LOGOUT,
  CALL_LOGOUT: actions.CALL_LOGOUT,
  CALL_DIC: actions.CALL_DIC,
  SET_MESSAGE: actions.SET_MESSAGE
})(ConsolePage))
