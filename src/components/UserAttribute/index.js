import React, {Component} from "react";
import Select from "../Select";
import Dialog from "../Dialog";
import UserAttributePartnerNatureSelector from "../Select/UserAttributePartnerNatureSelectorPage";

/**
 * 作者：张宝玉
 * 模块：平台属性
 * 时间：2018-02-26
 * */

export default class UserAttribute extends Component {
  constructor(props) {
    super(props);
    this.state = {
      partnerNature: "",
      partnerNatureValue:"",
      apiData: {
        api_url: "",
        supervise_bank: ""
      },
      isDebtExchange: 1,
      isDeadlineFavor: 1,
      repaymentModes: [],
      productDeadlines: [],
      message: {
        api_url: "",
        supervise_bank: ""
      },
      confirmSave: false,

    };

    this.save = this.save.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.renderFundColumn = this.renderFundColumn.bind(this);

    this.openSaveConfirm = this.openSaveConfirm.bind(this);
    this.closeSaveConfirm = this.closeSaveConfirm.bind(this);

    this.handlePartnerNatureChange = this.handlePartnerNatureChange.bind(this);
    this.getPartnerNatures = this.getPartnerNatures.bind(this);
    this.renderPartnerNatures = this.renderPartnerNatures.bind(this);

    this.getRepaymentModes = this.getRepaymentModes.bind(this);
    this.renderRepaymentModes = this.renderRepaymentModes.bind(this);
    this.repaymentModeChange = this.repaymentModeChange.bind(this);
    this.renderProductDeadline = this.renderProductDeadline.bind(this);
    this.productDeadlineChange = this.productDeadlineChange.bind(this);
    this.renderDebtExchange = this.renderDebtExchange.bind(this);
    this.debtExchangeChange = this.debtExchangeChange.bind(this);
    this.renderDeadlineFavor = this.renderDeadlineFavor.bind(this);
    this.deadlineFavorChange = this.deadlineFavorChange.bind(this);

    var self = this;
    this.fundColumns = [
      {
        name: "supervise_bank",
        text: "监管银行",
        type: "text",
        //labelClassName: "asterisk",
        handleChange: (e) => {
          //self.state.apiData.supervise_bank = e.target.value
          let {apiData} = this.state;
          apiData.supervise_bank = e.target.value;
          this.setState({apiData});
        },
        validate: () => {
          // TODO 由于有部分资金方银行审核不及时，只好将这里放开
          /*var row = self.state.apiData;
          return ((typeof row.supervise_bank == undefined) || !row.supervise_bank) ? "必填" : null;*/
          return null
        }
      },
      {
        name: "api_url",
        text: "端口地址",
        type: "text",
        //labelClassName: "asterisk",
        handleChange: (e) => {
          //self.state.apiData.api_url = e.target.value
          let {apiData} = this.state;
          apiData.api_url = e.target.value;
          this.setState({apiData});
        },
        validate: () => {
          // TODO 由于有部分资金方银行审核不及时，只好将这里放开
          /*var row = self.state.apiData;
          return ((typeof row.api_url == undefined) || !row.api_url) ? "必填" : null;*/
          return null
        }
      },

    ];
  }

