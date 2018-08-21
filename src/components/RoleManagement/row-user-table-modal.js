/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Datatable from '../Datatable'
import Select from '../Select'
import {escCloser} from '../../utils/etc'

export default class RoleUserTableMode extends Component {
  static propTypes = {
    closer: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    searcher: PropTypes.func.isRequired,
    adder: PropTypes.func.isRequired,
    deleter: PropTypes.func.isRequired,
    roleId: PropTypes.string.isRequired,
    resetter: PropTypes.func.isRequired,
  }

  constructor(props){
    super(props)
    this.state = {
      message:{type:'',text:''},
      roleUserSearchType:'',
      showUserAddButton: false,
      showUserDeleteButton: true,
      checkedList:[]
    }
    this.handleUserSearch = this.handleUserSearch.bind(this)
    this.handleRoleUserTypeChange = this.handleRoleUserTypeChange.bind(this)
    this.renderRoleUserType = this.renderRoleUserType.bind(this)
    this.onUserSearch = this.onUserSearch.bind(this)
    this.addUser = this.addUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
    this.checkUserId = this.checkUserId.bind(this)

    let self = this
    this.userRowColumns = [
      {
        text: '',
        name: '',
        style: {maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis',textAlign:'center'},
        renderDom: row => {
          return (
                     <input type="checkbox" data-row-id={row.user_id}  onClick={(e)=>{self.checkUserId(e.target.checked, row.user_id)}} />

          )
        }
      },
      {
        text: '机构编码',
        name: 'org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '机构名称',
        name: 'user_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '用户账号',
        name: 'user_account',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '创建时间',
        name: 'rx_insertTime',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      }
    ]
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

  componentDidMount() {
    //this.handleUserSearch()
  }

  handleRoleUserTypeChange({value}) {

    if(value=='1')
    {
      this.setState({showUserAddButton:false})
      this.setState({showUserDeleteButton:true})
    }
    else {
      this.setState({showUserAddButton:true})
      this.setState({showUserDeleteButton:false})
    }

    this.setState({roleUserSearchType:value}, this.handleUserSearch)

  }

  onUserSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleUserSearch();
  }

  handleUserSearch() {

    this.setState({checkedList:[]})
    this.props.searcher({
      roleId: this.props.roleId,
      userAccount: this.userAccountInput && this.userAccountInput.value,
      searchType: this.state.roleUserSearchType,

    })

  }

  addUser(e)
  {
    e.preventDefault();
    e.stopPropagation();
    let valid = true, self = this

    if (this.state.checkedList.length==0) {
      valid = false
    }

    if (valid) {
      this.props.resetter()
      this.props.adder({role_id:this.props.roleId,user_list:this.state.checkedList,user_account: this.userAccountInput && this.userAccountInput.value,}).promise.then(() => {
        self.setState({message:{type:'SUCCESS',text:'添加角色用户成功',},checkedList:[]})
        setTimeout(() => {
          self.setState({message:{type:'SUCCESS',text:''}})
        }, 1000)
      })
    } else {
      //console.log(this.state.message)
      self.setState({message:{type:'FAIL',text:'请选择要添加的用户'}})
      setTimeout(() => {
        self.setState({message:{type:'FAIL',text:''}})
      }, 1000)
    }

  }

  deleteUser(e)
  {
    e.preventDefault();
    e.stopPropagation();
    let  valid = true,self=this

    if (this.state.checkedList.length==0) {
      valid = false
    }

    if (valid) {
      this.props.resetter()
      this.props.deleter({role_id:this.props.roleId,user_list:this.state.checkedList,user_account: this.userAccountInput && this.userAccountInput.value,}).promise.then(() => {
        self.setState({message:{type:'SUCCESS',text:'删除角色用户成功',},checkedList:[]})
        setTimeout(() => {
          self.setState({message:{type:'SUCCESS',text:''}})
        }, 1000)
      })
    } else {
      self.setState({message:{type:'FAIL',text:'请选择要删除的用户'}})
      setTimeout(() => {
        self.setState({message:{type:'FAIL',text:''}})
      }, 1000)
    }


  }

  checkUserId(value, id)
  {
    const {checkedList} = this.state
    if (value)
    {
      checkedList.push(id)
      this.setState({checkedList: [...checkedList]})
    }
    else {
      checkedList.splice(checkedList.indexOf(id), 1)
      this.setState({checkedList: [...checkedList]})
    }
  }
  renderRoleUserType() {

    let options, disabled = false, noEmpty = false
    options = [{label: "已添加", value: "1"},{label: "未添加", value: "0"}]
    disabled = false
    noEmpty = true
    return (
      <Select onChange={this.handleRoleUserTypeChange} options={options} disabled={disabled} noEmpty={noEmpty}/>
    )
  }

  render() {
    //const {closer, title,searcher,adder,deleter} = this.props
    const {closer, title,searcher,userData} = this.props
    const {message}=this.state
    var self = this
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
              <div className="component">
                <form className="filter-form clearfix" onSubmit={this.onUserSearch}>
                  <div className="row info-row">
                    <div className="col-sm-3">
                      <div className="form-group row">
                        <label className="col-sm-3">
                          <span>用户账号:</span>
                        </label>
                        <div className="col-sm-6">
                          <input type="search" placeholder="" defaultValue="" ref={(input) => {
                            this.userAccountInput = input;
                          }}/>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-3">
                      <div className="form-group row">
                        <label className="col-sm-3">
                          <span>用户分类</span>
                        </label>
                        <div className="col-sm-6">
                          {this.renderRoleUserType()}
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <button type="submit" className="btn icon-btn btn-primary pull-left edi-mr-sm">
                        <i className="fa fa-search"></i>搜索
                      </button>
                      {this.state.showUserAddButton &&
                      <button type="button" className="btn icon-btn btn-primary pull-left edi-mr-sm" onClick={this.addUser}>
                        <i className="fa fa-plus"></i>添加
                      </button>
                        }
                      {this.state.showUserDeleteButton &&
                      <button type="button" className="btn icon-btn btn-primary pull-left"
                              onClick={this.deleteUser}>
                        <i className="fa fa-minus"></i>删除
                      </button>
                      }
                    </div>
                  </div>
                </form>
                <div className="wrapper" style={{height:'auto'}}>

                    <Datatable columns={this.userRowColumns} rows={userData}
                               noPgaging={true}/>
                </div>


              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" onClick={closer}>关闭</button>
            </div>
            {message && message.text && (message.type == "SUCCESS") && <p className="text-tips__center-danger text-success"><i className="fa fa-success"></i> {message.text}</p>}
            {message && message.text && (message.type == "FAIL") && <p className="text-tips__center-danger text-warning"><i className="fa fa-warning"></i> {message.text}</p>}
          </div>
        </div>

      </div>
    )
  }
}
