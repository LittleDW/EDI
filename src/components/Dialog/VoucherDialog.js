import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog from './index'

class VoucherDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      card_no: props.data.card_no,
      name: props.data.name,
      bank: props.data.bank,
      real_card_no: props.data.real_card_no,
      real_name: props.data.real_name,
      real_bank: props.data.real_bank,
      voucher: {
        file: '',
        url: props.data.voucher_url
      },
      message: {
        type: 'INFO',
        text: ''
      },
      disabled: false
    }

    this.nameInputChange = this.nameInputChange.bind(this);
    this.bankInputChange = this.bankInputChange.bind(this);
    this.cardNoInputChange = this.cardNoInputChange.bind(this);
    this.realNameInputChange = this.realNameInputChange.bind(this);
    this.realBankInputChange = this.realBankInputChange.bind(this);
    this.realCardNoInputChange = this.realCardNoInputChange.bind(this);
    this.chooseFile = this.chooseFile.bind(this);
    this.showFileInfo = this.showFileInfo.bind(this);
    this.confirm = this.confirm.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      const {card_no, name, bank, voucher_url} = nextProps.data
      this.setState({...this.state, card_no, name, bank, voucher: {url: voucher_url}})
    }
  }


  nameInputChange(e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      name: e.target.value
    })
  }

  bankInputChange(e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      bank: e.target.value
    })
  }

  cardNoInputChange(e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      card_no: e.target.value
    })
  }

  realNameInputChange(e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      real_name: e.target.value
    })
  }

  realBankInputChange(e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      real_bank: e.target.value
    })
  }

  realCardNoInputChange(e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      real_card_no: e.target.value
    })
  }

  chooseFile(e, type) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files[0]
    let {voucher, message} = this.state
    if (file && file.size > 5 * 1024 * 1024) {
      this.setState({
        message: {
          ...message,
          text: '图片大小不能超过5M，请重新选择'
        }
      })
    } else {
      voucher = {
        file: file,
        url: voucher.url
      }
      this.setState({
        voucher: {...voucher}, message: {
          ...message,
          text: ''
        }
      });
    }
  }

  showFileInfo() {
    const {voucher} = this.state
    if (!voucher.file && !voucher.url) {
      return ''
    } else if (voucher.file) {
      const {file} = voucher
      return `${file.name} (${file.size > 1048576 ? (file.size / 1048576).toFixed(1) + 'M' : (file.size / 1024).toFixed(1) + 'K'})`
    } else {
      return <a href={voucher.url} target="_blank" download
                className={this.state.disableDialog ? 'disabled' : ''}>下载</a>
    }
  }

  confirm() {
    const {card_no, name, bank,real_card_no, real_name, real_bank, voucher, message} = this.state
    if (!real_name || !real_bank || !real_card_no || !name || !bank || !card_no) {
      this.setState({
        message: {
          type: 'FAIL',
          text: '必填的信息不能为空'
        }
      })
      return
    }
    if (!voucher.url && !voucher.file) {
      this.setState({
        message: {
          type: 'FAIL',
          text: '请上传您的付款凭证'
        }
      })
      return
    }
    this.setState({
      disabled: true,
      message: {
        ...message,
        text: '提交中，请稍后'
      }
    }, () => {
      this.props.confirm({
        card_no,
        name,
        bank,
        real_card_no,
        real_name,
        real_bank,
        file: voucher.file ? voucher.file : undefined,
        _row: this.props.data._row
      })
    })
  }

  render() {
    const {data} = this.props
    const {card_no, name, bank,real_card_no, real_name, real_bank, voucher, disabled, message} = this.state
    return (
      <Dialog confirm={this.confirm} closer={this.props.closer} title={this.props.title} disabled={disabled}
              message={message}>
        <div className="form-group">
          <label className="col-sm-4 control-label">对账单编号：</label>
          <div className="col-sm-5 form-text">
            {data.code}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">资金方：</label>
          <div className="col-sm-5 form-text">
            {data.fund_org_code}
          </div>
        </div>
        {data.from_date && <div className="form-group">
          <label className="col-sm-4 control-label">起始还款日：</label>
          <div className="col-sm-5 form-text">
            {data.from_date}
          </div>
        </div>}
        {data.closing_date && <div className="form-group">
          <label className="col-sm-4 control-label">截止还款日：</label>
          <div className="col-sm-5 form-text">
            {data.closing_date}
          </div>
        </div>}
        {data.settlement_month && <div className="form-group">
          <label className="col-sm-4 control-label">服务费结算月</label>
          <div className="col-sm-5 form-text">
            {data.settlement_month}
          </div>
        </div>}
        <div className="form-group">
          <label className="col-sm-4 control-label">还款总额（元）：</label>
          <div className="col-sm-5 form-text">
            {data.total_fee}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">收款账户名称<span style={{color: 'red'}}>*</span>：</label>
          <div className="col-sm-5">
            {/*{data.real_gathering_name}*/}
            <input type="text" value={real_name} onChange={this.realNameInputChange} maxLength="100"/>
            {!real_name && <span className="form-verification">必填</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">收款账户开户行<span style={{color: 'red'}}>*</span>：</label>
          <div className="col-sm-5">
            {/*{data.real_gathering_bank}*/}
            <input type="text" value={real_bank} onChange={this.realBankInputChange} maxLength="100"/>
            {!real_bank && <span className="form-verification">必填</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">收款账户号<span style={{color: 'red'}}>*</span>：</label>
          <div className="col-sm-5">
            {/*{data.real_gathering_card_no}*/}
            <input type="text" value={real_card_no} onChange={this.realCardNoInputChange} maxLength="100"/>
            {!real_card_no && <span className="form-verification">必填</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">付款账户名称<span style={{color: 'red'}}>*</span>：</label>
          <div className="col-sm-5">
            <input type="text" value={name} onChange={this.nameInputChange} maxLength="100"/>
            {!name && <span className="form-verification">必填</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">付款账户开户行<span style={{color: 'red'}}>*</span>：</label>
          <div className="col-sm-5">
            <input type="text" value={bank} onChange={this.bankInputChange} maxLength="100"/>
            {!bank && <span className="form-verification">必填</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">付款账户号<span style={{color: 'red'}}>*</span>：</label>
          <div className="col-sm-5">
            <input type="text" value={card_no} onChange={this.cardNoInputChange} maxLength="100"/>
            {!card_no && <span className="form-verification">必填</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">付款凭证<span style={{color: 'red'}}>*</span>：</label>
          <div className="col-sm-8">
            <label htmlFor="voucher" className="btn icon-btn btn-default"><i
              className="fa fa-upload"></i>{voucher.file || voucher.url ? '重新上传' : '上传'}
            </label>
            <input type="file" className="hidden" hidden id="voucher" onChange={e => this.chooseFile(e)}
                   accept="image/jpeg, image/x-png"/>
            <span style={{padding: '0 20px'}}>{this.showFileInfo()}</span>
            {/*{ && <span styleName="form-verification">必填</span>}*/}
          </div>
        </div>
      </Dialog>
    );
  }
}

VoucherDialog.propTypes = {
  data: PropTypes.object.isRequired,
  confirm: PropTypes.func.isRequired,
  closer: PropTypes.func.isRequired
};

export default VoucherDialog;
