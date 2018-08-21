/* eslint-disable no-undef */

import React, {Component} from 'react'
import Dialog from '../Dialog'
import Modal from '../Modal'
import OperLogModal from '../OperLogModal'
import Datatable from '../Datatable'
import AssetUserFromSelector from '../Select/AssetUserFromSelectorPage'
import AssetRelatedUserFromSelector from '../Select/AssetRelatedUserFromSelectorPage'
import AfterRepaymentOrderStatusSelector from '../Select/AfterRepaymentOrderStatusSelectorPage'
import {
  FormatAfterRepaymentOrderStatus,
  FormatOrgCode,
} from '../Formatter'
import SearchBar from '../Common/SearchBar'
import AfterRepaymentOrderModal from './afterRepaymentOrderModal'
import VoucherDialog from '../Dialog/VoucherDialog'

export default class AfterRepaymentOrder extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._SESSION, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      index: 1,
      afterRepaymentStatus: "",
      _row: null,
      afterRepaymentStartDate:'',
      afterRepaymentEndDate:'',
      assetOrgCode: (user_type === 1) ? session.org_code : '',
      fundOrgCode: (user_type === 2) ? session.org_code : '',

      showRepaymentModal: false,
      showDetailModal: false,
      showOperLogModal: false,
      detail: null
    }

    this.columns = [
      {
        text: '贷后订单号',
        name: 'after_repayment_order_no',
      },
      {
        text: '贷款总笔数',
        name: 'total_number_of_repayments',
        style: {width: '160px', textAlign: 'center'},
      },
      {
        text: '待还总金额（元）',
        name: 'remaining_total_fee',
        style: {width: '200px', textAlign: 'right'},
      },
      {
        text: '实收总金额（元）',
        name: 'paid_up_total_fee',
        style: {width: '200px', textAlign: 'right'},
      },
      {
        text: '订单状态',
        name: 'order_status',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => (<FormatAfterRepaymentOrderStatus value={row.order_status}/>)
      },
      {
        text: '操作',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => this.renderOperDom(row)
      },
      {
        text: '查看', style: {textAlign: 'center', width: '80px'}, renderDom: row => {
          return (<a href="javascript:" key={'oper1'} onClick={(e) => self.showOperLogModal(row)}> 操作记录 </a>)
        }
      },
      {
        text: '附件',
        name: 'detail_file_url',
        style: {width: '80px', textAlign: 'center'},
        renderDom: row => <a href={row.detail_file_url} >附件</a>
      },
      {
        text: '备注',
        name: 'remark',
        withTitle: true,
        style: {maxWidth: '80px', textAlign: 'center', overflow: 'hidden'}
      }
    ]

    this.searchBarItems = [
      {
        label: "贷后订单号:",
        type:"text",
        props:{
          ref:(input) => {this.afterRepaymentOrderInput = input}
        }
      },
      {
        label: "状态:",
        type:"custom",
        dom: <AfterRepaymentOrderStatusSelector onChange={this.handleTheAfterRepaymentOrderStatusChange}/>
      },
    ]

    if(user_type !== 1) {
      const index = this.columns.findIndex(item => item.text === '操作')
      if (index >= 0) {
        this.columns = [...this.columns.slice(0, index), ...this.columns.slice(index+1)]
      }

      this.columns.splice(1,0,{
        text: '资产方',
        name: 'asset_org_code',
        style: {width: '160px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.asset_org_code}/>
      })

      if(user_type === 2){
        this.searchBarItems.push({
          label: "资产方:",
          type:"custom",
          dom: <AssetRelatedUserFromSelector onChange={this.handleAssetRelatedUserFromSelectorChange} userFrom="1" fundOrgCode={session.org_code}/>
        })
      } else {
        this.searchBarItems.push({
          label: "资产方:",
          type:"custom",
          dom: <AssetUserFromSelector onChange={this.handleAssetRelatedUserFromSelectorChange} userFrom="1"/>
        })
      }
    }

    this.toggleOps = (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const {_row} = this.state
      if (_row && _row.after_repayment_order_no === row.after_repayment_order_no) {
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
      if (row.order_status === '002' || row.order_status === '100') {
        return null
      } else {
        return (<div styleName="table-ops">
            {[
              <a href="javascript:" className={`inner-link ${this.props._buttons.includes('after_repayment_order_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('002', '确认', row)} key="002">确认</a>,
              <a href="javascript:" className={`inner-link ${this.props._buttons.includes('after_repayment_order_oper') ? '': 'disabled'}`} onClick={() => this.actionDialog('100', '取消', row)} key="100">废弃</a>
            ]}
        </div>)
      }
    }

    this.actionDialog = (targetStatus, actionName, _row) => {
      if (_row) {
        let confirmDialog = <Dialog confirm={()=>this.handleTheAfterRepaymentOrderStatus(targetStatus, actionName, _row)} closer={() => this.setState({confirmDialog: null})} title={'操作确认'} style={{width: '500px'}}><p>该对贷后订单的当前状态为<strong> {<FormatAfterRepaymentOrderStatus value={_row.order_status}/>} </strong>, 是否要<strong> {actionName} ？</strong></p></Dialog>
        this.setState({confirmDialog, _row: {..._row}})
      }
    }

    this.handleTheAfterRepaymentOrderStatus = (targetStatus, actionName, _row) => {
      this.setState({confirmDialog: null})
      this.props.changeStatus({
        order_no: _row.after_repayment_order_no,
        order_status: targetStatus,
      }).promise.then(({response:data})=> {
        if(data && data.success){
          this.handleSearch(this.state.index)
        }
      })
    }

    this.handleAfterRepaymentOrderConfirm=(formData, opt)=>{
      const {creator} = this.props
      let promise = creator(formData,opt).promise
      promise.then(({response})=>{
        if(response && response.success){
          this.handleSearch()
          this.closeAfterRepaymentOrderModal()
        }
      })
      return promise
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

  handleAssetRelatedUserFromSelectorChange=(row)=>{
    this.setState({assetOrgCode: row.value, index: 1}, this.handleSearch)
  }

  handleTheAfterRepaymentOrderStatusChange=(row)=>{
    this.setState({afterRepaymentOrderStatus: row.value, index: 1}, this.handleSearch)
  }
  handleSearch=(i)=>{
    const {index,assetOrgCode,afterRepaymentOrderStatus} = this.state
    const {searcher} = this.props
    var myIndex = (typeof i == "number")? i : 1;
    this.state.index = myIndex
    searcher({
      pageIndex: myIndex,
      afterRepaymentOrderNo: this.afterRepaymentOrderInput.value,
      assetOrgCode,
      afterRepaymentOrderStatus,
    })
  }
  onSearch=(e)=>{
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }
  showAfterRepaymentOrderModal=()=>{
    this.setState({showAfterRepaymentOrderModal: true})
  }
  closeAfterRepaymentOrderModal=()=>{
    this.props.reset()
    this.setState({showAfterRepaymentOrderModal: false})
  }
  showOperLogModal=(row)=>{
    this.setState({operLogKey: row.after_repayment_order_no, showOperLogModal: true})
  }
  closeOperLogModal=()=>{
    this.props.reset()
    this.setState({operLogKey: "", showOperLogModal: false})
  }
  render() {
    const {afterRepaymentOrder,matcher,_buttons} = this.props
    const {showAfterRepaymentOrderModal, showOperLogModal, confirmDialog, operLogKey, user_type} = this.state
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          {_buttons.includes("create_after_repayment_order") && (user_type === 1) && <button type="button" className="btn icon-btn btn-success pull-right" onClick={this.showAfterRepaymentOrderModal}>
            <i className="fa fa-plus"></i>新增贷后订单
          </button>}
          <button type="submit" className="btn icon-btn btn-primary pull-right">
            <i className="fa fa-search"></i>查询
          </button>
        </SearchBar>

        <div className="wrapper">
          <Datatable columns={this.columns} rows={afterRepaymentOrder.rows} index={this.state.index} searcher={this.handleSearch} total={afterRepaymentOrder.total}/>
        </div>
        { showAfterRepaymentOrderModal && <AfterRepaymentOrderModal matcher={matcher} afterRepaymentOrderDetail={afterRepaymentOrder.detail} closer={this.closeAfterRepaymentOrderModal} confirm={this.handleAfterRepaymentOrderConfirm} working={afterRepaymentOrder.working} title="新增还款对账单"/>}
        { showOperLogModal && <OperLogModal data={this.state.detail} fromTable={"t_after_repayment_order"} fromTableKey={operLogKey} title="贷后订单单日志" closer={ this.closeOperLogModal } /> }
        {confirmDialog && confirmDialog}
      </div>
    )
  }
}