  componentWillMount() {
    window.addEventListener("click", this.clearOps);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  componentDidMount() {
    this.handleSearch();
  }

  componentWillReceiveProps(nextProps) {

  }

  renderFundColumn(column, i) {
    const {apiData, message} = this.state;
    return (
      <div className="form-group" key={i}>
        <label className={`col-sm-3 control-label ${column.labelClassName || ""}`}>{column.text}</label>
        <div className="col-sm-6">
          <input type={column.type || "text"} className="form-control" placeholder={column.text}
                 value={apiData[column.name]} onChange={column.handleChange}/>
        </div>
        {message[column.name] && <div className="col-sm-3">
          <span className="help-block">{message[column.name]}</span>
        </div>}
      </div>
    );
  }

  handleSearch() {
    this.props.searcher().promise.then((data) => {
      if (data && data.response && data.response.success) {
        let {partner_nature, is_debt_exchange, is_deadline_favor, repayment_mode, product_deadline, supervise_bank, api_url} = data.response.rows;


        this.setState({partnerNature: partner_nature});
        this.setState({isDeadlineFavor: is_deadline_favor});
        this.setState({isDebtExchange: is_debt_exchange});

        let {apiData} = this.state;
        apiData.supervise_bank = supervise_bank;
        apiData.api_url = api_url;
        this.setState({apiData});

        let arr = this.props.dictionary.filter(r => (r.table_name == "t_user_attribute")).filter(r => (r.col_name == "repayment_mode"));
        arr.forEach(item => item["checked"] = repayment_mode && repayment_mode.includes(item.para_key));
        this.setState({repaymentModes: arr});

        let arrDeadline = this.props.deadlineList;
        arrDeadline.forEach(item => item["checked"] = product_deadline && product_deadline.includes(item.deadline_id));
        this.setState({productDeadlines: arrDeadline});

      }
    });
  }


  save(e) {

    e.preventDefault();
    e.stopPropagation();
    const {_session} = this.props;
    let {message} = this.state, valid = true, validRepaymentMode = true, validDeadline = true;

    let repayment_mode = [];
    this.state.repaymentModes.forEach(item => item.checked && repayment_mode.push(item.para_key));

    let product_deadline = [];
    this.state.productDeadlines.forEach(item => item.checked && product_deadline.push(item.deadline_id));

    if (repayment_mode.length == 0) {
      this.props.setMessage("请选择还款方式", "FAIL");
      validRepaymentMode = false;
    }

    if (this.state.isDeadlineFavor == 1 && product_deadline.length == 0) {
      this.props.setMessage("请选择产品期限", "FAIL");
      validDeadline = false;
    }

    {
      _session && (_session.user_type == 2) &&
      this.fundColumns.map(r => {
        message[r.name] = r.validate();
      });

      for (var props in message) {
        if (message[props]) {
          valid = false;
        }
      }
    }

    if (validRepaymentMode && validDeadline && valid) {
      //this.setState({confirmSave: false})
      this.props.messageResetter();

      this.props.saver({
        partner_nature: this.state.partnerNatureValue,
        is_debt_exchange: this.state.isDebtExchange,
        repayment_mode: repayment_mode.join(","),
        is_deadline_favor: this.state.isDeadlineFavor,
        product_deadline: this.state.isDeadlineFavor == 1 ? product_deadline.join(",") : "",
        supervise_bank: this.state.apiData.supervise_bank,
        api_url: this.state.apiData.api_url
      }).promise.then(({response})=>{
        if(response && response.success){
          return this.props.callDic().promise.then(({response})=>{
            this.props.setMessage("平台属性更新成功", "SUCCESS")
          })
        } else {
          this.props.setMessage("平台属性更新失败", "FAIL")
        }
      });
    } else {
      this.setState({message: {...message}});
    }
  }


  getPartnerNatures() {
    var {dictionary} = this.props;
    return dictionary.filter(r => (r.table_name == "t_user_attribute")).filter(r => (r.col_name == "partner_nature"));
  }


  renderPartnerNatures() {
    //let asset = this.getPartnerNatures();
    let {partnerNature} = this.state;
    return (
      <UserAttributePartnerNatureSelector onChange={this.handlePartnerNatureChange} extValue={partnerNature} noEmpty={true}/>
      /*<Select onChange={this.handlePartnerNatureChange} defaultValue={partnerNature} noEmpty={true}
                               options={asset.map((r, i) => ({label: r.para_value, value: r.para_key}))}/>*/
    );
  }

  handlePartnerNatureChange(row) {
    let partnerNature = row.value;
    (row.value != this.state.partnerNature) && this.setState({partnerNatureValue:partnerNature});
  }

  getRepaymentModes() {
    var {dictionary} = this.props;
    return dictionary.filter(r => (r.table_name == "t_user_attribute")).filter(r => (r.col_name == "repayment_mode"));
  }

  renderRepaymentModes() {
    const {repaymentModes} = this.state;
    return repaymentModes.map((item, index) =>
      <div className="col-sm-4 checkbox" key={index}>
        <label key={index}>
          <input type="checkbox" checked={item.checked}
                 onChange={(e) => {
                   this.repaymentModeChange(e, item.para_key, index);
                 }}/>{item.para_value}
        </label>
      </div>);
  }

  repaymentModeChange(e, key, index) {
    let {repaymentModes} = this.state;
    repaymentModes[index].checked = e.target.checked;
    this.setState({repaymentModes});
    console.log(this.state.repaymentModes);
  }

  renderProductDeadline() {
    let {productDeadlines} = this.state;
    return productDeadlines.map((item, index) =>
      <div className="col-sm-3 checkbox" key={index}>
        <label>
          <input type="checkbox"
                 disabled={item.disabled == undefined ? (this.state.isDeadlineFavor == 0 ? true : false) : item.disabled}
                 checked={item.checked}
                 onChange={(e) => {
                   this.productDeadlineChange(e, item.deadline_id, index);
                 }}/>{item.deadline_name}
        </label>
      </div>
    );
  }

  productDeadlineChange(e, key, index) {
    const {productDeadlines} = this.state;

    productDeadlines[index].checked = e.target.checked;
    this.setState({productDeadlines});
    console.log(this.state.productDeadlines);
  }

  renderDebtExchange() {
    const {isDebtExchange} = this.state;
    return ([<div className="col-sm-3 radio" key={"yes"}>
        <label>
          <input type="radio" name="rdo_debt_exchange"
                 checked={isDebtExchange == 1 ? true : false}
                 onChange={(e) => {
                   this.debtExchangeChange(e, 1);
                 }}/>是
        </label>
      </div>,
        <div className="col-sm-3 radio" key={"no"}>
          <label>
            <input type="radio" name="rdo_debt_exchange"
                   checked={isDebtExchange == 0 ? true : false} onChange={(e) => {
              this.debtExchangeChange(e, 0);
            }}/>否
          </label>
        </div>
      ]
    );
  }

  debtExchangeChange(e, index) {
    let {isDebtExchange} = this.state;
    isDebtExchange = index;
    this.setState({isDebtExchange});
  }

  renderDeadlineFavor() {
    const {isDeadlineFavor} = this.state;
    return (
      [<div className="col-sm-3 radio" key={"1"}>
        <label>
          <input type="radio" name="rdo_deadline_favor"
                 checked={isDeadlineFavor == 1 ? true : false} onChange={(e) => {
            this.deadlineFavorChange(e, 1);
          }}/>有偏好
        </label>
      </div>
        ,
        <div className="col-sm-3 radio" key={"2"}>
          <label>
            <input type="radio"
                   checked={isDeadlineFavor == 0 ? true : false}
                   onChange={(e) => {
                     this.deadlineFavorChange(e, 0);
                   }}/>无偏好
          </label>
        </div>]
    );
  }

  deadlineFavorChange(e, index) {
    let {isDeadlineFavor} = this.state;
    isDeadlineFavor = index;
    this.setState({isDeadlineFavor});

    let {productDeadlines} = this.state;
    if (index == 1) {
      productDeadlines.forEach(item => item["disabled"] = false);
    }
    else {
      productDeadlines.forEach(item => item["disabled"] = true);
    }
    this.setState({productDeadlines});
    console.log(this.state.productDeadlines);
  }

  openSaveConfirm(row) {
    this.setState({confirmSave: true});
  }

  closeSaveConfirm() {
    this.setState({confirmSave: false});
  }

  render() {
    const {data, _buttons, _session} = this.props;
    var self = this;
    return (
      <div className="component">
        <div className="wrapper wrapper__no-filter-form container-fluid">
          <form className="col-sm-8  col-sm-offset-2 form-horizontal" onSubmit={this.save}>
            <legend>基本信息</legend>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                合作方性质:
              </label>
              <div className="col-sm-6">
                {this.renderPartnerNatures()}
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                是否支持债转:
              </label>
              <div className="col-sm-6">
                {this.renderDebtExchange()}
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                还款方式:
              </label>
              <div className="col-sm-8">
                {this.renderRepaymentModes()}
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <span>产品期限:</span>
              </label>
              <div className="col-sm-6">
                {this.renderDeadlineFavor()}
              </div>

            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
              </label>
              <div className="col-sm-9">
                <p className="col-sm-12 help-block text-muted">勾选表示对以下期限有特殊的要求</p>
                {this.renderProductDeadline()}
              </div>
            </div>
            {_session && (_session.user_type == 2) &&
            <legend key={"legend"}>业务端口<small className="text-muted" style={{fontSize: '14px'}}>（此业务端口包括：开户、提现、还款和受托支付授权的相关地址）</small></legend>}
            {_session && (_session.user_type == 2) && this.fundColumns.map(self.renderFundColumn)}

            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9 text-left">
                <button type="submit" className="btn icon-btn btn-primary">保存/修改</button>
              </div>

            </div>
          </form>
        </div>


        {this.state.confirmSave && <Dialog confirm={(e) => {
          self.save(e);
          self.closeSaveConfirm();
        }} title="请确认" closer={this.closeSaveConfirm} size="modal-md">
          确定要保存么?
        </Dialog>}

      </div>
    );
  }
}

