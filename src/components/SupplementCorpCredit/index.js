import React, {Component} from 'react'
import FileSaver from 'file-saver'
import Modal from './table-model'
import AssetSelector from '../Select/AssetSelectorPage'
import AssetUserFromSelector from '../Select/AssetUserFromSelectorPage'
import {FormatOrgCode} from '../Formatter'
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
      xslx: null,
      progress:null,
      createTab: 0
    }
    this.xhr = null
    this.tableColumns = [
      { text: '匹配状态', name: '_reason',renderDom: row => row._reason || "匹配成功" },
      { text: '借款人名称', name: 'borrow_name' },
      { text: '营业执照号', name: 'borrow_business_license' }
    ]
    this.succceedAssetOrderColumns = [
      { text: '资产方', name: 'asset_org_code', renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      { text: '借款人名称', name: 'borrow_name' },
      { text: '营业执照号', name: 'borrow_business_license' }
    ]
    this.faiedAssetOrderColumns = [
      { text: '资产方', name: 'asset_order_no', renderDom: row => <FormatOrgCode value={row.asset_org_code}/>},
      { text: '借款人名称', name: 'borrow_name' },
      { text: '营业执照号', name: 'borrow_business_license' },
      { text: '失败原因', name: '_reason' }
    ]
    this.hideMode = this.hideMode.bind(this)
    this.showMode = this.showMode.bind(this)
    this.handleAssetUserChange = this.handleAssetUserChange.bind(this)
    this.handleAttachmentChange = this.handleAttachmentChange.bind(this)
    this.handleAssetOrderChange = this.handleAssetOrderChange.bind(this)
    this.handleAssetOrderReset = this.handleAssetOrderReset.bind(this)
    this.handleAttachmentReset = this.handleAttachmentReset.bind(this)
    this.handleMatchAssetOrder = this.handleMatchAssetOrder.bind(this)
    this.handleCreateAssetOrder = this.handleCreateAssetOrder.bind(this)
    this.selectCreateTab = this.selectCreateTab.bind(this)
    this.formatOrganizationCode = this.formatOrganizationCode.bind(this)
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
    const {showMode,createTab, progress, creatingAssetOrder} = this.state
    const {assetOrders,message} = this.props
    !assetOrders.matched.length && newAssetOrders.matched.length && newAssetOrders.matched.map(r=>(r._checked = true))

    /*if(!showMode && (newAssetOrders !== assetOrders)){
      this.setState({showMode: true})
    }*/
    /*if(newAssetOrders && newAssetOrders.job_done && createTab && assetOrders.succeed && assetOrders.succeed.length){
      this.setState({createTab: 0})
    }*/
    /*if(progress && creatingAssetOrder && newAssetOrders && newAssetOrders.job_done){
      this.setState({progress: null, creatingAssetOrder: false})
    }*/
    if(progress && !newAssetOrders.creating){
      this.setState({progress: null})
    }
  }
  componentWillUnmount() {
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    const {resetAssetOrder} = this.props
    resetAssetOrder()
  }
  handleAssetUserChange(row){
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    this.setState({
      assetOrgCode:row.value
    })
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
    if(attachment&&attachment.length){
      this.uploadAttachmentButton.value = ""
      this.setState({attachment:null},resetAssetOrder)
    }
  }
  handleMatchAssetOrder(e) {
    e.preventDefault();
    e.stopPropagation();
    const {setMessage, matchAssetOrder, assetOrders} = this.props
    const {xslx,attachment,showMode} = this.state
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
        let api = matchAssetOrder(formData)
        self.xhr = api.xhr
        api.promise.then(self.showMode)
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
    let {assetOrgCode, attachment} = this.state
    let orders = assetOrders.matched.filter(r=>r._checked)
    let self = this
    let runner = ()=>{
      if(attachment && orders.length){
        var formData = new FormData();
        formData.append("org_code", assetOrgCode)
        let checkedOrders = orders.filter(r=>r._checked), uploadingAttachment = [ ...new Set([].concat.apply([], checkedOrders.map(r=>r.borrow_credit_voucher_details))) ]
        formData.append("orders", JSON.stringify(checkedOrders))
        attachment.filter(r=>uploadingAttachment.includes(r.name)).map(r=>{
          formData.append("attachment", r);
        })
        self.xhr = createAssetOrder(formData,{onProgress: self.handleProgress}).xhr
      } else {
        setMessage("请确认匹配结果是否勾选以及资料包是否已挂载","FAIL")
      }
    }
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    this.setState({showMode: false},runner)
    /** 错开一次更新，防止跟接口取消混淆 */
    //setTimeout(runner)
  }
  handleProgress(e) {
    if(this._reactInternalInstance){
      this.setState({
        progress: {total:e.total, loaded: e.loaded, percent: `${Math.floor(100*e.loaded/e.total)}%`}
      })
    }
  }
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
  formatOrganizationCode(s) {
    var {orgCodes} = this.props, result = orgCodes.filter(r => (s == r.value))[0]
    return result ? result.label : s
  }
  exportResult(){
    let csv = "\ufeff", fileName = ''
    const {assetOrders} = this.props
    const {createTab} = this.state
    // 当用导出数少于40万条时为xlsx
    if(createTab){
      if(assetOrders.failed.length < 400000) {
        fastExport([...assetOrders.failed,...assetOrders.unmatched], this.tableColumns, "补充失败记录.xlsx")
        return
      } else {
        csv += `${this.tableColumns.map(r=>r.text).join(",")}\n`
        csv += assetOrders.failed.map(r=> this.tableColumns.map(t=>r[t.name]).join(",")).join("\n")
        csv += "匹配失败结果\n"
        csv += assetOrders.unmatched.map(r=> this.tableColumns.map(t=>r[t.name]).join(",")).join("\n")
        fileName = "补充失败记录.csv"
      }
    } else {
      if(assetOrders.succeed.length < 400000){
        fastExport(assetOrders.succeed,this.tableColumns,"补充成功记录.xlsx")
        return
      } else {
        csv += `${this.tableColumns.map(r=>r.text).join(",")}\n`
        csv += assetOrders.succeed.map(r=> this.tableColumns.map(t=>r[t.name]).join(",")).join("\n")
        fileName = "补充成功记录.csv"
      }
    }

    let blob = new Blob([csv], {type: "text/csv"})
    FileSaver.saveAs(blob, fileName)
  }
  renderAttachment(r, i){
    return (<li key={i} className="list-group-item progress-item">{r.name}<span className="progress"></span></li>)
    {/*return (<button type="button" className={`btn btn-default ${style["progress-btn"]}`}>{r.name}<span className={style["progress"]}></span></button>)*/}
  }
  renderHint(){
    const {creating, matching, matched, succeed, failed, unmatched} = this.props.assetOrders
    const {progress} = this.state
    let message
    if(progress){
      message = `${progress.percent} 已上传，${creating?'补充中...':''}`
    } else if (matching){
      message = "匹配中..."
    } else if ((succeed && (succeed.length > 0)) || (failed && (failed.length > 0))){
      message = `${succeed.length?`${succeed.length}条已补充`:''} ${failed.length?`${failed.length}条补充失败`:''} ${unmatched.length? `${unmatched.length}条匹配失败`:''}`
    } else if (matched && (matched.length>0)){
      message = `${matched.length}条已匹配`
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
    const {session, assetOrders, assetUsers, message} = this.props
    const {xslx, attachment, createTab,progress} = this.state
    let type, org, self = this
    return (
      <div className="component">
        <div className="wrapper__no-filter-form__expand container-fluid">
          {progress && <div className="progress edi_progress">
            <div className={`progress-bar progress-bar-striped edi_progress-bar active`} style={{width:progress.percent}}></div>
          </div>}
          <section className="section__handleOrder-960">
            <form onSubmit={this.handleMatchAssetOrder} className="form-horizontal">
              <h3 className="form-group" style={{marginTop: '0'}}>
                <span className="col-sm-3 text-right">授信资料批量补充</span>
                {this.renderHint()}
              </h3>
              <hr />
              <div className="form-group row">
                <label className="col-sm-3 control-label">用户类型</label>
                <div className="col-sm-6">
                  <span styleName="label-value">企业用户</span>
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label asterisk">资产方</label>
                <div className="col-sm-6">
                  <AssetUserFromSelector onChange={this.handleAssetUserChange} noEmpty={true} userFrom="1"/>
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label asterisk">信息</label>
                <div className="col-sm-6">
                  <a target="_blank" href="/企业授信资料补充模板.xlsx" styleName="label-value">下载模板</a>
                  <p className="help-block edi_text-danger"><i className="fa fa-warning"></i> 请务必按照模板编辑资料，否则将可能补充失败</p>
                  <label htmlFor={`${this.now}orders`} className={`btn icon-btn btn-danger`}><i className="fa fa-upload"></i>{xslx ? '重新上传':'请选择一个xlsx文件'}</label>
                  <input type="file" className="hidden" ref={(button) => {this.uploadOrderButton = button;}} hidden id={`${this.now}orders`} onChange={this.handleAssetOrderChange} onClick={this.handleAssetOrderReset} accept=".xlsx, .xls, .csv"/>
                  <p className="help-block">只上传XLS或XLSX文件</p>
                </div>
                {xslx && <div className="col-sm-3">
                  <ul className='list-group' styleName="attachment-list">
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
                    普通类型（借款人名称+营业执照号），如某某科技532501100006302<br/>
                    身份证（身份证+借款人名称+营业执照号），如身份证某某科技532501100006302<br/>
                    电子签章（电子签章+借款人名称+营业执照号），如电子签章某某科技532501100006302<br/>
                    补充资料（补充资料+借款人名称+营业执照号），如补充资料某某科技532501100006302
                  </p>
                </div>
                {attachment && (attachment.length > 0) && <div className="col-sm-3">
                  <ul className="list-group" styleName="attachment-list">
                    {attachment.map(self.renderAttachment)}
                  </ul>
                </div>}
              </div>
              <div className="form-group"styleName="btn-row">
                <div className="col-sm-offset-3 col-sm-9">
                  <button type="submit" className="btn icon-btn btn-success pull-left">{!this.state.showMode? "查看匹配":"匹配资料"}</button>
                  { !this.state.showMode && assetOrders && assetOrders.matched && (assetOrders.matched.length > 0) &&
                    <button type="button" className="btn icon-btn btn-primary pull-left" onClick={this.handleCreateAssetOrder}>补充资料</button>
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
            <legend>授信资料补充结果</legend>
            <ul className="nav nav-tabs">
              <li role="presentation" className={(createTab == 0)?'active':''} onClick={()=>{this.selectCreateTab(0)}}><a href="javascript:">补充成功结果</a></li>
              <li role="presentation" className={(createTab == 1)?'active':''} onClick={()=>{this.selectCreateTab(1)}}><a href="javascript:">补充失败结果</a></li>
            </ul>

            <button type="button" className="btn icon-btn btn-info" styleName="exporter" onClick={this.exportResult}><i className="fa fa-download"></i>导出</button>
            {(createTab == 0) && <div className="wrapper__tab-area"><Datatable columns={this.succceedAssetOrderColumns} rows={assetOrders.succeed} noPgaging={true}/></div>}
            {(createTab == 1) && <div className="wrapper__tab-area"><Datatable columns={this.faiedAssetOrderColumns} rows={[...assetOrders.failed, ...assetOrders.unmatched]} noPgaging={true}/></div>}
          </section>
        </div>
        }
        { this.state.showMode && assetOrders && ((assetOrders.matched && (assetOrders.matched.length > 0)) || (assetOrders.unmatched && (assetOrders.unmatched.length > 0))) &&  <Modal columns={this.tableColumns} matched={assetOrders.matched} unmatched={assetOrders.unmatched} closer={this.hideMode} submit={this.handleCreateAssetOrder} message={message} title="匹配结果" />}
      </div>
    )
  }
}

export default CreateAssetOrder
