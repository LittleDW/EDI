/* eslint-disable no-undef */

import React, {Component} from 'react'
import Dialog from '../Dialog'
import moment from 'moment'
import Datatable from '../Datatable'
import OperLogModal from '../Modal/OperLogModal'
import FundRelatedUserFromSelector from '../Select/FundRelatedUserFromSelectorPage'
import AssetRelatedUserFromSelector from '../Select/AssetRelatedUserFromSelectorPage'
import FundUserFromSelector from '../Select/FundUserFromSelectorPage'
import AssetUserFromSelector from '../Select/AssetUserFromSelectorPage'
import OrderStatusSelector from '../Select/OrderStatusSelectorPage'
import {
  FormatOrderStatus,
  FormatOrderBorrowPeriod,
  FormatOrderBorrowType,
  FormatOrderBorrowPayMode,
  FormatOrderRefuseType,
  FormatEnterpriseOrderBusinessType,
  FormatOrderContractType,
  FormatOrgCode,
  FormatOrderRepaymentMode,
  FormatOrderCreditOrg,
  FormatOrderDataFrom,
} from '../Formatter'
import SearchBar from '../Common/SearchBar'
import Modal from '../Orders/modal'
import DatePicker from '../DatePicker'
import TableMode from '../Orders/table-modal'
import VoucherTableMode from './all-voucher-table-modal'
import {getBrowserType} from '../../utils/etc'
import style from "./style.scss"
import CheckResultUploadModal from '../Orders/checkResultUploadModal'
import ContractSupplymentModal from '../Orders/contractSupplyment'
import AccountDetailUploadModal from '../Orders/accountDetailUploadModal'

