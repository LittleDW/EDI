/* eslint-disable no-undef */

import React, {Component} from 'react'
import FileSaver from 'file-saver'
import PropTypes from 'prop-types'
import Datatable from '../Datatable'
import {escCloser, fastExport, getBrowserType} from '../../utils/etc'
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default class AllVoucherTableMode extends Component {

  constructor(props){
    super(props)
    this.state = {
      copied: false
    }
    this.clickAll = this.clickAll.bind(this)
    this.export = this.export.bind(this)
    this.browser = getBrowserType()
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

  componentWillUpdate(newProps, newState){
    const {copied:newCopied} = newState
    const {copied} = this.state
    if(newCopied && !copied){
      setTimeout(()=>{
        this.setState({copied: false})
      },5000)
    }
  }

  clickAll(){
    if(this.wrapperDiv){
      var links = this.wrapperDiv.querySelectorAll("a")
      links.forEach(r=>{
        r.click()
      })
    }
  }
  export(){
    /*const {data,columns} = this.props
    let blob = new Blob([`${columns.map(r=>r.text).join(",")}\r\n${data.map(r=>columns.map(t=>r[t.name]).join(",")).join("\r\n")}`],{type: "text/csv;charset=utf-8;"});
    FileSaver.saveAs(blob, '地址列表.csv');
    */
    const {data,columns} = this.props
    if(data && (data.length > 400000)){
      let title = "企业订单资料列表.csv"
      let csv = [`${columns.map(r=>r.text).join(",")}\r\n${data.map(r=>columns.map(t=>r[t.name]).join(",")).join("\r\n")}`]
      var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
      FileSaver.saveAs(blob, title);
    } else {
      fastExport(data,columns,"企业订单资料列表.xlsx")
    }
  }
  render() {
    const {closer, title, columns, data} = this.props
    const {copied} = this.state
    const allURL = data.map(r=>r.voucher_url).join("\r\n")
    return (
      <div className="modal fade fade in"role="dialog">
        <div className="modal-backdrop fade in" onClick={closer}></div>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={closer}><span
                aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="wrapper" ref={(input) => {
              this.wrapperDiv = input;
            }}>
              <p className="modal__tips"><i className="fa fa-warning"></i>由于下载环境的影响，超大量下载会存在失败的可能或下载速度慢建议减少单次下载量。</p>
              {data.length !== 0 ?
                <Datatable columns={columns} rows={data}
                           noPgaging={true}/> : <h2>没有数据！</h2>}
            </div>
            <div className="modal-footer">
              {(this.browser == "Safari") && <p className="text-danger"><i className="fa fa-warning"></i>您的浏览器不支持大批量下载，请切换chrome浏览器下载全部链接</p>}
              <button type="button" className="btn btn-default" onClick={closer}>关闭</button>
              <button type="button" className="btn btn-warning" onClick={this.export}>导出</button>
              <CopyToClipboard text={allURL} onCopy={() => this.setState({copied: true})}>
                <button type="button" className="btn btn-primary">{copied? "已拷贝":"复制下载地址"}</button>
              </CopyToClipboard>
              <button type="button" disabled={(this.browser == "Safari")} className="btn btn-danger" onClick={this.clickAll}>直接下载</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

AllVoucherTableMode.propTypes = {
  closer: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
}
