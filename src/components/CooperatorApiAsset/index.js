import React,{Component} from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import Datatable from '../Datatable'
import Select from '../Select'
import Dialog from '../Dialog'
import OperLogModal from '../Modal/OperLogModal'

/**
 * 作者：张宝玉
 * 模块：合作方API管理
 * 时间：2018-02-06
 * */

export default class CooperatorApiAsset extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 1,
      showMode: false,
      showOperLogModal: false,
      createFlag: false,
      updateFlag: false,
      assetOrgCode: "",
      opsAssetOrgCode: "",
      opsAssetApiType: "",
      data: {},
      message: {
        api_url: '',
        api_token: ''
      },
      confirmDelete: false,
      deleteAssetOrgCode: "",
      deleteApiType: "",
    }
    this.showMode = this.showMode.bind(this)
    this.hideMode = this.hideMode.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
    this.openModeToEdit = this.openModeToEdit.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.toggleOps = this.toggleOps.bind(this)
    this.clearOps = this.clearOps.bind(this)
    this.openDeleteConfirm = this.openDeleteConfirm.bind(this)
    this.closeDeleteConfirm = this.closeDeleteConfirm.bind(this)
    this.openOperLogModal = this.openOperLogModal.bind(this)
    this.hideOperLogModal = this.hideOperLogModal.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.getAssetOrganizations = this.getAssetOrganizations.bind(this)
    this.getAssetApiTypes = this.getAssetApiTypes.bind(this)
    this.renderAssetOrganizations = this.renderAssetOrganizations.bind(this)
    this.formatAssetOrgCode = this.formatAssetOrgCode.bind(this)
    this.formatAssetApiType = this.formatAssetApiType.bind(this)

    var self = this
    this.rowColumns = [
      {
        text: '资产方',
        name: 'asset_org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: row =>  this.formatAssetOrgCode(row.asset_org_code)
      },
      {
        text: 'API类型',
        name: 'api_type',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: row => this.formatAssetApiType(row.api_type)
      },
      {
        text: 'API地址',
        name: 'api_url',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '握手token',
        name: 'api_token',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '创建时间',
        name: 'rx_insertTime',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '操作',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => {
          const {_buttons} = self.props
          return (
            <div styleName="table-ops">
              <a href="javascript:" onClick={(e) => self.toggleOps(e, row)}>操作</a>
              <div styleName={(row.asset_org_code == self.state.opsAssetOrgCode && row.api_type == self.state.opsAssetApiType) ? 'show-ops' : "hidden-ops"}>
                {Array.isArray(_buttons) && _buttons.includes("cooperator_api_asset_update") && <a href="javascript:" onClick={() => self.openModeToEdit(row)}>修改</a>}
                {Array.isArray(_buttons) && _buttons.includes("cooperator_api_asset_delete") && <a href="javascript:" onClick={(e) => self.openDeleteConfirm(row)}>删除</a>}
                {Array.isArray(_buttons) && _buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
              </div>
            </div>
          )
        }
      }
    ]



    this.modalColumns = [
      {
        title: "资产方API"
      },
      {
        name: 'asset_org_code',
        text: '资产方',
        type: 'select',
        labelClassName: "asterisk",
        noEmpty: true,
        getOptions: this.getAssetOrganizations,
        handleChange(row){
          self.state.data.asset_org_code = row.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.asset_org_code == undefined) || !row.asset_org_code) ? "必填" : null
        }
      },
      {
        name: 'api_type',
        text: 'API类型',
        type: 'select',
        labelClassName: "asterisk",
        noEmpty: true,
        getOptions: this.getAssetApiTypes,
        handleChange(row){
          self.state.data.api_type = row.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.api_type == undefined) || !row.api_type) ? "必填" : null
        }
      },
      {
        name: 'api_url',
        text: 'API地址',
        type: 'text',
        handleChange(e){
          self.state.data.api_url = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.api_url && (row.api_url.length > 200) ? "API地址不能超过200字" : null)
        }
      },
      {
        name: 'api_token',
        text: '握手token',
        type: 'text',
        handleChange(e){
          self.state.data.api_token = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.api_token && (row.api_token.length > 50) ? "握手token不能超过50字" : null)
        }
      }
    ]
    this.updateColumns = [
      {
        title: "资产方API"
      },
      {
        name: 'asset_org_code',
        text: '资产方',
        type: 'select',
        labelClassName: "asterisk",
        renderDom: row =>  this.formatAssetOrgCode(row.asset_org_code)
      },
      {
        name: 'api_type',
        text: 'API类型',
        type: 'select',
        labelClassName: "asterisk",
        renderDom: row => this.formatAssetApiType(row.api_type)
      },
      {
        name: 'api_url',
        text: 'API地址',
        type: 'text',
        handleChange(e){
          self.state.data.api_url = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.api_url && (row.api_url.length > 200) ? "API地址不能超过200字" : null)
        }
      },
      {
        name: 'api_token',
        text: '握手token',
        type: 'text',
        handleChange(e){
          self.state.data.api_token = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return (row.api_token && (row.api_token.length > 50) ? "握手token不能超过50字" : null)
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
    if (this.state.opsAssetOrgCode && this.state.opsAssetApiType) {
      this.setState({...this.state, opsAssetOrgCode: undefined,opsAssetApiType:undefined})
    }
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleSearch(index) {
    let myIndex = (typeof index == 'undefined') ? 1: index
    this.state.index = myIndex
    this.props.searcher({
      pageIndex: this.state.index,
      assetOrgCode:  this.state.assetOrgCode,
      //userId:this.props._session.user_id,
    })
  }



  hideMode() {
    this.setState({showMode: false})
  }

  showMode() {
    this.setState({showMode: true})
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
      this.setState({showMode: false})
      this.props.messageResetter()
      this.props.creater(this.state.data).promise.then((data)=>{
        data.response && data.response.success && this.handleSearch()
      })
    } else {
      this.setState({message:{...message}})
    }
  }

  update(e) {
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
      this.setState({showMode: false})
      this.props.messageResetter()
      this.props.updater(this.state.data)
    } else {
      this.setState({message:{...message}})
    }
  }


  delete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({index: 1})

    this.props.messageResetter()
    this.props.deleter({asset_org_code:this.state.deleteAssetOrgCode,api_type:this.state.deleteApiType}).promise.then((data)=>{
      data.response && data.response.success && this.handleSearch()
    })
  }

  openModeToEdit(row) {
  if(row.asset_org_code==undefined)
  {
    this.setState({createFlag:true})
    this.setState({updateFlag:false})
    row.asset_org_code = this.state.assetOrgCode;
  }
  else
  {
    this.setState({createFlag:false})
    this.setState({updateFlag:true})
  }
    this.setState({
      data: {...row},
      showMode: true
    })
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  onUserSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleUserSearch();
  }

  toggleOps(e, row) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.opsAssetOrgCode == row.asset_org_code && this.state.opsAssetApiType == row.api_type) {
      this.setState({...this.state, opsAssetOrgCode: undefined, opsAssetApiType: undefined})
    } else {
      this.setState({...this.state, opsAssetOrgCode: row.asset_org_code, opsAssetApiType: row.api_type})
    }
  }

  formatAssetOrgCode(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  formatAssetApiType(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_asset_api')).filter(r => (r.col_name == "api_type")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  getAssetOrganizations() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")).filter(r => r.para_key.startsWith("A"))
  }



  getAssetApiTypes() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_asset_api')).filter(r => (r.col_name == "api_type"))
  }

  renderAssetOrganizations() {
    var asset = this.getAssetOrganizations()

    return (
      <Select onChange={this.handleAssetOrgChange}
              options={asset.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }

  handleAssetOrgChange(row) {
    let assetOrgCode = row.value
    this.setState({assetOrgCode}, () => {
      this.handleSearch()
    })
  }

  openDeleteConfirm(row){
    this.setState({confirmDelete: true, deleteAssetOrgCode: row.asset_org_code, deleteApiType: row.api_type})
  }
  closeDeleteConfirm(){
    this.setState({confirmDelete: false, deleteAssetOrgCode: "", deleteApiType: ""})
  }





  render() {
    const {data, _buttons} = this.props
    var self = this
    return (
      <div className="component">
        <form className="filter-form clearfix" onSubmit={ this.onSearch }>
          <div className="row info-row">
            <div className="col-sm-3">
              <label className="col-sm-3 filter-form__static-text">
                <span>资产方:</span>
              </label>
              <div className="col-sm-8">
                {this.renderAssetOrganizations()}
              </div>
            </div>
            <div className="col-sm-6">
              <button type="submit" className="btn icon-btn btn-primary pull-left edi-mr">
                <i className="fa fa-search"></i>搜索
              </button>
              {Array.isArray(_buttons) && _buttons.includes("cooperator_api_asset_create") &&
              <button type="button" className="btn icon-btn btn-primary pull-left" onClick={() => {
                self.openModeToEdit({})
              }}>
                <i className="fa fa-plus"></i>创建
              </button>
              }
            </div>
          </div>
        </form>
        <div className="wrapper">
          <Datatable columns={ this.rowColumns } rows={ data.rows } index={ this.state.index }
                     searcher={ this.handleSearch } total={data.total}
          />
        </div>
        { this.state.showMode && this.state.createFlag &&
        <Modal data={this.state.data} columns={this.modalColumns} message={this.state.message} title="资产方API"
               closer={ this.hideMode } confirm={this.create}/> }
        { this.state.showMode && this.state.updateFlag &&
        <Modal data={this.state.data} columns={this.updateColumns} message={this.state.message} title="资产方API"
               closer={ this.hideMode } confirm={this.update}/> }
        {this.state.confirmDelete && <Dialog confirm={(e)=>{
          self.delete(e)
          self.closeDeleteConfirm()
        }} title="请确认" closer={this.closeDeleteConfirm} size="modal-md">
          确定要删除该条记录么?
        </Dialog>}
        { this.state.showOperLogModal &&
        <OperLogModal data={this.state.data} tableName={'t_asset_api'} tableKey={this.state.data.asset_org_code+','+this.state.data.api_type} title="资产方API日志"
                      closer={ this.hideOperLogModal } /> }
      </div>
    )
  }
}

