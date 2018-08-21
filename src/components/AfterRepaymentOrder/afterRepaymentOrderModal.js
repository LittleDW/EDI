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
  FormatAfterRepaymentOrderDetailBizType,
  FormatAfterRepaymentOrderDetailBorrowType,
  FormatAfterRepaymentOrderDetailOverdueStatus,
} from "../Formatter";
import CSSModules from 'react-css-modules'
import Select from "../Select";


/**
 * 由于用户可能频繁点上一步下一步，如果用input取value有可能造成上一步，数据被清空的尴尬情况，故采用state控值得方法
 * */
class Modal extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session, user_type = session && session.user_type || -1
    this.xhr = null
    this.now = Date.now()

    this.columns = [
      {
        text: '放款日期',
        name: 'loan_date',
        required:true,
      },
      {
        text: '借款主体类型',
        name: 'borrow_type',
        required:true,
        renderDom: row => (<FormatAfterRepaymentOrderDetailBorrowType value={row.borrow_type}/>)
      },
      {
        text: '借款人名称',
        name: 'borrow_name',
        required:true,
      },
      {
        text: '借款人证件号',
        name: 'borrow_certificate_no',
        required:true,
      },
      {
        text: '借款人银行预留手机号',
        name: 'borrow_phone',
        required:true,
      },
      {
        text: '总期数',
        name: 'period_count',
      },
      {
        text: '剩余期数',
        name: 'remaining_periods',
      },
      {
        text: '待还总金额（元）',
        name: 'remaining_total_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '待还本金（元）',
        name: 'remaining_principal_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '待还利息（元）',
        name: 'remaining_interest_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '本期应还金额（元）',
        name: 'current_balance',
        style: {textAlign: 'right'}
      },
      {
        text: '应还日期',
        name: 'due_date',
      },
      {
        text: '实际还款日期',
        name: 'actual_repayment_date',
        required:true,
      },
      {
        text: '实收总金额（元）',
        name: 'paid_up_total_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '实收本金（元）',
        name: 'paid_up_principal_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '实收利息（元）',
        name: 'paid_up_interest_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '提前还款金额（元）',
        name: 'prepayment_fee',
        style: {textAlign: 'right'}
      },
      {
        text: '业务类型',
        name: 'business_type',
        renderDom: row => (<FormatAfterRepaymentOrderDetailBizType value={row.business_type}/>)
      },
      {
        text: '逾期状态',
        name: 'overdue_status',
        required:true,
        renderDom: row => (<FormatAfterRepaymentOrderDetailOverdueStatus value={row.overdue_status}/>)
      },
      {
        text: '逾期天数',
        name: 'overdue_days',
      },
      {
        text: '逾期手续费（元）',
        name: 'overdue_poundage',
        style: {textAlign: 'right'}
      },
      {
        text: '逾期违约金（元）',
        name: 'overdue_penalty',
        style: {textAlign: 'right'}
      },
      {
        text: '备注',
        name: 'remark',
      },
    ]

    this.errorColumns = [{text: '校验结果', name: '_reason',}, ...this.columns]

    this.state = {
      user_type,
      //assetOrgCode: (user_type === 1) ? session.org_code : '',
      //fundOrgCode: props.defaultFundOrgCode,
      step: 0,
      //index:1,
      data:{
        remark:"",
      },
      map:null,
      afterRepaymentOrderDetailFile: null,
      mapper: null,
      message:{},
      progress: null
    }

    this.old_map = this.columns.map(r=>({label: r.text, value: r.text, id:r.name}))
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

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
  handleRepaymentReset=(e)=>{
    const {afterRepaymentOrderDetailFile} = this.state
    if(afterRepaymentOrderDetailFile){
      this.setState({afterRepaymentOrderDetailFile: null, mapper: null},this.resetXHR)
    }
  }
  handleRemarkChange=(e) =>{
    this.setState({data: {...this.state.data,remark: this.remarkInput.value}})
  }
  resetXHR =(runner)=>{
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null;
      this.setState({progress:null}, runner)
    } else {
      (typeof runner == "function") && runner()
    }
  }
  handleProgress=(e)=> {
    if(this._reactInternalInstance){
      this.setState({
        progress: {total:e.total, loaded: e.loaded, percent: `${Math.floor(100*e.loaded/e.total)}%`}
      })
    }
  }
  handleConfirm=(e)=> {
    e.preventDefault();
    e.stopPropagation();
    const {confirm, matcher} = this.props, self = this
    let {data,afterRepaymentOrderDetailFile, mapper} = this.state

    if(data.remark && (data.remark.length > 255)){
      let message = {remark:"字数不能大于255"}
      this.setState({message});
      return
    }
    this.resetXHR(()=>{
      var formData = new FormData();
      formData.append("afterRepaymentOrderDetailFile", afterRepaymentOrderDetailFile);
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
              formData.append("afterRepaymentOrderDetailFile", afterRepaymentOrderDetailFile)
              formData.append("data", JSON.stringify({...data, json_details: JSON.stringify(response.matched)}))
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
  toStepTwo=(e)=>{
    e.preventDefault();
    e.stopPropagation();
    let message = {}, {data,afterRepaymentOrderDetailFile} = this.state,self = this
    if(Object.keys(message).length){
      this.setState({message})
    } else {
      this.setState({
        step: 1,
        message: {},
      },()=>{
        if(afterRepaymentOrderDetailFile){
          self.handleConfirm(e)
        }
      })
    }
  }

  backToStepOne=(e)=>{
    this.setState({step: 0, afterRepaymentOrderDetailFile: null},this.resetXHR)
  }
  /*renderFirstStep(){
    const {message, data, fundAccount,repaymentFile} = this.state
    let {defaultFundOrgCode} = this.props
    return (
      <div styleName="block finance-block">
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
        {this.renderFirstStepDetail(fundAccount)}
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
      </div>
    )
  }
  renderFirstStepDetail(fundAccount){
    if(fundAccount){
      return [
        (<div className="form-group" key="firstStepDetail0">
          <label className="col-sm-4 control-label">合作方机构号</label>
          <div className="col-sm-5 form-text">{fundAccount.asset_org_code}</div>
        </div>),
        (<div className="form-group" key="firstStepDetail1">
          <label className="col-sm-4 control-label">合作方名称</label>
        <div className="col-sm-5 form-text">{fundAccount.asset_user_full_name}</div>
        </div>),
        (<div className="form-group" key="firstStepDetail2">
          <label className="col-sm-4 control-label">合作方简称</label>
          <div className="col-sm-5 form-text">{fundAccount.asset_user_name}</div>
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
  }*/
  renderSecondStep=()=>{
    const {data,afterRepaymentOrderDetailFile, progress,message} = this.state
    return (
      <div styleName="block finance-block">
        {progress && <div className="progress edi_progress">
          <div className={`progress-bar progress-bar-striped active edi_progress-bar`} style={{width:progress.percent}}></div>
        </div>}
        <div className="form-group">
          <h4 className="col-sm-4 control-label">贷后订单:</h4>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">备注</label>
          <div className="col-sm-5">
            <input type="text" maxLength="255" value={data.remark} onChange={this.handleRemarkChange} ref={(input) => {this.remarkInput = input;}}/>
          </div>
          {message.remark &&
          <div className="col-sm-3"><span className="help-block">{message.remark}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">新增贷后订单</label>
          <div className="col-sm-8">
            <label htmlFor={`${this.now}repayment`} className="btn icon-btn btn-default pull-left">
              <i className="fa fa-upload"></i>{afterRepaymentOrderDetailFile ? '重新上传' : '上传明细'}</label>
            <input type="file" className="hidden" ref={(button) => {this.afterRepaymentOrderDetailButton = button;}} hidden
                   id={`${this.now}repayment`} onChange={this.handleAfterRepaymentOrderDetailChange} onClick={this.handleAfterRepaymentOrderDetailReset}
                   accept=".xlsx, .xls, .csv"/>
            <a target="_blank" href="/资产方台账模板.xlsx" className="pull-left form-text edi-ml edi-mr">下载模板</a>
            {afterRepaymentOrderDetailFile && <div className="pull-left form-text">{afterRepaymentOrderDetailFile.name}</div>}
          </div>
        </div>
        {this.renderSecondStepSwitch()}
      </div>
    )
  }
  handleAfterRepaymentOrderDetailChange=(e)=>{
    e.preventDefault();
    e.stopPropagation();
    var file = e.currentTarget.files[0]
    this.setState({afterRepaymentOrderDetailFile: file},()=>{
      this.submitBtn && this.submitBtn.focus()
      this.resetXHR()
    })
  }
  handleAfterRepaymentOrderDetailReset=(e)=>{
    const {afterRepaymentOrderDetailFile} = this.state
    if(afterRepaymentOrderDetailFile){
      this.afterRepaymentOrderDetailButton.value = ""
      this.setState({afterRepaymentOrderDetailFile: null, mapper: null},this.resetXHR)
    }
  }

  renderSecondStepSwitch=()=>{
    const {afterRepaymentOrderDetail} = this.props
    let {mapper} = this.state
    if(afterRepaymentOrderDetail){
      if(mapper && Array.isArray(afterRepaymentOrderDetail.ngHeaders)){
        return this.renderSecondStepMatcher()
      } else if (Array.isArray(afterRepaymentOrderDetail.unmatched) && afterRepaymentOrderDetail.unmatched.length){
        return this.renderSecondStepResult()
      }
    }
  }
  renderSecondStepMatcher=()=>{
    const {afterRepaymentOrderDetail} = this.props
    let ngHeaders = afterRepaymentOrderDetail.ngHeaders.map(r=>({label:r && r.replace(/^(.{10}).*/i,"$1...")||"", value:r})), {mapper} = this.state
    return [
      (<div className="form-group" key="secondStepHeader">
        <h4 className="col-sm-4 control-label">表头映射:</h4>
      </div>),
      ...this.columns.map((r,i)=>{
        let mapTarget = mapper.find(s=>s.id === r.name), defaultValue = mapTarget && mapTarget.value || ""
        defaultValue = afterRepaymentOrderDetail.ngHeaders.includes(defaultValue)?defaultValue:""
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
  mapperChanger=(target)=>{
    let self = this
    return (row)=>{
      let {mapper} = self.state
      mapper.find(r=>r.id==target).value = row.value
      this.submitBtn && this.submitBtn.focus()
      self.setState({mapper:[...mapper]})
    }
  }
  renderSecondStepResult=()=>{
    const {afterRepaymentOrderDetail} = this.props
    return [
      (<div className="form-group" key="thirdStepHeader">
        <h4 className="col-sm-4 control-label">未匹配数据:</h4>
      </div>),
      (
        <div className="row" key="thirdStepBody">
          <div className="col-sm-8 col-sm-offset-2 scroller" style={{ maxHeight: '23rem',minHeight:'8rem' }}>
            <Datatable columns={this.errorColumns} rows={afterRepaymentOrderDetail.unmatched} noPgaging={true}/>
          </div>
        </div>
      )
    ]
  }
  /*renderSwitch(){
    const {step} = this.state
    switch (step){
      case 0:
        return this.renderFirstStep()
      case 1:
        return this.renderSecondStep()
      default:
        return this.renderFirstStep()
    }
  }*/
  /*renderSubmit(){
    const {step} = this.state
    switch (step){
      case 0:
        return (<button type="submit" className="btn btn-primary pull-right" onClick={this.toStepTwo} ref={(toStepTwoBtn)=>{this.toStepTwoBtn = toStepTwoBtn}}>确定</button>)
      case 1:
        return [
          (<button key="submit1" type="submit" className="btn btn-primary pull-right" onClick={this.handleConfirm} ref={(submitBtn)=>{this.submitBtn = submitBtn}}>确定</button>),
          (<button key="submit0" type="button" className="btn btn-warning pull-right" onClick={this.backToStepOne}>上一步</button>)
        ]
      default:
    }
  }*/
  render() {
    const {closer,message, title} = this.props
    return (
      <div className="modal fade in" styleName="modal" role="dialog">
        <div className="modal-backdrop fade in" onClick={closer}></div>
        <div className="modal-dialog modal-lg" role="document">
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={closer}><span
                aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              {this.renderSecondStep()}
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary pull-right" onClick={this.handleConfirm} ref={(submitBtn)=>{this.submitBtn = submitBtn}}>确定</button>
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
  //defaultFundOrgCode: Selector.getDefaultFundOrgCodes(state),
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE,
    matcher: ownProps.matcher
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)