export default class CorpOrder extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      index: 1,
      status: [],
      assetOrgCode: (user_type === 1)? session.org_code:'',
      fundOrgCode:(user_type === 2)? session.org_code:'',
      orderRepaymentNo: '',
      orderPaymentNo: '',
      orderAccountNo: '',
      orderAdavnceNo: '',
      orderNo: '',
      today: moment().format("yyyy-MM-dd"),
      startDate: null,
      endDate: null,
      startCreateTime: null,
      endCreateTime: null,
      opsOrderNo:'',
      confirmExport: false,
      confirmMassDownload: false,
      showAllVoucher: false,
      showOperLogModal: false,
      showContractSupplymentModal: false,
      operLogModalKey: '',
      showAccountDetailUploadModal: false,
      showCheckResultUploadModal: false,
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.handleExport = this.handleExport.bind(this)
    this.openOrderRepaymentModal = this.openOrderRepaymentModal.bind(this)
    this.closeOrderRepaymentModal = this.closeOrderRepaymentModal.bind(this)
    this.openOrderPaymentModal = this.openOrderPaymentModal.bind(this)
    this.closeOrderPaymentModal = this.closeOrderPaymentModal.bind(this)
    this.openOrderAdvanceModal = this.openOrderAdvanceModal.bind(this)
    this.closeOrderAdvanceModal = this.closeOrderAdvanceModal.bind(this)
    this.openOrderContractModal = this.openOrderContractModal.bind(this)
    this.closeOrderContractModal = this.closeOrderContractModal.bind(this)
    this.openOrderVoucherModal = this.openOrderVoucherModal.bind(this)
    this.closeOrderVoucherModal = this.closeOrderVoucherModal.bind(this)
    this.openOrderAccountModal = this.openOrderAccountModal.bind(this)
    this.closeOrderAccountModal = this.closeOrderAccountModal.bind(this)
    this.openOrderModal = this.openOrderModal.bind(this)
    this.closeOrderModal = this.closeOrderModal.bind(this)
    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.handleStatusChange = this.handleStatusChange.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.toggleOps = this.toggleOps.bind(this)
    this.clearOps = this.clearOps.bind(this)
    this.openExportConfirm = this.openExportConfirm.bind(this)
    this.closeExportConfirm = this.closeExportConfirm.bind(this)
    this.openMassDownloadConfirm= this.openMassDownloadConfirm.bind(this)
    this.closeMassDownloadConfirm = this.closeMassDownloadConfirm.bind(this)
    this.showAllVouchers = this.showAllVouchers.bind(this)
    this.hideAllVouchers = this.hideAllVouchers.bind(this)
    this.hasOpsColumn = this.hasOpsColumn.bind(this)
    this.handleStartDatesChange = this.handleStartDatesChange.bind(this)
    this.handleEndDatesChange = this.handleEndDatesChange.bind(this)
    this.handleCreateTimeChange = this.handleCreateTimeChange.bind(this)
    this.openOperLogModal = this.openOperLogModal.bind(this)
    this.hideOperLogModal = this.hideOperLogModal.bind(this)

    this.openAccountDetailUploadModal = this.openAccountDetailUploadModal.bind(this)
    this.closeAccountDetailUploadModal = this.closeAccountDetailUploadModal.bind(this)
    this.openCheckResultUploadModal = this.openCheckResultUploadModal.bind(this)
    this.closeCheckResultUploadModal = this.closeCheckResultUploadModal.bind(this)
    this.handleAccountDetailConfirm = this.handleAccountDetailConfirm.bind(this)
    this.handleCheckResultConfirm = this.handleCheckResultConfirm.bind(this)

    this.assetColumns = [
      {
        text: '平台订单号',
        name: 'order_no',
        withTitle: true,
        style: {maxWidth: (window.innerWidth<1650)?'240px':'', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '订单状态',
        name: 'order_status',
        style: {'width': '80px', textAlign: 'center'},
        renderDom: row => <FormatOrderStatus value={row.order_status}/>
      },
      {
        text: '资金方',
        name: 'fund_org_code',
        style: {'width': '80px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.fund_org_code}/>
      },
      {
        text: '资产方订单号',
        name: 'asset_order_no',
        style: {maxWidth: (window.innerWidth<1650)?'290px':'', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {text: '借款日期', name: 'borrow_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '创建时间', name: 'rx_insertTime', style: {'width': '80px', textAlign: 'center'}},
      {text: '借款人名称', name: 'borrow_name', style: {'width': '80px', textAlign: 'center'}},
      {text: '借款金额（元）', name: 'borrow_fee', style: {'width': '120px', textAlign: 'right'}},
      {
        text: '借款期限单位',
        name: 'borrow_period',
        style: {'width': '50px', textAlign: 'center'},
        renderDom: row => <FormatOrderBorrowPeriod value={row.borrow_period}/>
      },
      {text: '借款期限', name: 'borrow_deadline', style: {'width': '80px', textAlign: 'center'}},
      {
        text: '查看', style: {textAlign: 'center',width:'80px'}, renderDom: row => {
        const {_buttons} = self.props
        let hasOpsColumn = self.hasOpsColumn()
        if(hasOpsColumn){
        return (
          <div styleName="table-ops">
            <a href="javascript:" onClick={(e) => self.toggleOps(e,row)}>单据</a>
            <div styleName={(row.order_no == self.state.opsOrderNo)?'show-ops':'hidden-ops'}>
              {_buttons.includes("corp_orders_detail") && <a href="javascript:" onClick={() => self.openOrderModal(row)}>订单</a>}
              {_buttons.includes("corp_orders_advance") && <a href="javascript:" onClick={() => self.openOrderAdvanceModal(row)}>垫付</a>}
              {_buttons.includes("corp_orders_account") && <a href="javascript:" onClick={() => self.openOrderAccountModal(row)}>出账</a>}
              {_buttons.includes("corp_orders_payment") && <a href="javascript:" onClick={() => self.openOrderPaymentModal(row)}>到账</a>}
              {_buttons.includes("corp_orders_repayment") && <a href="javascript:" onClick={() => {self.openOrderRepaymentModal(row)}}>兑付</a>}
              {_buttons.includes("corp_orders_contract") && <a href="javascript:" onClick={() => {self.openOrderContractModal(row)}}>合同</a>}
              {_buttons.includes("corp_orders_service") && <a href="javascript:" onClick={() => {self.openOrderServiceModal(row)}}>服务费</a>}
              {_buttons.includes("corp_orders_voucher") && <a href="javascript:" onClick={() => {self.openOrderVoucherModal(row)}}>资料</a>}
              {_buttons.includes("corp_orders_credit") && <a href="javascript:" onClick={() => self.openOrderCreditModal(row)}>授信</a>}
              {_buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
            </div>
          </div>
        )
        } else {
          return "无权操作"
        }
      }
      }
    ]
    this.fundColumns = [
      {
        text: '平台订单号',
        name: 'order_no',
        withTitle: true,
        style: {maxWidth: (window.innerWidth<1650)?'240px':'', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '订单状态',
        name: 'order_status',
        style: {'width': '80px', textAlign: 'center'},
        renderDom: row => <FormatOrderStatus value={row.order_status}/>
      },
      {
        text: '资产方',
        name: 'asset_org_code',
        style: {'width': '80px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.asset_org_code}/>
      },
      //{text: '资金方订单号', name: 'fund_order_no',style: {width:'80px','maxWidth': '300px',overflow: 'hidden',textOverflow: 'ellipsis'}},
      {
        text: '资产方订单号',
        name: 'asset_order_no',
        style: {maxWidth: (window.innerWidth<1650)?'290px':'', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {text: '借款日期', name: 'borrow_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '创建时间', name: 'rx_insertTime', style: {'width': '80px', textAlign: 'center'}},
      {text: '借款人名称', name: 'borrow_name', style: {'width': '80px', textAlign: 'center'}},
      {text: '借款金额（元）', name: 'borrow_fee', style: {'width': '120px', textAlign: 'right'}},
      {
        text: '借款期限单位',
        name: 'borrow_period',
        style: {'width': '50px', textAlign: 'center'},
        renderDom: row => <FormatOrderBorrowPeriod value={row.borrow_period}/>
      },
      {text: '借款期限', name: 'borrow_deadline', style: {'width': '80px', textAlign: 'center'}},
      {
        text: '查看', style: {textAlign: 'center',width:'80px'}, renderDom: row => {
        const {_buttons} = self.props
        let hasOpsColumn = self.hasOpsColumn()
        if(hasOpsColumn){
          return (
            <div styleName="table-ops">
              <a href="javascript:" onClick={(e) => self.toggleOps(e,row)}>单据</a>
              <div styleName={(row.order_no == self.state.opsOrderNo)?'show-ops':'hidden-ops'}>
                {_buttons.includes("corp_orders_detail") && <a href="javascript:" onClick={() => self.openOrderModal(row)}>订单</a>}
                {_buttons.includes("corp_orders_advance") && <a href="javascript:" onClick={() => self.openOrderAdvanceModal(row)}>垫付</a>}
                {_buttons.includes("corp_orders_account") && <a href="javascript:" onClick={() => self.openOrderAccountModal(row)}>出账</a>}
                {_buttons.includes("corp_orders_payment") && <a href="javascript:" onClick={() => self.openOrderPaymentModal(row)}>到账</a>}
                {_buttons.includes("corp_orders_repayment") && <a href="javascript:" onClick={() => {self.openOrderRepaymentModal(row)}}>兑付</a>}
                {_buttons.includes("corp_orders_contract") && <a href="javascript:" onClick={() => {self.openOrderContractModal(row)}}>合同</a>}
                {_buttons.includes("corp_orders_service") && <a href="javascript:" onClick={() => {self.openOrderServiceModal(row)}}>服务费</a>}
                {_buttons.includes("corp_orders_voucher") && <a  href="javascript:" onClick={() => {self.openOrderVoucherModal(row)}}>资料</a>}
                {_buttons.includes("corp_orders_credit") && <a  href="javascript:" onClick={() => self.openOrderCreditModal(row)}>授信</a>}
                {_buttons.includes("oper_log") && <a  href="javascript:" onClick={() => self.openOperLogModal(row)}> 日志</a>}
              </div>
            </div>
          )
        } else {
          return "无权访问"
        }
      }
      }
    ]

    this.voucherColumns = [{
      text: '资料名称',
      name: 'voucher_name',
      withTitle: true,
      style: {maxWidth: "200px", overflow: 'hidden', textOverflow: 'ellipsis'}
    },{
      text: '资料下载地址',
      name: 'voucher_url',
      withTitle: true,
      style: {maxWidth: "600px", overflow: 'hidden', textOverflow: 'ellipsis'},
      renderDom: (row) => (<a href={row['voucher_url']} download target="_blank">{row['voucher_url']}</a>)
    }]

    this.contractColumns = [{
      text: '合同类型',
      name: 'contract_type',
      style: {overflow: 'hidden', textOverflow: 'ellipsis'},
      renderDom: (row) => <FormatOrderContractType value={row['contract_type']}/>
    },{
      text: '合同号',
      name: 'contract_number',
      style: {overflow: 'hidden', textOverflow: 'ellipsis'}
    },{
      text: '合同下载地址',
      name: 'contract_url',
      withTitle: true,
      style: {maxWidth: "600px", overflow: 'hidden', textOverflow: 'ellipsis'},
      renderDom: (row) => (<a href={row['contract_url']} download target="_blank">{row['contract_url']}</a>)
    }]
    this.serviceColumns = [{
      text: '兑付日',
      name: 'service_date',
      style: {overflow: 'hidden', textOverflow: 'ellipsis'},
    }, {
      text: '服务费（元）',
      name: 'service_fee',
      style: {overflow: 'hidden', textOverflow: 'ellipsis'}
    },]
    this.adminColumns = [
      {
        text: '平台订单号',
        name: 'order_no',
        withTitle: true,
        style: {maxWidth: (window.innerWidth<1650)?'200px':'', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {
        text: '订单状态',
        name: 'order_status',
        style: {'width': '80px', textAlign: 'center'},
        renderDom: row => <FormatOrderStatus value={row.order_status}/>
      },
      {
        text: '资产方',
        name: 'asset_org_code',
        style: {'width': '80px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.asset_org_code}/>
      },
      {
        text: '资金方',
        name: 'fund_org_code',
        style: {'width': '80px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.fund_org_code}/>
      },
      {
        text: '资产方订单号',
        name: 'asset_order_no',
        withTitle: true,
        style: {maxWidth: (window.innerWidth<1650)?'250px':'380px', overflow: 'hidden', textOverflow: 'ellipsis'}
      },
      {text: '借款日期', name: 'borrow_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '创建时间', name: 'rx_insertTime', style: {'width': '80px', textAlign: 'center'}},
      {text: '借款人名称', name: 'borrow_name', style: {'width': '80px', textAlign: 'center'}},
      {text: '借款金额（元）', name: 'borrow_fee', style: {'width': '120px', textAlign: 'right'}},
      {
        text: '借款期限单位',
        name: 'borrow_period',
        style: {'width': '50px', textAlign: 'center'},
        renderDom: row => <FormatOrderBorrowPeriod value={row.borrow_period}/>
      },
      {text: '借款期限', name: 'borrow_deadline', style: {'width': '80px', textAlign: 'center'}},
      {
        text: '查看', style: {textAlign: 'center','width': '80px',}, renderDom: row => {
        const {_buttons} = self.props
        let hasOpsColumn = self.hasOpsColumn()
        if(hasOpsColumn){
          return (
            <div styleName="table-ops">
              <a href="javascript:" onClick={(e) => self.toggleOps(e,row)}>单据</a>
              <div styleName={(row.order_no == self.state.opsOrderNo)?'show-ops':'hidden-ops'}>
                {_buttons.includes("corp_orders_detail") && <a href="javascript:" onClick={() => self.openOrderModal(row)}>订单</a>}
                {_buttons.includes("corp_orders_advance") && <a href="javascript:" onClick={() => self.openOrderAdvanceModal(row)}>垫付</a>}
                {_buttons.includes("corp_orders_account") && <a href="javascript:" onClick={() => self.openOrderAccountModal(row)}>出账</a>}
                {_buttons.includes("corp_orders_payment") && <a href="javascript:" onClick={() => self.openOrderPaymentModal(row)}>到账</a>}
                {_buttons.includes("corp_orders_repayment") && <a href="javascript:" onClick={() => {self.openOrderRepaymentModal(row)}}>兑付</a>}
                {_buttons.includes("corp_orders_contract") && <a href="javascript:" onClick={() => {self.openOrderContractModal(row)}}>合同</a>}
                {_buttons.includes("corp_orders_service") && <a href="javascript:" onClick={() => {self.openOrderServiceModal(row)}}>服务费</a>}
                {_buttons.includes("corp_orders_voucher") && <a href="javascript:" onClick={() => {self.openOrderVoucherModal(row)}}>资料</a>}
                {_buttons.includes("corp_orders_credit") && <a href="javascript:" onClick={() => self.openOrderCreditModal(row)}>授信</a>}
                {_buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}> 日志</a>}
              </div>
            </div>
          )
        } else {
          return "无权访问"
        }
      }
      }
    ]

    this.orderColumns = [
      {text: '平台订单号', name: 'order_no'},
      {text: '订单状态', name: 'order_status', renderDom: row => <FormatOrderStatus value={row.order_status}/>},
      {text: '业务类型', name: 'business_type', renderDom: row => <FormatEnterpriseOrderBusinessType value={row.business_type}/>},
      {text: '资产方机构号', name: 'asset_org_code'},
      {text: '资产方机构名', name: 'asset_org_code', renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      {text: '资产方订单号', name: 'asset_order_no'},
      {text: '借款日期', name: 'borrow_date'},
      {text: '借款主体类型', name: 'borrow_type', renderDom: row => <FormatOrderBorrowType value={row.borrow_type}/>},
      {text: '借款人名称', name: 'borrow_name'},
      {text: '营业执照号', name: 'borrow_business_license'},
      {text: '借款支付方式', name: 'borrow_pay_mode', renderDom: row => <FormatOrderBorrowPayMode value={row.borrow_pay_mode}/>},
      {text: '借款用途', name: 'borrow_purpose'},
      {text: '借款金额（元）', name: 'borrow_fee'},
      {text: '借款期限单位', name: 'borrow_period', renderDom: row => <FormatOrderBorrowPeriod value={row.borrow_period}/>},
      {text: '借款期限', name: 'borrow_deadline'},
      {text: '收款账号名称', name: 'gathering_name'},
      {text: '收款账户开户行', name: 'gathering_bank'},
      {text: '收款账户号', name: 'gathering_card_no'},
      {text: '资金方机构号', name: 'fund_org_code'},
      {text: '资金方机构名', name: 'fund_org_code', renderDom: row => <FormatOrgCode value={row.fund_org_code}/>},
      {text: '资金方订单号', name: 'fund_order_no'},
      {text: '拒绝类型', name: 'refuse_type', renderDom: row => <FormatOrderRefuseType value={row.refuse_type}/>},
      {text: '拒绝原因', name: 'refuse_reason'},
      {text: '还款方式', name: 'repayment_mode', renderDom: row => <FormatOrderRepaymentMode value={row.repayment_mode}/>},
      {text: '数据来源', name: 'data_from', renderDom: row => <FormatOrderDataFrom value={row.data_from}/>},
    ]

    this.repaymentColumns = [
      {text: '平台订单号', name: 'order_no'},
      {text: '兑付日', name: 'repayment_date'},
      {text: '兑付账户', name: 'repayment_card_no'},
      {text: '兑付开户行', name: 'repayment_bank'},
      {text: '兑付户名', name: 'repayment_name'},
      {text: '兑付本金（元）', name: 'repayment_original_fee'},
      {text: '兑付利息（元）', name: 'repayment_interest_fee'},
      {text: '兑付到期日', name: 'repayment_end_date'},
    ]
    this.paymentColumns = [
      {text: '平台订单号', name: 'order_no'},
      {text: '到账日期', name: 'payment_date'},
      {text: '到账金额（元）', name: 'payment_fee'},
      {text: '支付渠道', name: 'payment_channel'},
      {text: '交易流水号', name: 'payment_serial_no'}
    ]
    this.advanceColumns = [
      {text: '平台订单号', name: 'order_no'},
      {text: '垫资日期', name: 'advance_date'},
      {text: '垫资金额（元）', name: 'advance_fee'},
      {text: '垫款渠道', name: 'advance_channel'},
      {text: '垫款流水号', name: 'advance_serial_no'}
    ]
    this.accountColumns = [
      {text: '平台订单号', name: 'order_no'},
      {text: '资金方机构号', name: 'fund_org_code'},
      {text: '资金方机构名', name: 'fund_org_name', renderDom: row => <FormatOrgCode value={row.fund_org_code}/>},
      {text: '资金方订单号', name: 'fund_order_no'},
      {text: '产品利率', name: 'product_rate'},
      {text: '出账金额（元）', name: 'account_fee'},
      {text: '出账日期', name: 'account_date'},
      {text: '收款人户名', name: 'real_gathering_name'},
      {text: '收款账户开户行', name: 'real_gathering_bank'},
      {text: '收款账户号', name: 'real_gathering_card_no'},
      /*{text: '银行贷款合同号', name: 'bank_loan_contract_no', renderDom: ()=>this.props.corpOrders.orders.bank_loan_contract_no},
      {text: '支付凭证地址', name: 'payment_certificate_url', renderDom: ()=>this.props.corpOrders.orderPayment.payment_certificate_url},*/
      {text: '银行贷款合同号', name: 'bank_loan_contract_no', renderDom: ()=>{
          let selected = self.props.corpOrders.orders.rows.find(r=>r.order_no == this.state.orderAccountNo);
          return selected && selected.bank_loan_contract_no || ''
        }},
      {text: '支付凭证地址', name: 'payment_certificate_url', renderDom: ()=>{
          let selected = self.props.corpOrders.orderPayment.rows.find(r=>r.order_no == this.state.orderAccountNo);
          return selected&&selected.payment_certificate_url || ''
        }},
      /*{text: '兑付账户', name: 'repayment_card_no'},
      {text: '兑付开户行', name: 'repayment_bank'},
      {text: '兑付户名', name: 'repayment_name'}*/
    ]
    this.creditColumns = [{
      text: '机构',
      name: 'credit_org',
      style: {maxWidth: "120px", overflow: 'hidden', textOverflow: 'ellipsis'},
      renderDom: (row) => <FormatOrderCreditOrg value={row['credit_org']}/>
    }, {
      text: '授信结果',
      name: 'credit_result',
      style: {overflow: 'hidden', textOverflow: 'ellipsis'},
    }]
    this.searchBarItems = [
      {
        label: "订单状态:",
        type:"custom",
        dom: <OrderStatusSelector onChange={this.handleStatusChange} multiple={true}/>
      },
      {
        label: "订单号:",
        type:"group",
        props:{
          items:[
            {
              label: "借款时间",
              type:"daterange",
              props:{
                showClearDate:true,
                onDatesChange:self.handleDatesChange,
                output:"date",
                style: {width: "100%"},
                ref:(input) => {this.borrowTimePicker = input},
              },
              resetState: ()=>{
                if(this.borrowTimePicker){
                  this.borrowTimePicker.resetState()
                }
              }
            },
            {
              label: "创建时间",
              type:"daterange",
              props:{
                onDatesChange:self.handleCreateTimeChange,
                showClearDate:true,
                output:"date",
                style: {width: "100%"},
                ref:(input) => {this.createTimePicker = input},
              },
              resetState: ()=>{
                if(this.createTimePicker){
                  this.createTimePicker.resetState()
                }
              }
            },
          ]
        }
      },
      {
        label: "订单号:",
        type:"group",
        props:{
          items:[
            {
              label: "平台订单号",
              type:"text",
              props:{
                ref:(input) => {this.platformCodeInput = input},
              },
              resetState: ()=>{
                if(this.platformCodeInput){
                  this.platformCodeInput.value = ""
                }
              }
            },
            {
              label: "资产订单号",
              type:"text",
              props:{
                ref:(input) => {this.assetCodeInput = input}
              },
              resetState: ()=>{
                if(this.assetCodeInput){
                  this.assetCodeInput.value = ""
                }
              }
            }
          ]
        }
      },
    ]

    if(user_type === 1){
      this.searchBarItems = [
        {
          label: "资金方:",
          type:"custom",
          dom: <FundRelatedUserFromSelector onChange={this.handleFundOrgChange} assetOrgCode={session.org_code} userFrom="1"/>
        },...this.searchBarItems
      ]
    } else if (user_type === 2){
      this.searchBarItems = [
        {
          label: "资产方:",
          type:"custom",
          dom: <AssetRelatedUserFromSelector onChange={this.handleAssetOrgChange} fundOrgCode={session.org_code} userFrom="1"/>
        },...this.searchBarItems
      ]
    } else if ((user_type === 3) || (user_type === 4)){
      this.searchBarItems = [
        {
          label: "资产方:",
          type:"custom",
          dom: <AssetUserFromSelector onChange={this.handleAssetOrgChange} userFrom="1"/>
        },
        {
          label: "资金方:",
          type:"custom",
          dom: <FundUserFromSelector onChange={this.handleFundOrgChange} userFrom="1"/>
        },...this.searchBarItems
      ]
    }
  }

  componentWillMount(){
    window.addEventListener("click", this.clearOps)
  }
  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }
  clearOps() {
    if(this.state.opsOrderNo){
      this.setState({...this.state, opsOrderNo: undefined})
    }
  }

 /* getOrderStatus() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_enterprise_order')).filter(r => (r.col_name == "order_status"))
  }

  getFundOrganizations() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")).filter(r => r.para_key.startsWith("F"))
  }

  getAssetOrganizations() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")).filter(r => r.para_key.startsWith("A"))
  }*/

  /*renderOrderStatus() {
    var status = this.getOrderStatus()
    return (
      <Select onChange={this.handleStatusChange} multiple={true} options={status.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>
    )
  }*/

  /*renderFundOrganizations() {
    const {type,_session} = this.props
    let options, disabled = false, noEmpty = false
    var funds = this.getFundOrganizations()
    if(type !== 2){
      options = funds.map((r, i) => ({label: r.para_value, value: r.para_key}))
    } else {
      options = funds.filter(r=>r.para_key==_session.org_code).map((r, i) => ({label: r.para_value, value: r.para_key}))
      disabled = true
      noEmpty = true
    }
    return (
      <Select onChange={this.handleFundOrgChange} options={options} disabled={disabled} noEmpty={noEmpty}/>
    )
  }*/

  /*renderAssetOrganizations() {
    const {type,_session} = this.props
    let options, disabled = false, noEmpty = false
    var asset = this.getAssetOrganizations()
    if(type !== 1){
      options = asset.map((r, i) => ({label: r.para_value, value: r.para_key}))
    } else {
      options = asset.filter(r=>r.para_key==_session.org_code).map((r, i) => ({label: r.para_value, value: r.para_key}))
      disabled = true
      noEmpty = true
    }
    return (
      <Select onChange={this.handleAssetOrgChange} options={options} disabled={disabled} noEmpty={noEmpty}/>
    )
  }*/

  handleSearch(index) {
    let myIndex = ((this.platformCodeInput && this.platformCodeInput.value) || (this.assetCodeInput && this.assetCodeInput.value) || typeof index == 'undefined') ? 1: index
    this.setState({index: myIndex, opsOrderNo:''})
    return this.props.searcher({
      pageIndex: myIndex,
      orderNo: this.platformCodeInput && this.platformCodeInput.value,
      assetOrderNo: this.assetCodeInput && this.assetCodeInput.value,
      createTimeStart: this.state.startCreateTime && this.state.startCreateTime.format('YYYY-MM-DD 00:00:00'),
      createTimeEnd: this.state.endCreateTime && this.state.endCreateTime.format('YYYY-MM-DD 23:59:59'),
      borrowDateStart: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00'),
      borrowDateEnd: this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59'),
      orderStatus: this.state.status,
      assetOrgCode: this.state.assetOrgCode,
      fundOrgCode: this.state.fundOrgCode
    })
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  handleExport() {
    var {messageSetter} = this.props
    this.handleSearch().promise.then(({response})=>{
      if(response.success){
        if(response.total <= window.EDI_CLIENT.exportMaxRows){
          var browserType = getBrowserType(),
            queryString = `/corpOrder/export?orderNo=${this.platformCodeInput && this.platformCodeInput.value || ""}&assetOrderNo=${this.assetCodeInput && this.assetCodeInput.value || ''}&fundOrgCode=${this.state.fundOrgCode}&assetOrgCode=${this.state.assetOrgCode}&borrowDateStart=${this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00') || ''}&borrowDateEnd=${this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59') || ''}&createTimeStart=${this.state.startCreateTime && this.state.startCreateTime.format('YYYY-MM-DD 00:00:00') || ''}&createTimeEnd=${this.state.endCreateTime && this.state.endCreateTime.format('YYYY-MM-DD 23:59:59') || ''}&orderStatus=${this.state.status.join(",")}`
          messageSetter("导出即将开始","INFO")

          setTimeout(()=>{
            if (browserType == "Chrome") {
              this.hiddenLink.href = queryString
              this.hiddenLink.click()
            } else if (browserType == 'Safari') {
              window.location.href = queryString
            } else if (browserType == 'Firefox') {
              window.location.href = queryString
            } else {
              window.open(queryString, '_blank')
            }
          },2000)
        } else {
          messageSetter(`系统目前仅支持${window.EDI_CLIENT.exportMaxRows/10000}万条以内的导出，推荐按天导出`,"WARN")
        }
      }
    })
  }

  handleDatesChange({startDate, endDate}) {
    this.setState({startDate, endDate}, () => {
      this.handleSearch()
    })
  }
  handleStartDatesChange(date) {
    this.setState({startDate:date}, this.handleSearch)
  }
  handleEndDatesChange(date) {
    this.setState({endDate:date}, this.handleSearch)
  }
  handleCreateTimeChange({startDate, endDate}) {
    this.setState({startCreateTime: startDate, endCreateTime: endDate}, this.handleSearch)
  }
  handleStatusChange(rows) {
    this.setState({status:rows.map(r=>r.value),index:1}, this.handleSearch)
  }

  handleAssetOrgChange(row) {
    this.setState({assetOrgCode:row.value,index:1}, this.handleSearch)
  }

  handleFundOrgChange(row) {
    this.setState({fundOrgCode:row.value,index:1}, this.handleSearch)
  }

  componentDidMount() {
    this.handleSearch()
  }

  /*renderRepaymentModal(){
   const {orderRepayment} = this.props
   return (
   <OrderRepaymentModal rows={orderRepayment}/>
   )
   }*/

  openOrderRepaymentModal(row) {
    //this.state.orderRepaymentNo = row.order_no
    //this.setState(Object.assign({}, this.state, {orderRepaymentNo: row.order_no}))
    this.props.orderRepaymentSearcher({orderNo: row.order_no})
  }

  closeOrderRepaymentModal() {
    //this.setState(Object.assign({}, this.state, {orderRepaymentNo: ''}))
    this.props.resetOrderRepayment()
  }
  openOrderContractModal(row) {
    this.props.orderContractSearcher({orderNo: row.order_no})
  }

  closeOrderContractModal() {
    this.props.resetOrderContract()
  }

  openOrderServiceModal = (row) =>{
    this.props.orderServiceSearcher({orderNo: row.order_no})
  }

  closeOrderServiceModal = () => {
    this.props.resetOrderService()
  }

  openOrderVoucherModal(row) {
    this.props.orderVoucherSearcher({orderNo: row.order_no})
  }

  closeOrderVoucherModal() {
    this.props.resetOrderVoucher()
  }

  openOrderPaymentModal(row) {
    //this.state.orderRepaymentNo = row.order_no
    this.props.orderPaymentSearcher({orderNo: row.order_no})
    //this.setState(Object.assign({}, this.state, {orderPaymentNo: row.order_no}))
  }

  closeOrderPaymentModal() {
    this.props.resetOrderPayment()
  }

  openOrderAdvanceModal(row) {
    this.props.orderAdvanceSearcher({orderNo: row.order_no})
  }

  closeOrderAdvanceModal() {
    this.props.resetOrderAdvance()
  }

  openOrderAccountModal(row) {
    //this.props.orderAccountSearcher({orderNo: row.order_no})
    this.handleOrderAccountSearch(row)
  }

  closeOrderAccountModal() {
    //this.props.resetOrderAccount()
    this.setState({orderAccountNo: ''},()=>{
      this.props.resetOrderAccount();
      this.props.resetOrderPayment()
    })
  }

  openOrderModal(row) {
    //this.state.orderRepaymentNo = row.order_no
    this.setState(Object.assign({}, this.state, {orderNo: row.order_no, order: row}))
  }

  closeOrderModal() {
    this.setState(Object.assign({}, this.state, {orderNo: '', order: undefined}))
  }
  openOrderCreditModal=(row) => {
    this.props.orderCreditSearcher({orderNo: row.order_no})
  }
  closeOrderCreditModal=() =>{
    this.props.resetOrderCredit()
  }
  hasOpsColumn(){
    let {_buttons} = this.props
    return Array.isArray(_buttons) && (_buttons.includes("corp_orders_detail") || _buttons.includes("corp_orders_advance")
      || _buttons.includes("corp_orders_account") || _buttons.includes("corp_orders_payment") || _buttons.includes("corp_orders_repayment")
      || _buttons.includes("corp_orders_contract") || _buttons.includes("corp_orders_voucher"))
  }
  toggleOps(e,row){
    e.preventDefault();
    e.stopPropagation();
    if(this.state.opsOrderNo == row.order_no){
      this.setState({...this.state, opsOrderNo: undefined})
    } else {
      this.setState({...this.state, opsOrderNo: row.order_no})
    }
  }
  openMassDownloadConfirm(){
    this.setState({confirmMassDownload: true})
  }
  closeMassDownloadConfirm(){
    this.setState({confirmMassDownload: false})
  }
  openExportConfirm(){
    this.setState({confirmExport: true})
  }
  closeExportConfirm(){
    this.setState({confirmExport: false})
  }
  showAllVouchers() {
    this.setState({showAllVoucher: true})
    this.props.filterOrderVoucherSearcher({
      orderNo: this.platformCodeInput && this.platformCodeInput.value,
      assetOrderNo: this.assetCodeInput && this.assetCodeInput.value,
      borrowDateStart: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00'),
      borrowDateEnd: this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59'),
      createTimeStart: this.state.startCreateTime && this.state.startCreateTime.format('YYYY-MM-DD 00:00:00'),
      createTimeEnd: this.state.endCreateTime && this.state.endCreateTime.format('YYYY-MM-DD 23:59:59'),
      deadline_from: this.state.deadline_from,
      deadline_to: this.state.deadline_to,
      orderStatus: this.state.status,
      assetOrgCode: this.state.assetOrgCode,
      fundOrgCode: this.state.fundOrgCode
    })
  }
  hideAllVouchers() {
    this.setState({showAllVoucher: false})
    this.props.resetFilteredOrderVoucher()
  }

  openOperLogModal(row) {
    this.setState({
      operLogModalKey: row.order_no,
      showOperLogModal: true
    })
  }

  hideOperLogModal() {
    this.setState({
      showOperLogModal: false
    })
  }

  openAccountDetailUploadModal(){
    this.props.resetOrderUploadDetail()
    this.setState({showAccountDetailUploadModal: true})
  }
  closeAccountDetailUploadModal(){
    this.handleSearch()
    this.setState({showAccountDetailUploadModal: false})
  }
  openCheckResultUploadModal(){
    this.props.resetOrderUploadDetail()
    this.setState({showCheckResultUploadModal: true})
  }
  closeCheckResultUploadModal(){
    this.handleSearch()
    this.setState({showCheckResultUploadModal: false})
  }
  openContractSupplymentModal = () =>{
    this.props.resetOrderUploadDetail()
    this.setState({showContractSupplymentModal: true})
  }
  closeContractSupplymentModal = () =>{
    this.handleSearch()
    this.setState({showContractSupplymentModal: false})
  }
  handleAccountDetailConfirm(){
    const {accountDetailCreator} = this.props
    let promise = accountDetailCreator.apply(this, arguments).promise
    /*promise.then(({response})=>{
      if(response && response.success && !response.unmatched){
        this.handleSearch()
        this.closeAccountDetailUploadModal()
      }
    })*/
    return promise
  }
  handleCheckResultConfirm(){
    const {checkResultCreator} = this.props
    let promise = checkResultCreator.apply(this, arguments).promise
    /*promise.then(({response})=>{
      if(response && response.success && !response.unmatched){
        this.handleSearch()
        this.closeCheckResultUploadModal()
      }
    })*/
    return promise
  }

  handleContractSupplymentConfirm = (...arge) =>{
    const {contractSupplymentCreator} = this.props
    const promise = contractSupplymentCreator(...arge).promise;
    /*promise.then(({response})=>{
      if(response && response.success && !response.unmatched){
        this.handleSearch()
        this.closeContractSupplymentModal()
      }
    })*/
    return promise
  }
  handleOrderAccountSearch = (row)=>{
    const {orderPaymentSearcher, orderAccountSearcher} = this.props
    let param = {order_no:row.order_no}
    this.setState({orderAccountNo: row.order_no},()=>{
      orderPaymentSearcher(param).promise.then(()=>orderAccountSearcher(param))
    })
  }

  render() {
    const {corpOrders, navigateTo, type, orderRepaymentSearcher, orderPaymentSearcher, orderAdvanceSearcher, orderAccountSearcher, _buttons, checkResultMatcher, accountDetailMatcher, contractType, contractSupplymentMatcher } = this.props
    const {orders, orderRepayment, orderPayment, orderAdvance, orderAccount,fee,orderCredit} = corpOrders
    var column = ((type == 3) || (type == 4)) ? this.adminColumns : ((type == 2) ? this.fundColumns : this.assetColumns)
    const self = this
    const {showAllVoucher, confirmExport, confirmMassDownload, fundOrgCode, assetOrgCode,showCheckResultUploadModal, showAccountDetailUploadModal,orderAccountNo, showContractSupplymentModal} = this.state
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <div className="pull-left"  style={{width: '100px'}}>
            <button type="submit" className="btn icon-btn btn-primary" style={{marginLeft: 0, width: '100px'}}>
              <i className="fa fa-search"></i><span className="text">搜 索</span>
            </button>
            {(type === 2) && _buttons.includes("corp_orders_contract_supplement") &&
          <button type="button" className="btn icon-btn btn-warning pull-right" onClick={this.openContractSupplymentModal}style={{marginLeft: 0, width: '100px'}}>
            <i className="fa fa-plus-circle"></i><span className="text">合同补充</span>
          </button>}
          </div>
          {(type == 2) && _buttons.includes("corp_orders_check_result_upload") &&
          <button type="button" className="btn icon-btn btn-warning pull-right" onClick={this.openCheckResultUploadModal}>
            <i className="fa fa-upload"></i>上传审核结果
          </button>}
          {_buttons.includes("corp_orders_export") && <button type="button" className="btn icon-btn btn-danger pull-right" onClick={this.openExportConfirm}>
            <i className="fa fa-download"></i>订单导出
          </button>}
          {(type != 2) && Array.isArray(_buttons) && _buttons.includes("corp_orders_create") && <button type="button" className="btn icon-btn btn-success pull-right" onClick={()=>{navigateTo("createCorpAssetOrder")}}>
            <i className="fa fa-plus"></i>订单创建
          </button>}
          {(type == 2) && _buttons.includes("corp_orders_account_detail_upload") &&
          <button type="button" className="btn icon-btn btn-success pull-right" onClick={this.openAccountDetailUploadModal}>
            <i className="fa fa-cloud-upload"></i>上传出账明细
          </button>}
          {_buttons.includes("corp_orders_voucher_download") && <button type="button" className="btn icon-btn btn-danger pull-right" onClick={this.openMassDownloadConfirm}>
            <i className="fa fa-files-o"></i>资料下载
          </button>}
          {(type != 2) && Array.isArray(_buttons) && _buttons.includes("corp_orders_voucher_supplement") && <button type="button" className="btn icon-btn btn-warning pull-right" onClick={()=>{navigateTo("supplementCorpAssetOrder")}}>
            <i className="fa fa-plus-circle"></i>资料补充
          </button>}
        </SearchBar>
        {/*<form className={`${style["order-table-infos"]} clearfix`} onSubmit={this.onSearch}>
          <div className={`clearfix ${style["wrapper-row"]}`}>
            <div className={`row pull-left ${style["left"]}`}>
              <div className="col-sm-6">
                <div className="form-group row">
                  <label className="col-sm-5">
                    <span>资产方:</span>
                  </label>
                  <div className="col-sm-7">
                    <AssetRelatedSelector onChange={this.handleAssetOrgChange} fundOrgCode={(type === 2) ? fundOrgCode:""}/>
                  </div>
                </div>

                <div className="form-group row">
                  <label className="col-sm-5">
                    <span>资金方:</span>
                  </label>
                  <div className="col-sm-7">
                    <FundRelatedSelector onChange={this.handleFundOrgChange} assetOrgCode={(type === 1) ?assetOrgCode:""}/>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group row">
                  <label className="col-sm-5">
                    <span>平台订单号:</span>
                  </label>
                  <div className="col-sm-7">
                    <input type="search" placeholder="" defaultValue="" ref={(input) => {
                      this.platformCodeInput = input;
                    }}/>
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-5">
                    <span>资产方订单号:</span>
                  </label>
                  <div className="col-sm-7">
                    <input type="search" placeholder="" defaultValue="" ref={(input) => {
                      this.assetCodeInput = input;
                    }}/>
                  </div>
                </div>
              </div>
            </div>
            <div className={`pull-left row ${style["right"]}`}>
              <div className="form-group row">
                <label className="col-sm-3">
                  <span>订单状态:</span>
                </label>
                <div className="col-sm-8">
                  <OrderStatusSelector onChange={this.handleStatusChange} multiple={true} />
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-3">
                  <span>借款日期:</span>
                </label>
                <div className="col-sm-8">
                  <DatePicker onDatesChange={this.handleDatesChange}/>
                </div>
              </div>
            </div>
            <div className={`pull-left row ${style["btn-right"]}`}>
              <div className="form-group row">
                <div className="col-sm-12">

                </div>
              </div>
              <div className="form-group row">
                <div className="col-sm-12">

                </div>
              </div>
            </div>
          </div>
          <a download="true" className="hidden" target="_blank" ref={(link) => {
            this.hiddenLink = link
          }}/>
        </form>*/}

        <a download="true" className="hidden" target="_blank" ref={(link) => {
          this.hiddenLink = link
        }}/>

        <div className="wrapper">
          <Datatable columns={column} rows={orders.rows} index={this.state.index} searcher={this.handleSearch}
                     total={orders.total}/>
          {orders.rows.length > 0 && <div className={style["summa"]}>
            <p>共<span>{orders.total}条</span>记录；金额总计<span>{fee}</span>元</p>
          </div>}
        </div>
        {(orderRepayment.rows.length > 0) &&
        <Modal data={orderRepayment.rows} title="兑付单明细一览" columns={this.repaymentColumns}
               orderNo={this.state.orderRepaymentNo} searcher={orderRepaymentSearcher}
               closer={this.closeOrderRepaymentModal}/>}
        {(orderPayment.rows.length > 0) && !orderAccountNo &&
        <Modal data={orderPayment.rows} title="到账明细一览" columns={this.paymentColumns} orderNo={this.state.orderPaymentNo}
               searcher={orderPaymentSearcher} closer={this.closeOrderPaymentModal}/>}
        {(orderAdvance.rows.length > 0) &&
        <Modal data={orderAdvance.rows} title="垫付明细一览" columns={this.advanceColumns} orderNo={this.state.orderAdvanceNo}
               searcher={orderAdvanceSearcher} closer={this.closeOrderAdvanceModal}/>}
        {(orderAccount.rows.length > 0) &&
        <Modal data={orderAccount.rows} title="出账明细一览" columns={this.accountColumns} orderNo={this.state.orderAccountNo}
               searcher={this.handleOrderAccountSearch} closer={this.closeOrderAccountModal}/>}
        {(orderCredit.length > 0) &&
          <TableMode columns={this.creditColumns} data={orderCredit} title="订单授信信息集合"closer={this.closeOrderCreditModal}/>}
        {this.state.orderNo &&
        <Modal data={[this.state.order]} title="平台订单明细一览" columns={this.orderColumns} closer={this.closeOrderModal}/>}
        {corpOrders.contractList && corpOrders.contractList.length > 0 && <TableMode columns={this.contractColumns} data={corpOrders.contractList} title="合同一览" closer={this.closeOrderContractModal} />}
        {corpOrders.serviceList && corpOrders.serviceList.length > 0 && <TableMode columns={this.serviceColumns} data={corpOrders.serviceList} title="服务费一览" closer={this.closeOrderServiceModal} />}
        {corpOrders.voucherList && corpOrders.voucherList.length > 0 && <TableMode columns={this.voucherColumns} data={corpOrders.voucherList} title="资料一览" closer={this.closeOrderVoucherModal} />}
        {showAllVoucher && corpOrders.allVouchers && corpOrders.allVouchers.length > 0 && <VoucherTableMode columns={this.voucherColumns} data={corpOrders.allVouchers} title="企业订单搜索结果所含资料一览" closer={this.hideAllVouchers} />}
        {confirmExport && <Dialog confirm={(e)=>{
          self.handleExport(e)
          self.closeExportConfirm()
        }} title="请确认" closer={this.closeExportConfirm} size="modal-md">
          超大量导出订单会存在失败的可能或下载速度慢，建议减少单次下载量<br />
          系统目前仅支持{window.EDI_CLIENT.exportMaxRows/10000}万条以内的导出，如有更多数据需要导出，请另行联系我们<br />
          您确定要对{orders.total}条订单数据做导出操作么?
        </Dialog>}
        {confirmMassDownload && <Dialog confirm={(e)=>{
          self.showAllVouchers(e)
          self.closeMassDownloadConfirm()
        }} title="请确认" closer={this.closeMassDownloadConfirm} size="modal-md">
          超大量数据检索会存在失败的可能或速度慢<br />
          您确定要对{orders.total}条订单数据逐条检索查询出所有资料么?
        </Dialog>}
        { this.state.showOperLogModal &&
        <OperLogModal  tableName={'t_enterprise_order'} tableKey={this.state.operLogModalKey} title="企业订单日志"
                       closer={ this.hideOperLogModal } /> }
        {showCheckResultUploadModal && <CheckResultUploadModal detail={corpOrders.detail} matcher={checkResultMatcher} closer={this.closeCheckResultUploadModal} confirm={this.handleCheckResultConfirm} working={corpOrders.working} title="上传审核结果"/>}
        {showAccountDetailUploadModal && <AccountDetailUploadModal detail={corpOrders.detail} matcher={accountDetailMatcher} closer={this.closeAccountDetailUploadModal} confirm={this.handleAccountDetailConfirm} working={corpOrders.working} title="上传出账明细"/>}
        {showContractSupplymentModal && <ContractSupplymentModal detail={corpOrders.detail} matcher={contractSupplymentMatcher} closer={this.closeContractSupplymentModal} confirm={this.handleContractSupplymentConfirm} working={corpOrders.working} contractType={contractType} title="合同补充"/>}
      </div>
    )
  }
}
