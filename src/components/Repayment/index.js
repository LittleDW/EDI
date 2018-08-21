/* eslint-disable no-undef */

import React, {Component} from 'react'
import Dialog from '../Dialog'
import Datatable from '../Datatable'
import DatePicker from '../DatePicker'
import FundRelatedSelector from '../Select/FundRelatedSelectorPage'
import AssetRelatedSelector from '../Select/AssetRelatedSelectorPage'
import RepaymentStatusSelector from '../Select/RepaymentStatusSelectorPage'
import {FormatRepaymentStatus, FormatOrgCode} from '../Formatter'
import SearchBar from '../Common/SearchBar'
import moment from 'moment'
import {getBrowserType} from '../../utils/etc'
import Modal from './modal'

export default class Repayment extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      assetOrgCode: (user_type === 1)? session.org_code:'',
      fundOrgCode:(user_type === 2)? session.org_code:'',
      index: 1,
      repaymentNo: "",
      status: [],
      today: moment().format("YYYY-MM-DD"),
      startDate: null,
      endDate: null,
      confirmExport: false
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.handleExport = this.handleExport.bind(this)
    this.handleStatusChange = this.handleStatusChange.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.openRepaymentModal = this.openRepaymentModal.bind(this)
    this.closeRepaymentModal = this.closeRepaymentModal.bind(this)
    this.toggleOps = this.toggleOps.bind(this)
    this.toggleViews = this.toggleViews.bind(this)
    this.clearOps = this.clearOps.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
    this.openExportConfirm = this.openExportConfirm.bind(this)
    this.closeExportConfirm = this.closeExportConfirm.bind(this)
    this.handleStartDatesChange = this.handleStartDatesChange.bind(this)
    this.handleEndDatesChange = this.handleEndDatesChange.bind(this)

    this.assetColumns = [
      {text: '资金方', name: 'fund_org_code', style: {'width': '120px'}, renderDom: row => <FormatOrgCode value={row.fund_org_code}/>},
      {text: '兑付日期', name: 'repayment_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '到期日', name: 'repayment_end_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '状态', name: 'repayment_status', style: {'width': '80px', textAlign: 'center'}, renderDom: row => <FormatRepaymentStatus value={row.repayment_status}/>},
      {text: '兑付本金（元）', name: 'repayment_original_fee', style: {'width': '160px', textAlign: 'right'}},
      {text: '兑付利息（元）', name: 'repayment_interest_fee', style: {'width': '160px', textAlign: 'right'}},
      {text: '收款账户', name: 'repayment_card_no', style: {maxWidth:(window.innerWidth<1650)?'112px':'202px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '收款开户行', name: 'repayment_bank', style: {maxWidth:(window.sVinnerWidth<1650)?'112px':'202px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '收款户名', name: 'repayment_name', style: {maxWidth:(window.innerWidth<1650)?'112px':'202px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {
        text: '操作', style: {'width': '120px', textAlign: 'center'}, renderDom: row => {
        const {_buttons} = self.props
        if(_buttons.includes("repayment_asset_confirm") || _buttons.includes("repayment_asset_commence") || _buttons.includes("repayment_detail")){
          return (
            <div styleName="table-ops">
              {(_buttons.includes("repayment_asset_confirm") || _buttons.includes("repayment_asset_commence")) && <a href="javascript:" onClick={(e) => self.toggleOps(e,row)}>操作</a>}
              {_buttons.includes("repayment_detail") && <a href="javascript:" onClick={(e) => self.toggleViews(e,row)}>查看</a>}
              <div styleName={`${((`${row.asset_org_code},${row.fund_org_code},${row.repayment_date}`) == self.state.opsRepayment)?'show-ops': 'hidden-ops'}`}>
                {_buttons.includes("repayment_asset_confirm") && <a href="javascript:" onClick={() => self.updateStatus(row, "01")}>资产方确认</a>}
                {_buttons.includes("repayment_asset_commence") &&<a href="javascript:" onClick={() => self.updateStatus(row, "02")}>资产方还款</a>}
              </div>
              {_buttons.includes("repayment_detail") && <div styleName={((`${row.asset_org_code},${row.fund_org_code},${row.repayment_date}`) == self.state.viewRepayment)?'show-ops':'hidden-ops'}>
                <a href="javascript:" onClick={() => self.openRepaymentModal(row)}>兑付单</a>
              </div>}
            </div>
          )
        } else {
          return "无权操作"
        }
      }
      }
    ]

    this.fundColumns = [
      {text: '资产方', name: 'asset_org_code', style: {'width': '120px'}, renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      {text: '兑付日期', name: 'repayment_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '到期日', name: 'repayment_end_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '状态', name: 'repayment_status', style: {'width': '80px', textAlign: 'center'}, renderDom: row => <FormatRepaymentStatus value={row.repayment_status}/>},
      {text: '兑付本金（元）', name: 'repayment_original_fee', style: {'width': '160px', textAlign: 'right'}},
      {text: '兑付利息（元）', name: 'repayment_interest_fee', style: {'width': '160px', textAlign: 'right'}},
      {text: '收款账户', name: 'repayment_card_no', style: {maxWidth:(window.innerWidth<1650)?'142px':'232px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '收款开户行', name: 'repayment_bank', style: {maxWidth:(window.innerWidth<1650)?'142px':'232px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '收款户名', name: 'repayment_name', style: {maxWidth:(window.innerWidth<1650)?'142px':'232px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {
        text: '操作', style: {'width': '120px', textAlign: 'center'}, renderDom: row => {
        const {_buttons} = self.props
        if(_buttons.includes("repayment_fund_confirm") || _buttons.includes("repayment_detail")){
          return (
            <div styleName="table-ops">
              {_buttons.includes("repayment_fund_confirm") && <a href="javascript:" onClick={(e) => self.toggleOps(e,row)}>操作</a>}
              {_buttons.includes("repayment_detail") && <a href="javascript:" onClick={(e) => self.toggleViews(e,row)}>查看</a>}
              {_buttons.includes("repayment_fund_confirm") && <div styleName={((`${row.asset_org_code},${row.fund_org_code},${row.repayment_date}`) == self.state.opsRepayment)?'show-ops': 'hidden-ops'}>
                <a href="javascript:" onClick={() => self.updateStatus(row, "03")}>资金方确认</a>
              </div>}
              {_buttons.includes("repayment_detail") && <div styleName={((`${row.asset_org_code},${row.fund_org_code},${row.repayment_date}`) == self.state.viewRepayment)?'show-ops': 'hidden-ops'}>
                <a href="javascript:" onClick={() => self.openRepaymentModal(row)}>兑付单</a>
              </div>}
            </div>
          )
        } else {
          return "无权操作"
        }
      }
      }
    ]

    this.adminColumns = [
      {text: '资金方', name: 'fund_org_code', style: {'width': '120px'}, renderDom: row => <FormatOrgCode value={row.fund_org_code}/>},
      {text: '资产方', name: 'asset_org_code', style: {'width': '120px'}, renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      {text: '兑付日期', name: 'repayment_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '到期日', name: 'repayment_end_date', style: {'width': '80px', textAlign: 'center'}},
      {text: '状态', name: 'repayment_status', style: {'width': '80px', textAlign: 'center'}, renderDom: row => <FormatRepaymentStatus value={row.repayment_status}/>},
      {text: '兑付本金（元）', name: 'repayment_original_fee', style: {'width': '160px', textAlign: 'right'}},
      {text: '兑付利息（元）', name: 'repayment_interest_fee', style: {'width': '160px', textAlign: 'right'}},
      {text: '收款账户', name: 'repayment_card_no', style: {maxWidth:(window.innerWidth<1650)?'142px':'242px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '收款开户行', name: 'repayment_bank', style: {maxWidth:(window.innerWidth<1650)?'142px':'242px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {text: '收款户名', name: 'repayment_name', style: {maxWidth:(window.innerWidth<1650)?'142px':'242px',overflow: 'hidden', textOverflow: 'ellipsis'}},
      {
        text: '查看', style: {'width': '80px', textAlign: 'center'}, renderDom: row => {
        const {_buttons} = self.props
        if(_buttons.includes("repayment_detail")){
          return (
            <div>
              <a href="javascript:" onClick={() => self.openRepaymentModal(row)}>兑付单</a>
            </div>
          )
        } else {
          return "无权操作"
        }
      }
      }
    ]

    this.repaymentColumns = [
      {text: '资产方机构名', name: 'asset_org_code', renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      {text: '资金方机构名', name: 'fund_org_code', renderDom: row => <FormatOrgCode value={row.fund_org_code}/>},
      {text: '兑付日期', name: 'repayment_date'},
      {text: '兑付状态', name: 'repayment_status', renderDom: row => <FormatRepaymentStatus value={row.repayment_status}/>},
      {text: '收款开户行', name: 'repayment_bank'},
      {text: '收款户名', name: 'repayment_name'},
      {text: '收款账户', name: 'repayment_card_no'},
      {text: '兑付本金（元）', name: 'repayment_original_fee'},
      {text: '兑付利息（元）', name: 'repayment_interest_fee'},
      {text: '到期日', name: 'repayment_end_date'}
    ]
    this.searchBarItems = [
      {
        label: "资产方:",
        type:"custom",
        dom: <AssetRelatedSelector onChange={this.handleAssetOrgChange} fundOrgCode={(user_type === 2) ? session.org_code:""}/>
      },
      {
        label: "资金方:",
        type:"custom",
        dom: <FundRelatedSelector onChange={this.handleFundOrgChange} assetOrgCode={(user_type === 1) ? session.org_code : ""}/>
      },
      {
        label: "兑付状态:",
        type:"custom",
        dom: <RepaymentStatusSelector onChange={this.handleStatusChange} multiple={true}/>
      },
      {
        label: "兑付开始日:",
        type:"date",
        props:{
          showClearDate:true,
          onDateChange:self.handleStartDatesChange,
          output:"date",
          style: {width: "100%"}
        }
      },
      {
        label: "兑付结束日:",
        type:"date",
        props:{
          showClearDate:true,
          onDateChange:self.handleEndDatesChange,
          output:"date",
          style: {width: "100%"}
        }
      }
    ]
  }

  componentWillMount(){
    window.addEventListener("click", this.clearOps)
  }
  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }
  clearOps() {
    if(this.state.opsRepayment || this.state.viewRepayment){
      this.setState({...this.state, opsRepayment: undefined, viewRepayment: undefined})
    }
  }
  toggleOps(e,row){
    e.preventDefault();
    e.stopPropagation();
    var key = `${row.asset_org_code},${row.fund_org_code},${row.repayment_date}`;
    if(this.state.opsRepayment == key){
      this.setState({...this.state, opsRepayment: undefined, viewRepayment: undefined})
    } else {
      this.setState({...this.state, opsRepayment: key, viewRepayment: undefined})
    }
  }

  toggleViews(e,row){
    e.preventDefault();
    e.stopPropagation();
    var key = `${row.asset_org_code},${row.fund_org_code},${row.repayment_date}`;
    if(this.state.viewRepayment == key){
      this.setState({...this.state, viewRepayment: undefined, opsRepayment: undefined})
    } else {
      this.setState({...this.state, viewRepayment: key, opsRepayment: undefined})
    }
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  handleSearch(index) {
    if (typeof index != "undefined") {
      this.setState({index})
      return this.props.searcher({
        pageIndex: index,
        fundOrgCode: this.state.fundOrgCode,
        assetOrgCode: this.state.assetOrgCode,
        repaymentDateStart: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00') || '',
        repaymentDateEnd: this.state.startDate && this.state.endDate.format('YYYY-MM-DD 23:59:59') || '',
        repaymentStatus: this.state.status
      })
    } else {
      this.setState({index: 1})
      return this.props.searcher({
        pageIndex: 1,
        fundOrgCode: this.state.fundOrgCode,
        assetOrgCode: this.state.assetOrgCode,
        repaymentDateStart: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00') || '',
        repaymentDateEnd: this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59') || '',
        repaymentStatus: this.state.status
      })
    }
  }

  updateStatus(row, status) {
    var {messageSetter, statusUpdater, type} = this.props
    if(type == 1){
      if (status == "03"){
        messageSetter("资产方无权设置资金方确认","WARN")
        return
      } else if ((row.repayment_status == "01") && (status == "01")){
        messageSetter("资产方确认状态下，不能重复设置","WARN")
        return
      } else if ((row.repayment_status == "02") && (status == "01")){
        messageSetter("资产方还款状态下，资产方已不必确认","WARN")
        return
      } else if ((row.repayment_status == "02") && (status == "02")){
        messageSetter("资产方还款状态下，不能重复设置","WARN")
        return
      } else if ((row.repayment_status == "03") && (status == "01")){
        messageSetter("资金方确认状态下，资产方已不必确认","WARN")
        return
      } else if ((row.repayment_status == "03") && (status == "02")){
        messageSetter("资金方确认状态下，资产方已不必设置为还款","WARN")
        return
      }
    } else if (type == 2){
      if ((status < "03") && (status >= "00")){
        messageSetter("资金方无权设置资产方的操作","WARN")
        return
      }else if ((row.repayment_status == "03") && (status == "03")){
        messageSetter("资金方确认状态下，不能重复设置","WARN")
        return
      }
    }
    statusUpdater({
      fund_org_code: row.fund_org_code,
      asset_org_code: row.asset_org_code,
      repayment_date: row.repayment_date,
      repayment_status: status,
    })
  }

  handleExport() {
    var {messageSetter} = this.props
    this.handleSearch().promise.then(({response})=>{
      if(response.success){
        if(response.total <= window.EDI_CLIENT.exportMaxRows){
          var browserType = getBrowserType(),
            queryString = `/repayment/export?fundOrgCode=${this.state.fundOrgCode}&assetOrgCode=${this.state.assetOrgCode}&repaymentDateStart=${this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00') || ''}&repaymentDateEnd=${this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59') || ''}&repaymentStatus=${this.state.status.join(',')}`
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
          }, 2000)
        } else {
          messageSetter(`系统目前仅支持${window.EDI_CLIENT.exportMaxRows/10000}万条以内的导出，推荐按天导出`,"WARN")
        }
      }
    })
  }

  handleStatusChange(rows) {
    this.state.status = rows.map(r=>r.value)
    this.state.index = 1
    this.handleSearch()
  }

  handleDatesChange({startDate, endDate}) {
    this.setState({startDate, endDate}, () => {
      this.handleSearch()
    })
  }

  handleFundOrgChange(row) {
    this.setState({fundOrgCode: row.value}, this.handleSearch)
  }

  handleAssetOrgChange(row) {
    this.setState({assetOrgCode: row.value}, this.handleSearch)
  }

  openRepaymentModal(row) {
    //this.state.orderRepaymentNo = row.order_no
    this.setState(Object.assign({}, this.state, {
      repaymentNo: row.repayment_date + row.fund_org_code + row.asset_org_code,
      repayment: row
    }))
  }

  closeRepaymentModal() {
    this.setState(Object.assign({}, this.state, {repaymentNo: "", repayment: undefined}))
  }

  componentDidMount() {
    this.handleSearch()
  }
  openExportConfirm(){
    this.setState({confirmExport: true})
  }
  closeExportConfirm(){
    this.setState({confirmExport: false})
  }
  handleStartDatesChange(date) {
    this.setState({startDate:date}, this.handleSearch)
  }
  handleEndDatesChange(date) {
    this.setState({endDate:date}, this.handleSearch)
  }
  render() {
    const {repayment, _buttons, type} = this.props
    var self = this, column = ((type == 1)?this.assetColumns:((type == 2)?this.fundColumns:this.adminColumns))
    const {confirmExport, fundOrgCode, assetOrgCode} = this.state

    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <button type="submit" className="btn icon-btn btn-primary pull-left">
            <i className="fa fa-search"></i>搜索
          </button>
          {_buttons.includes("repayment_export") && <button type="button" className="btn icon-btn btn-danger pull-left" onClick={this.openExportConfirm}>
            <i className="fa fa-download"></i>导出
          </button>}
        </SearchBar>

        <a download="true" className="hidden" target="_blank" ref={(link) => {
          this.hiddenLink = link
        }}/>
        <div className="wrapper">
          <Datatable columns={column} rows={repayment.rows} index={this.state.index}
                     searcher={this.handleSearch} total={repayment.total}/>
        </div>
        {this.state.repaymentNo && <Modal data={[this.state.repayment]} title="兑付单明细一览" columns={this.repaymentColumns}
                                          closer={this.closeRepaymentModal}/>}
        {confirmExport && <Dialog confirm={(e)=>{
          self.handleExport(e)
          self.closeExportConfirm()
        }} title="请确认" closer={this.closeExportConfirm} size="modal-md">
          超大量导出兑付单会存在失败的可能或下载速度慢，建议减少单次下载量<br />
          系统目前仅支持{window.EDI_CLIENT.exportMaxRows/10000}万条以内的导出，如有更多数据需要导出，请另行联系我们<br />
          您确定要对{repayment.total}条兑付单数据做导出操作么?
        </Dialog>}
      </div>
    )
  }
}
