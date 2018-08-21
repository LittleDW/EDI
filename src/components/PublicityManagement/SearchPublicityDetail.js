import React, {Component} from 'react'
import FileSaver from 'file-saver'
import Modal from './table-model'
import AssetSelector from '../Select/AssetSelectorPage'
import {FormatOrgCode} from '../Formatter'
import Datatable from '../Datatable'
import style from '../SupplementAssetOrder/style.scss'
import CSSModules from "react-css-modules/dist/index";

@CSSModules(style, {allowMultiple: true})
class SearchPublicityDetail extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props.session, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      showMode: false,
      xslx: null,
      progress:null,
      taskInvalid: false,
      createTab: 0
    }
    this.xhr = null
    this.columns = [
      { text: '企业名称', name: 'borrow_name' },
      { text: '平台订单号', name: 'order_no' },
      { text: '资产方订单号', name: 'asset_order_no' },
    ]
    this.tableColumns = [
      { text: '匹配状态', name: '_reason',renderDom: row => row._reason || "匹配成功" },
      ...this.columns
    ]
    this.succceedAssetOrderColumns = this.columns
    this.faiedAssetOrderColumns = [
      ...this.columns,
      { text: '失败原因', name: '_reason' }
    ]
  }

  componentWillMount() {
    this.now = new Date().getTime()
  }
  componentDidMount() {
    /*this.uploadAttachmentButton.setAttribute("webkitdirectory",true)
    this.uploadAttachmentButton.setAttribute("mozdirectory",true)
    this.uploadAttachmentButton.setAttribute("directory",true)*/
  }
  componentWillUpdate(newProps, newState){
    const {assetOrders:newAssetOrders, message:newMessage} = newProps
    const {showMode,createTab, progress} = this.state
    const {assetOrders,message} = this.props
    !assetOrders.matched.length && newAssetOrders.matched.length && newAssetOrders.matched.map(r=>(r._checked = true))
  }
  componentWillUnmount() {
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    const {resetAssetOrder} = this.props
    resetAssetOrder()
  }
  /*handleAssetUserChange(row){
    const {resetAssetOrder} = this.props
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    this.setState({
      assetOrgCode:row.value
    })
    resetAssetOrder()
  }*/
  handleAssetOrderChange = (e)=>{
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
  handleAssetOrderReset = (e)=>{
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
  /*handleAttachmentChange(e) {
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
  }*/
  /*handleAttachmentReset(e){
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
  }*/
  handleMatchAssetOrder = (e)=>{
    e.preventDefault();
    e.stopPropagation();
    let taskValue = this.taskInput.value
    const {setMessage, matchAssetOrder, assetOrders} = this.props
    const {xslx,attachment,showMode} = this.state
    let self = this
    if(!taskValue){
      setMessage("请确认任务名是否已输入","FAIL")
      return
    }
    if(!showMode && (assetOrders.matched.length || assetOrders.unmatched.length)){
      this.setState({showMode:true})
      return
    }
    let runner = ()=>{
      if(xslx && !assetOrders.matched.length){
        var formData = new FormData();
        formData.append("task", taskValue);
        formData.append("xslx", xslx);
        let api = matchAssetOrder(formData)
        self.xhr = api.xhr
        api.promise.then(()=>{
          self.showMode()
          self.xhr = null
        })
        //self.xhr = matchAssetOrder(formData).xhr
      } else if (assetOrders.matched.length){
        self.showMode()
      } else {
        setMessage("请确认模板文件是否挂载","FAIL")
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
  handleCreateAssetOrder = (e)=>{
    e.preventDefault();
    e.stopPropagation();
    const {setMessage, createAssetOrder, assetOrders,resetAssetOrder,navigateTo,parentPath} = this.props
    let {assetOrgCode, attachment} = this.state
    let taskValue = this.taskInput.value
    if(!taskValue){
      setMessage("请确认任务名是否已输入","FAIL")
      return
    }
    let orders = assetOrders.matched.filter(r=>r._checked)
    let self = this
    let runner = ()=>{
      if(orders.length){
        //var formData = new FormData();
        //formData.append("company_name", taskValue)
        //let checkedOrders = orders.filter(r=>r._checked)
        //formData.append("data", JSON.stringify(checkedOrders))
        let api = createAssetOrder({task_name:taskValue, data:  orders,})
        self.xhr = api.xhr
        api.promise.then(({response})=>{
          self.xhr = null;
          if(response && response.success){
            navigateTo(parentPath)
          }
        })
        //self.xhr = createAssetOrder({task_name:taskValue, data:  orders,}).xhr
      } else {
        setMessage("请确认匹配结果是否勾选","FAIL")
      }
    }
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    resetAssetOrder()
    this.setState({showMode: false},runner)
    /** 错开一次更新，防止跟接口取消混淆 */
    //setTimeout(runner)
  }
  handleProgress = (e)=>{
    if(this._reactInternalInstance){
      this.setState({
        progress: {total:e.total, loaded: e.loaded, percent: `${Math.floor(100*e.loaded/e.total)}%`}
      })
    }
  }
  /*handleCreatingAssetOrder(e) {
    if(this._reactInternalInstance){
      this.setState({
        creatingAssetOrder: true
      })
    }
  }*/
  hideMode = ()=>{
    this.setState({
      showMode: false
    })
  }
  showMode = ()=>{
    this.setState({
      showMode: true
    })
  }
  selectCreateTab = (tab)=>{
    this.setState({
      createTab: tab
    })
  }
  exportResult = ()=>{
    let csv = "\ufeff", fileName = ''
    const {assetOrders} = this.props
    const {createTab} = this.state
    if(createTab){
      csv += `${this.tableColumns.map(r=>r.text).join(",")},失败原因\n`
      csv += assetOrders.failed.map(r=> this.tableColumns.map(t=>r[t.name]).concat([r._reason]).join(",")).join("\n")
      csv += "\n"
      csv += "征信信息查询任务失败结果\n"
      csv += assetOrders.unmatched.map(r=> this.tableColumns.map(t=>r[t.name]).concat([r._reason]).join(",")).join("\n")
      fileName = "征信信息查询失败记录.csv"
    } else {
      csv += `${this.tableColumns.map(r=>r.text).join(",")}\n`
      csv += assetOrders.succeed.map(r=> this.tableColumns.map(t=>r[t.name]).join(",")).join("\n")
      fileName = "征信信息查询成功记录.csv"
    }
    let blob = new Blob([csv], {type: "text/csv"})
    FileSaver.saveAs(blob, fileName)
  }
  renderAttachment=(r, i)=>{
    return (<li key={i} className={`list-group-item ${style["progress-item"]}`}>{r.name}<span className={style["progress"]}></span></li>)
    {/*return (<button type="button" className={`btn btn-default ${style["progress-btn"]}`}>{r.name}<span className={style["progress"]}></span></button>)*/}
  }
  renderHint=()=>{
    const {creating, matching, matched, succeed, failed, reason} = this.props.assetOrders
    const {progress} = this.state
    let message
    if(progress){
      message = `${progress.percent} 已上传，${creating?'征信信息查询任务启动中...':''}`
    } else if (matching){
      message = "匹配中..."
    } else if (succeed){
      message = `任务已创建`
    } else if (reason){
      message = `任务创建失败，失败原因${reason}`
    } else if (matched && (matched.length>0)){
      message = `${matched.length}条已匹配`
    }
    return (<span className={`col-sm-4 text-danger ${style["legend-value"]}`}>{message}</span>)
  }

  gotoResult = ()=>{
    this.resultSection.scrollIntoView(false)
  }

  handleTaskChange = ()=>{
    const {taskInvalid} = this.state
    const {resetAssetOrder} = this.props
    let value = this.taskInput.value
    if(value && /^([\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]|\d|\w)+$/.test(value) && taskInvalid){
      this.setState({taskInvalid: false})
    } else if((!value || !/^([\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]|\d|\w)+$/.test(value)) && !taskInvalid){
      this.setState({taskInvalid: true})
    }
    if(this.xhr && this.xhr.constructor && (this.xhr.constructor.name == "XMLHttpRequest")){
      this.xhr.abort()
      this.xhr = null
    }
    resetAssetOrder()
    /*if(xslx){
      this.uploadOrderButton.value = ""
      this.setState({xslx:null},resetAssetOrder)
    }*/
  }
  render() {
    const {session, assetOrders, assetUsers, message} = this.props
    //const {creating, matching, matched, succeed, failed} = assetOrders
    const {xslx, taskInvalid, createTab,progress, creating, showMode} = this.state
    let type, org, self = this
    return (
      <div className="component">
        <div className="wrapper__no-filter-form__expand container-fluid">
          {progress && <div className="progress edi_progress">
            <div className={`progress-bar edi_progress-bar ${assetOrders.ropProgress?"progress-bar-striped active":""}`} style={{width:progress.percent}}></div>
          </div>}
          <section className="section__handleOrder-960">
            <form onSubmit={this.handleMatchAssetOrder} className="form-horizontal">
              <h3 className="form-group">
                <span className="col-sm-3 text-right">企业征信信息查询</span>
                {this.renderHint()}
              </h3>
              <hr />
              <div className="form-group row">
                <label className="col-sm-3 control-label">查询对象类型</label>
                <div className="col-sm-6">
                  <span styleName="label-value">企业</span>
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label asterisk">任务名称</label>
                <div className="col-sm-3">
                  <input type="text" ref={(input) => {this.taskInput = input;}} onChange={this.handleTaskChange} disabled={this.xhr}/>
                </div>
                {taskInvalid && <div className="col-sm-3 col-sm-offset-3"><span className="help-block">任务名不能为空且不能有特殊字符</span></div>}
              </div>
              <div className="form-group row">
                <label className="col-sm-3 control-label asterisk">征信信息上传</label>
                <div className="col-sm-6">
                  <a target="_blank" href="/企业征信信息查询模板.xlsx" styleName="label-value">下载模板</a>
                  <p className="help-block text-danger"><i className="fa fa-warning"></i> 请按照模板编辑</p>
                  <label htmlFor={`${this.now}orders`} className={`btn icon-btn btn-danger`}><i className="fa fa-upload"></i>{xslx ? '重新上传':'请选择一个xlsx文件'}</label>
                  <input type="file" className="hidden" ref={(button) => {this.uploadOrderButton = button;}} hidden id={`${this.now}orders`} onChange={this.handleAssetOrderChange} onClick={this.handleAssetOrderReset} accept=".xlsx, .xls, .csv"/>
                  <p className="help-block">只上传XLS或XLSX文件</p>
                </div>
                {xslx && <div className="col-sm-3">
                  <ul className="list-group" styleName="attachment-list">
                    {self.renderAttachment(xslx)}
                  </ul>
                </div>}
              </div>
              <div className="form-group" styleName="btn-row">
                <div className="col-sm-offset-3 col-sm-9">
                  <button type="submit" className="btn icon-btn btn-success pull-left">{!showMode && assetOrders && assetOrders.matched && (assetOrders.matched.length > 0)? "查看匹配":"查询信息"}</button>
                  { !showMode && !creating && assetOrders && assetOrders.matched && (assetOrders.matched.length > 0) &&
                  <button type="button" className="btn icon-btn btn-primary pull-left" onClick={this.handleCreateAssetOrder}>创建任务</button>
                  }
                </div>
              </div>
            </form>
          </section>
        </div>
        { this.state.showMode && assetOrders && ((assetOrders.matched && (assetOrders.matched.length > 0)) || (assetOrders.unmatched && (assetOrders.unmatched.length > 0))) && <Modal columns={this.tableColumns} matched={assetOrders.matched} unmatched={assetOrders.unmatched} closer={this.hideMode} submit={this.handleCreateAssetOrder} message={message} title="匹配结果" />}
      </div>
    )
  }
}

export default SearchPublicityDetail
