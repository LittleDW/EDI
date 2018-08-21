import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import UserTypeSelector from '../Select/UserTypeSelectorPage'
import OrgRelatedUserTypeSelector from '../Select/OrgRelatedUserTypeSelectorPage'
import SingleDatePicker from '../SingleDatePicker'
import moment from 'moment'

const defaultUserType = [1,2]

class PayModal extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleOrgChange = this.handleOrgChange.bind(this)
    this.handleUserTypesChange = this.handleUserTypesChange.bind(this)
    this.handlePayInputChange = this.handlePayInputChange.bind(this)
    this.isOutsideRange = this.isOutsideRange.bind(this)

    this.state = {
      userType: "",
      orgCode: "",
      data:{
        org_code: "",
        pay_date: "",
        pay_fee: "",
        comment: "",
      },
      message:{
        org_code: "",
        pay_date: "",
        pay_fee: "",
        comment: "",
      },
    }
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

    const {confirm} = this.props
    let {orgCode, data} = this.state

    let message = {}
    if (!orgCode){
      message.org_code = "必填"
    }
    if (!data.pay_date){
      message.pay_date = "必填"
    }
    if(!data.pay_fee || isNaN(data.pay_fee) || (Math.abs(parseInt(data.pay_fee)) > 1000000000) || (!/^-?\d+$/.test(data.pay_fee))){
      message.pay_fee = "必填，整数且绝对值不大于10亿"
    }
    if (data.comment && data.comment.length > 255){
      message.comment = "字数不能大于255"
    }

    if(Object.keys(message).length){
      this.setState({message})
    } else {
      this.setState({message: {}}, confirm(e, {...data, org_code: orgCode}))
    }
  }

  handleOrgChange(row) {
    this.setState({orgCode: row.value})
  }

  handleUserTypesChange(row) {
    this.setState({userType: row.value})
  }

  handlePayInputChange(input){
    return (e)=>{
      let value = e.target.value
      this.setState({data: {...this.state.data,[input]: (isNaN(value) || (value===""))? value : Number(value)}})
    }
  }

  isOutsideRange(date) {
    const thisMonthFirstDay = moment().startOf('month');
    const thisMonthLastDay = moment().endOf('month');
    return (date.isBefore(thisMonthFirstDay) || date.isAfter(thisMonthLastDay))?true:false
  }

  render() {
    const {closer, message, title} = this.props
    let {data, message: messageCol} = this.state
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
                  <div className="col-sm-5"><UserTypeSelector onChange={this.handleUserTypesChange} allowedType={defaultUserType}/></div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label asterisk">合作方名称</label>
                  <div className="col-sm-5"><OrgRelatedUserTypeSelector onChange={this.handleOrgChange} userType={this.state.userType} defaultUserTypes={defaultUserType}/></div>
                  {messageCol.org_code &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.org_code}</span></div>}
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label asterisk">缴费日期</label>
                  <div className="col-sm-5"><SingleDatePicker onDateChange={(value) => (this.state.data.pay_date = value)} showClearDate={true} style={{width: "172px"}} isOutsideRange={this.isOutsideRange}/></div>
                  {messageCol.pay_date &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.pay_date}</span></div>}
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label asterisk">缴费金额(元)</label>
                  <div className="col-sm-5"><input type="number" value={data.pay_fee} onChange={this.handlePayInputChange("pay_fee")}/></div>
                  {messageCol.pay_fee &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.pay_fee}</span></div>}
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">备注</label>
                  <div className="col-sm-5"><input type="text" maxLength="255" value={data.comment} onChange={this.handlePayInputChange("comment")}/></div>
                  {messageCol.comment &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.comment}</span></div>}
                </div>
              </div>
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
PayModal.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE: PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message || state.message,
  _session: state._session,
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PayModal)

