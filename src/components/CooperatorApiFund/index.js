import React,{Component} from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import Datatable from '../Datatable'
import Select from '../Select'
import Dialog from '../Dialog'
import OperLogModal from '../Modal/OperLogModal'
import FormatOrgCodePage from '../Formatter/FormatOrgCodePage';

/**
 * 作者：张宝玉
 * 模块：合作方API管理
 * 时间：2018-02-06
 * */

export default class CooperatorApiFund extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 1,
      showMode: false,
      showOperLogModal: false,
      createFlag: false,
      updateFlag: false,
      fundOrgCode: "",
      opsFundOrgCode: "",
      opsFundApiType: "",
      data: {},
      message: {
        api_url: '',
        api_token: ''
      },
      confirmDelete: false,
      deleteFundOrgCode: "",
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
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.getFundOrganizations = this.getFundOrganizations.bind(this)
    this.getFundApiTypes = this.getFundApiTypes.bind(this)
    this.renderFundOrganizations = this.renderFundOrganizations.bind(this)
    this.formatFundOrgCode = this.formatFundOrgCode.bind(this)
    this.formatFundApiType = this.formatFundApiType.bind(this)

    var self = this
    this.rowColumns = [
      {
        text: '资金方',
        name: 'fund_org_code',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: row => this.formatFundOrgCode(row.fund_org_code)
      },
      {
        text: 'API类型',
        name: 'api_type',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: row => this.formatFundApiType(row.api_type)
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
              <div styleName={(row.fund_org_code == self.state.opsFundOrgCode && row.api_type == self.state.opsFundApiType) ? 'show-ops' : "hidden-ops"}>
                {Array.isArray(_buttons) && _buttons.includes("cooperator_api_fund_update") && <a href="javascript:" onClick={() => self.openModeToEdit(row)}>修改</a>}
                {Array.isArray(_buttons) && _buttons.includes("cooperator_api_fund_delete") && <a href="javascript:" onClick={(e) => self.openDeleteConfirm(row)}>删除</a>}
                {Array.isArray(_buttons) && _buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
              </div>
            </div>
          )
        }
      }
    ]



    this.modalColumns = [
      {
        title: "资金方API地址"
      },
      {
        name: 'fund_org_code',
        text: '资金方',
        type: 'select',
        labelClassName: "asterisk",
        noEmpty: true,

        getOptions:  this.getFundOrganizations,
        handleChange(row){
          self.state.data.fund_org_code = row.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.fund_org_code == undefined) || !row.fund_org_code) ? "必填" : null
        }
      },
      {
        name: 'api_type',
        text: 'API类型',
        type: 'select',
        labelClassName: "asterisk",
        noEmpty: true,

        getOptions: this.getFundApiTypes,
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
        title: "资金方API地址"
      },
      {
        name: 'fund_org_code',
        text: '资金方',
        type: 'custom',
        labelClassName: "asterisk",
        noEmpty: true,
        renderDom: (row) => <FormatOrgCodePage value={row.fund_org_code} />,
      },
      {
        name: 'api_type',
        text: 'API类型',
        type: 'custom',
        labelClassName: "asterisk",
        renderDom: row => this.formatFundApiType(row.api_type)
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
    if (this.state.opsFundOrgCode && this.state.opsFundApiType) {
      this.setState({...this.state, opsFundOrgCode: undefined,opsFundApiType:undefined})
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
      fundOrgCode:  this.state.fundOrgCode,
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
      this.props.creater(this.state.data).promise.then((data)=>{data.response && data.response.success  && this.handleSearch()})
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
    this.props.deleter({fund_org_code:this.state.deleteFundOrgCode,api_type:this.state.deleteApiType}).promise.then((data)=>{data.response && data.response.success  && this.handleSearch()})
  }

  openModeToEdit(row) {

    if(row.fund_org_code==undefined)
    {
      this.setState({createFlag:true})
      this.setState({updateFlag:false})
      row.fund_org_code = this.state.fundOrgCode;
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
    if (this.state.opsFundOrgCode == row.fund_org_code && this.state.opsFundApiType == row.api_type) {
      this.setState({...this.state, opsFundOrgCode: undefined, opsFundApiType: undefined})
    } else {
      this.setState({...this.state, opsFundOrgCode: row.fund_org_code, opsFundApiType: row.api_type})
    }
  }

  formatFundOrgCode(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  formatFundApiType(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_fund_api')).filter(r => (r.col_name == "api_type")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  getFundOrganizations() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")).filter(r => r.para_key.startsWith("F"))
  }


  getFundApiTypes() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_fund_api')).filter(r => (r.col_name == "api_type"))
  }

  renderFundOrganizations() {
    var funds = this.getFundOrganizations()

    return (
      <Select onChange={this.handleFundOrgChange}
              options={funds.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }

  handleFundOrgChange(row) {
    let fundOrgCode = row.value
    this.setState({fundOrgCode}, () => {
      this.handleSearch()
    })
  }

  openDeleteConfirm(row){
    this.setState({confirmDelete: true, deleteFundOrgCode: row.fund_org_code, deleteApiType: row.api_type})
  }
  closeDeleteConfirm(){
    this.setState({confirmDelete: false, deleteFundOrgCode: "", deleteApiType: ""})
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
                <span>资金方</span>
              </label>
              <div className="col-sm-8">
                {this.renderFundOrganizations()}
              </div>
            </div>
            <div className="col-sm-6">
              <button type="submit" className="btn icon-btn btn-primary pull-left edi-mr">
                <i className="fa fa-search"></i>搜索
              </button>
              {Array.isArray(_buttons) && _buttons.includes("cooperator_api_fund_create") &&
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
        <Modal data={this.state.data} columns={this.modalColumns} message={this.state.message} title="资金方API"
               closer={ this.hideMode } confirm={this.create}/> }
        { this.state.showMode && this.state.updateFlag &&
        <Modal data={this.state.data} columns={this.updateColumns} message={this.state.message} title="资金方API"
               closer={ this.hideMode } confirm={this.update}/> }

        {this.state.confirmDelete && <Dialog confirm={(e)=>{
          self.delete(e)
          self.closeDeleteConfirm()
        }} title="请确认" closer={this.closeDeleteConfirm} size="modal-md">
          确定要删除该条记录么?
        </Dialog>}
        { this.state.showOperLogModal &&
        <OperLogModal data={this.state.data} tableName={'t_fund_api'} tableKey={this.state.data.fund_org_code+','+this.state.data.api_type} title="资金方API日志"
                      closer={ this.hideOperLogModal } /> }
      </div>
    )
  }
}

