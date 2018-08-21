import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import PlatformPayModeSelector from '../Select/PlatformPayModeSelectorPage'
import {FormatUserType} from '../Formatter'
import YearMonthSelector from './YearMonthSelector'
import Selector from '../../redux/selectors'
import moment from 'moment'

class FeePatternModal extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handlePlatformPayModeChange = this.handlePlatformPayModeChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleStatusChange = this.handleStatusChange.bind(this)
    this.renderPlatformPayScope = this.renderPlatformPayScope.bind(this)
    this.handleCheckAll = this.handleCheckAll.bind(this)
    this.checkAllChecked = this.checkAllChecked.bind(this)
    this.calculateYearList = this.calculateYearList.bind(this)

    this.state = {
      platformPayMode: "",
      data:{
        user_type: "",
        user_name: "",
        platform_pay_mode: "",
        platform_use_rate: "",
        adjust_platform_use_rate: "",
        adjust_effect_month: "",
      },
      message:{
        platform_pay_mode: "",
        adjust_platform_use_rate: "",
        adjust_effect_month: "",
      },
    }

    const {data, orderStatus} = props
    this.state.data = {...data}
    let checkedStatus = new Set()
    if (data && data.platform_pay_scope) {
      checkedStatus = new Set(data.platform_pay_scope.split(";"))
    }

    orderStatus.map((row, i) => {
      if(checkedStatus.has(row.value)) {
        row._checked = true
      } else {
        row._checked = false
      }
    })
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
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

  handleConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const {confirm, orderStatus} = this.props
    let {orgCode, data, platformPayMode} = this.state

    let message = {}
    if (!platformPayMode){
      message.platform_pay_mode = "必填"
    }

    if(data.adjust_platform_use_rate && (isNaN(data.adjust_platform_use_rate) || (parseInt(data.adjust_platform_use_rate) > 1000000000) || (!/^[0-9]*(\.\d{1,3})?$/.test(data.adjust_platform_use_rate)))){
      message.adjust_platform_use_rate = "数值，且整数部分不可大于10亿，且小数部分最多3位"
    }

    if (moment(data.adjust_effect_month).isBefore(moment())){
      message.adjust_effect_month = "调整后费率开始时间必须大于当前月"
    }

    let platformPayScopeArr = new Array()
    orderStatus.filter(r=>r._checked).map(r=>{platformPayScopeArr.push(r.value)})
    let platformPayScope = platformPayScopeArr.join(";")

    if(Object.keys(message).length){
      this.setState({message})
    } else {
      this.setState({message: {}}, confirm(e, {...data, platform_pay_mode: platformPayMode, platform_pay_scope: platformPayScope}))
    }
  }

  handlePlatformPayModeChange(row) {
    this.setState({platformPayMode: row.value})
  }

  handleInputChange(input){
    return (e)=>{
      let value = e.target.value
      this.setState({data: {...this.state.data,[input]: (isNaN(value) || (value===""))? value : Number(value)}})
    }
  }

  handleDateChange({year, month}) {
    this.setState({data: {...this.state.data, adjust_effect_month: `${year}-${month}`}})
  }

  handleCheckAll(e){
    const {orderStatus} = this.props
    var unchecked = orderStatus.filter(r=>!r._checked)
    if(unchecked.length){
      orderStatus.map(r=>{r._checked = true})
    } else {
      orderStatus.map(r=>{r._checked = false})
    }
    this.forceUpdate()
  }
  checkAllChecked(e){
    const {orderStatus} = this.props
    return orderStatus.filter(r=>!r._checked).length == 0
  }

  handleStatusChange(e, row) {
    row._checked = !row._checked
    this.forceUpdate()
  }

  calculateYearList() {
    const nextMonth = moment().add(1, 'months')
    const year = nextMonth.year()
    let yearList = []
    for (let i = year; i <= year + 1; i++) {
      yearList.push({
        label: `${i} 年`,
        value: `${i}`
      })
    }
    return yearList
  }

  renderPlatformPayScope() {
    const {orderStatus} = this.props
    return (
      <div>
        {orderStatus && orderStatus.map((row, i) => {
          return <div className="checkbox col-sm-3" key={i}><label style={{"userSelect":"none"}}><input type="checkbox" checked={row._checked} onChange={e => this.handleStatusChange(e, row)}/>{row.label}</label></div>
        })}
      </div>
    )
  }

  render() {
    const {closer, message, title} = this.props
    let {message: messageCol,data} = this.state
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
              <div className="block relation-block">
                <div className="form-group">
                  <label className="col-sm-4 control-label">合作方类型</label>
                  <div className="col-sm-5 form-text"><FormatUserType value={data.user_type}/></div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">合作方名称</label>
                  <div className="col-sm-5 form-text"><span>{data.user_name}</span></div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label asterisk">费用缴纳方式</label>
                  <div className="col-sm-5"><PlatformPayModeSelector onChange={this.handlePlatformPayModeChange} extValue={data.platform_pay_mode} noEmpty={true}/></div>
                  {messageCol.platform_pay_mode &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.platform_pay_mode}</span></div>}
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">当前平台使用费率(%)</label>
                  <div className="col-sm-5 form-text"><span>{data.platform_use_rate}</span></div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">调整后平台使用费率(%)</label>
                  <div className="col-sm-5" style={{width: '190px'}}><input type="number" maxLength="255" value={data.adjust_platform_use_rate} onChange={this.handleInputChange("adjust_platform_use_rate")}/></div>
                  {messageCol.adjust_platform_use_rate &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.adjust_platform_use_rate}</span></div>}
                </div>
                {(data.adjust_platform_use_rate !== '' && data.adjust_platform_use_rate !== null && data.adjust_platform_use_rate !== undefined) && <div className="form-group">
                  <label className="col-sm-4 control-label">调整后费率生效时间</label>
                  <div className="col-sm-5"><YearMonthSelector handleDateChange={this.handleDateChange} defaultYear={data.adjust_effect_month?data.adjust_effect_month.split("-")[0]:undefined} defaultMonth={data.adjust_effect_month?data.adjust_effect_month.split("-")[1]:new Date().getMonth() + 2} calculateYearList={this.calculateYearList()} optionStyle={{maxHeight: '220px'}}/></div>
                  {messageCol.adjust_effect_month &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.adjust_effect_month}</span></div>}
                </div>}
                <div className="form-group">
                  <legend className="col-sm-7 col-sm-offset-2" style={{marginBottom: '5px'}}><p style={{fontSize: '1rem',margin:'5px 0'}}>平台使用费统计范围<span style={{fontSize: '12px', padding: '10px'}}>(立即生效)</span></p></legend>
                  <div className="checkbox col-sm-3" style={{position:'relative', top: '0', right: '30%'}}><label style={{"userSelect":"none"}}><input type="checkbox" onChange={this.handleCheckAll} checked={this.checkAllChecked()}/> 全选</label></div>
                  <div className="col-sm-7 col-sm-offset-2" style={{paddingLeft:'0'}}>
                    {this.renderPlatformPayScope()}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary pull-right" onClick={this.handleConfirm} ref={(submitBtn)=>{this.submitBtn = submitBtn}}>确定</button>
              <button type="button" className="btn btn-default pull-right" onClick={closer}>关闭</button>
              {message && message.text && (message.type == "FAIL") &&
              <p className="text-danger dialog-message"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type == "INFO") &&
              <p className="text-info dialog-message"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type == "SUCCESS") &&
              <p className="text-success dialog-message"><i className="fa fa-warning"></i> {message.text}</p>}
            </div>
          </form>
        </div>
      </div>
    )
  }
}
FeePatternModal.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE: PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message || state.message,
  _session: state._session,
  orderStatus: Selector.getOrderStatus(state),
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeePatternModal)

