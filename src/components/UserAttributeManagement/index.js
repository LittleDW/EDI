import React,{Component} from 'react'
import PropTypes from 'prop-types'
import Datatable from '../Datatable'
import Select from '../Select'
import Dialog from '../Dialog'
import UserTypeSelector from '../Select/UserTypeSelectorPage'
import OrgSelector from '../Select/OrgSelectorPage'
import UserAttributeIsDebtExchangeSelector from '../Select/UserAttributeIsDebtExchangeSelectorPage'
import {FormatOrgCode} from '../Formatter'
import Modal from './modal'

/**
 * 作者：张宝玉
 * 模块：平台属性
 * 时间：2018-02-26
 * */

const defaultUserType = ['1', '2']
export default class UserAttributeManagement extends Component {
  constructor(props) {
    super(props)
    let arr = props.dictionary.filter(r => (r.table_name == 't_user_attribute')).filter(r => (r.col_name == "repayment_mode"))
    arr.forEach(item => item['checked'] = false)
    this.state = {
      index: 1,
      orgCode:  '',
      partnerNature: "",
      isDebtExchange: "",
      allowedType: defaultUserType,
      showRepaymentMode: false,
      showProductDeadline: false,
      repaymentModes:[],
      productDeadlines:[]
    }

    this.handleSearch = this.handleSearch.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.renderDebtExchange = this.renderDebtExchange.bind(this)
    this.handleDebtExchangeChange = this.handleDebtExchangeChange.bind(this)

    this.handlePartnerNatureChange = this.handlePartnerNatureChange.bind(this)
    this.getPartnerNatures = this.getPartnerNatures.bind(this)
    this.renderPartnerNatures = this.renderPartnerNatures.bind(this)

    this.handleUserTypesChange = this.handleUserTypesChange.bind(this)
    this.handleOrgChange = this.handleOrgChange.bind(this)
    this.formatPartnerNature = this.formatPartnerNature.bind(this)
    this.formatDebtExchange = this.formatDebtExchange.bind(this)

    this.openModalRepaymentMode = this.openModalRepaymentMode.bind(this)
    this.openModalProductDeadline = this.openModalProductDeadline.bind(this)
    this.hideModalRepaymentMode = this.hideModalRepaymentMode.bind(this)
    this.hideModalProductDeadline = this.hideModalProductDeadline.bind(this)

    this.renderRepaymentModes = this.renderRepaymentModes.bind(this)
    this.renderProductDeadline = this.renderProductDeadline.bind(this)
    this.getIndex = this.getIndex.bind(this);

    var self = this

    this.columns = [
      {
        text: '序号',
        name: 'row_num',
        withTitle: true,
        style: {'width': '120px', textAlign: 'center'},
        renderDom: this.getIndex
      },
      {
        text: '合作方编码',
        name: 'org_code',
        withTitle: true,
        style: {'width': '120px', textAlign: 'center'},
      },
      {
        text: '合作方名称',
        name: 'org_code',
        style: {'width': '120px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.org_code}/>
      },
      {
        text: '合作方性质',
        name: 'partner_nature',
        style: {'width': '120px', textAlign: 'center'},
        renderDom: row => this.formatPartnerNature(row.partner_nature)

      },
      {
        text: '是否支持债转',
        name: 'is_debt_exchange',
        style: {'width': '120px', textAlign: 'center'},
        renderDom: row => this.formatDebtExchange(row.is_debt_exchange)
      },
      {
        text: '还款方式',
        name: 'repayment_mode',
        style: {'width': '120px', textAlign: 'center'},
        renderDom: row =>  <a href="javascript:" onClick={() => self.openModalRepaymentMode(row)}>详情</a>
      },
      {
        text: '产品期限要求',
        name: 'product_deadline',
        style: {'width': '120px', textAlign: 'center'},
        renderDom: row => <a href="javascript:" onClick={() => self.openModalProductDeadline(row)}>详情</a>
      }
      ]

    this.modalColumns = [
      {
        title: "角色权限"
      },
      {
        name: 'role_name',
        text: '角色名称',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.role_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.role_name == undefined) || !row.role_name) ? "必填" : ((row.role_name.length > 100) ? "角色名称不能超过100字" : null)
        }
      },

    ]

  }

  componentWillMount() {
    window.addEventListener("click", this.clearOps)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  componentDidMount() {
    this.handleSearch()
  }

  getIndex(row) {
    return this.props.data.rows.indexOf(row) + 1;
  }

  formatPartnerNature(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_user_attribute')).filter(r => (r.col_name == "partner_nature")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  formatDebtExchange(s) {
    var {dictionary} = this.props,
      period  = [{para_key:1,para_value:'是'},{para_key:0,para_value:'否'}],
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  handleSearch(index) {

    let myIndex = (typeof index == 'undefined') ? 1: index
    this.state.index = myIndex
    this.props.searcher({
      pageIndex: this.state.index,
      orgCode: this.state.orgCode,
      partnerNature: this.state.partnerNature,
      isDebtExchange: this.state.isDebtExchange
    })
  }



  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  openModalRepaymentMode(row) {
    let arr = this.props.dictionary.filter(r => (r.table_name == 't_user_attribute')).filter(r => (r.col_name == "repayment_mode"))
    arr.forEach(item => {item['checked'] = row.repayment_mode && row.repayment_mode.includes(item.para_key),item['disabled']=true})

    this.setState({
      repaymentModes: arr,
      showRepaymentMode: true
    })
  }

  hideModalRepaymentMode() {
    this.setState({showRepaymentMode: false})
  }

  openModalProductDeadline(row) {
    let arrDeadline = this.props.deadlineList
    arrDeadline.forEach(item => {item['checked'] = row.product_deadline && row.product_deadline.includes(item.deadline_id),item['disabled']=true})

    this.setState({
      productDeadlines: arrDeadline,
      showProductDeadline: true
    })
  }

  hideModalProductDeadline() {
    this.setState({showProductDeadline: false})
  }

  getPartnerNatures() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user_attribute')).filter(r => (r.col_name == "partner_nature"))
  }


  renderPartnerNatures() {
    var asset = this.getPartnerNatures()

    return (
      <Select onChange={this.handlePartnerNatureChange}
              options={asset.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }

  handlePartnerNatureChange(row) {
    let partnerNature = row.value
    this.setState({partnerNature}, this.handleSearch)
  }

  renderDebtExchange() {
    var debtExchange = [{para_key:"1",para_value:'是'},{para_key:"0",para_value:'否'}]

    return (
      <Select onChange={this.handleDebtExchangeChange}
              options={debtExchange.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }

  handleDebtExchangeChange(row) {
    let isDebtExchange = row.value
    this.setState({isDebtExchange}, this.handleSearch)
  }

  handleUserTypesChange = (row) => {
    const {allowedType, orgCode} = this.state
    if (row.value == '' && (orgCode == '' || orgCode.includes('%'))) {
      this.setState({allowedType: defaultUserType, orgCode: ''}, this.handleSearch)
    } else if (row.value == '')  {
      this.setState({allowedType: defaultUserType})
    } else{
      if (row.value == '1' && (orgCode == '' || orgCode.includes('%'))) {
        this.setState({allowedType: [row.value], orgCode: 'A1501%'}, this.handleSearch)
      } else if (row.value == '2' && (orgCode == '' || orgCode.includes('%'))) {
        this.setState({allowedType: [row.value], orgCode: 'F1502%'}, this.handleSearch)
      } else {
        this.setState({allowedType: [row.value]})
      }
    }
  }

  handleOrgChange = ({value}) => {
    const {allowedType} = this.state
    if (value == '' && allowedType.length === 1 && allowedType[0] === '1') {
      this.setState({
        orgCode: 'A1501%'
      }, this.handleSearch)
    } else if (value == '' && allowedType.length === 1 && allowedType[0] === '2') {
      this.setState({
        orgCode: 'F1502%'
      }, this.handleSearch)
    } else {
      this.setState({
        orgCode: value
      }, this.handleSearch)
    }
  }

  renderRepaymentModes() {
    const {repaymentModes} = this.state
    return repaymentModes.map((item, index) => <div className="col-sm-3" key={index}><input type="checkbox" id={`chk${index}`} disabled={item.disabled==undefined ? true : item.disabled} checked={item.checked}   /><label htmlFor={`chk${index}`}>{item.para_value}</label></div> )
  }

  renderProductDeadline() {
    let {productDeadlines} = this.state
    return productDeadlines.map((item, index) => <div className="col-sm-2" key={index}><input type="checkbox" id={`chkDeadline${index}`} disabled={item.disabled==undefined ? true : item.disabled} checked={item.checked}  /><label htmlFor={`chkDeadline${index}`}>{item.deadline_name}</label></div> )
  }

  render() {
    const {data, _buttons} = this.props
    var self = this
    return (
      <div className="component">
        <form className="filter-form clearfix" onSubmit={ this.onSearch }>
          <div className="row info-row">
            <div className="col-sm-5">
              <label className="col-sm-3 filter-form__static-text">
                <span>用户类型:</span>
              </label>
              <div className="col-sm-8">
                <UserTypeSelector onChange={this.handleUserTypesChange} allowedType={defaultUserType}/>
              </div>
            </div>

            <div className="col-sm-5">
            <label className="col-sm-3 filter-form__static-text">
              <span>合作方性质:</span>
            </label>
            <div className="col-sm-4">
              {this.renderPartnerNatures()}
            </div>
          </div>
          </div>
          <div className="row info-row">
            　
          </div>
          <div className="row info-row">
            <div className="col-sm-5">
              <label className="col-sm-3 filter-form__static-text">
                <span>机构:</span>
              </label>
              <div className="col-sm-8">
                <OrgSelector onChange={this.handleOrgChange} allowedType={self.state.allowedType}/>
              </div>
            </div>
            <div className="col-sm-5">
              <label className="col-sm-3 filter-form__static-text">
                <span>是否支持债转:</span>
              </label>
              <div className="col-sm-8">
                {/*{this.renderDebtExchange()}*/}
                <UserAttributeIsDebtExchangeSelector onChange={this.handleDebtExchangeChange}/>
              </div>
            </div>

            <div className="col-sm-2">
              <button type="submit" className="btn icon-btn btn-primary pull-left edi-mr">
                <i className="fa fa-search"></i>搜索
              </button>

            </div>
          </div>
        </form>
        <div className="wrapper">
          <Datatable columns={ this.columns } rows={ data.rows } index={ this.state.index }
                     searcher={ this.handleSearch } total={data.total}
          />
        </div>

        { this.state.showRepaymentMode  &&
        <Modal  title="还款方式"
               closer={ this.hideModalRepaymentMode }>{this.renderRepaymentModes()} </Modal> }
        { this.state.showProductDeadline &&
        <Modal title="产品期限要求" label="对以下产品期限有偏好"
               closer={ this.hideModalProductDeadline} >{this.renderProductDeadline()}</Modal> }

      </div>
    )
  }
}

