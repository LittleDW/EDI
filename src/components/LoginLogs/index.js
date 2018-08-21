/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import Datatable from '../Datatable'
import Select from '../Select'
import UserTypeSelector from '../Select/UserTypeSelectorPage'
import SearchBar from '../Common/SearchBar'
import DatePicker from '../DatePicker'
import style from "./style.scss"

let columns = [
  {text: '登录用户', name: 'user_name', style: {'width': '160px'}},
  {text: '登录时间', name: 'login_time', style: {'width': '200px'}},
  {text: '登录IP', name: 'login_ip', style: {'width': '200px'}},
  {text: '登录代理IP', name: 'login_proxy_ip', style: {'width': '200px'}},
  {text: '登录浏览器', name: 'login_browser', style: {'width': '160px'}},
  {text: '登录操作系统', name: 'login_system', style: {'width': '160px'}},
  {text: 'Session ID', name: 'login_mac_address', style: {overflow: 'hidden', textOverflow: 'ellipsis'}}
], tableStyle = {'width': '100%', position: 'relative', height: '29rem', overflow: 'auto'}, opsStyle={display:"block"}

export default class LoginLogs extends Component {
  constructor() {
    super()
    this.state = {
      index: 1,
      type: '',
      userName:'',
      today: moment().format("yyyy-MM-dd"),
      startDate: null,
      endDate: null
    }
    var self = this
    this.handleSearch = this.handleSearch.bind(this)
    this.formatUserTypes = this.formatUserTypes.bind(this)
    this.getUserTypes = this.getUserTypes.bind(this)
    this.handleUserTypesChange = this.handleUserTypesChange.bind(this)
    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.handleStartDatesChange = this.handleStartDatesChange.bind(this)
    this.handleEndDatesChange = this.handleEndDatesChange.bind(this)
    this.onSearch = this.onSearch.bind(this)

    this.searchBarItems = [
      {
        label: "用户名:",
        type:"text",
        props: {
          ref:(input) => {this.userNameInput = input}
        }
      },
      {
        label: "用户类型:",
        type:"custom",
        dom: <UserTypeSelector onChange={this.handleUserTypesChange}/>
      },
      {
        label: "登录开始日:",
        type:"date",
        props:{
          showClearDate:true,
          onDateChange:self.handleStartDatesChange,
          output:"date",
          style: {width: "100%"}
        }
      },
      {
        label: "登录结束日:",
        type:"date",
        props:{
          showClearDate:true,
          onDateChange:self.handleEndDatesChange,
          output:"date",
          style: {width: "100%"}
        }
      }
    ]
  }

  formatUserTypes(s) {
    var status = this.getUserTypes(), result = status.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  getUserTypes() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "user_type"))
  }

  /*renderUserTypes() {
    var types = this.getUserTypes()
    return (
      <Select onChange={this.handleUserTypesChange} options={types.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }*/
  handleUserTypesChange(row) {
    // 不支持0类型
    this.state.type = row && row.value && !isNaN(row.value) ? Number(row.value): ''
    this.state.index = 1
    //this.setState({status:e.target.value})
    this.handleSearch()
  }
  handleDatesChange({startDate, endDate}) {
    this.setState({startDate, endDate}, () => {
      this.handleSearch()
    })
  }

  handleSearch(index) {
    let myIndex = (typeof index == 'undefined') ? 1: index
    this.setState({index: myIndex}, () => {
      this.props.searcher({
        pageIndex: this.state.index,
        loginTimeStart: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00'),
        loginTimeEnd: this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59'),
        userName: this.userNameInput.value,
        userType: this.state.type
      })
    })
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleStartDatesChange(date) {
    this.setState({startDate:date}, this.handleSearch)
  }
  handleEndDatesChange(date) {
    this.setState({endDate:date}, this.handleSearch)
  }

  render() {
    const {data, searcher} = this.props
    return (
      <div className={`${style["login-logs"]}`}>
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <button type="submit" className="btn icon-btn btn-primary pull-left">
            <i className="fa fa-search"></i>搜索
          </button>
        </SearchBar>

        {/*<form className={`${style["login-logs-table-infos"]} clearfix`} onSubmit={this.onSearch}>
          <div className={`row ${style["info-row"]}`}>
            <div className="col-sm-2">
              <div className="form-group row">
                <label className="col-sm-4">
                  <span>用户名:</span>
                </label>
                <div className="col-sm-8">
                  <input type="search" placeholder="" defaultValue="" ref={(input) => {
                    this.userNameInput = input;
                  }}/>
                </div>
              </div>
            </div>
            <div className="col-sm-2">
              <div className="form-group row">
                <label className="col-sm-4">
                  <span>用户类型:</span>
                </label>
                <div className="col-sm-8">
                  <UserTypeSelector onChange={this.handleUserTypesChange}/>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="form-group row">
                <label className="col-sm-2">
                  <span>登录日期:</span>
                </label>
                <div className="col-sm-8">
                  <DatePicker onDatesChange={this.handleDatesChange}/>
                </div>
              </div>
            </div>
            <div className="col-sm-2">
              <button type="submit" className="btn icon-btn btn-primary pull-left">
                <i className="fa fa-search"></i>搜索
              </button>
            </div>
          </div>
        </form>*/}

        <div className={style["login-logs-table-wrapper"]}>
          <Datatable columns={columns} rows={data.rows} index={this.state.index} searcher={this.handleSearch}
                     style={tableStyle} total={data.total}/>
        </div>
      </div>
    )
  }
}
