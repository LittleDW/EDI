import React, {Component} from 'react'
import FileSaver from 'file-saver'
import Modal from './table-model'
//import FundRelatedSelector from '../Select/FundRelatedSelectorPage'
import FundRelatedUserFromSelector from '../Select/FundRelatedUserFromSelectorPage'
import AssetSelector from '../Select/AssetSelectorPage'
import AssetUserFromSelector from '../Select/AssetUserFromSelectorPage'
import {FormatOrgCode,FormatOrderCreditOrg} from '../Formatter'
import Datatable from '../Datatable'
import style from '../SupplementAssetOrder/style.scss'
import CSSModules from "react-css-modules/dist/index";
import {fastExport} from '../../utils/etc'

@CSSModules(style, {allowMultiple: true})
class CreateAssetOrder extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props.session, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      showMode: false,
      assetOrgCode: (user_type === 1)? session.org_code:'',
      fundOrgCode:(user_type === 2)? session.org_code:'',
      xslx: null,
      progress:null,
      createTab: 0
    }
    this.xhr = null
    this.tableColumns = [
      { text: '资产方订单号', name: 'asset_order_no' },
      { text: '借款日期', name: 'borrow_date' },
      { text: '借款主体类型', name: 'borrow_type' },
      { text: '借款人名称', name: 'borrow_name' },
      { text: '借款人证件类型', name: 'borrow_certificate_type' },
      { text: '借款人证件号', name: 'borrow_certificate_no' },
      { text: '借款人银行预留手机号', name: 'borrow_phone' },
      { text: '借款人邮箱', name: 'borrow_mail' },
      { text: '借款人开户行', name: 'borrow_bank' },
      { text: '借款人银行卡类型', name: 'borrow_card_type' },
      { text: '借款人银行卡号', name: 'borrow_card_no' },
      { text: '借款人所属地区', name: 'borrow_area' },
      { text: '借款人工作地址', name: 'borrow_work_address' },
      { text: '借款人家庭地址', name: 'borrow_family_address' },
      { text: '借款人户籍地址', name: 'borrow_census_address' },
      { text: '借款用途', name: 'borrow_purpose' },
      { text: '借款金额（元）', name: 'borrow_fee' ,renderDom: row => isNaN(row.borrow_fee)?0:Number((Number(row.borrow_fee)/100).toFixed(2))},
      { text: '借款期限单位', name: 'borrow_period' },
      { text: '借款期限', name: 'borrow_deadline' },
      { text: '借款人授信额度（元）', name: 'borrow_credit_fee',renderDom: row => isNaN(row.borrow_credit_fee)?0:Number((Number(row.borrow_credit_fee)/100).toFixed(2))},
      { text: '借款人征信报告情况', name: 'borrow_credit_report' },
      { text: '借款人收入情况', name: 'borrow_income_report' },
      { text: '借款支付方式', name: 'borrow_pay_mode' },
      { text: '收款账号名称', name: 'gathering_name' },
      { text: '收款账户开户行', name: 'gathering_bank' },
      { text: '收款账户号', name: 'gathering_card_no' },
      { text: '业务类型', name: 'business_type' },
      { text: '还款方式', name: 'repayment_mode' },
      { text: '征信信息集合', name: 'credit_info_details',renderDom: row => row.credit_info_details && row.credit_info_details.replace(/^(.{5}).+$/,"$1...") || ""},
      { text: '借款人职业', name: 'occupation' },
      { text: '还款来源', name: 'repayment_from'},
      { text: '授信机构', name: 'credit_org', renderDom: row => <FormatOrderCreditOrg value={row.credit_org}/>},
      { text: '授信评分', name: 'credit_score' },
      { text: '被法院执行总次数', name: 'court_exec_count',},
    ]
    this.matchTableColumns = [
      { text: '匹配状态', name: 'business_type',renderDom: row => row._reason || "匹配成功" },
      ...this.tableColumns
    ]
    this.succceedAssetOrderColumns = [
      { text: '资产方', name: 'asset_org_code', renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      { text: '资产方订单号', name: 'asset_order_no' },
      { text: '资金方', name: 'fund_org_code', renderDom: row => <FormatOrgCode value={row.fund_org_code}/>},
      { text: '资金方订单号', name: 'fund_order_no' },
      { text: '借款人名称', name: 'borrow_name' },
      { text: '借款人证件号', name: 'borrow_certificate_no' },
    ]
    this.faiedAssetOrderColumns = [
      { text: '资产方', name: 'asset_order_no', renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      { text: '资产方订单号', name: 'asset_order_no' },
      { text: '借款人名称', name: 'borrow_name' },
      { text: '借款人证件号', name: 'borrow_certificate_no' },
      { text: '失败原因', name: '_reason' }
    ]
    this.hideMode = this.hideMode.bind(this)
    this.showMode = this.showMode.bind(this)
    this.handleAssetUserChange = this.handleAssetUserChange.bind(this)
    this.handleAttachmentChange = this.handleAttachmentChange.bind(this)
    this.handleAssetOrderChange = this.handleAssetOrderChange.bind(this)
    this.handleFundUserChange = this.handleFundUserChange.bind(this)
    this.handleAssetOrderReset = this.handleAssetOrderReset.bind(this)
    this.handleAttachmentReset = this.handleAttachmentReset.bind(this)
    this.handleMatchAssetOrder = this.handleMatchAssetOrder.bind(this)
    this.handleCreateAssetOrder = this.handleCreateAssetOrder.bind(this)
    this.selectCreateTab = this.selectCreateTab.bind(this)
    this.exportResult = this.exportResult.bind(this)
    this.handleProgress = this.handleProgress.bind(this)
    this.renderHint = this.renderHint.bind(this)
  }

  componentWillMount() {
    this.now = new Date().getTime()
  }
  componentDidMount() {
    /*this.uploadOrderButton.setAttribute("webkitdirectory",true)
    this.uploadOrderButton.setAttribute("mozdirectory",true)
    this.uploadOrderButton.setAttribute("directory",true)*/
    this.uploadAttachmentButton.setAttribute("webkitdirectory",true)
    this.uploadAttachmentButton.setAttribute("mozdirectory",true)
    this.uploadAttachmentButton.setAttribute("directory",true)
  }
  componentWillUpdate(newProps, newState){
    const {assetOrders:newAssetOrders, message:newMessage} = newProps
    const {showMode,createTab} = this.state
    const {assetOrders,message} = this.props
    !assetOrders.matched.length && newAssetOrders.matched.length && newAssetOrders.matched.map(r=>(r._checked = true))

    if(!showMode && (newAssetOrders !== assetOrders)){
      this.setState({showMode: true})
    }
    /*if(newAssetOrders && newAssetOrders.job_done && createTab && assetOrders.succeed && assetOrders.succeed.length){
      this.setState({createTab: 0})
    }*/
    /*if(progress && !newAssetOrders.creating){
      this.setState({progress: null})
    }*/
  }
  componentWillUnmount() {
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    resetAssetOrder()
  }
  handleFundUserChange(row){
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    this.setState({fundOrgCode:row.value})
    resetAssetOrder()
  }
  handleAssetUserChange(row){
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    this.setState({assetOrgCode:row.value})
    resetAssetOrder()
  }
  handleAssetOrderChange(e) {
    e.preventDefault();
    e.stopPropagation();
    var file = e.currentTarget.files[0]
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    this.setState({
      xslx: file
    })
    resetAssetOrder()
    //test.multipartUpload("a",file)
  }
  handleAssetOrderReset(e){
    const {xslx} = this.state
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    if(xslx){
      this.uploadOrderButton.value = ""
      this.setState({xslx:null},resetAssetOrder)
    }
  }
  handleAttachmentChange(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.currentTarget.files
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    this.setState({
      attachment: Array.from(files)
    })
    resetAssetOrder()
  }
  handleAttachmentReset(e){
    const {attachment} = this.state
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    if(attachment&&attachment.length){
      this.uploadAttachmentButton.value = ""
      this.setState({attachment:null},resetAssetOrder)
    }
  }
  handleMatchAssetOrder(e) {
    e.preventDefault();
    e.stopPropagation();
    const {xslx,attachment,showMode} = this.state
    const {setMessage, matchAssetOrder, assetOrders} = this.props
    let self = this
    if(!showMode && (assetOrders.matched.length || assetOrders.unmatched.length)){
      this.setState({showMode:true})
      return
    }
    let runner = ()=>{
      if(xslx && attachment && !assetOrders.matched.length){
        var formData = new FormData();
        formData.append("xslx", xslx);
        formData.append("voucher",new Blob([JSON.stringify(attachment.map(r=>r.name))], { type: "text/plain"}))
        self.xhr = matchAssetOrder(formData).xhr
      } else if (assetOrders.matched.length){
        self.showMode()
      } else {
        setMessage("请确认模板文件以及资料包是否挂载","FAIL")
      }
    }
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
      /** 错开一次更新，防止跟接口取消混淆 */
      setTimeout(runner)
    } else {
      runner()
    }
  }
  handleCreateAssetOrder(e) {
    e.preventDefault();
    e.stopPropagation();
    const {setMessage, createAssetOrder, assetOrders,resetAssetOrder} = this.props
    let {assetOrgCode, fundOrgCode, attachment} = this.state
    let orders = assetOrders.matched.filter(r=>r._checked)
    let self = this
    let runner = ()=>{
      if(attachment && orders.length){
        var formData = new FormData();
        formData.append("org_code", assetOrgCode)
        formData.append("fund_org_code", fundOrgCode)
        let checkedOrders = orders.filter(r=>r._checked), uploadingAttachment = [ ...new Set([].concat.apply([], checkedOrders.map(r=>r.borrow_voucher_details))) ]
        formData.append("orders", JSON.stringify(checkedOrders))
        attachment.filter(r=>uploadingAttachment.includes(r.name)).map(r=>{
          formData.append("attachment", r);
        })
        let api = createAssetOrder(formData,{onProgress: self.handleProgress/*,socket:{
          handler: self.handleAPIProgress
        }*/})
        self.xhr = api.xhr
        api.promise.then(()=>{
          self.setState({progress: null,apiProgress:null})
        })
        /*self.xhr = createAssetOrder(formData,{onProgress: self.handleProgress,socket:{
          event:"order-creating-progress",
          handler:self.handleAPIProgress
        }}).xhr*/
      } else {
        setMessage("请确认匹配结果是否存在，是否勾选以及资料包是否已挂载","FAIL")
      }
    }
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    resetAssetOrder()
    /** 错开一次更新，防止跟接口取消混淆 */
    setTimeout(runner)
  }
  handleProgress(e) {
    if(this._reactInternalInstance){
      this.setState({
        progress: {total:e.total, loaded: e.loaded, percent: `${Math.floor(100*e.loaded/e.total)}%`}
      })
    }
  }
  handleAPIProgress = (percent)=>{
    this.setState({
      apiProgress: percent
    })
  }
  /*handleCreatingAssetOrder(e) {
    if(this._reactInternalInstance){
      this.setState({
        creatingAssetOrder: true
      })
    }
  }*/
  hideMode() {
    this.setState({
      showMode: false
    })
  }
  showMode() {
    this.setState({
      showMode: true
    })
  }
  selectCreateTab(tab){
    this.setState({
      createTab: tab
    })
  }
  exportResult(){
    let csv = "\ufeff", fileName = ''
    const {assetOrders} = this.props
    const {createTab} = this.state
    if(createTab){
      if(assetOrders.failed.length < 400000){
        fastExport(assetOrders.failed,[...this.tableColumns, {text:"失败原因",name:"_reason"}],"订单创建失败记录.xlsx")
        return
      } else {
        csv += `${this.tableColumns.map(r=>r.text).join(",")},失败原因\n`
        csv += assetOrders.failed.map(r=> this.tableColumns.map(t=>t.renderDom? t.renderDom(r):r[t.name]).concat([r._reason]).join(",")).join("\n")
        this.hiddenLink.download = "订单创建失败记录.csv"
      }
    } else {
      if(assetOrders.succeed.length < 400000){
        fastExport(assetOrders.succeed,this.tableColumns,"订单创建成功记录.xlsx")
        return
      } else {
        csv += `${this.tableColumns.map(r=>r.text).join(",")}\n`
        csv += assetOrders.succeed.map(r=> this.tableColumns.map(t=>t.renderDom? t.renderDom(r):r[t.name]).join(",")).join("\n")
        this.hiddenLink.download = "订单创建成功记录.csv"
      }
    }
    fileName = this.hiddenLink.download
    let blob = new Blob([csv], {type: "text/csv"})
    FileSaver.saveAs(blob, fileName)
  }
  renderAttachment(r, i){
    return (<li key={i} className="list-group-item progress-item">{r.name}<span className="progress"></span></li>)
    {/*return (<button type="button" className={`btn btn-default ${style["progress-btn"]}`}>{r.name}<span className={style["progress"]}></span></button>)*/}
  }
  renderHint(){
    const {creating, matching, matched, succeed, failed} = this.props.assetOrders
    const {progress,apiProgress} = this.state
    let message
    if(progress){
      if(apiProgress){
        message = `${progress.percent} 已上传，${creating?'订单创建中...':''} 创建进度:${apiProgress}`
      } else {
        message = `${progress.percent} 已上传，${creating?'订单创建中...':''}`
      }
    } else if (matching){
      message = "匹配中..."
    } else if (matched && (matched.length>0)){
      message = `${matched.length}条已匹配`
    } else if ((succeed && (succeed.length > 0)) || (failed && (failed.length > 0))){
      message = `${succeed.length?`${succeed.length}条已创建`:''} ${failed.length?`${failed.length}条创建失败`:''}`
    }
    return (<span className="col-sm-4 edi_text-danger" styleName="legend-value">
      {message}
      { ((succeed && (succeed.length > 0)) || (failed && failed.length > 0)) &&
        <a href="javascript:" className="edi-ml" onClick={this.gotoResult}>查看结果</a>
      }
      </span>)
  }

  gotoResult = ()=>{
    this.resultSection.scrollIntoView(false)
  }

  render() {
    const {session, assetOrders, assetUsers, fundUsers, message} = this.props
    const {xslx, attachment, createTab,progress, fundOrgCode, assetOrgCode, apiProgress} = this.state
    let self = this
    return (
      <div className="component">
        <div className="wrapper__no-filter-form__expand container-fluid">
          {progress && <div className="progress edi_progress">
            <div className={`progress-bar progress-bar-striped active edi_progress-bar`} style={{width:progress.percent}}></div>
            {apiProgress && <div className={`progress-bar progress-bar-danger progress-bar-striped active edi_progress-bar`} style={{width:apiProgress}}></div>}
          </div>}
          <section className="section__handleOrder-960">
            <form onSubmit={this.handleMatchAssetOrder} className="form-horizontal">
              <h3 className="form-group" style={{marginTop: '0'}}>
                <span className="col-sm-3 text-right">订单批量创建</span>
                {this.renderHint()}
              </h3>
              <hr />
              <div className="form-group row">
                <label className="col-sm-3 control-label">用户类型</label>
                <div className="col-sm-6">
                  <span styleName="label-value">个人用户</span>
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label asterisk">资产方</label>
                <div className="col-sm-6">
                  {/*<AssetSelector onChange={this.handleAssetUserChange} noEmpty={true}/>*/}
                  <AssetUserFromSelector onChange={this.handleAssetUserChange} noEmpty={true} userFrom="1"/>
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label">资金方</label>
                <div className="col-sm-6">
                  <FundRelatedUserFromSelector onChange={this.handleFundUserChange} assetOrgCode={assetOrgCode} userFrom="1"/>
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label asterisk">订单信息</label>
                <div className="col-sm-6">
                  <a target="_blank" href="/订单信息模板.xlsx" styleName="label-value">下载模板</a>
                  <p className="help-block edi_text-danger"><i className="fa fa-warning"></i> 请务必按照模板编辑资料，否则将可能创建订单失败</p>
                  <label htmlFor={`${this.now}orders`} className="btn icon-btn btn-danger"><i className="fa fa-upload"></i>{xslx ? '重新上传':'请选择一个xlsx文件'}</label>
                  <input type="file" className="hidden" ref={(button) => {this.uploadOrderButton = button;}} hidden id={`${this.now}orders`} onChange={this.handleAssetOrderChange} onClick={this.handleAssetOrderReset} accept=".xlsx, .xls, .csv"/>
                  <p className="help-block">只上传XLS或XLSX文件</p>
                </div>
                {xslx && <div className="col-sm-3">
                  <ul className={`list-group ${style["attachment-list"]}`}>
                    {self.renderAttachment(xslx)}
                  </ul>
                </div>}
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label asterisk">资料包</label>
                <div className="col-sm-6">
                  <label htmlFor={`${this.now}attachment`} className={`btn icon-btn btn-warning`}><i className="fa fa-upload"></i>{attachment && (attachment.length > 0) ? '重新上传':'请选择一个文件夹'}</label>
                  <input type="file" multiple={true} className="hidden" ref={(button) => {this.uploadAttachmentButton = button;}} hidden id={`${this.now}attachment`} onChange={this.handleAttachmentChange} onClick={this.handleAttachmentReset}/>
                  <p className="help-block">
                    匹配类型：<br/>
                    资料格式支持jpg,png,pdf,rar或zip，统一放在一个文件夹里上传，请避免在文件夹里包含无关文件以节省您的时间和我们的空间。<br/>

                    命名规则：<br/>
                    普通类型（借款人名称+借款人证件号），如张三110107187009231232（每个订单必须上传至少一份此命名规范的rar或者zip格式资料包）<br/>
                    身份证（身份证+借款人名称+借款人证件号），如身份证张三110107187009231232<br/>
                    电子签章（电子签章+借款人名称+借款人证件号），如电子签章张三110107187009231232<br/>
                    补充资料（补充资料+借款人名称+借款人证件号），如补充资料张三110107187009231232</p>
                </div>
                {attachment && (attachment.length > 0) && <div className="col-sm-3">
                  <ul className="list-group" styleName="attachment-list">
                    {attachment.map(self.renderAttachment)}
                  </ul>
                </div>}
              </div>
              <div className="form-group" styleName="btn-row">
                <div className="col-sm-offset-3 col-sm-9">
                  <button type="submit" className="btn icon-btn btn-success pull-left">{!this.state.showMode? "查看匹配":"匹配订单"}</button>
                  { !this.state.showMode && assetOrders && assetOrders.matched && (assetOrders.matched.length > 0) &&
                    <button type="button" className="btn icon-btn btn-primary pull-left" onClick={this.handleCreateAssetOrder}>创建订单</button>
                  }
                </div>
              </div>
            </form>
          </section>
        </div>
        <a download="true" className="hidden" target="_blank" ref={(link) => {this.hiddenLink = link}}/>
        {
          ((assetOrders.succeed && (assetOrders.succeed.length > 0)) || (assetOrders.failed && (assetOrders.failed.length > 0))) && <div className="wrapper__no-filter-form__expand container-fluid" style={{marginTop: '1rem'}}>
          <section ref={(section)=>{this.resultSection = section}} className="section__handleOrder-960">
            <legend>创建结果</legend>
            <ul className="nav nav-tabs">
              <li role="presentation" className={(createTab == 0)?'active':''} onClick={()=>{this.selectCreateTab(0)}}><a href="javascript:">创建成功结果</a></li>
              <li role="presentation" className={(createTab == 1)?'active':''} onClick={()=>{this.selectCreateTab(1)}}><a href="javascript:">创建失败结果</a></li>
            </ul>

            <button type="button" className={`btn icon-btn btn-info`} styleName="exporter" onClick={this.exportResult}><i className="fa fa-download"></i>导出</button>
            {(createTab == 0) && <div className="wrapper__tab-area"><Datatable columns={this.succceedAssetOrderColumns} rows={assetOrders.succeed} noPgaging={true}/></div>}
            {(createTab == 1) && <div className="wrapper__tab-area"><Datatable columns={this.faiedAssetOrderColumns} rows={assetOrders.failed} noPgaging={true}/></div>}
          </section>
        </div>
        }
        { this.state.showMode && assetOrders && ((assetOrders.matched && (assetOrders.matched.length > 0)) || (assetOrders.unmatched && (assetOrders.unmatched.length > 0))) && <Modal columns={this.matchTableColumns} matched={assetOrders.matched} unmatched={assetOrders.unmatched} closer={this.hideMode} submit={this.handleCreateAssetOrder} message={message} title="匹配结果" />}
      </div>
    )
  }
}

export default CreateAssetOrder
