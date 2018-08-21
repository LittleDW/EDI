import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import Datatable from "../Datatable";
import Selector from '../../redux/selectors'
import moment from 'moment'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import SingleDatePicker from '../SingleDatePicker'
import AssetRelatedAccountPurposeWithAssetUserFromSelector from '../Select/AssetRelatedAccountPurposeWithAssetUserFromSelectorPage'
import FundRelatedSelector from '../Select/FundRelatedSelectorPage'
import {
  FormatFundAccountAccountPurpose,
  FormatFinanceRepaymentDetailInterestMode,
  FormatFinanceRepaymentDetailRepaymentMode,
  FormatFinanceRepaymentDetailServiceFeeMode,
} from "../Formatter";
import Select from "../Select";
import CSSModules from "react-css-modules/dist/index";
import style from '../SupplementAssetOrder/style.scss'

/**
 * 由于用户可能频繁点上一步下一步，如果用input取value有可能造成上一步，数据被清空的尴尬情况，故采用state控值得方法
 * */
@CSSModules(style, {allowMultiple: true})
class Modal extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session, user_type = session && session.user_type || -1
    this.xhr = null
    this.now = Date.now()
    this.handleRepaymentAssetChange = this.handleRepaymentAssetChange.bind(this)
    this.handleRepaymentInputChange = this.handleRepaymentInputChange.bind(this)
    this.handleRepaymentFromDateChange = this.handleRepaymentFromDateChange.bind(this)
    this.handleRepaymentCloseDateChange = this.handleRepaymentCloseDateChange.bind(this)
    this.handleRepaymentChange = this.handleRepaymentChange.bind(this)
    this.handleRepaymentReset = this.handleRepaymentReset.bind(this)
    this.handleProgress = this.handleProgress.bind(this)
    this.resetXHR = this.resetXHR.bind(this)
    this.renderSecondStep = this.renderSecondStep.bind(this)
    this.renderSwitch = this.renderSwitch.bind(this)
    this.renderSecondStepSwitch = this.renderSecondStepSwitch.bind(this)
    this.renderSecondStepMatcher = this.renderSecondStepMatcher.bind(this)
    this.renderSecondStepResult = this.renderSecondStepResult.bind(this)
    this.renderFirstStep = this.renderFirstStep.bind(this)
    this.renderFirstStepDetail = this.renderFirstStepDetail.bind(this)
    this.toStepTwo = this.toStepTwo.bind(this)
    this.backToStepOne = this.backToStepOne.bind(this)
    this.mapperChanger = this.mapperChanger.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)

    this.columns = [
      {
        text: '标的编号',
        name: 'target_no',
        required:true,
      },
      {
        text: '标的名称',
        name: 'target_name',
        required:true,
      },
      {
        text: '借款人名称',
        name: 'borrow_name',
        required:true,
      },
      {
        text: '业务推荐方名称',
        name: 'recommended_name',
        required:true,
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
        required:true,
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '到账日期',
        name: 'payment_date',
        required:true,
        style: {'width': '160px', textAlign: 'center'}
      },
      {
        text: '出账金额（元）',
        name: 'account_fee',
        required:true,
        style: {textAlign: 'right'}
      },
      {
        text: '借款到期日',
        name: 'borrow_end_date',
        required:true,
      },
      {
        text: '计息方式',
        name: 'interest_mode',
        renderDom: row => (<FormatFinanceRepaymentDetailInterestMode value={row.interest_mode}/>)
      },
      {
        text: '计息天数',
        name: 'interest_daycount',
      },
      {
        text: '借款利率',
        name: 'interest_rate',
        required:true,
      },
      {
        text: '服务费率',
        name: 'service_rate',
      },
      {
        text: '综合费率',
        name: 'all_rate',
      },
      {
        text: '本息还款方式',
        name: 'repayment_mode',
        required:true,
        renderDom: row => (<FormatFinanceRepaymentDetailRepaymentMode value={row.repayment_mode}/>)
      },
      {
        text: '服务费结算方式',
        name: 'service_fee_mode',
        renderDom: row => (<FormatFinanceRepaymentDetailServiceFeeMode value={row.service_fee_mode}/>)
      },
      {
        text: '本金总期数',
        name: 'principal_period_count',
        required:true,
      },
      {
        text: '利息总期数',
        name: 'interest_period_count',
        required:true,
      },
      {
        text: '服务费总期数',
        name: 'service_fee_period_count',
      },
      {
        text: '每期还款日',
        name: 'each_repayment_day',
      },
      {
        text: '利息总额（元）',
        name: 'interest_total_fee',
        required:true,
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
        text: '还款日期',
        name: 'repayment_date',
        required:true,
      },
      {
        text: '当前期次',
        name: 'current_period',
        required:true,
      },
      {
        text: '应还本金（元）',
        name: 'repayment_principal_fee',
        required:true,
      },
      {
        text: '应还利息（元）',
        name: 'repayment_interest_fee',
        required:true,
      },
      {
        text: '应还总额（元）',
        name: 'repayment_all_fee',
        required:true,
      },
      {
        text: '备注',
        name: 'remark',
      }
    ]

    this.errorColumns = [{text: '校验结果', name: '_reason',}, ...this.columns]

    this.state = {
      user_type,
      //assetOrgCode: (user_type === 1) ? session.org_code : '',
      //fundOrgCode: props.defaultFundOrgCode,
      fundAccount: null,
      step: 0,
      index:1,
      map:null,
      repaymentFile: null,
      data:{
        //asset_org_code: (user_type === 1) ? session.org_code : '',
        fund_org_code: props.defaultFundOrgCode,
        repayment_from_date:undefined,
        repayment_closing_date:undefined,
        repayment_principal_fee:"",
        repayment_interest_fee:"",
        repayment_total_fee:"",
        remark:"",
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
   /* const {financeRepaymentDetail, working} = nextProps
    let {mapper} = this.state
    if(!working){
      let obj = {}
      if(financeRepaymentDetail && financeRepaymentDetail.ngHeaders && !mapper){
        obj.mapper = this.old_map
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
  handleRepaymentAssetChange(row) {
    this.setState({data: {...this.state.data,asset_org_code: row.value}, fundAccount: row.fundAccount,assetAccount: row.assetAccount})
  }
  handleRepaymentFromDateChange(value){
    this.setState({data: {...this.state.data,repayment_from_date: value}})
  }
  handleRepaymentCloseDateChange(value){
    this.setState({data: {...this.state.data,repayment_closing_date: value}})
  }
  /*handleAssetOrgChange(row) {
    this.setState({data: {...this.state.data,asset_org_code: rowvalue}})
    this.setState({assetOrgCode: row.value, index: 1}, this.handleSearch)
  }*/
  handleRepaymentInputChange(input){
    return (e)=>{
      let value = e.target.value
      this.setState({data: {...this.state.data,[input]: (isNaN(value) || (value===""))? value : Number(value)}})
    }
  }

  handleRepaymentChange(e) {
    e.preventDefault();
    e.stopPropagation();
    var file = e.currentTarget.files[0]
    this.setState({repaymentFile: file},()=>{
      this.submitBtn && this.submitBtn.focus()
      this.resetXHR()
    })
  }
  handleRepaymentReset(e){
    const {repaymentFile} = this.state
    if(repaymentFile){
      this.repaymentButton.value = ""
      this.setState({repaymentFile: null, mapper: null},this.resetXHR)
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
    let {data, repaymentFile, mapper} = this.state

    this.resetXHR(()=>{
      var formData = new FormData();
      formData.append("repaymentFile", repaymentFile);
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
              formData.append("data", JSON.stringify({...data, repayment_details: JSON.stringify(response.matched)}))
              formData.append("repaymentFile", repaymentFile)
              let cfm = confirm(formData,{onProgress: self.handleProgress})
              this.xhr = null
              cfm.then(()=>{
                this.setState({progress:null})
              })
            })
          }
        }
      }).finally(()=>{
        this.setState({progress:null})
        this.xhr = null
      })
    })
  }
  toStepTwo(e){
    e.preventDefault();
    e.stopPropagation();
    let message = {}, {data,repaymentFile} = this.state,self = this
    if (!data.repayment_from_date || !moment(data.repayment_from_date,"YYYY-MM-DD").isValid()){
      message.repayment_from_date = "必填，格式为YYYY-MM-DD"
    }
    if (!data.repayment_closing_date || !moment(data.repayment_closing_date,"YYYY-MM-DD").isValid()){
      message.repayment_closing_date = "必填，格式为YYYY-MM-DD"
    }
    if(isNaN(data.repayment_principal_fee) || (data.repayment_principal_fee < 0) || (data.repayment_principal_fee > 1000000000)){
      message.repayment_principal_fee = "必填，非负数，且为不大于10亿"
    }
    if(isNaN(data.repayment_interest_fee) || (data.repayment_interest_fee < 0) || (data.repayment_interest_fee > 1000000000)){
      message.repayment_interest_fee = "必填，非负数，且为不大于10亿"
    }
    if(!data.repayment_total_fee || (data.repayment_total_fee < 0) || (data.repayment_total_fee > 1000000000)){
      message.repayment_total_fee = "必填，正数，且为不大于10亿"
    }
    if (data.remark && data.remark.length > 255){
      message.remark = "字数不能大于255"
    }

    if(Object.keys(message).length){
      this.setState({message})
    } else {
      this.setState({
        step: 1,
        message: {},
      },()=>{
        if(repaymentFile){
          self.handleConfirm(e)
        }
      })
    }
  }

  backToStepOne(e){
    this.setState({step: 0, repaymentFile: null},this.resetXHR)
  }

  renderHint=()=>{
    const {progress} = this.state
    let message
    if(progress){
      message = `还款明细后台创建中，请耐心等待`
    }
    return (
      <div className="col-sm-8 form-text">
        <span className="edi_text-danger">{message}</span>
      </div>)
  }

  renderFirstStep(){
    const {message, data, fundAccount,assetAccount,repaymentFile} = this.state
    let {defaultFundOrgCode} = this.props
    return (
      <div>
        <div className="form-group">
          <h4 className="col-sm-4 control-label">基本信息:</h4>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">资产方名称</label>
          <div className="col-sm-5">
            <AssetRelatedAccountPurposeWithAssetUserFromSelector onChange={this.handleRepaymentAssetChange} defaultValue={this.state.data && this.state.data.asset_org_code || ""} fundOrgCode={defaultFundOrgCode} assetAccountPurpose="001" fundAccountPurpose="002" userFrom="1" noEmpty={true}/>
          </div>
          {message.asset_org_code &&
          <div className="col-sm-3"><span className="help-block">{message.asset_org_code}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">起始还款日</label>
          <div className="col-sm-5">
            <SingleDatePicker onDateChange={this.handleRepaymentFromDateChange} showClearDate={true} date={this.state.data.repayment_from_date} style={{width: "172px"}}/>
          </div>
          {message.repayment_from_date &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_from_date}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">截止还款日</label>
          <div className="col-sm-5">
            <SingleDatePicker onDateChange={this.handleRepaymentCloseDateChange} showClearDate={true} date={this.state.data.repayment_closing_date} style={{width: "172px"}}/>
          </div>
          {message.repayment_closing_date &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_closing_date}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">应付本金（元）</label>
          <div className="col-sm-5">
            <input type="number" value={data.repayment_principal_fee} onChange={this.handleRepaymentInputChange("repayment_principal_fee")}/>
          </div>
          {message.repayment_principal_fee &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_principal_fee}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">应付利息（元）</label>
          <div className="col-sm-5">
            <input type="number" value={data.repayment_interest_fee} onChange={this.handleRepaymentInputChange("repayment_interest_fee")}/>
          </div>
          {message.repayment_interest_fee &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_interest_fee}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">应付总额（元）</label>
          <div className="col-sm-5">
            <input type="number" value={data.repayment_total_fee} onChange={this.handleRepaymentInputChange("repayment_total_fee")}/>
          </div>
          {message.repayment_total_fee &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_total_fee}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">备注</label>
          <div className="col-sm-5">
            <input type="text" maxLength="255" value={data.remark} onChange={this.handleRepaymentInputChange("remark")}/>
          </div>
          {message.remark &&
          <div className="col-sm-3"><span className="help-block">{message.remark}</span></div>}
        </div>
        {this.renderFirstStepDetail(fundAccount,assetAccount)}
        <div className="form-group">
          <h4 className="col-sm-4 control-label">上传明细:</h4>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">还款明细</label>
          <div className="col-sm-8">
            <label htmlFor={`${this.now}repayment`} className="btn icon-btn btn-default pull-left">
              <i className="fa fa-upload"></i>{repaymentFile ? '重新上传' : '上传明细'}</label>
            <input type="file" className="hidden" ref={(button) => {this.repaymentButton = button;}} hidden
                   id={`${this.now}repayment`} onChange={this.handleRepaymentChange} onClick={this.handleRepaymentReset}
                   accept=".xlsx, .xls, .csv"/>
            <a target="_blank" href="/还款对账明细模板.xlsx" className="pull-left form-text edi-mr edi-ml">下载模板</a>
            {repaymentFile && <div className="pull-left form-text">{repaymentFile.name}</div>}
          </div>
        </div>
        <div className="form-group"><label className="col-sm-4 control-label"></label>
          <div className="col-sm-8"><p className="help-block edi_text-danger">建议单次上传记录数控制在1万条以内</p></div>
        </div>
      </div>
    )
  }
  renderFirstStepDetail(fundAccount,assetAccount){
    if(fundAccount){
      return [
        (<div className="form-group" key="firstStepDetail0">
          <label className="col-sm-4 control-label">合作方机构号</label>
          <div className="col-sm-5 form-text">{fundAccount.asset_org_code}</div>
        </div>),
        (<div className="form-group" key="firstStepDetail1">
          <label className="col-sm-4 control-label">合作方名称</label>
        <div className="col-sm-5 form-text">{assetAccount.asset_user_full_name}</div>
        </div>),
        (<div className="form-group" key="firstStepDetail2">
          <label className="col-sm-4 control-label">合作方简称</label>
          <div className="col-sm-5 form-text">{assetAccount.asset_user_name}</div>
        </div>),
        (<div className="form-group" key="firstStepDetail3">
          <label className="col-sm-4 control-label">账户用途</label>
          <div className="col-sm-5 form-text">
            <FormatFundAccountAccountPurpose value={fundAccount.account_purpose}/>
          </div>
        </div>),
        (<div className="form-group" key="firstStepDetail4">
          <label className="col-sm-4 control-label">收款账户名称</label>
          <div className="col-sm-5 form-text">{fundAccount.gathering_name}</div>
        </div>),
        (<div className="form-group" key="firstStepDetail5">
          <label className="col-sm-4 control-label">收款账户开户行</label>
        <div className="col-sm-5 form-text">{fundAccount.gathering_bank}</div>
        </div>),
        (<div className="form-group" key="firstStepDetail6">
          <label className="col-sm-4 control-label">收款账户号</label>
          <div className="col-sm-5 form-text">{fundAccount.gathering_card_no}</div>
        </div>),
      ]
    }
  }
  renderSecondStep(){
    const {repaymentFile, progress} = this.state
    return (
      <div>
        {progress && <div className="progress edi_progress">
          <div className={`progress-bar progress-bar-striped active edi_progress-bar`} style={{width:progress.percent}}></div>
        </div>}
        <div className="form-group">
          <h4 className="col-sm-4 control-label" style={{marginTop: '0'}}>上传明细:</h4>
          {this.renderHint()}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">还款明细</label>
          <div className="col-sm-8">
            <label htmlFor={`${this.now}repayment`} className="btn icon-btn btn-default pull-left">
              <i className="fa fa-upload"></i>{repaymentFile ? '重新上传' : '上传明细'}</label>
            <input type="file" className="hidden" ref={(button) => {this.repaymentButton = button;}} hidden
                   id={`${this.now}repayment`} onChange={this.handleRepaymentChange} onClick={this.handleRepaymentReset}
                   accept=".xlsx, .xls, .csv"/>
            <a target="_blank" href="/还款对账明细模板.xlsx" className="pull-left form-text edi-ml edi-mr">下载模板</a>
            {repaymentFile && <div className="pull-left form-text">{repaymentFile.name}</div>}
          </div>
        </div>
        <div className="form-group"><label className="col-sm-4 control-label"></label>
          <div className="col-sm-8"><p className="help-block">建议单次上传记录数控制在1万条以内</p></div>
        </div>
        {this.renderSecondStepSwitch()}
      </div>
    )
  }
  renderSecondStepSwitch(){
    const {financeRepaymentDetail} = this.props
    let {mapper} = this.state
    if(financeRepaymentDetail){
      if(mapper && Array.isArray(financeRepaymentDetail.ngHeaders)){
        return this.renderSecondStepMatcher()
      } else if (Array.isArray(financeRepaymentDetail.unmatched) && financeRepaymentDetail.unmatched.length){
        return this.renderSecondStepResult()
      }
    }
  }
  renderSecondStepMatcher(){
    const {financeRepaymentDetail} = this.props
    let ngHeaders = financeRepaymentDetail.ngHeaders.map(r=>({label:r, value:r})), {mapper} = this.state
    return [
      (<div className="form-group" key="secondStepHeader">
        <h4 className="col-sm-4 control-label">表头映射:</h4>
      </div>),
      ...this.columns.map((r,i)=>{
        let mapTarget = mapper.find(s=>s.id === r.name), defaultValue = mapTarget && mapTarget.value || ""
        defaultValue = financeRepaymentDetail.ngHeaders.includes(defaultValue)?defaultValue:""
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
    const {financeRepaymentDetail} = this.props
    return [
      (<div className="form-group" key="thirdStepHeader">
        <h4 className="col-sm-4 control-label">未匹配数据:</h4>
      </div>),
      (
        <div className="row" key="thirdStepBody">
          <div className="col-sm-8 col-sm-offset-2 scroller" style={{ height: '23rem' }}>
            <Datatable columns={this.errorColumns} rows={financeRepaymentDetail.unmatched} noPgaging={true}/>
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
Modal.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE: PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message || state.message,
  _session: state._session,
  //defaultAssetOrgCode: Selector.getDefaultAssetOrgCodes(state),
  defaultFundOrgCode: Selector.getDefaultFundOrgCodes(state),
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE,
    matcher: ownProps.matcher
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)

