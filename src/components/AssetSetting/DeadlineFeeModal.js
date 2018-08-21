import React, {Component} from "react";
import PropTypes from "prop-types";
import {FormatDeadline} from "../Formatter";

class DeadlineFeeModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      _row: props._row
    }

  }

  updateAssetFee = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let value = e.target.value;
    if (isNaN(value)) {
      return;
    }
    if (Number(e.target.value) < 0) {
      e.target.value *= -1;
    } else if (Number(e.target.value) > 1000000) {
      e.target.value = 1000000;
    }
    const {_row} = this.state;
    _row.asset_fee = Number(e.target.value);
    this.setState({_row});
  };

  updateFundFee = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let value = e.target.value;
    if (isNaN(value)) {
      return;
    }
    if (Number(e.target.value) < 0) {
      e.target.value *= -1;
    } else if (Number(e.target.value) > 1000000) {
      e.target.value = 1000000;
    }
    const {_row} = this.state;
    _row.fund_fee = Number(e.target.value);
    this.setState({_row});
  };

  captchaInputChange = (e) => {
    if (isNaN(e.target.value)) {
      return;
    }
    const {_row} = this.state;
    let _row0 = {..._row};
    _row0["_captcha"] = e.target.value;
    this.setState({
      _row: _row0
    });
  };

  update = () => {
    const {_row} = this.state
    const {enableCaptcha} = this.props
    if (enableCaptcha && (!_row._captcha || _row._captcha.length !== 6)) {
      return
    }
    this.props.update(_row)
  }

  render() {
    const {_session, title, captchaSetting, enableCaptcha} = this.props
    const {user_type} = _session
    const {_row} = this.state
    return (
      <div className="modal fade fade in edi-dialog" role="dialog">
        <div className="modal-backdrop fade in" onClick={this.props.hideMode}></div>
        <div className="modal-dialog modal-lg" role="document">
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={this.props.hideMode}><span
                aria-hidden="true">×</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              <div className='block'>
                {user_type !== 2 && <div className="form-group">
                  <label className="col-sm-4 control-label">资金方:</label>
                  <div className="col-sm-5 form-text">
                    {_row.fund_name}
                  </div>
                </div>}
                {user_type !== 1 && <div className="form-group">
                  <label className="col-sm-4 control-label">资产方:</label>
                  <div className="col-sm-5 form-text">
                    {_row.asset_name}
                  </div>
                </div>}
                <div className="form-group">
                  <label className="col-sm-4 control-label">调整时间:</label>
                  <div className="col-sm-5 form-text">
                    {_row.match_date}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">产品期限:</label>
                  <div className="col-sm-5 form-text">
                    <FormatDeadline value={_row.deadline_id}/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">资产方供给量（万元）:</label>
                  {user_type !== 2 && <div className="col-sm-4">
                    <input type="text" value={_row.asset_fee} onChange={this.updateAssetFee}/>
                  </div>}
                  {user_type === 2 && <div className="col-sm-5 form-text">
                    {_row.asset_fee}
                  </div>}
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">资金方募集量（万元）:</label>
                  {user_type !== 1 && <div className="col-sm-4">
                    <input type="text" value={_row.fund_fee} onChange={this.updateFundFee}/>
                  </div>}
                  {user_type === 1 && <div className="col-sm-5 form-text">
                    {_row.fund_fee}
                  </div>}
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">目标匹配量/日（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.max_fee}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">最小匹配量/日（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.min_fee}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">已匹配量/日（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.finish_max_fee}
                  </div>
                </div>
                {enableCaptcha && <div className="form-group">
                  <label className="col-sm-4 control-label">联系人:</label>
                  <div className="col-sm-5 form-text">
                    {_session.user_name}
                  </div>
                </div>}
                {enableCaptcha && <div className="form-group">
                  <label className="col-sm-4 control-label">手机号:</label>
                  <div className="col-sm-2 form-text">
                    {_session.mobile}
                  </div>
                  <div className="col-sm-4">
                    <button className="btn btn-default" type={"button"} disabled={captchaSetting.capDisabled}
                            onClick={this.props.sendCaptcha}>{!captchaSetting.capDisabled ? "发送验证码" : `${captchaSetting.count}秒后重新发送`}</button>
                  </div>
                </div>}
                {enableCaptcha && <div className="form-group">
                  <label className="col-sm-4 control-label">验证码:</label>
                  <div className="col-sm-4">
                    <input type="text" placeholder={"请输入短信验证码"} maxLength={6} onChange={this.captchaInputChange}
                           value={_row["_captcha"] ? _row["_captcha"] : ''}/>
                  </div>
                  {!_row["_captcha"] && <div className="col-sm-3 form-text">
                    <span>必填</span>
                  </div>}
                  {_row["_captcha"] && _row['_captcha'].length != 6 && <div className="col-sm-3 form-text">
                    <span>验证码为6位数字</span>
                  </div>}
                </div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary pull-right" onClick={this.update}>确定</button>
              <button type="button" className="btn btn-default pull-right" onClick={this.props.hideMode}>关闭</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

DeadlineFeeModal.propTypes = {
  title: PropTypes.string.isRequired,
  _row: PropTypes.object.isRequired,
  _session: PropTypes.object.isRequired,
  captchaSetting: PropTypes.object.isRequired,
  enableCaptcha: PropTypes.bool.isRequired,
  update: PropTypes.func.isRequired,
  sendCaptcha: PropTypes.func.isRequired,
  hideMode: PropTypes.func.isRequired,
};

export default DeadlineFeeModal;
