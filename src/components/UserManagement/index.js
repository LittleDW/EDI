import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import Datatable from '../Datatable'
import Select from '../Select'
import UserTypeSelector from '../Select/UserTypeSelectorPage'
import OrgSelector from '../Select/OrgSelectorPage'
import UserAttributeFundAccountModeSelector from '../Select/UserAttributeFundAccountModeSelectorPage'
import UserAttributeIsIsAutoCreditSelector from '../Select/UserAttributeIsIsAutoCreditSelectorPage'
import SearchBar from '../Common/SearchBar'
import {FormatUserStatus, FormatUserType} from '../Formatter'
import Dialog from '../Dialog'
import TreeModal from "../TreeModal"
import OperLogModal from '../Modal/OperLogModal';


export default class UserManagement extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 1,
      showMode: false,
      showTreeMode: false,
      showOperLogModal: false,
      showUserAttributeMode: false,
      opsUserId: "",
      userAttribute: null,
      data: {},
      message: {
        user_type: '',
        org_code: '',
        user_status: '',
        user_account: '',
        password: '',
        user_name: '',
        user_full_name: '',
        rop_user_id: '',
        linkman: '',
        tel: '',
        mobile: '',
        email: ''
      },
      userType: undefined,
      checked: [],
      expanded: [],
      menus: [],
      confirmDelete: false,
      deleteUserId: "",
      deleteUserAccount: "",
    }
    this.showMode = this.showMode.bind(this)
    this.hideMode = this.hideMode.bind(this)
    this.showTreeMode = this.showTreeMode.bind(this)
    this.hideTreeMode = this.hideTreeMode.bind(this)
    this.update = this.update.bind(this)
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.openModeToEdit = this.openModeToEdit.bind(this)
    this.openModeToAuth = this.openModeToAuth.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.handleUserTypesChange = this.handleUserTypesChange.bind(this)
    this.handleOrgChange = this.handleOrgChange.bind(this)
    this.toggleOps = this.toggleOps.bind(this)
    this.clearOps = this.clearOps.bind(this)
    this.authorize = this.authorize.bind(this)
    this.openDeleteConfirm = this.openDeleteConfirm.bind(this)
    this.closeDeleteConfirm = this.closeDeleteConfirm.bind(this)
    this.openOperLogModal = this.openOperLogModal.bind(this);
    this.hideOperLogModal = this.hideOperLogModal.bind(this);

    var self = this
    this.rowColumns = [
      {
        text: '用户类型',
        name: 'user_type',
        style: {'width': '160px', textAlign: 'center'},
        renderDom: row => <FormatUserType value={row.user_type}/>
      },
      {
        text: '机构编码',
        name: 'org_code',
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '用户状态',
        name: 'user_status',
        style: {'width': '120px', textAlign: 'center'},
        renderDom: row => <FormatUserStatus value={row.user_status}/>
      },
      {
        text: '用户账号',
        name: 'user_account',
        style: {'width': '160px', textAlign: 'left'}
      },
      {
        text: '机构名',
        name: 'user_name',
        style: {'width': '160px', textAlign: 'left'}
      },
      {
        text: '用户手机',
        name: 'mobile',
        style: {width: '160px', textAlign: 'left'}
      },
      {
        text: '用户邮箱',
        name: 'email',
        style: {width: '160px', textAlign: 'left'}
      },
      {
        text: 'ROP平台编码',
        name: 'rop_user_id',
        style: {textAlign: 'left'}
      },
      {
        text: '操作', style: {width: '80px', textAlign: 'center'}, renderDom: row => {
        const {_buttons} = self.props;
        return (
          <div styleName="table-ops">
            <a href="javascript:" onClick={(e) => self.toggleOps(e, row)}>操作</a>
            <div styleName={(row.user_id == self.state.opsUserId) ? 'show-ops' : 'hidden-ops'}>
              {row.user_from==1 && <a href="javascript:" onClick={() => self.openModeToAuth(row)}>功能权限</a>}
              <a href="javascript:" onClick={() => self.openModeToEdit(row)}>修改</a>
              <a href="javascript:" onClick={(e) => self.openDeleteConfirm(row)}>删除</a>
              <a href="javascript:" onClick={() => self.openUserAttributeModal(row)}>用户属性</a>
              {Array.isArray(_buttons) && _buttons.includes("oper_log") &&
              <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>
              }
            </div>
          </div>
        )
      }
      }
    ]
    this.modalColumns = [
      {
        title: "基本信息"
      },
      {
        name: 'user_type',
        text: '用户类型',
        type: 'select',
        labelClassName: "asterisk",
        noEmpty: true,
        options: props && props.userTypes.slice(0, 4) || [],
        handleChange(row){
          self.state.data.user_type = row.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_type == undefined) || !row.user_type) ? "必填" : null
        }
      },
      {
        name: 'org_code',
        text: '机构编码',
        type: 'text',
        labelClassName: "asterisk",
        placeholder:"资金方F1502+3位数字, 资产方A1501+3位数字",
        handleChange(e){
          self.state.data.org_code = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if((typeof row.org_code == undefined) || !row.org_code){
            return "必填"
          } else if (row.org_code && (row.org_code.length > 20)){
            return "ROP用户编码不能超过20字"
          } else if((self.state.data.user_type == "1")&&(!/^A1501\d{3}$/.test(row.org_code))){
            return "资产方格式有问题"
          } else if((self.state.data.user_type == "2")&&(!/^F1502\d{3}$/.test(row.org_code))){
            return "资金方格式有问题"
          } else if((self.state.data.user_type == "3")&&(!/^O1503\d{3}$/.test(row.org_code))){
            return "资产管理员格式有问题"
          } else if((self.state.data.user_type == "4")&&(!/^X1504\d{3}$/.test(row.org_code))){
            return "系统管理员格式有问题"
          }
          //return ((typeof row.org_code == undefined) || !row.org_code) ? "必填" : (row.org_code && (row.org_code.length > 20) ? "ROP用户编码不能超过20字" : ((((self.state.data.user_type == "2")&&(/^F1502\d{3}$/.test(row.org_code))) ? null : ((((self.state.data.user_type == "1")&&(/^A1501\d{3}$/.test(row.org_code))) ? null : "格式有问题")))))
        }
      },
      {
        name: 'rop_user_id',
        text: 'ROP用户编码',
        type: 'text',
        placeholder:"格式为 8位-4位-4位-4位-12位 数字或大写字母",
        handleChange(e){
          self.setState({
            data: {
              ...self.state.data,
              rop_user_id: e.target.value,
            }
          })
        },
        validate: () => {
          var row = self.state.data
          return (row.rop_user_id && (row.rop_user_id.length > 50) ? "ROP用户编码不能超过50字" : (row.rop_user_id&&!/^([0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12})?$/.test(row.rop_user_id) ? "格式有问题" : null))
        }
      },
      {
        title: "用户名及联系方式"
      },
      {
        name: 'user_account',
        text: '用户账号',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_account = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_account == undefined) || !row.user_account) ? "必填" : ((row.user_account.length > 50) ? "用户账号不能超过50字" : null)
        }
      },
      {
        name: 'new_password',
        text: '新密码',
        type: 'password',
        labelClassName: "asterisk",
        handleChange: (e) => {
          self.state.data.new_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if((typeof row.new_password == undefined) || !row.new_password){
            return "必填"
          } else if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      },
      {
        name: 'confirm_password',
        text: '密码确认',
        type: 'password',
        labelClassName: "asterisk",
        handleChange: (e) => {
          self.state.data.confirm_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if((typeof row.confirm_password == undefined) || !row.confirm_password){
            return "必填"
          } else if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      },
      {
        name: 'user_name',
        text: '机构名',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_name == undefined) || !row.user_name) ? "必填" : ((row.user_name.length > 50) ? "机构名不能超过50字" : null)
        }
      },
      {
        name: 'user_full_name',
        text: '机构名全称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_full_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_full_name == undefined) || !row.user_full_name) ? "必填" : ((row.user_full_name.length > 50) ? "机构名全称不能超过50字" : null)
        }
      },
      {
        name: 'linkman',
        text: '联系人',
        type: 'text',
        handleChange(e){
          self.state.data.linkman = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.linkman && (row.linkman.length > 50) ? "联系人不能超过50字" : null)
        }
      },
      {
        name: 'tel',
        text: '电话',
        type: 'text',
        handleChange(e){
          self.state.data.tel = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.tel && (row.tel.length > 50) ? "电话不能超过50字" : null)
        }
      },
      {
        name: 'mobile',
        text: '手机',
        type: 'text',
        handleChange(e){
          self.state.data.mobile = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.mobile && (row.mobile.length > 50) ? "手机不能超过50字" : null)
        }
      },
      {
        name: 'email',
        text: '邮箱',
        type: 'text',
        handleChange(e){
          self.state.data.email = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.email && (row.email.length > 50) ? "邮箱不能超过50字" : null)
        }
      },
    ]

    this.modalColumnsUpdate = [
      {
        title: "基本信息"
      },
      {
        name: 'user_type',
        text: '用户类型',
        type: 'text',
        readOnly: true,
        entryClassName:"form-text",
        renderDom: row => <FormatUserType value={row.user_type} />
      },
      {
        name: 'org_code',
        text: '机构编码',
        type: 'text',
        readOnly: true
      },
      {
        name: 'rop_user_id',
        text: 'ROP用户编码',
        type: 'text',
        placeholder:"格式为 8位-4位-4位-4位-12位 数字或大写字母",
        handleChange(e){
          self.setState({
            data: {
              ...self.state.data,
              rop_user_id: e.target.value,
            }
          })
        },
        validate: () => {
          var row = self.state.data
          return (row.rop_user_id && (row.rop_user_id.length > 50) ? "ROP用户编码不能超过50字" : (row.rop_user_id&&!/^([0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12})?$/.test(row.rop_user_id) ? "格式有问题" : null))
        }
      },
      {
        title: "用户名及联系方式"
      },
      {
        name: 'user_account',
        text: '用户账号',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_account = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_account == undefined) || !row.user_account) ? "必填" : ((row.user_account.length > 50) ? "用户账号不能超过50字" : null)
        }
      },
      {
        name: 'new_password',
        text: '新密码',
        type: 'password',
        handleChange: (e) => {
          self.state.data.new_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      },
      {
        name: 'confirm_password',
        text: '密码确认',
        type: 'password',
        handleChange: (e) => {
          self.state.data.confirm_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      },
      {
        name: 'user_name',
        text: '机构名',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_name == undefined) || !row.user_name) ? "必填" : ((row.user_name.length > 50) ? "机构名不能超过50字" : null)
        }
      },
      {
        name: 'user_full_name',
        text: '机构名全称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_full_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_full_name == undefined) || !row.user_full_name) ? "必填" : ((row.user_full_name.length > 50) ? "机构名全称不能超过50字" : null)
        }
      },
      {
        name: 'linkman',
        text: '联系人',
        type: 'text',
        handleChange(e){
          self.state.data.linkman = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.linkman && (row.linkman.length > 50) ? "联系人不能超过50字" : null)
        }
      },
      {
        name: 'tel',
        text: '电话',
        type: 'text',
        handleChange(e){
          self.state.data.tel = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.tel && (row.tel.length > 50) ? "电话不能超过50字" : null)
        }
      },
      {
        name: 'mobile',
        text: '手机',
        type: 'text',
        handleChange(e){
          self.state.data.mobile = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.mobile && (row.mobile.length > 50) ? "手机不能超过50字" : null)
        }
      },
      {
        name: 'email',
        text: '邮箱',
        type: 'text',
        handleChange(e){
          self.state.data.email = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.email && (row.email.length > 50) ? "邮箱不能超过50字" : null)
        }
      },
    ]

    this.modalColumnsEx = [
      {
        title: "基本信息"
      },
      {
        name: 'user_type',
        text: '用户类型',
        type: 'text',
        readOnly: true,
        entryClassName:"form-text",
        renderDom: row => <FormatUserType value={row.user_type}/>

      },
      {
        name: 'org_code',
        text: '机构编码',
        type: 'text',
        readOnly: true,
      },
      {
        name: 'rop_user_id',
        text: 'ROP用户编码',
        type: 'text',
        placeholder:"格式为 8位-4位-4位-4位-12位 数字或大写字母",
        handleChange(e){
          self.state.data.rop_user_id = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.rop_user_id && (row.rop_user_id.length > 50) ? "ROP用户编码不能超过50字" : (row.rop_user_id&&!/^([0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12})?$/.test(row.rop_user_id) ? "格式有问题" : null))
        }
      },
      {
        title: "用户名及联系方式"
      },
      {
        name: 'user_account',
        text: '用户账号',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_account = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_account == undefined) || !row.user_account) ? "必填" : ((row.user_account.length > 50) ? "用户账号不能超过50字" : null)
        }
      },
      {
        name: 'new_password',
        text: '新密码',
        type: 'password',
        handleChange: (e) => {
          self.state.data.new_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      },
      {
        name: 'confirm_password',
        text: '密码确认',
        type: 'password',
        handleChange: (e) => {
          self.state.data.confirm_password = e.target.value
        },
        validate: () => {
          var row = self.state.data
          if (row.new_password != row.confirm_password){
            return "新密码前后输入不一致"
          }
          return null
        }
      },
      {
        name: 'user_name',
        text: '机构名',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_name == undefined) || !row.user_name) ? "必填" : ((row.user_name.length > 50) ? "机构名不能超过50字" : null)
        }
      },
      {
        name: 'user_full_name',
        text: '机构名全称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_full_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_full_name == undefined) || !row.user_full_name) ? "必填" : ((row.user_full_name.length > 50) ? "机构名全称不能超过50字" : null)
        }
      },
      {
        name: 'linkman',
        text: '联系人',
        type: 'text',
        handleChange(e){
          self.state.data.linkman = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.linkman && (row.linkman.length > 50) ? "联系人不能超过50字" : null)
        }
      },
      {
        name: 'tel',
        text: '电话',
        type: 'text',
        handleChange(e){
          self.state.data.tel = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.tel && (row.tel.length > 50) ? "电话不能超过50字" : null)
        }
      },
      {
        name: 'mobile',
        text: '手机',
        type: 'text',
        handleChange(e){
          self.state.data.mobile = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.mobile && (row.mobile.length > 50) ? "手机不能超过50字" : null)
        }
      },
      {
        name: 'email',
        text: '邮箱',
        type: 'text',
        handleChange(e){
          self.state.data.email = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.email && (row.email.length > 50) ? "邮箱不能超过50字" : null)
        }
      },
    ]

    this.adminAttributeModalColumn = [
      {
        title: "这是管理员😱😱😱😱"
      },
    ]

    this.assetAttributeModalColumn = [
      {
        title: "属性配置"
      },
      {
        name: 'is_auto_credit',
        text: '是否自动授信',
        type: 'text',
        renderDom: row=> <UserAttributeIsIsAutoCreditSelector noEmpty={true} onChange={(row)=>{
          /*if(self.state.userAttribute){
            self.state.userAttribute.is_auto_credit = row.value
          }*/
          self.state.userAttribute.is_auto_credit = row.value
        }} defaultValue={self.state.userAttribute.is_auto_credit} />,
        //options: props && props.userTypes.slice(0, 4) || [],
      },
    ]

    this.fundAttributeModalColumn = [
      {
        title: "属性配置"
      },
      {
        name: 'fund_account_mode',
        text: '资金方开户模式',
        type: 'text',
        renderDom: row=> <UserAttributeFundAccountModeSelector noEmpty={true} onChange={(row)=>{
          /*if(self.state.userAttribute){
            self.state.userAttribute.fund_account_mode = row.value
          }*/
          self.state.userAttribute.fund_account_mode = row.value
        }} defaultValue={self.state.userAttribute.fund_account_mode} />,
        //options: props && props.userTypes.slice(0, 4) || [],
      },
      {
        name: 'check_day',
        text: '审核失败有效天数',
        type: 'text',
        handleChange(e){
          self.state.userAttribute.check_day = e.target.value
        },
        validate: () => {
          var value = self.state.userAttribute.check_day
          if(isNaN(value)){
            return "必须是数字"
          } else {
            var number = Number(value)
            if(number < 0 || /^[1-9]\d*\.\d+$/.test(value)){
              return "必须是正整数"
            }
          }
        }
      },
      {
        name: 'raise_day',
        text: '募集失败有效天数',
        type: 'text',
        handleChange(e){
          self.state.userAttribute.raise_day = e.target.value
        },
        validate: () => {
          var value = self.state.userAttribute.raise_day
          if(isNaN(value)){
            return "必须是数字"
          } else {
            var number = Number(value)
            if(number < 0 || /^[1-9]\d*\.\d+$/.test(value)){
              return "必须是正整数"
            }
          }
        }
      },
    ]

    this.searchBarItems = [
      {
        label: "用户类型:",
        type:"custom",
        dom: <UserTypeSelector onChange={this.handleUserTypesChange}/>
      },
      {
        label: "机构:",
        type:"custom",
        renderDom:() => <OrgSelector allowedType={self.state.userType ? [self.state.userType] : [1,2,3,4,5,6]} onChange={this.handleOrgChange} />
      },
      {
        label: "用户账号:",
        type:"text",
        props:{
          ref:(input) => {this.userAccountInput = input;}
        }
      },
      {
        label: "机构名:",
        type:"text",
        props:{
          ref:(input) => {this.userNameInput = input;}
        }
      }
    ]
  }

  componentWillMount() {
    window.addEventListener("click", this.clearOps)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  clearOps() {
    if (this.state.opsUserId) {
      this.setState({...this.state, opsUserId: undefined})
    }
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleSearch(index) {
    let myIndex = (this.userAccountInput.value || this.userNameInput.value || typeof index == 'undefined') ? 1: index
    this.state.index = myIndex
    this.props.searcher({
      pageIndex: this.state.index,
      userType: this.state.userType,
      orgCode: this.state.orgCode,
      userAccount: this.userAccountInput.value,
      userName: this.userNameInput.value,
    })
  }

  hideMode() {
    this.setState({showMode: false})
  }

  showMode() {
    this.setState({showMode: true})
  }

  hideTreeMode() {
    this.setState({showTreeMode: false})
  }

  showTreeMode() {
    this.setState({showTreeMode: true})
  }
  openOperLogModal(row) {
    this.setState({
      data: {...row},
      showOperLogModal: true
    })
  }
  hideOperLogModal() {
    this.setState({
      showOperLogModal: false
    })
  }

  update(e) {
    e.preventDefault();
    e.stopPropagation();
    let {message} = this.state, valid = true

    this.modalColumnsUpdate.map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      //const {old_password,new_password,confirm_password,user_name,mobile,email,user_id} = this.state.data
      this.props.messageResetter()
      this.props.updater(this.state.data).promise.then(({response})=>{
        if(response&&response.success){
          return this.props.callDic().promise.then(({response})=>{
            this.setState({showMode: false})
            this.handleSearch(1)
          })
        }
      })
    } else {
      this.setState({message:{...message}})
    }
  }

  create(e) {
    e.preventDefault();
    e.stopPropagation();
    let {message} = this.state, valid = true

    this.modalColumns.map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      this.userAccountInput.value = ''
      this.userNameInput.value = ''
      this.props.messageResetter()
      this.props.creater(this.state.data).promise.then(({response})=>{
        if(response&&response.success){
          return this.props.callDic().promise.then(({response})=>{
            this.setState({showMode: false,index: 1, opsUserId:''})
            this.handleSearch(1)
          })
        }
      })
    } else {
      this.setState({message:{...message}})
    }
  }

  delete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({showMode: false,index: 1, opsUserId:''})
    this.userAccountInput.value = ''
    this.userNameInput.value = ''
    this.props.messageResetter()
    this.props.deleter({user_id: this.state.deleteUserId}).promise.then(({response})=>{
      if(response&&response.success){
        return this.props.callDic().promise.then(({response})=>{
          this.handleSearch(1)
        })
      }
    })
  }

  openModeToEdit(row) {
    this.setState({
      data: {...row},
      showMode: true
    })
  }

  openUserAttributeModal=(row)=>{
    var self = this;
    this.props.userAttributeSearcher({...row}).promise.then(({response})=>{
      if(response && response.success){
        self.setState({
          showUserAttributeMode: true,
          userAttribute: {...row,...response.data}
        })
      }
    })
  }

  hideUserAttributeMode=() => {
    this.setState({showUserAttributeMode: false, userAttribute: null})
  }

  showUserAttributeMode=() => {
    this.setState({showUserAttributeMode: true})
  }

  userAttributeUpdate=(e) =>{
    e.preventDefault();
    e.stopPropagation();
    let {message} = this.state, valid = true, {user_type} = this.state.userAttribute;
    if((user_type !== 1) && (user_type !== 2)){
      this.props.messageSetter("非法操作","WARN")
      return
    }
    let myColumn = ((user_type === 1)? this.assetAttributeModalColumn: ((user_type === 2)? this.fundAttributeModalColumn: this.adminAttributeModalColumn));
    myColumn.map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      //const {old_password,new_password,confirm_password,user_name,mobile,email,user_id} = this.state.data
      this.props.messageResetter()
      this.props.userAttributeUpdater({...this.state.userAttribute,
        is_auto_credit: Number(this.state.userAttribute.is_auto_credit)}).promise.then(({response})=>{
        if(response&&response.success){
          /*return this.props.callDic().promise.then(({response})=>{
            this.setState({showMode: false})
            this.handleSearch(1)
          })*/
          this.hideUserAttributeMode()
        }
      })
    } else {
      this.setState({message:{...message}})
    }
  }

  openModeToAuth(row) {
    this.props.authSearcher({...row}).promise.then(({response})=>{
      this.setState({
        data: {...row},
        showTreeMode: true
      })
    })
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  handleOrgChange(row) {
    let orgCode = row && row.value || ''
    let index = 1
    this.setState({orgCode, index}, () => {
      this.handleSearch()
    })
  }

  /*renderOrganizations() {
    var asset = this.getOrganizations()
    return (
      <Select onChange={this.handleOrgChange} ref={(input) => {this.orgCodeSelect = input}} options={asset.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }

  renderUserTypes() {
    var types = this.getUserTypes()
    return (
      <Select onChange={this.handleUserTypesChange} ref={(input) => {this.userTypeSelect = input}}
              options={types.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }*/

  handleUserTypesChange(row) {
    const userType = row && row.value && !isNaN(row.value) ? Number(row.value) : '';
    this.setState({
      ...this.state,
      userType,
      index: 1
    }, ()=> this.handleSearch());
  }

  toggleOps(e, row) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.opsUserId == row.user_id) {
      this.setState({...this.state, opsUserId: undefined})
    } else {
      this.setState({...this.state, opsUserId: row.user_id})
    }
  }

  authorize(e, row) {
    e.preventDefault();
    e.stopPropagation();
    this.props.messageResetter()
    this.props.auther({user_id: this.state.data.user_id, checked: row})
    this.setState({showTreeMode: false, opsUserId:''})
  }

  openDeleteConfirm(row){
    this.setState({confirmDelete: true, deleteUserId: row.user_id, deleteUserAccount: row.user_account})
    this.setState({confirmDelete: true, deleteUserId: row.user_id, deleteUserAccount: row.user_account})
  }
  closeDeleteConfirm(){
    this.setState({confirmDelete: false, deleteUserId: "", deleteUserAccount: ""})
  }

  render() {
    const {users={}} = this.props, {userAttribute,data} = this.state;
    var self = this,collection,userAttributeModalColumn;
    if(userAttribute){
      const {user_type,user_id} = userAttribute;
      userAttributeModalColumn = (user_type === 1)? this.assetAttributeModalColumn: ((user_type === 2)? this.fundAttributeModalColumn: this.adminAttributeModalColumn)
    }

    if(data){
      const {user_id} = data;
      collection = [
        {table_name:"t_user", table_key:user_id},
        {table_name:"t_user_attribute", table_key:user_id}
      ]
    }
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <button type="submit" className="btn icon-btn btn-primary pull-left">
            <i className="fa fa-search"></i>搜索
          </button>
          <button type="button" className="btn icon-btn btn-primary pull-left" onClick={() => {self.openModeToEdit({})}}>
            <i className="fa fa-plus"></i>创建
          </button>
        </SearchBar>
        <div className="wrapper">
          <Datatable columns={ this.rowColumns } rows={ users.rows } index={ this.state.index }
                     searcher={ this.handleSearch } total={users.total}
          />
        </div>
        { this.state.showMode && !this.state.data.user_id &&
        <Modal data={this.state.data} columns={this.modalColumns} message={this.state.message} title="创建新用户"
               closer={ this.hideMode } confirm={this.create}/> }
        { this.state.showMode && this.state.data.user_id && (this.state.data.user_from==1) &&
        <Modal data={this.state.data} columns={this.modalColumnsUpdate} message={this.state.message} title="修改用户"
               closer={ this.hideMode } confirm={this.update}/> }
        { this.state.showMode && this.state.data.user_id && (this.state.data.user_from==2) &&
        <Modal data={this.state.data} columns={this.modalColumnsEx} message={this.state.message} title="修改用户"
               closer={ this.hideMode } confirm={this.update}/> }
        { this.state.showUserAttributeMode && this.state.userAttribute &&
        <Modal data={this.state.userAttribute} columns={userAttributeModalColumn} message={this.state.message} title="修改用户属性"
               closer={ this.hideUserAttributeMode} confirm={this.userAttributeUpdate}/> }
        { this.state.showTreeMode &&
        <TreeModal data={this.props.users.menus} checked={this.props.users.checked} expanded={this.props.users.expanded} closer={ this.hideTreeMode }
                   message={this.state.message} title="用户功能权限" confirm={this.authorize}/> }
        {this.state.confirmDelete && <Dialog confirm={(e)=>{
          self.delete(e)
          self.closeDeleteConfirm()
        }} title="请确认" closer={this.closeDeleteConfirm} size="modal-md">
          确定要删除用户[{this.state.deleteUserAccount}]么?
        </Dialog>}
        { this.state.showOperLogModal &&
        <OperLogModal data={this.state.data} actionType='user' fromTableCollection={collection} type={1} title="用户信息日志"
               closer={ this.hideOperLogModal } /> }
      </div>
    )
  }
}
