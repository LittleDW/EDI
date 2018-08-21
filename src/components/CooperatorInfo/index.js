import React, {Component} from 'react'
import Modal from '../Modal'
import Datatable from '../Datatable'
import Dialog from '../Dialog'
import SearchBar from '../Common/SearchBar'
import FundRelatedSelector from '../Select/FundRelatedSelectorPage'
import AssetRelatedSelector from '../Select/AssetRelatedSelectorPage'
import FundSelector from '../Select/FundSelectorPage'
import AssetSelector from '../Select/AssetSelectorPage'
import AssetRestrictedSelector from '../Select/AssetRestrictedSelectorPage'
import FundRestrictedSelector from '../Select/FundRestrictedSelectorPage'
import {FormatUserFrom} from '../Formatter'
import OperLogModal from '../Modal/OperLogModal'
import AddRelationModal from './addRelationModal'

export default class CooperatorInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 1,
      showMode: false,
      showViewMode: false,
      showOperLogModal: false,
      showAddRelationModal: false,
      showSupplyInfoModal: false,
      operLogModalKey: '',
      opsUserId: "",
      data: {},
      message: {
        user_full_name: '',
        user_name: '',
        linkman: '',
        mobile: '',
        email: '',
      },
      fundOrgCode: "",
      assetOrgCode: "",
      confirmDelete: false,
      deleteOrgCode: "",
      deleteUserFullName: "",
      supplyButtonDisabled: false,
    }
    this.showMode = this.showMode.bind(this)
    this.hideMode = this.hideMode.bind(this)
    this.showViewMode = this.showViewMode.bind(this)
    this.hideViewMode = this.hideViewMode.bind(this)
    this.update = this.update.bind(this)
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.openModeToEdit = this.openModeToEdit.bind(this)
    this.openModeToView = this.openModeToView.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.toggleOpsAsset = this.toggleOpsAsset.bind(this)
    this.clearOps = this.clearOps.bind(this)
    this.openDeleteConfirm = this.openDeleteConfirm.bind(this)
    this.closeDeleteConfirm = this.closeDeleteConfirm.bind(this)
    this.getRowColumns = this.getRowColumns.bind(this)
    this.getSearchBarItems = this.getSearchBarItems.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.openOperLogModal = this.openOperLogModal.bind(this)
    this.hideOperLogModal = this.hideOperLogModal.bind(this)
    this.openModeToAddRelation = this.openModeToAddRelation.bind(this)
    this.openModeToSupplyInfo = this.openModeToSupplyInfo.bind(this)
    this.openAddRelationModal = this.openAddRelationModal.bind(this)
    this.hideAddRelationModal = this.hideAddRelationModal.bind(this)
    this.openSupplyInfoModal = this.openSupplyInfoModal.bind(this)
    this.hideSupplyInfoModal = this.hideSupplyInfoModal.bind(this)
    this.addRelation = this.addRelation.bind(this)
    this.supplyInfo = this.supplyInfo.bind(this)

    var self = this, session = props._SESSION
    this.assetRowColumns = [
      {
        text: '机构编码',
        name: 'fund_org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资金方全称',
        name: 'fund_user_full_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资金方简称',
        name: 'fund_user_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '联系人',
        name: 'fund_linkman',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '联系方式',
        name: 'fund_mobile',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '工作邮箱',
        name: 'fund_email',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '来源',
        name: 'fund_user_from',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: row => <FormatUserFrom value={row.fund_user_from}/>
      },
      {
        text: '操作',
        style: {width: '150px', textAlign: 'center'},
        renderDom: row => {
          const {_buttons} = self.props
          if (row.fund_user_from == 1) {
            return ""
          }
          return (
            <div styleName="table-ops">
              {Array.isArray(_buttons) && _buttons.includes("cooperator_info_update") && <a href="javascript:" onClick={() => self.openModeToEdit(row)}>修改</a>}
              {Array.isArray(_buttons) && _buttons.includes("cooperator_info_delete") && <a href="javascript:" onClick={(e) => self.openDeleteConfirm(row)}>删除</a>}
              {Array.isArray(_buttons) && _buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
            </div>
          )
        }
      }
    ]

    this.fundRowColumns = [
      {
        text: '机构编码',
        name: 'asset_org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资产方全称',
        name: 'asset_user_full_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资产方简称',
        name: 'asset_user_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '联系人',
        name: 'asset_linkman',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '联系方式',
        name: 'asset_mobile',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '工作邮箱',
        name: 'asset_email',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '来源',
        name: 'asset_user_from',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: row => <FormatUserFrom value={row.asset_user_from}/>
      },
      {
        text: '操作',
        style: {width: '150px', textAlign: 'center'},
        renderDom: row => {
          const {_buttons} = self.props
          if (row.asset_user_from == 1) {
            return ""
          }
          return (
            <div styleName="table-ops">
              {Array.isArray(_buttons) && _buttons.includes("cooperator_info_update") && <a href="javascript:" onClick={() => self.openModeToEdit(row)}>修改</a>}
              {Array.isArray(_buttons) && _buttons.includes("cooperator_info_delete") && <a href="javascript:" onClick={(e) => self.openDeleteConfirm(row)}>删除</a>}
              {Array.isArray(_buttons) && _buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}> 日志</a>}
            </div>
          )
        }
      }
    ]

    this.rowColumns = [
      {
        text: '资金方机构编码',
        name: 'fund_org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资金方全称',
        name: 'fund_user_full_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资金方简称',
        name: 'fund_user_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资产方机构编码',
        name: 'asset_org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资产方全称',
        name: 'asset_user_full_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '资产方简称',
        name: 'asset_user_name',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '操作',
        style: {width: '150px', textAlign: 'center'},
        renderDom: row => {
          const {_buttons} = self.props
          return (
            <div styleName="table-ops">
              {Array.isArray(_buttons) && _buttons.includes("cooperator_info_view") && <a href="javascript:" onClick={(e) => self.openModeToView(row)}>查看</a>}
              {Array.isArray(_buttons) && _buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}> 日志</a>}
            </div>
          )
        }
      }
    ]

    this.assetModalColumns = [
      {
        name: 'org_code',
        text: '机构编码',
        type: 'text',
        readOnly: true
      },
      {
        name: 'user_full_name',
        text: '资金方名称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_full_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_full_name == undefined) || !row.user_full_name) ? "必填" : ((row.user_full_name.length > 50) ? "资金方名称不能超过50字" : null)
        }
      },
      {
        name: 'user_name',
        text: '资金方简称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_name == undefined) || !row.user_name) ? "必填" : ((row.user_name.length > 50) ? "资金方简称不能超过50字" : null)
        }
      },
      {
        name: 'user_from',
        text: `来源`,
        type: 'text',
        readOnly: true,
        renderDom: row => {
          return [<FormatUserFrom value={2}/>, <br />, <span className="text-danger">注：外部合作方只进行财务统计，不会参与资产订单交互。如果需要进行资产订单交互，请联系管理员添加内部合作方</span>]
        }
      },
      {
        name: 'linkman',
        text: '联系人',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.linkman = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.linkman == undefined) || !row.linkman) ? "必填" : ((row.linkman.length > 50) ? "联系人不能超过50字" : null)
        }
      },
      {
        name: 'mobile',
        text: '联系人联系方式',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.mobile = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.mobile == undefined) || !row.mobile) ? "必填" : ((row.mobile.length > 50) ? "联系人联系方式不能超过50字" : null)
        }
      },
      {
        name: 'email',
        text: '联系人邮箱',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.email = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.email == undefined) || !row.email) ? "必填" : ((row.email.length > 50) ? "联系人邮箱方式不能超过50字" : null)
        }
      },
    ]

    this.fundModalColumns = [
      {
        name: 'org_code',
        text: '机构编码',
        type: 'text',
        readOnly: true
      },
      {
        name: 'user_full_name',
        text: '资产方名称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_full_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_full_name == undefined) || !row.user_full_name) ? "必填" : ((row.user_full_name.length > 50) ? "资产方名称不能超过50字" : null)
        }
      },
      {
        name: 'user_name',
        text: '资产方简称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.user_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.user_name == undefined) || !row.user_name) ? "必填" : ((row.user_name.length > 50) ? "资产方简称不能超过50字" : null)
        }
      },
      {
        name: 'user_from',
        text: `来源`,
        type: 'text',
        readOnly: true,
        renderDom: row => {
          return [<FormatUserFrom value={2}/>, <br />, <span className="text-danger">注：外部合作方只进行财务统计，不会参与资产订单交互。如果需要进行资产订单交互，请联系管理员添加内部合作方</span>]
        }
      },
      {
        name: 'linkman',
        text: '联系人',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.linkman = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.linkman == undefined) || !row.linkman) ? "必填" : ((row.linkman.length > 50) ? "联系人不能超过50字" : null)
        }
      },
      {
        name: 'mobile',
        text: '联系人联系方式',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.mobile = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.mobile == undefined) || !row.mobile) ? "必填" : ((row.mobile.length > 50) ? "联系人联系方式不能超过50字" : null)
        }
      },
      {
        name: 'email',
        text: '联系人邮箱',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.email = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.email == undefined) || !row.email) ? "必填" : ((row.email.length > 50) ? "联系人邮箱方式不能超过50字" : null)
        }
      },
    ]

    this.modalColumns = [
      {
        title: "资金方详情"
      },
      {
        name: 'fund_org_code',
        text: '资金方机构号',
        type: 'text',
        readOnly: true
      },
      {
        name: 'fund_user_full_name',
        text: '资金方全称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'fund_user_name',
        text: '资金方简称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'fund_user_from',
        text: '资金方来源',
        type: 'text',
        readOnly: true,
        renderDom: row => <div className="form-text"><FormatUserFrom value={row.fund_user_from}/></div>
      },
      {
        name: 'fund_linkman',
        text: '资金方联系人',
        type: 'text',
        readOnly: true
      },
      {
        name: 'fund_mobile',
        text: '联系人联系方式',
        type: 'text',
        readOnly: true
      },
      {
        name: 'fund_email',
        text: '联系人邮箱',
        type: 'text',
        readOnly: true
      },
      {
        title: "资产方详情"
      },
      {
        name: 'asset_org_code',
        text: '资产方机构号',
        type: 'text',
        readOnly: true
      },
      {
        name: 'asset_user_full_name',
        text: '资产方全称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'asset_user_name',
        text: '资产方简称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'asset_user_from',
        text: '资产方来源',
        type: 'text',
        readOnly: true,
        renderDom: row => <div className="form-text"><FormatUserFrom value={row.asset_user_from}/></div>
      },
      {
        name: 'asset_linkman',
        text: '资产方联系人',
        type: 'text',
        readOnly: true
      },
      {
        name: 'asset_mobile',
        text: '联系人联系方式',
        type: 'text',
        readOnly: true
      },
      {
        name: 'asset_email',
        text: '联系人邮箱',
        type: 'text',
        readOnly: true
      },
    ]

    this.assetSearchBarItems = [
      {
        label: "资金方:",
        type: "custom",
        dom: <FundRelatedSelector onChange={this.handleFundOrgChange} assetOrgCode={session.org_code} ref={(select)=>{this.select = select}}/>
      },
    ]

    this.fundSearchBarItems = [
      {
        label: "资产方:",
        type: "custom",
        dom: <AssetRelatedSelector onChange={this.handleAssetOrgChange} fundOrgCode={session.org_code} ref={(select)=>{this.select = select}}/>
      },
    ]

    this.searchBarItems = [
      {
        label: "资金方:",
        type: "custom",
        dom: <FundRestrictedSelector onChange={this.handleFundOrgChange}/>
      },
      {
        label: "资产方:",
        type: "custom",
        dom: <AssetRestrictedSelector onChange={this.handleAssetOrgChange}/>
      },
    ]
  }

  handleAssetOrgChange(row) {
    this.setState({assetOrgCode: row.value, index: 1}, this.handleSearch)
  }

  handleFundOrgChange(row) {
    this.setState({fundOrgCode: row.value, index: 1}, this.handleSearch)
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
    let myIndex = (typeof index == 'undefined') ? 1: index
    let {fundOrgCode, assetOrgCode} = this.state
    this.setState({index: myIndex})
    this.props.CALL_COOPERATOR_INFO_QUERY({
      pageIndex: myIndex,
      fundOrgCode: fundOrgCode,
      assetOrgCode: assetOrgCode,
    })
  }

  hideMode() {
    this.setState({showMode: false})
  }

  showMode() {
    this.setState({showMode: true})
  }

  hideViewMode() {
    this.setState({showViewMode: false})
  }

  showViewMode() {
    this.setState({showViewMode: true})
  }

  update(e) {
    e.preventDefault();
    e.stopPropagation();
    let {message} = this.state, valid = true

    this.getModalColumns(this.props._SESSION.user_type).map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      this.setState({showMode: false})
      this.props.RESET_MESSAGE()
      this.props.CALL_COOPERATOR_INFO_UPDATE(this.state.data).promise.then(({response})=>{
        if(response.success){
          return this.props.CALL_DIC().promise.then(({response})=>{
            //window.sessionStorage.setItem("edi.dictionary", JSON.stringify(response))
            this.props.SET_MESSAGE("合作方更新成功", "SUCCESS")
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

    this.getModalColumns(this.props._SESSION.user_type).map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      this.setState({showMode: false,index: 1, opsUserId:'', fundOrgCode: "", assetOrgCode: ""})

      this.props.RESET_MESSAGE()
      this.props.CALL_COOPERATOR_INFO_CREATE({...this.state.data, user_type: this.props._SESSION.user_type==1?6:5}).promise.then(({response})=>{
        if(response && response.success){
          return this.props.CALL_DIC().promise.then(({response})=>{
            //window.sessionStorage.setItem("edi.dictionary", JSON.stringify(response))
            this.props.SET_MESSAGE("合作方创建成功", "SUCCESS")
            this.select.getWrappedInstance().resetState()
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
    this.setState({index: 1, fundOrgCode: "", assetOrgCode: ""})
    let fundOrgCode, assetOrgCode
    if (this.props._SESSION.user_type == 1) {
      fundOrgCode = this.state.deleteOrgCode
      assetOrgCode = this.props._SESSION.org_code
    } else if (this.props._SESSION.user_type == 2) {
      fundOrgCode = this.props._SESSION.org_code
      assetOrgCode = this.state.deleteOrgCode
    }
    this.props.RESET_MESSAGE()
    this.props.CALL_COOPERATOR_INFO_DELETE({asset_org_code: assetOrgCode, fund_org_code: fundOrgCode})
    this.select.getWrappedInstance().resetState()
  }

  openModeToEdit(row) {
    let data
    if (this.props._SESSION.user_type == 1) {
      data = {org_code: row.fund_org_code, user_full_name: row.fund_user_full_name, user_name: row.fund_user_name, linkman: row.fund_linkman, mobile: row.fund_mobile, email: row.fund_email}
    } else if (this.props._SESSION.user_type == 2) {
      data = {org_code: row.asset_org_code, user_full_name: row.asset_user_full_name, user_name: row.asset_user_name, linkman: row.asset_linkman, mobile: row.asset_mobile, email: row.asset_email}
    }

    this.setState({
      data: {...data},
      showMode: true
    })
  }

  openModeToView(row) {
    this.setState({
      data: {...row},
      showViewMode: true
    })
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  toggleOpsAsset(e, row) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.opsUserId == row.fund_org_code) {
      this.setState({...this.state, opsUserId: undefined})
    } else {
      this.setState({...this.state, opsUserId: row.fund_org_code})
    }
  }

  openDeleteConfirm(row){
    this.setState({confirmDelete: true, deleteOrgCode: this.props._SESSION.user_type==1?row.fund_org_code:row.asset_org_code, deleteUserFullName: this.props._SESSION.user_type==1?row.fund_user_full_name:row.asset_user_full_name})
  }
  closeDeleteConfirm(){
    this.setState({confirmDelete: false, deleteOrgCode: "", deleteUserFullName: ""})
  }

  getRowColumns(userType) {
    if (userType == 1) {
      return this.assetRowColumns
    } else if (userType == 2) {
      return this.fundRowColumns
    } else {
      return this.rowColumns
    }
  }

  getSearchBarItems(userType) {
    if (userType == 1) {
      return this.assetSearchBarItems
    } else if (userType == 2) {
      return this.fundSearchBarItems
    } else {
      return this.searchBarItems
    }
  }

  getModalColumns(userType) {
    if (userType == 1) {
      return this.assetModalColumns
    } else if (userType == 2) {
      return this.fundModalColumns
    } else {
      return []
    }
  }

  openOperLogModal(row) {
    let operLogModalKey = [];
    const user_type = this.props._SESSION.user_type;

    if(user_type === 3 || user_type === 4 ){
      operLogModalKey = [
        {table_name:"t_user", table_key: row.fund_user_id, action_type: 'cooperator'},
        {table_name:"t_user", table_key: row.asset_user_id, action_type: 'cooperator'},
        {table_name:"t_asset_fund", table_key: row.fund_org_code + ',' + row.asset_org_code, action_type: 'cooperator'},
      ];
    }else{
      const user_id  = this.props._SESSION.user_type === 1 ? row.fund_user_id : row.asset_user_id;
      operLogModalKey = [
        {table_name:"t_user", table_key: user_id, action_type: 'cooperator'},
        {table_name:"t_asset_fund", table_key: row.fund_org_code + ',' + row.asset_org_code, action_type: 'cooperator'},
      ];
    }

    this.setState({
      operLogModalKey,
      showOperLogModal: true
    })
  }

  hideOperLogModal() {
    this.setState({
      showOperLogModal: false
    })
  }

  openModeToAddRelation() {
    this.openAddRelationModal()
  }

  openModeToSupplyInfo() {
    this.openSupplyInfoModal()
  }

  openAddRelationModal() {
    this.setState({showAddRelationModal: true})
  }

  hideAddRelationModal() {
    this.setState({showAddRelationModal: false})
  }

  openSupplyInfoModal() {
    this.setState({showSupplyInfoModal: true})
  }

  hideSupplyInfoModal() {
    this.setState({showSupplyInfoModal: false})
  }

  addRelation(e, orgCode, data) {
    e.preventDefault();
    e.stopPropagation();

    let relationOrgCodes = []
    if (!orgCode) {
      this.props.SET_MESSAGE("机构名必填", "FAIL")
    } else {
      if (data && data.length) {
        data.map(r => {
          if (r._checked) {
            relationOrgCodes.push(r.org_code)
          }
        })
      }
      if (relationOrgCodes.length == 0) {
        this.props.SET_MESSAGE("至少选择一个合作方", "FAIL")
      } else {
        const {assetOrgCode, fundOrgCode} = this.state
        this.hideAddRelationModal()
        this.props.RESET_MESSAGE()
        this.props.CALL_COOPERATOR_INFO_ADD_RELATION({orgCode, relationOrgCodes, assetOrgCode, fundOrgCode})
      }
    }
  }

  supplyInfo(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      supplyButtonDisabled: true,
    })
    this.hideSupplyInfoModal()
    let {fundOrgCode, assetOrgCode} = this.state
    this.props.CALL_COOPERATOR_INFO_SUPPLY_INFO({fundOrgCode, assetOrgCode, pageIndex: 1}).promise.then(data => {
      if (data && data.response && data.response.success) {
        this.setState({index: 1, supplyButtonDisabled: false})
      }
    }).catch(() => {
      this.hideSupplyInfoModal()
      this.setState({supplyButtonDisabled: false})
    })
    //
    // let relationOrgCodes = []
    // if (!orgCode) {
    //   this.props.SET_MESSAGE("机构名必填", "FAIL")
    // } else {
    //   if (data && data.length) {
    //     data.map(r => {
    //       if (r._checked) {
    //         relationOrgCodes.push(r.org_code)
    //       }
    //     })
    //   }
    //   if (relationOrgCodes.length == 0) {
    //     this.props.SET_MESSAGE("至少选择一个合作方", "FAIL")
    //   } else {
    //     this.hideSupplyInfoModal()
    //     this.props.RESET_MESSAGE()
    //     this.props.CALL_COOPERATOR_INFO_SUPPLY_INFO({orgCode, relationOrgCodes})
    //   }
    // }
  }

  render() {
    const {COOPERATORS, _buttons, _SESSION} = this.props
    let userType = _SESSION.user_type
    var self = this
    return (
      <div className="component">
        <SearchBar items={this.getSearchBarItems(userType)} searcher={this.onSearch}>
          <button type="submit" className="btn icon-btn btn-primary pull-left">
            <i className="fa fa-search"></i>查询
          </button>
          {Array.isArray(_buttons) && _buttons.includes("cooperator_info_create") &&
          <button type="button" className="btn icon-btn btn-primary pull-left" onClick={() => {
            self.openModeToEdit({})
          }}>
            <i className="fa fa-plus"></i>新增
          </button>
          }
          {userType==4 && Array.isArray(_buttons) && _buttons.includes("cooperator_info_add_relation") &&
          <button type="button" className="btn icon-btn btn-primary pull-left" onClick={() => {
            self.openModeToAddRelation({})
          }}>
            <i className="fa fa-plus"></i>添加关系
          </button>
          }
          {userType==4 && Array.isArray(_buttons) && _buttons.includes("cooperator_info_supply_info") &&
          <button type="button" className={`btn icon-btn btn-warning pull-left ${this.state.supplyButtonDisabled ? 'disabled' : ''}`} onClick={() => {
            self.openModeToSupplyInfo({})
          }}>
            <i className={`${this.state.supplyButtonDisabled ? 'fa fa-circle-o-notch fa-spin fa-fw' : 'fa fa-play'}`}></i>补全信息
          </button>
          }
        </SearchBar>
        <div className="wrapper">
          <Datatable columns={ this.getRowColumns(userType) } rows={ COOPERATORS.rows } index={ this.state.index }
                     searcher={ this.handleSearch } total={COOPERATORS.total}
          />
        </div>
        { this.state.showMode && !this.state.data.org_code &&
        <Modal data={this.state.data} columns={this.getModalColumns(userType)} message={this.state.message} title="新增外部合作方"
               closer={ this.hideMode } confirm={this.create}/> }
        { this.state.showMode && this.state.data.org_code &&
        <Modal data={this.state.data} columns={this.getModalColumns(userType)} message={this.state.message} title="修改外部合作方"
               closer={ this.hideMode } confirm={this.update}/> }
        { this.state.showViewMode &&
        <Modal data={this.state.data} columns={this.modalColumns} message={this.state.message} title="合作方详情"
               closer={ this.hideViewMode } confirm={this.hideViewMode} /> }
        {this.state.confirmDelete && <Dialog confirm={(e)=>{
          self.delete(e)
          self.closeDeleteConfirm()
        }} title="请确认" closer={this.closeDeleteConfirm} size="modal-md">
          确定要删除合作方[{this.state.deleteUserFullName}]么?
        </Dialog>}
        { this.state.showOperLogModal &&
        <OperLogModal data={this.state.data} type={1} fromTableCollection={this.state.operLogModalKey} title="合作方信息日志"
                      closer={ this.hideOperLogModal } /> }
        { this.state.showAddRelationModal &&
        <AddRelationModal title="添加合作方关系" searcher={this.props.CALL_COOPERATOR_INFO_SEARCH_RELATION}
                      closer={ this.hideAddRelationModal } confirm={this.addRelation} /> }
        {this.state.showSupplyInfoModal && <Dialog confirm={this.supplyInfo} closer={this.hideSupplyInfoModal} title={'操作确认'} style={{width: '500px'}}><p>确定要一键补全所有用户信息？</p></Dialog>}
        {/*{ this.state.showSupplyInfoModal &&*/}
        {/*<AddRelationModal title="补全合作方信息" searcher={this.props.CALL_COOPERATOR_INFO_SEARCH_ADDED_RELATION}*/}
                          {/*closer={ this.hideSupplyInfoModal } confirm={this.supplyInfo} /> }*/}
      </div>
    )
  }
}
