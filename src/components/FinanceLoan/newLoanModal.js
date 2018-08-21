/* eslint-disable no-undef */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Selector from '../../redux/selectors'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import SingleDatePicker from '../SingleDatePicker'
import Combobox from '../Combobox'
import AssetRelatedAccountPurposeWithAssetUserFromSelector from '../Select/AssetRelatedAccountPurposeWithAssetUserFromSelectorPage'
import FundRelatedAccountPurposeWithFundUserFromSelector from '../Select/FundRelatedAccountPurposeWithFundUserFromSelectorPage'
import LoanModal from "./loanModal";
import moment from 'moment'

class Modal extends LoanModal {
  constructor(props) {
    super(props)
    this.state.data.account_date = moment(this.now).format('YYYY-MM-DD')
    this.renderFirstStep = this.renderFirstStep.bind(this)
    this.handleAccountDatesChange = this.handleAccountDatesChange.bind(this)
    this.toStepTwo = this.toStepTwo.bind(this)
  }
  handleAccountDatesChange(value){
    this.setState({data: {...this.state.data,account_date: value}})
  }
  toStepTwo(e){
    e.preventDefault();
    e.stopPropagation();
    let message = {}, {data,loanFile} = this.state
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
      message.pay_channel = "请选择支付渠道"
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

    if (!data.account_date || !moment(data.account_date,"YYYY-MM-DD").isValid()){
      message.account_date = "必填，格式为YYYY-MM-DD"
    }

    if(Object.keys(message).length){
      this.setState({message})
    } else {
      this.setState({
        step: 1,
        message: {},
      },()=>{
        if(loanFile){
          this.handleConfirm(e)
        }
      })
    }
  }
  renderFirstStep(){
    const {defaultFundOrgCode, defaultAssetOrgCode} = this.props
    const {loanFile,message, data, loanVoucherFile, user_type} = this.state
    return (
      <div>
        <div className="form-group">
          <h4 className="col-sm-4 control-label">基本信息:</h4>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">资产方名称</label>
          <div className="col-sm-5">
            <AssetRelatedAccountPurposeWithAssetUserFromSelector onChange={this.handleHistoricalLoanAssetChange} defaultValue={this.state.data && this.state.data.asset_org_code || ""} fundOrgCode={defaultFundOrgCode} assetAccountPurpose="001" fundAccountPurpose="002" userFrom="1" noEmpty={true}/>
          </div>
          {message.asset_org_code &&
          <div className="col-sm-3"><span className="help-block">{message.asset_org_code}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">资金方名称</label>
          <div className="col-sm-5">
            <FundRelatedAccountPurposeWithFundUserFromSelector onChange={this.handleHistoricalLoanFundChange} defaultValue={this.state.data && this.state.data.fund_org_code || ""} fundOrgCode={defaultAssetOrgCode} assetAccountPurpose="001" fundAccountPurpose="002" userFrom="1" noEmpty={true}/>
          </div>
          {message.fund_org_code &&
          <div className="col-sm-3"><span className="help-block">{message.fund_org_code}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">数据来源</label>
          <div className="col-sm-5 form-text">新建</div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">出账日期</label>
          <div className="col-sm-5">
            <SingleDatePicker onDateChange={this.handleAccountDatesChange} showClearDate={true} date={this.state.data.account_date} style={{width: "172px"}}/>
          </div>
          {message.account_date &&
          <div className="col-sm-3"><span className="help-block">{message.account_date}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">出账金额（元）</label>
          <div className="col-sm-5">
            <input type="number" value={data.account_fee} onChange={this.handleHistoricalLoanInputChange("account_fee")} step="0.01"/>
          </div>
          {message.account_fee &&
          <div className="col-sm-3"><span className="help-block">{message.account_fee}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">备注</label>
          <div className="col-sm-5">
            <input type="text" maxLength="255" value={data.remark} onChange={this.handleHistoricalLoanInputChange("remark")}/>
          </div>
          {message.remark &&
          <div className="col-sm-3"><span className="help-block">{message.remark}</span></div>}
        </div>
        <div className="form-group">
          <h4 className="col-sm-4 control-label">收款账户详情:</h4>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">收款账户名称</label>
          <div className="col-sm-5">
            <input type="text" maxLength="50" value={data.real_gathering_name} onChange={this.handleHistoricalLoanInputChange("real_gathering_name")}/>
          </div>
          {message.real_gathering_name &&
          <div className="col-sm-3"><span className="help-block">{message.real_gathering_name}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">收款账户开户行</label>
          <div className="col-sm-5">
            <input type="text" maxLength="50" value={data.real_gathering_bank} onChange={this.handleHistoricalLoanInputChange("real_gathering_bank")}/>
          </div>
          {message.real_gathering_bank &&
          <div className="col-sm-3"><span className="help-block">{message.real_gathering_bank}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">收款账户号</label>
          <div className="col-sm-5">
            <input type="text" maxLength="50" value={data.real_gathering_card_no} onChange={this.handleHistoricalLoanInputChange("real_gathering_card_no")}/>
          </div>
          {message.real_gathering_card_no &&
          <div className="col-sm-3"><span className="help-block">{message.real_gathering_card_no}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">支付渠道</label>
          <div className="col-sm-5">
            <Combobox options={this.payChannelOptions} onChange={this.handlePayChannelChange} maxLength="50" defaultValue={data.pay_channel}/>
          </div>
          {message.pay_channel &&
          <div className="col-sm-3"><span className="help-block">{message.pay_channel}</span></div>}
        </div>
        <div className="form-group">
          <h4 className="col-sm-4 control-label">付款账户详情:</h4>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">付款账户名称</label>
          <div className="col-sm-5">
            <input type="text" maxLength="50" value={data.repayment_name} onChange={this.handleHistoricalLoanInputChange("repayment_name")}/>
          </div>
          {message.repayment_name &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_name}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">付款账户开户行</label>
          <div className="col-sm-5">
            <input type="text" maxLength="50" value={data.repayment_bank} onChange={this.handleHistoricalLoanInputChange("repayment_bank")}/>
          </div>
          {message.repayment_bank &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_bank}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">付款账户号</label>
          <div className="col-sm-5">
            <input type="text" maxLength="50" value={data.repayment_card_no} onChange={this.handleHistoricalLoanInputChange("repayment_card_no")}/>
          </div>
          {message.repayment_card_no &&
          <div className="col-sm-3"><span className="help-block">{message.repayment_card_no}</span></div>}
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">出账凭证</label>
          <div className="col-sm-8">
            <label htmlFor={`${this.now}loanVoucher`} className="pull-left btn icon-btn btn-default">
              <i className="fa fa-upload"></i>{loanVoucherFile ? '重新上传' : '上传凭证'}</label>
            <input type="file" className="hidden" ref={(button) => {this.loanVoucherFile = button;}} hidden
                   id={`${this.now}loanVoucher`}
                   onChange={this.handleLoanVoucherChange} onClick={this.handleLoanVoucherReset}/>
            {loanVoucherFile && <div className="pull-left form-text edi-ml">{loanVoucherFile.name}</div>}
          </div>
        </div>
        <div className="form-group">
          <h4 className="col-sm-4 control-label">上传明细:</h4>
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
  defaultAssetOrgCode: Selector.getDefaultAssetOrgCodes(state),
  defaultFundOrgCode: Selector.getDefaultFundOrgCodes(state),
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE,
    matcher: ownProps.matcher
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)
