import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import Combobox from '../Combobox'
import tableStyle from "../Datatable/style.scss"
import CSSModules from 'react-css-modules'
import {FormatPlatformPayMode} from '../Formatter'
import moment from 'moment'
import {formatNumber} from '../../utils/etc'

@CSSModules(tableStyle, {allowMultiple: true})
class PayNoticeModal extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session
    this.handleConfirm = this.handleConfirm.bind(this)
    this.renderPattern = this.renderPattern.bind(this)
    this.handleMailToChange = this.handleMailToChange.bind(this)
    this.handleMailCcChange = this.handleMailCcChange.bind(this)
    this.getEmailOptions = this.getEmailOptions.bind(this)

    this.state = {
      data:{
        mail_to: "",
        mail_cc: "",
      },
      message:{
        mail_to: "",
        mail_cc: "",
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

    const {confirm, data: propData} = this.props
    let {data} = this.state

    let message = {}
    if (!data.mail_to){
      message.mail_to = "必填"
    }

    if(Object.keys(message).length){
      this.setState({message})
    } else {
      this.setState({message: {}}, confirm(e, {...propData, ...data}))
    }
  }

  handleMailToChange = (value) => {
    this.setState({data: {...this.state.data, mail_to: value}})
  }

  handleMailCcChange = (value) => {
    this.setState({data: {...this.state.data, mail_cc: value}})
  }

  getEmailOptions() {
    const {emails} = this.props
    let emailOptions = []
    if (emails && emails.length > 0) {
      emails.map(r=>{
        let option = {label: r.email, value: r.email}
        emailOptions.push(option)
      })
    }
    return emailOptions
  }

  renderPattern(){
    const {data} = this.props
    return [
      (<div className="form-group" key="patternTitle">
        <label className="col-sm-1 control-label">正文预览:</label>
      </div>),
      (data.platform_pay_mode == '001' &&
        <div className="row" key="patternBody">
          <label className="col-sm-1 control-label"></label>
          <div className="col-sm-11">
            {data.user_name}：<br/>
            <span style={{marginLeft: '15px'}}>您好！</span><br/>
            <span style={{marginLeft: '15px'}}>以下是贵公司{moment(data.month).format('YYYY年MM月')}的融数信息交互平台服务费账单，明细如下：</span><span style={{paddingRight: '15px'}} className="pull-right">单位：元</span><br/>
            <div style={{marginLeft: '15px',  overflow:'auto'}}>
              <table className={tableStyle.datatable}>
                <thead>
                <tr>
                  <th>账单截止日</th>
                  <th>费用缴纳方式</th>
                  <th>平台使用费率</th>
                  <th>本月平台个人订单金额</th>
                  <th>本月平台企业订单金额</th>
                  <th>本月减免平台订单金额</th>
                  <th>本月平台使用费</th>
                  <th>本月缴费金额</th>
                  <th>上月账户余额</th>
                  <th>本月账户余额</th>
                  <th>本月应付总额</th>
                  <th>备注</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>{data.month}</td>
                  <td><FormatPlatformPayMode value={data.platform_pay_mode}/></td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.platform_use_rate)}%</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.person_order_fee)}</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.enterprise_order_fee)}</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.order_reduce_fee)}</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.platform_use_fee)}</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.finish_pay_fee)}</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.last_balance_fee)}</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.balance_fee)}</td>
                  <td style={{textAlign:'right'}}>{formatNumber(data.need_pay_fee)}</td>
                  <td>{data.comment}</td>
                </tr>
                </tbody>
              </table>
            </div><br/>
            <span style={{marginLeft: '25px'}}>说明：</span><br/>
            <span style={{marginLeft: '35px'}}>本月账户余额 = 上月账户余额 + 本月缴费金额</span><br/>
            <span style={{marginLeft: '35px'}}>本月应付总额 = 本月平台使用费 - 本月账户余额</span><br/><br/>
            <span style={{marginLeft: '15px'}}>贵公司本月账户余额已不足5万元，请于三个工作日内预缴约一个月的平台使用费{Math.ceil((50000-data.balance_fee+data.platform_use_fee)/10000)}万元至如下账户，以免影响</span><br/>
            <span style={{marginLeft: '15px'}}>信息交互平台的正常使用，谢谢！</span><br/>
            <span style={{marginLeft: '25px'}}>账户名称：融数信息科技集团有限公司</span><br/>
            <span style={{marginLeft: '25px'}}>开户行：平安银行北京分行营业部</span><br/>
            <span style={{marginLeft: '25px'}}>账号：11015089146001</span><br/><br/>
            <span style={{marginLeft: '15px'}}>如有疑问，请及时联系：郭兰兰 edi@rongcapital.cn，guolanlan@rongcapital.cn  联系电话：13701223706。</span>
          </div>
        </div>
      ),
      (data.platform_pay_mode == '002' &&
        <div className="row" key="patternBody">
          <label className="col-sm-1 control-label"></label>
          <div className="col-sm-11">
            {data.user_name}：<br/>
            <span style={{marginLeft: '15px'}}>您好！</span><br/>
            <span style={{marginLeft: '15px'}}>以下是贵公司{moment(data.month).format('YYYY年MM月')}的融数信息交互平台服务费账单，明细如下：</span><span style={{paddingRight: '15px'}} className="pull-right">单位：元</span><br/>
            <div style={{marginLeft: '15px',  overflow:'auto'}}>
              <table style={{marginLeft: '15px'}} className={tableStyle.datatable}>
                <thead>
                  <tr>
                    <th>账单月份</th>
                    <th>费用缴纳方式</th>
                    <th>平台使用费率</th>
                    <th>本月平台个人订单金额</th>
                    <th>本月平台企业订单金额</th>
                    <th>本月减免平台订单金额</th>
                    <th>本月平台使用费</th>
                    <th>本月缴费金额</th>
                    <th>上月账户余额</th>
                    <th>本月账户余额</th>
                    <th>本月应付总额</th>
                    <th>结算截止日</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.month}</td>
                    <td><FormatPlatformPayMode value={data.platform_pay_mode}/></td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.platform_use_rate)}%</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.person_order_fee)}</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.enterprise_order_fee)}</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.order_reduce_fee)}</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.platform_use_fee)}</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.finish_pay_fee)}</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.last_balance_fee)}</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.balance_fee)}</td>
                    <td style={{textAlign:'right'}}>{formatNumber(data.need_pay_fee)}</td>
                    <td>{data.pay_deadline_date}</td>
                  </tr>
                </tbody>
              </table>
            </div><br/>
            <span style={{marginLeft: '25px'}}>说明：</span><br/>
            <span style={{marginLeft: '35px'}}>本月账户余额 = 上月账户余额 + 本月缴费金额</span><br/>
            <span style={{marginLeft: '35px'}}>本月应付总额 = 本月平台使用费 - 本月账户余额</span><br/><br/>
            <span style={{marginLeft: '15px'}}>请贵公司于{moment(data.pay_deadline_date).format('YYYY年MM月DD日')}前将足额款项支付至如下账户，以免产生逾期违约金并影响信息交互平台的正常使用：</span><br/>
            <span style={{marginLeft: '25px'}}>账户名称：融数信息科技集团有限公司</span><br/>
            <span style={{marginLeft: '25px'}}>开户行：平安银行北京分行营业部</span><br/>
            <span style={{marginLeft: '25px'}}>账号：11015089146001</span><br/><br/>
            <span style={{marginLeft: '15px'}}>如有疑问，请及时联系：郭兰兰 edi@rongcapital.cn，guolanlan@rongcapital.cn  联系电话：13701223706。</span>
          </div>
        </div>
      ),
    ]
  }

  render() {
    const {closer, message, title} = this.props
    let {message: messageCol} = this.state

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
              <div className="filter-form">
                <div className="form-group">
                  <h5 className="col-sm-8">发送邮件通知对方进行缴费，请先填写邮箱地址(多邮箱请用逗号分割):</h5>
                </div>
                <div className="form-group">
                  <label className="col-sm-1 control-label asterisk">收件人</label>
                  <div className="col-sm-8"><Combobox options={this.getEmailOptions()||[]} onChange={this.handleMailToChange} multiple={true}/></div>
                  {messageCol.mail_to &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.mail_to}</span></div>}
                </div>
                <div className="form-group">
                  <label className="col-sm-1 control-label">抄送</label>
                  <div className="col-sm-8"><Combobox options={this.getEmailOptions()||[]} onChange={this.handleMailCcChange} multiple={true}/></div>
                  {messageCol.mail_cc &&
                  <div className="col-sm-3"><span className="help-block">{messageCol.mail_cc}</span></div>}
                </div>
              </div>
              <div className="filter-form">
                {this.renderPattern()}
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
PayNoticeModal.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE: PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message || state.message,
  _session: state._session,
  emails: state.platformUseFee.emails,
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PayNoticeModal)

