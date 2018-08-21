
import React, {Component} from 'react'
import moment from 'moment'
import Datatable from '../Datatable'
import SearchBar from '../Common/SearchBar'
import Modal from '../Modal'
import {formatNumber, getBrowserType} from '../../utils/etc'
import {FormatUserType, FormatPlatformPayMode} from '../Formatter'
import UserTypeSelector from '../Select/UserTypeSelectorPage'
import OrgRelatedUserTypeSelector from '../Select/OrgRelatedUserTypeSelectorPage'
import PayModal from './pay-modal'
import FeePatternModal from './fee-pattern-modal'
import OperLogModal from '../Modal/OperLogModal'
import YearMonthSelector from './YearMonthSelector'
import PlatformPayModeSelector from '../Select/PlatformPayModeSelectorPage'
import CSSModules from 'react-css-modules'
import style from "./style.scss"
import PayNoticeModal from './pay-notice-modal'
import Dialog from '../Dialog'

const defaultUserType = [1,2]

@CSSModules(style, {allowMultiple: true})
export default class PlatformUseFee extends Component {
  constructor() {
    super()
    this.state = {
      tab: 0,
      index: 1,
      data: null,
      billReduceMessage: {
        order_reduce_fee: '',
      },
      createTimeStart: null,
      createTimeEnd: null,
      payDateStart: null,
      payDateEnd: null,
      orgCode: '',
      userType: '',
      platformPayMode: '',
      billYear: '',
      billMonth: '',
      operId: '',
      showBillReduceModal: false,
      showBillOperLogModal: false,
      showPayNoticeModal: false,
      showPayModal: false,
      showPayOperLogModal: false,
      showFeePatternModal: false,
      showFeeOperLogModal: false,
      confirmExport: false,
    }
    var self = this
    this.handleSearchBill = this.handleSearchBill.bind(this)
    this.handleSearchPay = this.handleSearchPay.bind(this)
    this.handleSearchFee = this.handleSearchFee.bind(this)
    this.toggleOpsBill = this.toggleOpsBill.bind(this)
    this.toggleOpsPay = this.toggleOpsPay.bind(this)
    this.toggleOpsFee = this.toggleOpsFee.bind(this)
    this.clearOps = this.clearOps.bind(this)
    this.selectTab = this.selectTab.bind(this)
    this.handleCreateTimeChangePay = this.handleCreateTimeChangePay.bind(this)
    this.handlePayDateChangePay = this.handlePayDateChangePay.bind(this)
    this.handleOrgChangePay = this.handleOrgChangePay.bind(this)
    this.handleUserTypesChangePay = this.handleUserTypesChangePay.bind(this)
    this.openPayModal = this.openPayModal.bind(this)
    this.hidePayModal = this.hidePayModal.bind(this)
    this.handleConfirmPay = this.handleConfirmPay.bind(this)
    this.openPayOperLogModal = this.openPayOperLogModal.bind(this)
    this.hidePayOperLogModal = this.hidePayOperLogModal.bind(this)
    this.handleOrgChangeFee = this.handleOrgChangeFee.bind(this)
    this.handleUserTypesChangeFee = this.handleUserTypesChangeFee.bind(this)
    this.openFeePatternModal = this.openFeePatternModal.bind(this)
    this.hideFeePatternModal = this.hideFeePatternModal.bind(this)
    this.handleConfirmFee = this.handleConfirmFee.bind(this)
    this.openFeeOperLogModal = this.openFeeOperLogModal.bind(this)
    this.hideFeeOperLogModal = this.hideFeeOperLogModal.bind(this)
    this.handleBillDateChange = this.handleBillDateChange.bind(this)
    this.handlePlatformPayModeChange = this.handlePlatformPayModeChange.bind(this)
    this.handleOrgChangeBill = this.handleOrgChangeBill.bind(this)
    this.handleUserTypesChangeBill = this.handleUserTypesChangeBill.bind(this)
    this.openBillReduceModal = this.openBillReduceModal.bind(this)
    this.hideBillReduceModal = this.hideBillReduceModal.bind(this)
    this.handleConfirmBillReduce = this.handleConfirmBillReduce.bind(this)
    this.openBillOperLogModal = this.openBillOperLogModal.bind(this)
    this.hideBillOperLogModal = this.hideBillOperLogModal.bind(this)
    this.openPayNoticeModal = this.openPayNoticeModal.bind(this)
    this.hidePayNoticeModal = this.hidePayNoticeModal.bind(this)
    this.handleConfirmPayNotice = this.handleConfirmPayNotice.bind(this)
    this.openExportConfirm = this.openExportConfirm.bind(this)
    this.closeExportConfirm = this.closeExportConfirm.bind(this)
    this.handleExport = this.handleExport.bind(this)

    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1

    this.searchBarItemsBill = [
      {
        label: "账单日期:",
        type:"custom",
        renderDom: () => <YearMonthSelector defaultYear={year} defaultMonth={month} handleDateChange={this.handleBillDateChange} noEmpty={false} yearStyle={{width: '90px'}} monthStyle={{marginLeft: '3px', width: '70px'}}/>
      },
      {
        label: "合作方类型:",
        type:"custom",
        dom: <UserTypeSelector onChange={this.handleUserTypesChangeBill} allowedType={defaultUserType}/>
      },
      {
        label: "合作方名称:",
        type:"custom",
        renderDom: () => <OrgRelatedUserTypeSelector onChange={this.handleOrgChangeBill} userType={this.state.userType} defaultUserTypes={defaultUserType}/>
      },
      {
        label: "缴纳方式:",
        type:"custom",
        renderDom: () => <PlatformPayModeSelector onChange={this.handlePlatformPayModeChange}/>
      },
    ],
    this.searchBarItemsPay = [
      {
        label: "时间:",
        type:"group",
        props:{
          items:[
            {
              label: "创建日期",
              type:"daterange",
              props:{
                onDatesChange:self.handleCreateTimeChangePay,
                showClearDate:true,
                output:"date",
                style: {width: "100%"},
                ref:(input) => {this.createTimePayPicker = input},
              },
              resetState: ()=>{
                if(this.createTimePayPicker){
                  this.createTimePayPicker.resetState()
                }
              }
            },
            {
              label: "缴费日期",
              type:"daterange",
              props:{
                onDatesChange:self.handlePayDateChangePay,
                showClearDate:true,
                output:"date",
                style: {width: "100%"},
                ref:(input) => {this.payDatePayPicker = input},
              },
              resetState: ()=>{
                if(this.payDatePayPicker){
                  this.payDatePayPicker.resetState()
                }
              }
            },
          ]
        }
      },
      {
        label: "合作方类型:",
        type:"custom",
        dom: <UserTypeSelector onChange={this.handleUserTypesChangePay} allowedType={defaultUserType}/>
      },
      {
        label: "合作方名称:",
        type:"custom",
        renderDom: () => <OrgRelatedUserTypeSelector onChange={this.handleOrgChangePay} userType={this.state.userType} defaultUserTypes={defaultUserType}/>
      },
    ],
    this.searchBarItemsFee = [
      {
        label: "合作方类型:",
        type:"custom",
        dom: <UserTypeSelector onChange={this.handleUserTypesChangeFee} allowedType={defaultUserType}/>
      },
      {
        label: "合作方名称:",
        type:"custom",
        renderDom: () => <OrgRelatedUserTypeSelector onChange={this.handleOrgChangeFee} userType={this.state.userType} defaultUserTypes={defaultUserType}/>
      },
    ],

    this.billColumns = [
      {
        text: '操作', style: {textAlign: 'center', width: '80px'}, renderDom: row => {
        const {_buttons} = self.props
        return (
          <div styleName="table-ops">
            <a href="javascript:" onClick={(e) => self.toggleOpsBill(e, row)}>操作</a>
            <div styleName={(`${row.org_code}::${row.month}` == self.state.operId) ? "show-ops-right" : 'hidden-ops-right'}>
              <a href="javascript:" onClick={() => self.openBillOperLogModal(row)}>日志</a>
              {Array.isArray(_buttons) && _buttons.includes("platform_use_fee_bill_notice") && <a href="javascript:" onClick={() => self.openPayNoticeModal(row)}>缴费提醒</a>}
              {Array.isArray(_buttons) && _buttons.includes("platform_use_fee_bill_reduce") && <a href="javascript:" onClick={() => self.openBillReduceModal(row)}>减免</a>}
            </div>
          </div>
        )
      }
      },
      {
        text: '合作方类型',
        name: 'user_type',
        style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: (row) => <FormatUserType value={row.user_type}/>
      },
      {text: '合作方名称', name: 'user_name', style: {maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '账单月份', name: 'month', style: {maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {
        text: '缴纳方式',
        name: 'platform_pay_mode',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center'},
        renderDom: (row) => <FormatPlatformPayMode value={row.platform_pay_mode}/>
      },
      {
        text: '费率(%)',
        name: 'platform_use_rate',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.platform_use_rate)
      },
      {
        text: '本月个人订单金额',
        name: 'person_order_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.person_order_fee)
      },
      {
        text: '本月企业订单金额',
        name: 'enterprise_order_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.enterprise_order_fee)
      },
      {
        text: '本月减免订单金额',
        name: 'order_reduce_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.order_reduce_fee)
      },
      {
        text: '本月使用费',
        name: 'platform_use_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.platform_use_fee)
      },
      {
        text: '本月缴费金额',
        name: 'finish_pay_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.finish_pay_fee)
      },
      {
        text: '上月账户余额',
        name: 'last_balance_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.last_balance_fee)
      },
      {
        text: '本月账户余额',
        name: 'balance_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.balance_fee)
      },
      {
        text: '本月应付总额',
        name: 'need_pay_fee',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.need_pay_fee)
      },
      {text: '结算截止日', name: 'pay_deadline_date', style: {maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center'}},

    ],

    this.payColumns = [
      {text: '创建时间', name: 'create_time', style: {width: '200px', textAlign: 'center'}},
      {text: '缴费日期', name: 'pay_date', style: {width: '160px', textAlign: 'center'}},
      {
        text: '合作方类型',
        name: 'user_type',
        style: {width: '160px'},
        renderDom: (row) => <FormatUserType value={row.user_type}/>
      },
      {text: '合作方名称', name: 'user_name', style: {maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {
        text: '缴费金额(元)',
        name: 'pay_fee',
        style: {width: '200px', textAlign: 'right'},
        renderDom: (row) => formatNumber(row.pay_fee)
      },
      {text: '备注', name: 'comment', style: {maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis'}}
    ],

    this.feeColumns = [
      {
        text: '合作方类型',
        name: 'user_type',
        style: {width: '160px'},
        renderDom: (row) => <FormatUserType value={row.user_type}/>
      },
      {text: '合作方名称', name: 'user_name', style: {maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}},
      {
        text: '费用缴纳方式',
        name: 'platform_pay_mode',
        style: {width: '160px', textAlign: 'center'},
        renderDom: (row) => <FormatPlatformPayMode value={row.platform_pay_mode}/>
      },
      {
        text: '平台使用费率(%)',
        name: 'platform_use_rate',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => row.platform_use_rate === null ? '' : formatNumber(row.platform_use_rate)
      },
      {
        text: '调整后平台使用费率(%)',
        name: 'adjust_platform_use_rate',
        style: {maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'},
        renderDom: (row) => row.adjust_platform_use_rate === null ? '' : formatNumber(row.adjust_platform_use_rate)
      },
      {text: '调整后费率生效时间', name: 'adjust_effect_month', style: {maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center'}},
      {
        text: '操作', style: {textAlign: 'center', width: '80px'}, renderDom: row => {
          const {_buttons} = self.props
          return (
            <div styleName="table-ops">
              <a href="javascript:" onClick={(e) => self.toggleOpsFee(e, row)}>操作</a>
              <div styleName={(row.user_id == self.state.operId) ? "show-ops" : 'hidden-ops'}>
                <a href="javascript:" onClick={() => self.openFeeOperLogModal(row)}>日志</a>
                {Array.isArray(_buttons) && _buttons.includes("platform_use_fee_pattern_update") && <a href="javascript:" onClick={() => self.openFeePatternModal(row)}>编辑</a>}
              </div>
            </div>
          )
        }
      }
    ],

    this.billReduceColumns = [
      {
        name: 'user_type',
        text: '合作方类型',
        type: 'text',
        readOnly: true,
        renderDom: row => <FormatUserType value={row.user_type}/>
      },
      {
        name: 'user_name',
        text: '合作方名称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'month',
        text: '账单月份',
        type: 'text',
        readOnly: true
      },

      {
        name: 'person_order_fee',
        text: '本月平台个人订单金额(元)',
        type: 'text',
        readOnly: true,
        renderDom: row => formatNumber(row.person_order_fee)
      },
      {
        name: 'enterprise_order_fee',
        text: '本月平台企业订单金额(元)',
        type: 'text',
        readOnly: true,
        renderDom: row => formatNumber(row.enterprise_order_fee)
      },
      {
        name: 'order_reduce_fee',
        text: '减免平台订单金额(元)',
        type: 'text',
        labelClassName: "asterisk",
        handleChange(e){
          self.state.data.order_reduce_fee = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.order_reduce_fee == undefined) || !row.order_reduce_fee) ? "必填" : (isNaN(row.order_reduce_fee) || (Math.abs(parseFloat(row.order_reduce_fee)) > 10000000000) || (!/^-?\d+$/.test(row.order_reduce_fee)) ? "整数且绝对值不能大于100亿" : null)
        }
      },
    ]
  }

  handleBillDateChange({year, month}) {
    this.setState({billYear: year, billMonth: month}, this.handleSearchBill)
  }

  handlePlatformPayModeChange(row) {
    this.setState({platformPayMode: row.value}, this.handleSearchBill)
  }

  handleOrgChangeBill(row) {
    this.setState({orgCode: row.value}, this.handleSearchBill)
  }

  handleUserTypesChangeBill(row) {
    this.setState({userType: row.value}, this.handleSearchBill)
  }

  toggleOpsBill(e, row) {
    e.preventDefault();
    e.stopPropagation();
    const {operId} = this.state
    if (operId == `${row.org_code}::${row.month}`) {
      this.setState({operId: ''})
    } else {
      this.setState({operId: `${row.org_code}::${row.month}`})
    }
  }

  toggleOpsPay(e, row) {
    e.preventDefault();
    e.stopPropagation();
    const {operId} = this.state
    if (operId == row.pay_no) {
      this.setState({operId: ''})
    } else {
      this.setState({operId: row.pay_no})
    }
  }

  toggleOpsFee(e, row) {
    e.preventDefault();
    e.stopPropagation();
    const {operId} = this.state
    if (operId == row.user_id) {
      this.setState({operId: ''})
    } else {
      this.setState({operId: row.user_id})
    }
  }

  clearOps() {
    if (this.state.operId) {
      this.setState({operId: ''})
    }
  }

  handleSearchBill(index) {
    let myIndex = (typeof index == 'undefined') ? 1: index
    this.setState({index: myIndex})
    return this.props.billSearcher({
      pageIndex: myIndex,
      billYear: this.state.billYear,
      billMonth: this.state.billMonth,
      userType: this.state.userType,
      orgCode: this.state.orgCode,
      platformPayMode: this.state.platformPayMode
    })
  }

  handleSearchPay(index) {
    let myIndex = (typeof index == 'undefined') ? 1: index
    this.setState({index: myIndex}, () => {
      this.props.paySearcher({
        pageIndex: myIndex,
        createTimeStart: this.state.createTimeStart && this.state.createTimeStart.format('YYYY-MM-DD 00:00:00'),
        createTimeEnd: this.state.createTimeEnd && this.state.createTimeEnd.format('YYYY-MM-DD 23:59:59'),
        payDateStart: this.state.payDateStart && this.state.payDateStart.format('YYYY-MM-DD 00:00:00'),
        payDateEnd: this.state.payDateEnd && this.state.payDateEnd.format('YYYY-MM-DD 23:59:59'),
        userType: this.state.userType,
        orgCode: this.state.orgCode
      })
    })
  }

  handleSearchFee(index) {
    let myIndex = (typeof index == 'undefined') ? 1: index
    this.setState({index: myIndex}, () => {
      this.props.feeSearcher({
        pageIndex: myIndex,
        userType: this.state.userType,
        orgCode: this.state.orgCode
      })
    })
  }

  handleOrgChangePay(row) {
    this.setState({orgCode: row.value}, this.handleSearchPay)
  }

  handleUserTypesChangePay(row) {
    this.setState({userType: row.value}, this.handleSearchPay)
  }

  componentWillMount() {
    window.addEventListener("click", this.clearOps)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  componentDidMount() {
  }

  selectTab(e, tab) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      createTimeStart: null,
      createTimeEnd: null,
      payDateStart: null,
      payDateEnd: null,
      orgCode: '',
      userType: '',
      platformPayMode: '',
      billYear: '',
      billMonth: '',
      operId: '',
    })

    if (tab == 0) {
      this.handleSearchBill()
    } else if (tab == 1) {
      this.handleSearchPay()
    } else if (tab == 2) {
      this.handleSearchFee()
    }
    this.setState({tab})
  }

  handleCreateTimeChangePay({startDate, endDate}) {
    this.setState({createTimeStart: startDate, createTimeEnd: endDate}, this.handleSearchPay)
  }

  handlePayDateChangePay({startDate, endDate}) {
    this.setState({payDateStart: startDate, payDateEnd: endDate}, this.handleSearchPay)
  }

  openBillReduceModal(row) {
    this.setState({data:{...row}, showBillReduceModal: true})
  }

  hideBillReduceModal() {
    this.setState({showBillReduceModal: false})
  }

  handleConfirmBillReduce(e){
    e.preventDefault();
    e.stopPropagation();

    let {billReduceMessage: message} = this.state, valid = true

    this.billReduceColumns.map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      this.hideBillReduceModal()
      this.props.resetMessage()
      this.props.billReducer(this.state.data).promise.then(({response})=>{
        if(response && response.success){
          this.handleSearchBill(this.state.index)
          this.props.messageSetter("平台订单金额减免成功", "SUCCESS")
        }
      })
    } else {
      this.setState({billReduceMessage:{...message}})
    }
  }

  openPayModal() {
    this.setState({data:{}, showPayModal: true})
  }

  hidePayModal() {
    this.setState({showPayModal: false})
  }

  handleConfirmPay(e, data){
    e.preventDefault();
    e.stopPropagation();

    this.hidePayModal()
    this.props.resetMessage()
    this.props.payAdder(data).promise.then(data => {
      if (data && data.response && data.response.success) {
        this.handleSearchPay()
      }
    })
  }

  openPayOperLogModal(row) {
    this.setState({data: {...row}, showPayOperLogModal: true})
  }

  hidePayOperLogModal() {
    this.setState({showPayOperLogModal: false})
  }

  handleOrgChangeFee(row) {
    this.setState({orgCode: row.value}, this.handleSearchFee)
  }

  handleUserTypesChangeFee(row) {
    this.setState({userType: row.value}, this.handleSearchFee)
  }

  openFeePatternModal(row) {
    this.setState({
      data: {...row, adjust_platform_use_rate: row.adjust_platform_use_rate === null ? '' : row.adjust_platform_use_rate},
      showFeePatternModal: true
    })
  }

  hideFeePatternModal() {
    this.setState({
      showFeePatternModal: false
    })
  }

  handleConfirmFee(e, data){
    e.preventDefault();
    e.stopPropagation();

    this.hideFeePatternModal()
    this.props.resetMessage()
    this.props.feePatternUpdater(data)
  }

  openFeeOperLogModal(row) {
    this.setState({data: {...row}, showFeeOperLogModal: true})
  }

  hideFeeOperLogModal() {
    this.setState({showFeeOperLogModal: false})
  }

  openBillOperLogModal(row) {
    this.setState({data: {...row}, showBillOperLogModal: true})
  }

  hideBillOperLogModal() {
    this.setState({showBillOperLogModal: false})
  }

  openPayNoticeModal(row) {
    const {mailSearcher} = this.props
    mailSearcher({orgCode: row.org_code})
    this.setState({data:{...row}, showPayNoticeModal: true})
  }

  hidePayNoticeModal() {
    this.setState({showPayNoticeModal: false})
  }

  handleConfirmPayNotice(e, data){
    e.preventDefault();
    e.stopPropagation();

    this.hidePayNoticeModal()
    this.props.resetMessage()
    this.props.payNoticer(data)
  }

  openExportConfirm() {
    this.setState({confirmExport: true})
  }

  closeExportConfirm() {
    this.setState({confirmExport: false})
  }

  handleExport() {
    var {messageSetter} = this.props
    this.handleSearchBill().promise.then(({response})=>{
      if(response.success){
        var browserType = getBrowserType(),
          queryString = `/platformUseFee/export?billYear=${this.state.billYear}&billMonth=${this.state.billMonth}&userType=${this.state.userType}&orgCode=${this.state.orgCode}&platformPayMode=${this.state.platformPayMode}`
        messageSetter("导出即将开始","INFO")
        setTimeout(()=>{
          if (browserType == "Chrome") {
            this.hiddenLink.href = queryString
            this.hiddenLink.click()
          } else if (browserType == 'Safari') {
            //this.hiddenLink.href = queryString
            window.location.href = queryString
          } else if (browserType == 'Firefox') {
            //this.hiddenLink.href = queryString
            window.location.href = queryString
          } else {
            window.open(queryString, '_blank')
          }
        },2000)
      }
    })
  }

  render() {
    const {data, _buttons, _session} = this.props
    const {tab, showBillOperLogModal, showBillReduceModal, showPayNoticeModal, showPayModal, showFeePatternModal, showPayOperLogModal, showFeeOperLogModal, confirmExport} = this.state

    let userType = _session.user_type
    return userType == 3?(
      <div className="component">
        {tab == 0 && <SearchBar items={this.searchBarItemsBill} searcher={this.handleSearchBill}>
          <div className="pull-left">
            <button type="button" className="btn icon-btn btn-primary" onClick={() => {
              this.handleSearchBill()
            }} style={{marginLeft: 0}}>
              <i className="fa fa-search"></i><span className="text">搜索</span>
            </button>
          </div>
          {Array.isArray(_buttons) && _buttons.includes("platform_use_fee_bill_export") &&
          <button type="button" className="btn icon-btn btn-danger pull-right" onClick={this.openExportConfirm}>
            <i className="fa fa-download"></i><span className="text">账单导出</span>
          </button>}
        </SearchBar>}

        {tab == 1 && <SearchBar items={this.searchBarItemsPay} searcher={this.handleSearchPay}>
          <div className="pull-left">
            <button type="button" className="btn icon-btn btn-primary" onClick={() => {
              this.handleSearchPay()
            }} style={{marginLeft: 0}}>
              <i className="fa fa-search"></i><span className="text">搜索</span>
            </button>
          </div>
          {Array.isArray(_buttons) && _buttons.includes("platform_use_fee_pay") &&
          <button type="button" className="btn icon-btn btn-success pull-right" onClick={() => {
            this.openPayModal()
          }}>
            <i className="fa fa-plus"></i>缴费
          </button>
          }
        </SearchBar>}

        {tab == 2 && <SearchBar items={this.searchBarItemsFee} searcher={this.handleSearchFee}>
          <div className="pull-left">
            <button type="button" className="btn icon-btn btn-primary" onClick={() => {
              this.handleSearchFee()
            }} style={{marginLeft: 0}}>
              <i className="fa fa-search"></i><span className="text">搜索</span>
            </button>
          </div>
        </SearchBar>}

        <div className="wrapper__tab-paging">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={(
            tab == 0)
              ? 'active'
              : ''} onClick={e => this.selectTab(e, 0)}>
              <a href="javascript:;">账单</a>
            </li>
            <li role="presentation" className={(
            tab == 1)
              ? 'active'
              : ''} onClick={e => this.selectTab(e, 1)}>
              <a href="javascript:;">缴费</a>
            </li>
            <li role="presentation" className={(
            tab == 2)
              ? 'active'
              : ''} onClick={e => this.selectTab(e, 2)}>
              <a href="javascript:;">费用模版</a>
            </li>
          </ul>
          {tab == 0 && <span className="unit">单位：元</span>}
          {
            tab == 0 && <div className="wrapper__tab-area__higher">
              <Datatable columns={this.billColumns} rows={data.rows} index={this.state.index} searcher={this.handleSearchBill}
                         total={data.total}/>
              {/*{data.rows.length > 0 && <div styleName="summa">*/}
                {/*<p>累计平台订单金额 <span>{formatNumber(data.order_fee_total)}</span> 元,平台使用费 <span>{formatNumber(data.platform_use_fee_total)}</span> 元,缴费金额 <span>{formatNumber(data.finish_pay_fee_total)}</span> 元</p></div>}*/}
            </div>
          }
          {
            tab == 1 && <div className="wrapper__tab-area__higher">
              <Datatable columns={this.payColumns} rows={data.rows} index={this.state.index} searcher={this.handleSearchPay}
                         total={data.total}/>
            </div>
          }
          {
            tab == 2 && <div className="wrapper__tab-area__higher">
              <Datatable columns={this.feeColumns} rows={data.rows} index={this.state.index} searcher={this.handleSearchFee}
                         total={data.total}/>
            </div>
          }
        </div>

        { showBillReduceModal && <Modal data={this.state.data} columns={this.billReduceColumns} message={this.state.billReduceMessage} title="减免平台订单金额" closer={ this.hideBillReduceModal } confirm={this.handleConfirmBillReduce} /> }
        { showPayNoticeModal && <PayNoticeModal data={this.state.data} title="缴费提醒" closer={ this.hidePayNoticeModal } confirm={this.handleConfirmPayNotice}/> }
        { showPayModal && <PayModal title="缴费" closer={ this.hidePayModal } confirm={this.handleConfirmPay} /> }
        { showFeePatternModal && <FeePatternModal data={this.state.data} title="费用模版" closer={ this.hideFeePatternModal } confirm={this.handleConfirmFee} /> }
        { showBillOperLogModal && <OperLogModal data={this.state.data} tableName="t_edi_pay_bill" tableKey={`${this.state.data.org_code},${this.state.data.month}`} title="平台使用费账单日志" closer={ this.hideBillOperLogModal } /> }
        { showPayOperLogModal && <OperLogModal data={this.state.data} tableName="t_edi_pay_detail" tableKey={this.state.data.pay_no} title="平台使用费缴费日志" closer={ this.hidePayOperLogModal } /> }
        { showFeeOperLogModal && <OperLogModal data={this.state.data} tableName="t_user_attribute" tableKey={this.state.data.user_id} title="费用模板日志" closer={ this.hideFeeOperLogModal } /> }
        { confirmExport && <Dialog confirm={(e) => {
          this.handleExport(e)
          this.closeExportConfirm()
        }} title="请确认" closer={this.closeExportConfirm} size="modal-md">
          超大量数据检索会存在失败的可能或速度慢<br/>
          您确定要对{data.total}条账单数据做导出操作么?
        </Dialog>}
        <a download="true" className="hidden" target="_blank" ref={(link) => {this.hiddenLink = link}}/>
      </div>
    ):
    (
      <div className="component">
        <SearchBar items={this.searchBarItemsBill.slice(0, 1)} searcher={this.handleSearchBill}>
          <div className="pull-left">
            <button type="button" className="btn icon-btn btn-primary" onClick={() => {
              this.handleSearchBill()
            }} style={{marginLeft: 0}}>
              <i className="fa fa-search"></i><span className="text">搜索</span>
            </button>
          </div>
        </SearchBar>
        <div className="wrapper__tab-paging">
            <span className="unit__without-tab">单位：元</span>
            <Datatable columns={this.billColumns.slice(3, this.billColumns.length)} rows={data.rows} index={this.state.index} searcher={this.handleSearchBill}
                       total={data.total}/>
            {/*{data.rows.length > 0 && <div styleName="summa">*/}
              {/*<p>累计平台订单金额 <span>{formatNumber(data.order_fee_total)}</span> 元,平台使用费 <span>{formatNumber(data.platform_use_fee_total)}</span> 元,缴费金额 <span>{formatNumber(data.finish_pay_fee_total)}</span> 元</p></div>}*/}
        </div>
      </div>
    )
  }
}
