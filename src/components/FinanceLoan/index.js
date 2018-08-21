/* eslint-disable no-undef */

import React, {Component} from 'react'
import moment from 'moment'
import Dialog from '../Dialog'
import Modal from '../Modal'
import OperLogModal from '../OperLogModal'
import Datatable from '../Datatable'
import FundRelatedSelector from '../Select/FundRelatedSelectorPage'
import AssetRelatedSelector from '../Select/AssetRelatedSelectorPage'
import FinanceLoanStatusSelector from '../Select/FinanceLoanStatusSelectorPage'
import UserFromSelector from '../Select/UserFromSelectorPage'
import FinanceLoanDataFromSelector from '../Select/FinanceLoanDataFromSelectorPage'
import AssetRelatedUserFromSelector from '../Select/AssetRelatedUserFromSelectorPage'
import {
  FormatFinanceLoanStatus,
  FormatFinanceLoanDataFrom,
  FormatUserFrom,
  FormatOrgCode
} from '../Formatter'
import SearchBar from '../Common/SearchBar'
import HistoricalLoanModal from './historicalLoanModal'
import NewLoanModal from './newLoanModal'

export default class FinanceLoan extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._SESSION, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      index: 1,
      loanStatus: "",
      _row: null,
      accountStartDate:'',
      accountEndDate:'',
      fundUserFrom:"",
      dataFrom:"",
      assetOrgCode: (user_type === 1) ? session.org_code : '',
      fundOrgCode: (user_type === 2) ? session.org_code : '',

      showHistoricalLoanModal: false,
      showNewLoanModal: false,
      showDetailModal: false,
      showOperLogModal: false,
      detail: null
    }

    this.handleAccountStartDateChange = this.handleAccountStartDateChange.bind(this)
    this.handleAccountEndDateChange = this.handleAccountEndDateChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.handleFinanceLoanStatusChange = this.handleFinanceLoanStatusChange.bind(this)
    this.handleFundUserFromChange = this.handleFundUserFromChange.bind(this)
    this.handleDataFromChange = this.handleDataFromChange.bind(this)

    this.showHistoricalLoanModal = this.showHistoricalLoanModal.bind(this)
    this.closeHistoricalLoanModal = this.closeHistoricalLoanModal.bind(this)
    this.showNewLoanModal = this.showNewLoanModal.bind(this)
    this.closeNewLoanModal = this.closeNewLoanModal.bind(this)
    this.showDetailModal = this.showDetailModal.bind(this)
    this.closeDetailModal = this.closeDetailModal.bind(this)
    this.showOperLogModal = this.showOperLogModal.bind(this)
    this.closeOperLogModal = this.closeOperLogModal.bind(this)
    this.handleHistoricalLoanConfirm = this.handleHistoricalLoanConfirm.bind(this)
    this.handleNewLoanConfirm = this.handleNewLoanConfirm.bind(this)

    this.onSearch = this.onSearch.bind(this)

    let targetName = (user_type === 1) && [{
        text: '资金方名称',
        name: 'fund_org_code',
        renderDom: row => (<FormatOrgCode value={row.fund_org_code}/>)
      },{
        text: '用户来源',
        name: 'user_from',
        renderDom: row => (<FormatUserFrom value={row.user_from}/>)
      }] ||  (user_type === 2) && [{
        text: '资产方名称',
        name: 'asset_org_code',
        renderDom: row => (<FormatOrgCode value={row.asset_org_code}/>)
      },{
        text: '用户来源',
        name: 'user_from',
        renderDom: row => (<FormatUserFrom value={row.user_from}/>)
      }] ||  (user_type === 3) && [{
        text: '资金方名称',
        name: 'fund_org_code',
        renderDom: row => (<FormatOrgCode value={row.fund_org_code}/>)
      },{
        text: '资产方名称',
        name: 'asset_org_code',
        renderDom: row => (<FormatOrgCode value={row.asset_org_code}/>)
      }] || [];

    this.columns = [
      {
        text: '对账单编号',
        name: 'loan_code',
        renderDom: row => <span>{row.loan_code}</span>
      },
      ...targetName,
      {
        text: '数据来源',
        name: 'data_from',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => (<FormatFinanceLoanDataFrom value={row.data_from}/>)
      },
      {
        text: '出账日期',
        name: 'account_date',
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '创建日期',
        name: 'rx_insertTime',
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '出账金额（元）',
        name: 'account_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '收款方名称',
        name: 'real_gathering_name',
        withTitle: true,
        style: {maxWidth: '220px', textAlign: 'center',overflow: 'hidden'},
      },
      {
        text: '状态',
        name: 'loan_status',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => (<FormatFinanceLoanStatus value={row.loan_status}/>)
      },
      {
        text: '操作',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => this.renderOperDom(row)
      },
      {
        text: '查看', style: {textAlign: 'center', width: '80px'}, renderDom: row => [<a href="javascript:;" key={'oper1'} onClick={(e) => self.showOperLogModal(row)} className={`${this.props._buttons.includes('finance_loan_view') ? '': 'disabled'}`}> 操作记录 </a>, <a href="javascript:;" key={'oper2'} onClick={(e) => self.showDetailModal(row)} className={`${this.props._buttons.includes('finance_loan_view') ? '': 'disabled'}`}> 出账详情 </a>]
      },
      {
        text: '附件',
        name: 'loan_file_url',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => <a href={row.loan_file_url} target="_blank" download>明细</a>
      },
      {
        text: '备注',
        name: 'remark',
        withTitle: true,
        style: {maxWidth: '80px', textAlign: 'center', overflow: 'hidden'}
      }
    ]

    if(user_type === 3) {
      const index = this.columns.findIndex(item => item.text === '操作')
      if (index >= 0) {
        this.columns = [...this.columns.slice(0, index), ...this.columns.slice(index+1)]
      }
    }

    this.searchBarItems = [
      {
        label: "对账单编号:",
        type:"text",
        props:{
          ref:(input) => {this.loanCodeInput = input}
        }
      },
      {
        label: "资产方:",
        type:"custom",
        dom: <AssetRelatedSelector onChange={this.handleAssetOrgChange} fundOrgCode={(user_type === 2) ? session.org_code : ""}/>
      },
      {
        label: "资金方:",
        type:"custom",
        dom: <FundRelatedSelector onChange={this.handleFundOrgChange} assetOrgCode={(user_type === 1) ? session.org_code : ""}/>
      },
      {
        label: "收款方名称:",
        type:"text",
        props:{
          ref:(input) => {this.realGatheringNameInput = input}
        }
      },
      {
        label: "状态:",
        type:"custom",
        dom: <FinanceLoanStatusSelector onChange={this.handleFinanceLoanStatusChange}/>
      },
      {
        label: "用户来源:",
        type:"custom",
        dom: <UserFromSelector onChange={this.handleFundUserFromChange}/>
      },
      {
        label: "数据来源:",
        type:"custom",
        dom: <FinanceLoanDataFromSelector onChange={this.handleDataFromChange}/>
      },
      {
        label: "出账开始:",
        type:"date",
        props:{
          onDateChange:this.handleAccountStartDateChange,
          showClearDate:true,
          style: {width: "100%"}
        }
      },
      {
        label: "出账结束:",
        type:"date",
        props:{
          onDateChange:this.handleAccountEndDateChange,
          showClearDate:true,
          style: {width: "100%"}
        }
      },
    ]

    this.detailModalColumns = [
      {
        name: 'fund_user_full_name',
        text: '资金方名称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'fund_org_code',
        text: '资金方机构号',
        type: 'text',
        readOnly: true
      },
      {
        name: 'asset_user_full_name',
        text: '资产方名称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'asset_org_code',
        text: '资产方机构号',
        type: 'text',
        readOnly: true
      },
      {
        name: 'data_from',
        text: '数据来源',
        type: 'text',
        readOnly: true,
        renderDom: row => (<FormatFinanceLoanDataFrom value={row.data_from}/>)
      },
      {
        name: 'account_date',
        text: '出账日期',
        type: 'text',
        readOnly: true
      },
      {
        name: 'account_fee',
        text: '出账金额（元）',
        type: 'text',
        readOnly: true
      },
      {
        name: 'real_gathering_name',
        text: '收款账户名称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'real_gathering_bank',
        text: '收款账户开户行',
        type: 'text',
        readOnly: true
      },
      {
        name: 'real_gathering_card_no',
        text: '收款账户号',
        type: 'text',
        readOnly: true
      },
      {
        name: 'pay_channel',
        text: '支付渠道',
        type: 'text',
        readOnly: true
      },
      {
        name: 'repayment_name',
        text: '付款账户名称',
        type: 'text',
        readOnly: true
      },
      {
        name: 'repayment_bank',
        text: '付款账户开户行',
        type: 'text',
        readOnly: true
      },
      {
        name: 'repayment_card_no',
        text: '付款账户号',
        type: 'text',
        readOnly: true
      },
      {
        name: 'account_voucher_url',
        text: '出账凭证',
        type: 'text',
        readOnly: true,
        renderDom: row => (row.account_voucher_url?<a href={row.account_voucher_url} target="_blank" download>下载</a>:"")
      }
    ]

    this.toggleOps = (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const {_row} = this.state
      if (_row && _row.loan_code === row.loan_code) {
        this.setState({_row: null})
      } else {
        this.setState({_row: {...row}})
      }
    }

    this.clearOps = () => {
      if (this.state._row) {
        this.setState({_row: null})
      }
    }

    // 操作/状态     （001：待对账   002：待复核   003：已取消   004：已确认)
    this.renderOperDom = (row) => {
      const {user_type, user_id} = this.props._SESSION
      if (row.loan_status === '003') {
        return null
      } else if (user_type === 1 && row.loan_status === '002') {
        return null
      } else {
        return (<div styleName="table-ops">
            {row.loan_status === '001' && user_type === 1 && <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_loan_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('004', '确认', row)}>确认</a>}
            {row.loan_status === '001' && user_type === 1 && <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_loan_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('002', "申请复核", row)}>申请复核</a>}
            {(row.loan_status === '001' || row.loan_status === '002') && user_type === 2 && row.data_from === "A" && <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_loan_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('003', "废弃", row)}>废弃</a>}
            {row.loan_status === '002' && user_type === 2 && <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_loan_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('001', "重新发起", row)}>重新发起</a>}
            {row.loan_status === '004' && row.data_from === "B" && user_id === row.edi_user_id && moment().diff(moment(row.rx_insertTime), 'days') <= 7 && <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_loan_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('003', "废弃", row)}>废弃</a>}
        </div>)
      }
    }

    this.actionDialog = (targetStatus, actionName, _row) => {
      if (_row) {
        let confirmDialog = <Dialog confirm={()=>this.handleTheBill(targetStatus, actionName, _row)} closer={() => this.setState({confirmDialog: null})} title={'操作确认'} style={{width: '500px'}}><p>该对账单的当前状态为<strong> {<FormatFinanceLoanStatus value={_row.loan_status}/>} </strong>, 是否要<strong> {actionName} ？</strong></p></Dialog>
        this.setState({confirmDialog, _row: {..._row}})
      }
    }

    this.handleTheBill = (targetStatus, actionName, _row) => {
      this.setState({confirmDialog: null})
      this.props.changeStatus({
        loanCode: _row.loan_code,
        currentStatus: _row.loan_status,
        targetStatus: targetStatus,
        actionName
      }).promise.then(()=> {
        this.handleSearch(this.state.index)
      })
    }
  }

  componentDidMount() {
    this.handleSearch();
  }
  componentWillMount() {
    window.addEventListener("click", this.clearOps)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  handleAccountStartDateChange(date){
    this.setState({accountStartDate:date,index: 1}, this.handleSearch)
  }
  handleAccountEndDateChange(date){
    this.setState({accountEndDate:date,index: 1}, this.handleSearch)
  }
  handleAssetOrgChange(row) {
    this.setState({assetOrgCode: row.value, index: 1}, this.handleSearch)
  }

  handleFundOrgChange(row) {
    this.setState({fundOrgCode: row.value, index: 1}, this.handleSearch)
  }
  handleFinanceLoanStatusChange(row){
    this.setState({loanStatus: row.value, index: 1}, this.handleSearch)
  }
  handleFundUserFromChange(row){
    this.setState({fundUserFrom: row.value, index: 1}, this.handleSearch)
  }
  handleDataFromChange(row){
    this.setState({dataFrom: row.value, index: 1}, this.handleSearch)
  }
  handleSearch(i){
    const {index,assetOrgCode,fundOrgCode, accountStartDate, accountEndDate,loanStatus,fundUserFrom,dataFrom} = this.state
    const {searcher} = this.props
    var myIndex = (typeof i == "number")? i : 1;
    this.state.index = myIndex
    searcher({
      pageIndex: myIndex,
      loanCode: this.loanCodeInput.value,
      realGatheringName: this.realGatheringNameInput.value,
      accountStartDate,
      accountEndDate,
      assetOrgCode,
      fundOrgCode,
      loanStatus,
      fundUserFrom,
      dataFrom
    })
  }
  handleHistoricalLoanConfirm(){
    const {appender} = this.props
    let promise = appender.apply(this, arguments).promise
    promise.then(({response})=>{
      if(response && response.success){
        this.handleSearch()
        this.closeHistoricalLoanModal()
      }
    })
    return promise
  }
  handleNewLoanConfirm(){
    const {creator} = this.props
    let promise = creator.apply(this, arguments).promise
    promise.then(({response})=>{
      if(response && response.success){
        this.handleSearch()
        this.closeNewLoanModal()
      }
    })
    return promise
  }
  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }
  showHistoricalLoanModal(){
    this.setState({showHistoricalLoanModal: true, showNewLoanModal: false})
  }
  closeHistoricalLoanModal(){
    this.props.reset()
    this.setState({showHistoricalLoanModal: false})
  }
  showNewLoanModal(){
    this.setState({showNewLoanModal: true, showHistoricalLoanModal: false})
  }
  closeNewLoanModal(){
    this.props.reset()
    this.setState({showNewLoanModal: false})
  }
  showDetailModal(row){
    this.setState({detail: {...row}, showDetailModal: true})
  }
  closeDetailModal(){
    this.props.reset()
    this.setState({detail: null, showDetailModal: false})
  }
  showOperLogModal(row){
    this.setState({operLogKey: row.loan_code, showOperLogModal: true})
  }
  closeOperLogModal(){
    this.props.reset()
    this.setState({operLogKey: "", showOperLogModal: false})
  }
  render() {
    const {financeLoan,matcher,_buttons} = this.props
    const {showHistoricalLoanModal, showNewLoanModal, showDetailModal, showOperLogModal, confirmDialog, user_type, operLogKey} = this.state
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          {_buttons.includes("create_finance_loan") && (user_type === 2) && <button type="button" className="btn icon-btn btn-success pull-right" onClick={this.showNewLoanModal}>
            <i className="fa fa-plus"></i>新增放款对账单
          </button>}
          <button type="submit" className="btn icon-btn btn-primary pull-right">
            <i className="fa fa-search"></i>查询
          </button>
          {_buttons.includes("append_finance_loan") && ((user_type === 1) || (user_type === 2)) &&<button type="button" className="btn icon-btn btn-warning pull-right" onClick={this.showHistoricalLoanModal}>
            <i className="fa fa-plus"></i>补充历史出账单
          </button>}
        </SearchBar>

        <div className="wrapper">
          <Datatable columns={this.columns} rows={financeLoan.rows} index={this.state.index} searcher={this.handleSearch}
                     total={financeLoan.total}/>
        </div>

        { showHistoricalLoanModal && <HistoricalLoanModal financeLoanDetail={financeLoan.detail} matcher={matcher} closer={this.closeHistoricalLoanModal} confirm={this.handleHistoricalLoanConfirm} working={financeLoan.working} title="补充历史放款对账单"/>}
        { showNewLoanModal && <NewLoanModal financeLoanDetail={financeLoan.detail} matcher={matcher} closer={this.closeNewLoanModal} confirm={this.handleNewLoanConfirm} working={financeLoan.working} title="新增放款对账单"/>}
        { showDetailModal && <Modal data={this.state.detail} columns={this.detailModalColumns} title="出账详情" closer={ this.closeDetailModal } confirm={this.closeDetailModal} /> }
        { showOperLogModal && <OperLogModal data={this.state.detail} fromTable={"t_finance_loan"} fromTableKey={operLogKey} title="放款对账单" closer={ this.closeOperLogModal } /> }
        {confirmDialog && confirmDialog}
      </div>
    )
  }
}
