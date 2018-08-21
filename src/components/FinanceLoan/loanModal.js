/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import Datatable from "../Datatable";
import Selector from '../../redux/selectors'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import FundRelatedUserFromSelector from '../Select/FundRelatedUserFromSelectorPage'
import AssetRelatedSelector from '../Select/AssetRelatedSelectorPage'
import FundRelatedSelector from '../Select/FundRelatedSelectorPage'
import {
  FormatFinanceLoanDetailInterestMode,
  FormatFinanceLoanDetailRepaymentMode,
  FormatFinanceLoanDetailServiceFeeMode,
} from "../Formatter";
import FinanceLoanDataFromSelector from "../Select/FinanceLoanDataFromSelectorPage";
import Select from "../Select";
import style from '../SupplementAssetOrder/style.scss'
import CSSModules from "react-css-modules/dist/index";

/**
 * 由于用户可能频繁点上一步下一步，如果用input取value有可能造成上一步，数据被清空的尴尬情况，故采用state控值得方法
 * */
@CSSModules(style, {allowMultiple: true})
export default class Modal extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session, user_type = session && session.user_type || -1
    this.payChannelOptions=[{label: "连连支付",value:"连连支付"}, {label: "通联支付",value:"通联支付"}, {label: "宝付支付",value:"宝付支付"},]
    this.xhr = null
    this.now = Date.now()
    this.handleHistoricalLoanFundChange = this.handleHistoricalLoanFundChange.bind(this)
    this.handleHistoricalLoanAssetChange = this.handleHistoricalLoanAssetChange.bind(this)
    this.handleLoanChange = this.handleLoanChange.bind(this)
    this.handleLoanReset = this.handleLoanReset.bind(this)
    this.handleLoanVoucherChange = this.handleLoanVoucherChange.bind(this)
    this.handleHistoricalLoanInputChange = this.handleHistoricalLoanInputChange.bind(this)
    this.handleLoanVoucherReset = this.handleLoanVoucherReset.bind(this)
    this.handleProgress = this.handleProgress.bind(this)
    this.resetXHR = this.resetXHR.bind(this)
    this.renderSecondStep = this.renderSecondStep.bind(this)
    this.renderSwitch = this.renderSwitch.bind(this)
    this.renderSecondStepSwitch = this.renderSecondStepSwitch.bind(this)
    this.renderSecondStepMatcher = this.renderSecondStepMatcher.bind(this)
    this.renderSecondStepResult = this.renderSecondStepResult.bind(this)
    this.toStepTwo = this.toStepTwo.bind(this)
    this.backToStepOne = this.backToStepOne.bind(this)
    this.mapperChanger = this.mapperChanger.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)

    this.columns = [
      {
        text: '标的编号',
        name: 'target_no',
        required: true,
      },
      {
        text: '标的名称',
        name: 'target_name',
        required: true,
      },
      {
        text: '借款人名称',
        name: 'borrow_name',
        required: true,
      },
      {
        text: '业务推荐方名称',
        name: 'recommended_name',
        required: true,
      },
      {
        text: '业务推荐方简称',
        name: 'recommended_short_name',
      },
      {
        text: '收款方名称',
        name: 'payee_name',
      },
      {
        text: '满标日期',
        name: 'fill_date',
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '出账日期',
        name: 'account_date',
        required: true,
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '到账日期',
        name: 'payment_date',
        required: true,
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '出账金额（元）',
        name: 'account_fee',
        required: true,
        style: {textAlign: 'right'}
      },
      {
        text: '借款到期日',
        name: 'borrow_end_date',
        required: true,
      },
      {
        text: '计息方式',
        name: 'interest_mode',
        renderDom: row => (<FormatFinanceLoanDetailInterestMode value={row.interest_mode}/>)
      },
      {
        text: '计息天数',
        name: 'interest_daycount',
        required: true,
      },
      {
        text: '借款利率',
        name: 'interest_rate',
        required: true,
      },
      {
        text: '服务费率',
        name: 'service_rate',
      },
      {
        text: '综合费率',
        name: 'all_rate',
        required: true,
      },
      {
        text: '本息还款方式',
        name: 'repayment_mode',
        required: true,
        renderDom: row => (<FormatFinanceLoanDetailRepaymentMode value={row.repayment_mode}/>)
      },
      {
        text: '服务费结算方式',
        name: 'service_fee_mode',
        renderDom: row => (<FormatFinanceLoanDetailServiceFeeMode value={row.service_fee_mode}/>)
      },
      {
        text: '本金总期数',
        name: 'principal_period_count',
        required: true,
      },
      {
        text: '利息总期数',
        name: 'interest_period_count',
        required: true,
      },
      {
        text: '服务费总期数',
        name: 'service_fee_period_count',
        required: true,
      },
      {
        text: '每期还款日',
        name: 'each_repayment_day',
      },
      {
        text: '利息总额（元）',
        name: 'interest_total_fee',
      },
      {
        text: '服务费总额（元）',
        name: 'service_total_fee',
      },
      {
        text: '服务费结算月份',
        name: 'service_settlement_month',
      },
      {
        text: '备注',
        name: 'remark',
      }
    ]

    this.errorColumns = [{text: '校验结果', name: '_reason',}, ...this.columns]

    this.state = {
      user_type,
      assetOrgCode: (user_type === 1) ? session.org_code : '',
      fundOrgCode: (user_type === 2) ? session.org_code : '',
      step: 0,
      index:1,
      map:null,
      loanFile: null,
      loanVoucherFile: null,
      data:{
        asset_org_code: (user_type === 1) ? session.org_code : '',
        fund_org_code: (user_type === 2) ? session.org_code : '',
        account_fee:"",
        remark:"",
        real_gathering_name:"",
        real_gathering_bank:"",
        real_gathering_card_no:"",
        pay_channel:"",
        repayment_name:"",
        repayment_bank:"",
        repayment_card_no:"",
        account_date:undefined,
      },
      mapper: null,
      message:{},
      progress: null
    }

    this.old_map = this.columns.map(r=>({label: r.text, value: r.text, id:r.name}))
  }

  componentDidMount() {
    //this.handleSearch()
  }

  componentWillReceiveProps(nextProps) {
    /*const {financeLoanDetail, working} = nextProps
    let {mapper} = this.state
    if(!working){
      let obj = {}
      if(financeLoanDetail && financeLoanDetail.ngHeaders && !mapper){
        obj.mapper = JSON.parse(JSON.stringify(this.old_map))
      }
      obj.progress = null
      this.setState(obj)
    }*/
  }

  componentWillMount() {
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.addEventListener("keydown", this.escCloser)
  }

  componentWillUnmount() {
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.removeEventListener("keydown", this.escCloser);
  }
  handlePayChannelChange = (value) => {
    this.setState({data: {...this.state.data,pay_channel: value}})
  }
  handleHistoricalLoanAssetChange(row) {
    this.setState({data: {...this.state.data,
        asset_org_code: row.value,
        real_gathering_name: row.assetAccount && row.assetAccount.gathering_name || "",
        real_gathering_bank: row.assetAccount && row.assetAccount.gathering_bank || "",
        real_gathering_card_no: row.assetAccount && row.assetAccount.gathering_card_no || "",
        repayment_name: row.fundAccount && row.fundAccount.gathering_name || "",
        repayment_bank: row.fundAccount && row.fundAccount.gathering_bank || "",
        repayment_card_no: row.fundAccount && row.fundAccount.gathering_card_no || "",
      }})
  }
  handleHistoricalLoanFundChange(row) {
    this.setState({data: {...this.state.data,
        fund_org_code: row.value,
        real_gathering_name: row.assetAccount && row.assetAccount.gathering_name || "",
        real_gathering_bank: row.assetAccount && row.assetAccount.gathering_bank || "",
        real_gathering_card_no: row.assetAccount && row.assetAccount.gathering_card_no || "",
        repayment_name: row.fundAccount && row.fundAccount.gathering_name || "",
        repayment_bank: row.fundAccount && row.fundAccount.gathering_bank || "",
        repayment_card_no: row.fundAccount && row.fundAccount.gathering_card_no || "",
      }})
  }
  handleHistoricalLoanInputChange(input){
    return (e)=>{
      let value = e.target.value
      this.setState({data: {...this.state.data,[input]: (isNaN(value) || (value===""))? value : Number(value)}})
    }
  }

  handleLoanChange(e) {
    e.preventDefault();
    e.stopPropagation();
    var file = e.currentTarget.files[0]
    this.setState({loanFile: file},()=>{
      this.submitBtn && this.submitBtn.focus()
      this.resetXHR()
    })
  }
  handleLoanReset(e){
    const {loanFile} = this.state
    if(loanFile){
      this.loanButton.value = ""
      this.setState({loanFile: null, mapper: null},this.resetXHR)
    }
  }

  handleLoanVoucherChange(e) {
    e.preventDefault();
    e.stopPropagation();
    var file = e.currentTarget.files[0]
    this.setState({loanVoucherFile: file},()=>{
      this.toStepTwoBtn && this.toStepTwoBtn.focus()
      this.resetXHR()
    })
  }
  handleLoanVoucherReset(e){
    const {loanVoucherFile} = this.state
    if(loanVoucherFile){
      this.loanVoucherFile.value = ""
      this.setState({loanVoucherFile: null},this.resetXHR)
    }
  }

  resetXHR (runner){
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null;
      this.setState({progress:null}, runner)
    } else {
      (typeof runner == "function") && runner()
    }
  }
  handleProgress(e) {
    if(this._reactInternalInstance){
      this.setState({
        progress: {total:e.total, loaded: e.loaded, percent: `${Math.floor(100*e.loaded/e.total)}%`}
      })
    }
  }
  handleConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    const {confirm, matcher} = this.props, self = this
    let {data,loanVoucherFile, loanFile, mapper} = this.state

    this.resetXHR(()=>{
      var formData = new FormData();
      formData.append("loanFile", loanFile);
      mapper && formData.append("mapper", JSON.stringify(mapper));
      let mc = matcher(formData)
      self.xhr = mc.xhr
      mc.promise.then(({response})=>{
        if(response && response.success){
          if(response.ngHeaders){
            this.setState({mapper: JSON.parse(JSON.stringify(response.map || this.old_map))})
          } else if ((!response.unmatched || !response.unmatched.length) && response.matched && response.matched.length){
            this.resetXHR(()=>{
              var formData = new FormData();
              /*Object.keys(data).forEach(r=>{formData.append([r], data[r])})*/
              formData.append("data", JSON.stringify({...data, loan_details: JSON.stringify(response.matched)}))
              formData.append("loanVoucherFile", loanVoucherFile)
              formData.append("loanFile", loanFile)
              let cfm = confirm(formData,{onProgress: self.handleProgress})
              this.xhr = null
              cfm.then(()=>{
                this.setState({progress:null})
              })
            })
          }
        }
      })
    })
  }
  toStepTwo(e){
    e.preventDefault();
    e.stopPropagation();
    let message = {}, {data,loanFile} = this.state, self = this
    if(!data.account_fee|| (data.account_fee < 0) || (data.account_fee > 1000000000)){
      message.account_fee = "必填，正数，且为不大于10亿"
    }
    if (data.remark && data.remark.length > 255){
      message.remark = "字数不能大于255"
    }

    if (!data.real_gathering_name || (data.real_gathering_name.length > 50)){
      message.real_gathering_name = "必填，且字数不能大于50"
    }

    if (!data.real_gathering_bank || (data.real_gathering_bank.length > 50)){
      message.real_gathering_bank = "必填，且字数不能大于50"
    }

    if (!data.real_gathering_card_no || (data.real_gathering_card_no.length > 50)){
      message.real_gathering_card_no = "必填，且字数不能大于50"
    }

    if (!data.pay_channel || (data.pay_channel.length > 50)){
      message.pay_channel = "必填，且字数不能大于50"
    }

    if (data.repayment_name && (data.repayment_name.length > 50)){
      message.repayment_name = "字数不能大于50"
    }

    if (!data.repayment_bank || (data.repayment_bank.length > 50)){
      message.repayment_bank = "必填，且字数不能大于50"
    }

    if (data.repayment_card_no && (data.repayment_card_no.length > 50)){
      message.repayment_card_no = "字数不能大于50"
    }

    if(Object.keys(message).length){
      this.setState({message})
    } else {
      this.setState({
        step: 1,
        message: {},
      },()=>{
        if(loanFile){
          self.handleConfirm(e)
        }
      })
    }
  }

  backToStepOne(e){
    this.setState({step: 0, loanFile: null},this.resetXHR)
  }
  renderHint=()=>{
    const {progress} = this.state
    let message
    if(progress){
      message = `出账明细后台创建中，请耐心等待`
    }
    return (
      <div className="col-sm-8 form-text">
        <span className="edi_text-danger">{message}</span>
      </div>)
  }
  renderFirstStep(){
    return []
  }
  renderSecondStep(){
    const {loanFile, progress} = this.state
    return (
      <div>
        {progress && <div className="progress edi_progress">
          <div className={`progress-bar progress-bar-striped active edi_progress-bar`} style={{width:progress.percent}}></div>
        </div>}
        <div className="form-group">
          <h3 className="col-sm-4 control-label" style={{marginTop: '0'}}>上传明细:</h3>
          {this.renderHint()}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">出账明细表</label>
          <div className="col-sm-8">
            <label htmlFor={`${this.now}loan`} className="btn icon-btn btn-default pull-left">
              <i className="fa fa-upload"></i>{loanFile ? '重新上传' : '上传明细'}</label>
            <input type="file" className="hidden" ref={(button) => {this.loanButton = button;}} hidden
                   id={`${this.now}loan`} onChange={this.handleLoanChange} onClick={this.handleLoanReset}
                   accept=".xlsx, .xls, .csv"/>
            <a target="_blank" href="/放款对账明细模板.xlsx" className="pull-left form-text edi-ml edi-mr">下载模板</a>
            {loanFile && <div className="pull-left form-text">{loanFile.name}</div>}
          </div>
        </div>
        <div className="form-group"><label className="col-sm-4 control-label"></label>
          <div className="col-sm-8"><p className="help-block edi_text-danger">建议单次上传记录数控制在1万条以内</p></div>
        </div>
        {this.renderSecondStepSwitch()}
      </div>
    )
  }
  renderSecondStepSwitch(){
    const {financeLoanDetail} = this.props
    let {mapper} = this.state
    if(financeLoanDetail){
      if(mapper && Array.isArray(financeLoanDetail.ngHeaders)){
        return this.renderSecondStepMatcher()
      } else if (Array.isArray(financeLoanDetail.unmatched) && financeLoanDetail.unmatched.length){
        return this.renderSecondStepResult()
      }
    }
  }
  renderSecondStepMatcher(){
    const {financeLoanDetail} = this.props
    let ngHeaders = financeLoanDetail.ngHeaders.map(r=>({label:r, value:r})), {mapper} = this.state
    return [
      (<div className="form-group" key="secondStepHeader">
        <h4 className="col-sm-4 control-label">表头映射:</h4>
      </div>),
      ...this.columns.map((r,i)=>{
        let mapTarget = mapper.find(s=>s.id === r.name), defaultValue = mapTarget && mapTarget.value || "";
        defaultValue = financeLoanDetail.ngHeaders.includes(defaultValue)?defaultValue:"";
        return (
          <div className="form-group" key={i}>
            <label className={`col-sm-4 control-label ${r.required && "asterisk" || ""}`}>{r.text}</label>
            <div className="col-sm-6">
              <Select onChange={this.mapperChanger(r.name)} options={ngHeaders} extValue={defaultValue} placeholder="-- 无此字段 --" noEmpty={r.required} forceExtChange={true}/>
            </div>
          </div>
        )
      })
    ]
  }
  mapperChanger(target){
    let self = this
    return (row)=>{
      let {mapper} = self.state
      mapper.find(r=>r.id==target).value = row.value
      this.submitBtn && this.submitBtn.focus()
      self.setState({mapper:[...mapper]})
    }
  }
  renderSecondStepResult(){
    const {financeLoanDetail} = this.props
    return [
      (<div className="form-group" key="thirdStepHeader">
        <h4 className="col-sm-4 control-label">未匹配数据:</h4>
      </div>),
      (
        <div className="row" key="thirdStepBody">
          <div className="col-sm-8 col-sm-offset-2 scroller" style={{height: '23rem'}}>
            <Datatable columns={this.errorColumns} rows={financeLoanDetail.unmatched} noPgaging={true}/>
          </div>
        </div>
      )
    ]
  }
  renderSwitch(){
    const {step} = this.state
    switch (step){
      case 0:
        return this.renderFirstStep()
      case 1:
        return this.renderSecondStep()
      default:
        return this.renderFirstStep()
    }
  }
  renderSubmit(){
    const {step} = this.state
    const {working} = this.props
    switch (step){
      case 0:
        return (<button type="submit" className="btn btn-primary pull-right" onClick={this.toStepTwo} ref={(toStepTwoBtn)=>{this.toStepTwoBtn = toStepTwoBtn}}>确定</button>)
      case 1:
        return [
          (<button key="submit1" type="submit" className="btn btn-primary pull-right" onClick={this.handleConfirm} ref={(submitBtn)=>{this.submitBtn = submitBtn}} disabled={working}>确定</button>),
          (<button key="submit0" type="button" className="btn btn-warning pull-right" onClick={this.backToStepOne}>上一步</button>)
        ]
      default:
    }
  }
  render() {
    const {closer,message, title} = this.props
    return (
      <div className="modal fade in" role="dialog">
        <div className="modal-backdrop fade in" onClick={closer}></div>
        <div className="modal-dialog modal-lg" role="document">
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={closer}><span
                aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              {this.renderSwitch()}
            </div>
            <div className="modal-footer">
              {this.renderSubmit()}
              <button type="button" className="btn btn-default pull-right" onClick={closer}>关闭</button>
              {message && message.text && (message.type == "FAIL") &&
              <p className="dialog-message text-danger"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type == "INFO") &&
              <p className="dialog-message text-info"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type == "SUCCESS") &&
              <p className="dialog-message text-success"><i className="fa fa-warning"></i> {message.text}</p>}
            </div>
          </form>
        </div>
      </div>
    )
  }
}
/*
Modal.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE: PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message || state.message,
  _session: state._session,
  defaultAssetOrgCode: Selector.getDefaultAssetOrgCodes(state),
  defaultFundOrgCode: Selector.getDefaultFundOrgCodes(state),
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE,
    matcher: ownProps.matcher
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)*/
