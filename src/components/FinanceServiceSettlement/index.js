/* eslint-disable no-undef */

import React, {Component} from 'react'
import Dialog from '../Dialog'
import Modal from '../Modal'
import OperLogModal from '../OperLogModal'
import Datatable from '../Datatable'
import FundRelatedSelector from '../Select/FundRelatedSelectorPage'
import AssetRelatedSelector from '../Select/AssetRelatedSelectorPage'
import FinanceServiceSettlementStatusSelectorPage from '../Select/FinanceServiceSettlementStatusSelectorPage'
import {
  FormatFinanceServiceSettlementModePage,
  FormatFinanceServiceSettlementStatusPage,
  FormatOrgCode
} from '../Formatter'
import SearchBar from '../Common/SearchBar'
import ServiceSettlementModal from './serviceSettlementModal'
import VoucherDialog from '../Dialog/VoucherDialog'
import moment from 'moment'
import Select from '../Select'

export default class FinanceServiceSettlement extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._SESSION, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      index: 1,
      year: "",
      month: "",
      settlementStatus: "",
      _row: null,
      settlementStartDate:'',
      settlementEndDate:'',
      assetOrgCode: (user_type === 1) ? session.org_code : '',
      fundOrgCode: (user_type === 2) ? session.org_code : '',

      showServiceSettlementModal: false,
      showDetailModal: false,
      showOperLogModal: false,
      detail: null
    }

    this.handleServiceSettlementStartDateChange = this.handleServiceSettlementStartDateChange.bind(this)
    this.handleServiceSettlementEndDateChange = this.handleServiceSettlementEndDateChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.handleFinanceServiceSettlementStatusChange = this.handleFinanceServiceSettlementStatusChange.bind(this)

    this.showServiceSettlementModal = this.showServiceSettlementModal.bind(this)
    this.closeServiceSettlementModal = this.closeServiceSettlementModal.bind(this)
    this.handleServiceSettlementConfirm = this.handleServiceSettlementConfirm.bind(this)
    this.showDetailModal = this.showDetailModal.bind(this)
    this.closeDetailModal = this.closeDetailModal.bind(this)
    this.showOperLogModal = this.showOperLogModal.bind(this)
    this.closeOperLogModal = this.closeOperLogModal.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.handleYearChange = this.handleYearChange.bind(this)
    this.handleMonthChange = this.handleMonthChange.bind(this)

    this.yearList = []
    this.monthList = []
    let startYear = moment().year() - 1
    for (let i = startYear; i <= startYear + 3; i++) {
      this.yearList.push({
        label: `${i}年`,
        value: `${i}`
      })
    }
    for (let i = 1; i <= 12; i++) {
      this.monthList.push({
        label: `${i}月`,
        value: i < 10 ? `0${i}` : `${i}`
      })
    }

    let targetName = (user_type === 1) && [{
        text: '资金方名称',
        name: 'fund_org_code',
        readOnly: true,
        renderDom: row => (<FormatOrgCode value={row.fund_org_code}/>)
      }] ||  (user_type === 2) && [{
        text: '资产方名称',
        name: 'asset_org_code',
        readOnly: true,
        renderDom: row => (<FormatOrgCode value={row.asset_org_code}/>)
      }] ||  (user_type === 3) && [{
        text: '资金方名称',
        name: 'fund_org_code',
        readOnly: true,
        renderDom: row => (<FormatOrgCode value={row.fund_org_code}/>)
      },{
        text: '资产方名称',
        name: 'asset_org_code',
        readOnly: true,
        renderDom: row => (<FormatOrgCode value={row.asset_org_code}/>)
      }] || [];

    this.columns = [
      {
        text: '结算单编号',
        name: 'settlement_code',
        renderDom: row => <span className="contain-copy-btn">{row.settlement_code}</span>
      },
      ...targetName,
      {
        text: '服务费结算方式',
        name: 'settlement_mode',
        style: {textAlign: 'center'},
        renderDom: row => <FormatFinanceServiceSettlementModePage value={row.settlement_mode}/>
      },
      {
        text: '服务费结算月',
        name: 'settlement_month',
        style: {textAlign: 'right'}
      },
      {
        text: '应付服务费（元）',
        name: 'settlement_service_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '状态',
        name: 'settlement_status',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => (<FormatFinanceServiceSettlementStatusPage value={row.settlement_status}/>)
      },
      {
        text: '操作',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => this.renderOperDom(row)
      },
      {
        text: '查看', style: {textAlign: 'center', width: '80px'}, renderDom: row => {
          let arr = [<a href="javascript:;" key={'oper1'} onClick={(e) => self.showOperLogModal(row)} className={`${this.props._buttons.includes('finance_service_settlement_view') ? '': 'disabled'}`}> 操作记录 </a>]
          if (row.settlement_status === '005' || row.settlement_status === '006') {
            arr.push(<a href="javascript:;" key={'oper2'} onClick={(e) => self.showDetailModal(row)} className={`${this.props._buttons.includes('finance_service_settlement_view') ? '': 'disabled'}`}> 付款详情 </a>)
          }
          return arr
        }
      },
      {
        text: '附件',
        name: 'settlement_file_url',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => <a href={row.settlement_file_url} download>明细</a>
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
        label: "结算单编号:",
        type:"text",
        props:{
          ref:(input) => {this.settlementCodeInput = input}
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
        label: "状态:",
        type:"custom",
        dom: <FinanceServiceSettlementStatusSelectorPage onChange={this.handleFinanceServiceSettlementStatusChange}/>
      },
      {
        label: "服务费结算年:",
        type:"custom",
        dom: <Select onChange={this.handleYearChange} options={this.yearList} defaultValue={this.state.year} placeholder="&nbsp;" />
      },
      {
        label: "服务费结算月:",
        type:"custom",
        dom: <Select onChange={this.handleMonthChange} options={this.monthList} defaultValue={this.state.month} placeholder="&nbsp;"/>
      }
    ]

    this.detailModalColumns = [
      {
        text: '结算单编号',
        name: 'settlement_code',
        readOnly: true
      },
      ...targetName,
      {
        name: 'settlement_month',
        text: '服务费结算月',
        type: 'text',
        readOnly: true
      },
      {
        name: 'settlement_service_fee',
        text: '应付服务费（元）',
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
        name: 'repayment_voucher_url',
        text: '付款凭证',
        type: 'text',
        readOnly: true,
        renderDom: row => (row.repayment_voucher_url?<a href={row.repayment_voucher_url} target="_blank" download>下载</a>:"")
      }
    ]

    this.toggleOps = (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const {_row} = this.state
      if (_row && _row.settlement_code === row.settlement_code) {
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

    this.renderOperDom = (row) => {
      const {user_type} = this.props._SESSION
      if (row.settlement_status === '003' || row.settlement_status === '006') {
        return null
      } else if ((user_type === 1 && row.settlement_status === '002') || (user_type === 1 && row.settlement_status === '005')) {
        return null
      }else {
        // 操作/状态（001：待对账   002：待复核   003：已取消   004：待结算  005：待收款  006：已结清）
        return (<div styleName="table-ops">
            {(row.settlement_status === '001') && (user_type === 1 ? [<a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('004', '确认', row)} key="004">确认</a>, <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('002', '申请复核', row)} key="002">申请复核</a>] : (user_type === 2 ? <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('003', '废弃', row)}>废弃</a> : ''))
            }
            {row.settlement_status === '002' && (user_type === 2 ? [<a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('001', '重新发起', row)}key="001">重新发起</a>, <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('003', '废弃', row)} key="003">废弃</a>] : '')}
            {row.settlement_status === '004' && (user_type === 1 ? <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionRepaymentDialog('004', '添加/修改还款详情', row)}>添加/修改服务费详情</a> : <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('003', '废弃', row)} key="003">废弃</a>)}
            {row.settlement_status === '005' && (user_type === 2 ? [<a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('006', '确认', row)} key="006">确认</a>, <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('004', '驳回', row)}key="004">驳回</a>, <a href="javascript:" className={`inner-link ${this.props._buttons.includes('finance_service_settlement_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('003', '废弃', row)} key="003">废弃</a>] : '')}
        </div>)
      }
    }


    this.actionRepaymentDialog = (targetStatus, actionName,_row) => {
      if (_row) {
        const {settlement_code: code, fund_org_code, settlement_month, real_name, real_bank, real_card_no, real_repayment_card_no: card_no, real_repayment_bank: bank, real_repayment_name: name, settlement_service_fee: total_fee, repayment_voucher_url: voucher_url} = _row
        let data = {
          code,
          fund_org_code,
          settlement_month,
          real_name:real_name ? real_name : '',
          real_bank:real_bank ? real_bank : '',
          real_card_no:real_card_no ? real_card_no : '',
          voucher_url,
          card_no: card_no ? card_no : '',
          bank: bank ? bank : '',
          name: name ? name : '',
          total_fee,
          _row
        }
        let confirmDialog = <VoucherDialog data={data} confirm={this.handleVoucherBill} closer={() => this.setState({confirmDialog: null})} title={'添加/修改服务费详情'} ></VoucherDialog>
        this.setState({confirmDialog, _row: {..._row}})
      }
    }

    this.actionDialog = (targetStatus, actionName, _row) => {
      if (_row) {
        let confirmDialog = <Dialog confirm={()=>this.handleTheBill(targetStatus, actionName, _row)} closer={() => this.setState({confirmDialog: null})} title={'操作确认'} style={{width: '500px'}}><p>该结算单的当前状态为<strong> {<FormatFinanceServiceSettlementStatusPage value={_row.settlement_status}/>} </strong>, 是否要<strong> {actionName} ？</strong></p></Dialog>
        this.setState({confirmDialog, _row: {..._row}})
      }
    }

    this.handleTheBill = (targetStatus, actionName, _row) => {
      this.setState({confirmDialog: null})
      this.props.changeStatus({
        settlementCode: _row.settlement_code,
        currentStatus: _row.settlement_status,
        targetStatus: targetStatus,
        actionName
      }).promise.then(()=> {
        this.handleSearch(this.state.index)
      })
    }

    this.handleVoucherBill = (data) => {
      const {_row} = data
      const self = this
      let formData = new FormData()
      formData.append('settlement_code', _row.settlement_code)
      formData.append('settlement_status', '005')
      data.card_no && formData.append('repayment_card_no', data.card_no)
      data.bank && formData.append('repayment_bank', data.bank)
      data.name && formData.append('repayment_name', data.name)
      data.real_card_no && formData.append('real_gathering_card_no', data.real_card_no)
      data.real_bank && formData.append('real_gathering_bank', data.real_bank)
      data.real_name && formData.append('real_gathering_name', data.real_name)

      data.file && formData.append('repayment_voucher_url', data.file)
      /*for (let key of formData.entries()) {
        console.log(key)
      }*/
      this.props.changeStatus(formData).promise.then(()=>{
        self.handleSearch(self.state.index)
        self.setState({confirmDialog: null})
      })
    }
  }

  componentDidMount() {
    this.handleSearch()
  }

  componentWillMount() {
    window.addEventListener("click", this.clearOps)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  handleYearChange({value}) {
    const {year} = this.state
    if (year !== value) {
      this.setState({year: value}, this.handleSearch)
    }
  }

  handleMonthChange({value}) {
    const {month} = this.state
    if (month !== value) {
      this.setState({month: value}, this.handleSearch)
    }
  }

  handleServiceSettlementStartDateChange(date){
    this.setState({settlementStartDate:date,index: 1}, this.handleSearch)
  }
  handleServiceSettlementEndDateChange(date){
    this.setState({settlementEndDate:date,index: 1}, this.handleSearch)
  }
  handleAssetOrgChange(row) {
    this.setState({assetOrgCode: row.value, index: 1}, this.handleSearch)
  }

  handleFundOrgChange(row) {
    this.setState({fundOrgCode: row.value, index: 1}, this.handleSearch)
  }
  handleFinanceServiceSettlementStatusChange(row){
    this.setState({settlementStatus: row.value, index: 1}, this.handleSearch)
  }
  handleSearch(i){
    const {index,assetOrgCode,fundOrgCode, settlementStatus, year, month} = this.state
    const {searcher} = this.props
    var myIndex = (typeof i == "number")? i : 1;
    this.state.index = myIndex
    searcher({
      pageIndex: myIndex,
      settlementCode: this.settlementCodeInput && this.settlementCodeInput.value,
      year: year,
      month: month,
      assetOrgCode,
      fundOrgCode,
      settlementStatus,
    })
  }
  handleServiceSettlementConfirm(){
    const {creator} = this.props
    let promise = creator.apply(this, arguments).promise
    promise.then(({response})=>{
      if(response && response.success){
        this.handleSearch()
        this.closeServiceSettlementModal()
      }
    })
    return promise
  }
  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }
  showServiceSettlementModal(){
    this.setState({showServiceSettlementModal: true})
  }
  closeServiceSettlementModal(){
    this.props.reset()
    this.setState({showServiceSettlementModal: false})
  }
  showDetailModal(row){
    this.setState({detail: {...row}, showDetailModal: true})
  }
  closeDetailModal(){
    this.props.reset()
    this.setState({detail: null, showDetailModal: false})
  }
  showOperLogModal(row){
    this.setState({operLogKey: row.settlement_code, showOperLogModal: true})
  }
  closeOperLogModal(){
    this.props.reset()
    this.setState({operLogKey: "", showOperLogModal: false})
  }
  render() {
    const {financeService,matcher,_buttons} = this.props
    const {showServiceSettlementModal, showDetailModal, showOperLogModal, confirmDialog, operLogKey, user_type} = this.state
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          {_buttons.includes("create_finance_service_settlement") && (user_type === 2) && <button type="button" className="btn icon-btn btn-success pull-right" onClick={this.showServiceSettlementModal}>
            <i className="fa fa-plus"></i>新增服务费结算单
          </button>}
          <button type="submit" className="btn icon-btn btn-primary pull-right">
            <i className="fa fa-search"></i>查询
          </button>
        </SearchBar>

        <div className="wrapper">
          <Datatable columns={this.columns} rows={financeService.rows} index={this.state.index} searcher={this.handleSearch} total={financeService.total}/>
        </div>
        { showServiceSettlementModal && <ServiceSettlementModal financeServiceSettlementDetail={financeService.detail} matcher={matcher} closer={this.closeServiceSettlementModal} confirm={this.handleServiceSettlementConfirm} working={financeService.working} title="新增服务费结算单"/>}
        { showDetailModal && <Modal data={this.state.detail} columns={this.detailModalColumns} title="付款详情" closer={ this.closeDetailModal } confirm={this.closeDetailModal} /> }
        { showOperLogModal && <OperLogModal data={this.state.detail} fromTable={"t_finance_service_settlement"} fromTableKey={operLogKey} title="服务费结算单日志" closer={ this.closeOperLogModal } /> }
        {confirmDialog && confirmDialog}
      </div>
    )
  }
}
