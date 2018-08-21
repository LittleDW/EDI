import React, {Component} from 'react'
import PropTypes from 'prop-types'
import OrgFilter from './OrgFilter'
import MethodDataTable from "./MethodDataTable"
import Dialog from '../Dialog'
import Select from '../Select'
import OperLogModal from '../Modal/OperLogModal'

export default class SettleMethod extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModal: false,
      showOperLogModal: false,
      operLogModalKey: '',
      progress: null,
      disableDialog: false,
      message: {
        type: "FAIL",
        text: ''
      },
      _row: {}
    }

    this.openOperLogModal = this.openOperLogModal.bind(this)
    this.hideOperLogModal = this.hideOperLogModal.bind(this)

    this.handleOrgChange = ({assetOrgCode, fundOrgCode}) => {
      this.props.search({assetOrgCode, fundOrgCode})
    }

    this.toggleModal = (_row) => {
      _row.files = {}
      _row.files.due_diligence_url = {
        file: null,
        url: _row.due_diligence_url
      }
      _row.files.cooperative_agreements_url = {
        file: null,
        url: _row.cooperative_agreements_url
      }
      _row.files.guarantee_url = {
        file: null,
        url: _row.guarantee_url
      }
      _row.files.borrow_agreements_url = {
        file: null,
        url: _row.borrow_agreements_url
      }
      _row.files.other_agreements_url = {
        file: null,
        url: _row.other_agreements_url
      }
      this.setState({
        showModal: true,
        _row
      })
    }

    this.confirmInModal = () => {
      const {_row, message} = this.state
      if (!_row.interest_mode || !_row.service_mode) {
        let _message = {
          ...message,
          text: "请选择相应的计息方式和服务费结算方式"
        }
        this.setState({message: _message})
        return
      }
      if (!_row.total_rate) {
        let _message = {
          ...message,
          text: "综合费率不得为0"
        }
        this.setState({message: _message})
        return
      }
      const self = this
      let formData = new FormData();
      formData.append('asset_org_code', _row.asset_org_code)
      formData.append('fund_org_code', _row.fund_org_code)
      formData.append('total_rate', _row.total_rate)
      formData.append('interest_mode', _row.interest_mode)
      formData.append('service_mode', _row.service_mode)
      for (let item in _row.files) {
        if (_row.files[item].file) {
          formData.append(item, _row.files[item].file)
        }
      }
      /*for (let key of formData.entries()) {
        console.log(key)
      }*/
      this.props.update(formData, {onProgress: self.handleProgress}).promise.then(() => {
        this.filter.triggerPropSearch()
        setTimeout(() => {
          self.cancelInModal()
        }, 200)
      })
    }
    this.handleProgress = (data) => {
      let progress = (data.loaded * 100 / data.total).toFixed(2) + '%'
      this.setState({progress, disableDialog: true})
    }
    this.cancelInModal = () => {
      this.setState({
        showModal: false,
        progress: null,
        disableDialog: false,
        _row: {}
      })
    }

    this.chooseFile = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      let {_row} = this.state
      const file = e.target.files[0]
      _row.files[type] = {
        file: file,
        url: _row.files[type].url
      }
      this.setState({_row: {..._row}})
    }
    this.cancelFile = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      let {_row} = this.state
      _row.files[type].file = null
      this.setState({_row})
    }

    this.updateTotalRate = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isNaN(e.target.value)) {
        return false
      }
      const {_row} = this.state
      if (e.target.value.split('.').length > 1 && e.target.value.split('.')[1].length > 2) {
        _row.total_rate = Number(e.target.value).toFixed(2)
      } else {
        _row.total_rate = e.target.value
      }
      this.setState({_row: {..._row}})
    }

    this.updateInterestMode = ({value}) => {
      const {_row} = this.state
      _row.interest_mode = value
      this.setState({_row: {..._row}}, () => {
        const {_row, message} = this.state
        if (!_row.interest_mode || !_row.service_mode) {
          let _message = {
            ...message,
            text: "请选择相应的计息方式和服务费结算方式"
          }
          this.setState({message: _message})
        } else {
          let _message = {
            ...message,
            text: ""
          }
          this.setState({message: _message})
        }
      })
    }

    this.updateServiceFee = ({value}) => {
      const {_row} = this.state
      _row.service_mode = value
      this.setState({_row: {..._row}}, () => {
        const {_row, message} = this.state
        if (!_row.interest_mode || !_row.service_mode) {
          let _message = {
            ...message,
            text: "请选择相应的计息方式和服务费结算方式"
          }
          this.setState({message: _message})
        } else {
          let _message = {
            ...message,
            text: ""
          }
          this.setState({message: _message})
        }
      })
    }

    this.showFileInfo = (typeFile) => {
      if (!typeFile || (!typeFile.file && !typeFile.url)) {
        return ''
      } else if (typeFile.file) {
        const {file} = typeFile
        return `${file.name} (${file.size > 1048576 ? (file.size / 1048576).toFixed(1) + 'M' : (file.size / 1024).toFixed(1) + 'K'})`
      } else {
        return <a href={typeFile.url} target="_blank" download
                  className={this.state.disableDialog ? 'disabled' : ''}>下载</a>
      }
    }
  }

  openOperLogModal(row) {
    this.setState({
      operLogModalKey: row.fund_org_code + ',' + row.asset_org_code,
      showOperLogModal: true
    })
  }

  hideOperLogModal() {
    this.setState({
      showOperLogModal: false
    })
  }

  render() {
    const {_SESSION, DICTIONARY, settleMethod, serviceModeList, userFromList, interestModeList} = this.props
    const {showModal, _row, progress, disableDialog, message} = this.state
    return (
      <div className='component'>
        <form className='clearfix filter-form'>
          <OrgFilter session={_SESSION} handleOrgChange={this.handleOrgChange} ref={ref => this.filter = ref}/>
        </form>
        <div className='wrapper'>
          <MethodDataTable data={settleMethod.methodList} DICTIONARY={DICTIONARY} serviceModeList={serviceModeList} openOperLogModal={this.openOperLogModal}
                           userFromList={userFromList} interestModeList={interestModeList}
                           toggleModal={this.toggleModal} user_type={_SESSION.user_type} _buttons={this.props._buttons}/>
        </div>
        {showModal &&
        <Dialog title={'设置合作方结算方式'} confirm={this.confirmInModal} closer={this.cancelInModal} disabled={disableDialog}
                message={message}>
          {progress && <div className="progress edi_progress">
            <div className="progress-bar progress-bar-striped active edi_progress-bar" style={{width: progress}}></div>
          </div>}
          <div className="form-group">
            <label className="col-sm-4 control-label">机构编码</label>
            <div className="col-sm-5 form-control-static">
              {_row.orgCode}
            </div>
          </div>
          {_SESSION.user_type === 1 && [<div className="form-group" key="key1">
            <label className="col-sm-4 control-label">资金方名称</label>
            <div className="col-sm-5 form-control-static">
              {_row.orgFullName}
            </div>
          </div>,
          <div className="form-group" key="key2">
            <label className="col-sm-4 control-label">资金方简称</label>
            <div className="col-sm-5 form-control-static">
              {_row.orgName}
            </div>
          </div>]}
          {_SESSION.user_type === 2 && [<div className="form-group" key="key1">
            <label className="col-sm-4 control-label">资产方名称</label>
            <div className="col-sm-5 form-control-static">
              {_row.orgFullName}
            </div>
          </div>,
            <div className="form-group" key="key2">
              <label className="col-sm-4 control-label">资产方简称</label>
              <div className="col-sm-5 form-control-static">
                {_row.orgName}
              </div>
            </div>]}
          <div className="form-group">
            <label className="col-sm-4 control-label">综合费率（%）<span style={{color: 'red'}}>*</span></label>
            <div className="col-sm-3">
              <div className="input-group col-sm-11">
                <input type="text" value={_row.total_rate} onChange={this.updateTotalRate}/>
                <span className="input-group-addon">%</span>
              </div>
              {_row.total_rate === '' && <span className="form-verification">必填</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-4 control-label">计息方式<span style={{color: 'red'}}>*</span></label>
            <div className="col-sm-3">
              <Select
                onChange={this.updateInterestMode}
                options={this.props.interestModeList}
                defaultValue={_row.interest_mode}
                placeholder="&nbsp;"
              />
              {!_row.interest_mode && <span className="form-verification">必填</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-4 control-label">服务费结算方式<span style={{color: 'red'}}>*</span></label>
            <div className="col-sm-3">
              <Select
                onChange={this.updateServiceFee}
                options={this.props.serviceModeList}
                defaultValue={_row.service_mode}
                placeholder="&nbsp;"
              />
              {!_row.service_mode && <span className="form-verification">必填</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-4 control-label">尽调报告</label>
            <div className="col-sm-8">
              <label htmlFor="due_diligence_url" className="btn icon-btn btn-default"><i
                className="fa fa-upload"></i>{_row.files.due_diligence_url.file || _row.files.due_diligence_url.url ? '重新上传' : '上传文件'}
              </label>
              <input type="file" className="hidden" hidden id="due_diligence_url"
                     onChange={e => this.chooseFile(e, 'due_diligence_url')}
                     accept="*"/>
              {(_row.files.due_diligence_url.file || _row.files.due_diligence_url.url) &&
              <span style={{padding: '0 20px'}}>{this.showFileInfo(_row.files.due_diligence_url)}</span>}
              {_row.files.due_diligence_url.file && <a style={{display: 'inline-block'}} href="javascript:"
                                                       onClick={e => this.cancelFile(e, 'due_diligence_url')}
                                                       className={disableDialog ? 'disabled' : ''}>取消</a>}
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-4 control-label">合作协议</label>
            <div className="col-sm-8">
              <label htmlFor="cooperative_agreements_url" className="btn icon-btn btn-default"><i
                className="fa fa-upload"></i>{_row.files.cooperative_agreements_url.file || _row.files.cooperative_agreements_url.url ? '重新上传' : '上传文件'}
              </label>
              <input type="file" className="hidden" hidden id="cooperative_agreements_url"
                     onChange={e => this.chooseFile(e, 'cooperative_agreements_url')}
                     accept="*"/>
              {(_row.files.cooperative_agreements_url.file || _row.files.cooperative_agreements_url.url) &&
              <span style={{padding: '0 20px'}}>{this.showFileInfo(_row.files.cooperative_agreements_url)}</span>}
              {_row.files.cooperative_agreements_url.file && <a style={{display: 'inline-block'}} href="javascript:"
                                                                onClick={e => this.cancelFile(e, 'cooperative_agreements_url')}
                                                                className={disableDialog ? 'disabled' : ''}>取消</a>}
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-4 control-label">担保函</label>
            <div className="col-sm-8">
              <label htmlFor="guarantee_url" className="btn icon-btn btn-default"><i
                className="fa fa-upload"></i>{_row.files.guarantee_url.file || _row.files.guarantee_url.url ? '重新上传' : '上传文件'}
              </label>
              <input type="file" className="hidden" hidden id="guarantee_url"
                     onChange={e => this.chooseFile(e, 'guarantee_url')} accept="*"/>
              {(_row.files.guarantee_url.file || _row.files.guarantee_url.url) &&
              <span style={{padding: '0 20px'}}>{this.showFileInfo(_row.files.guarantee_url)}</span>}
              {_row.files.guarantee_url.file && <a style={{display: 'inline-block'}} href="javascript:"
                                                   onClick={e => this.cancelFile(e, 'guarantee_url')}
                                                   className={disableDialog ? 'disabled' : ''}>取消</a>}
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-4 control-label">借款服务协议样本</label>
            <div className="col-sm-8">
              <label htmlFor="borrow_agreements_url" className="btn icon-btn btn-default"><i
                className="fa fa-upload"></i>{_row.files.borrow_agreements_url.file || _row.files.borrow_agreements_url.url ? '重新上传' : '上传文件'}
              </label>
              <input type="file" className="hidden" hidden id="borrow_agreements_url"
                     onChange={e => this.chooseFile(e, 'borrow_agreements_url')} accept="*"/>
              {(_row.files.borrow_agreements_url.file || _row.files.borrow_agreements_url.url) &&
              <span style={{padding: '0 20px'}}>{this.showFileInfo(_row.files.borrow_agreements_url)}</span>}
              {_row.files.borrow_agreements_url.file && <a style={{display: 'inline-block'}} href="javascript:"
                                                           onClick={e => this.cancelFile(e, 'borrow_agreements_url')}
                                                           className={disableDialog ? 'disabled' : ''}>取消</a>}
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-4 control-label">其他协议</label>
            <div className="col-sm-8">
              <label htmlFor="other_agreements_url" className="btn icon-btn btn-default"><i
                className="fa fa-upload"></i>{_row.files.other_agreements_url.file || _row.files.other_agreements_url.url ? '重新上传' : '上传文件'}
              </label>
              <input type="file" className="hidden" hidden id="other_agreements_url"
                     onChange={e => this.chooseFile(e, 'other_agreements_url')} accept="*"/>
              {(_row.files.other_agreements_url.file || _row.files.other_agreements_url.url) &&
              <span style={{padding: '0 20px'}}>{this.showFileInfo(_row.files.other_agreements_url)}</span>}
              {_row.files.other_agreements_url.file && <a style={{display: 'inline-block'}} href="javascript:"
                                                          onClick={e => this.cancelFile(e, 'other_agreements_url')}
                                                          className={disableDialog ? 'disabled' : ''}>取消</a>}
            </div>
          </div>
        </Dialog>}
        { this.state.showOperLogModal &&
        <OperLogModal data={this.state.data} tableName={'t_asset_fund'} tableKey={this.state.operLogModalKey} actionType="settleMethod" title="结算方式日志"
                      closer={ this.hideOperLogModal } /> }
      </div>
    )
  }
}

SettleMethod.propTypes = {
  search: PropTypes.func.isRequired
}
