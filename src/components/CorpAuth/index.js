/* eslint-disable no-undef */

import React, {Component} from 'react'
import Dialog from '../Dialog'
import moment from 'moment'
import Datatable from '../Datatable'
import AssetRelatedUserFromSelector from '../Select/AssetRelatedUserFromSelectorPage'
import AssetUserFromSelector from '../Select/AssetUserFromSelectorPage'
import EnterprimseCreditSelector from '../Select/EnterprimseCreditSelectorPage'
import SearchBar from '../Common/SearchBar'
import TableMode from './table-modal'
import Modal from './modal'
import VoucherTableMode from './all-voucher-table-modal'
import OperLogModal from '../Modal/OperLogModal'
import {getBrowserType} from '../../utils/etc'
import {
  FormatEnterpriseAssetCreditBorrowEnterpriseType, FormatEnterpriseAssetCreditBorrowType,
  FormatEnterpriseAssetCredit,
  FormatEnterpriseFundCredit,
  FormatEnterpriseCreditCreditOrg,
  FormatOrgCode

} from '../Formatter'
import AuthResultUploadModal from './authResultUploadModal'

export default class CorpAuth extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session, user_type = session && session.user_type || -1
    this.state = {
      user_type,
      index: 1,
      status: [],
      assetOrgCode: (user_type === 1)? session.org_code:'',
      fundOrgCode:(user_type === 2)? session.org_code:'',
      today: moment().format("yyyy-MM-dd"),
      startDate: null,
      endDate: null,
      showDialog: false,
      opsAssetOrgCode: '',
      opsBorrowBusinessLicense:'',
      confirmExport: false,
      confirmMassDownload: false,
      showVoucher: false,
      showAllVoucher: false,
      showCorpAuthModal: false,
      showOperLogModal: false,
      operLogModalKey: '',
      _row: null,
      showCheckResultUploadModal: false,
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.openCorpAuthModal = this.openCorpAuthModal.bind(this)
    this.closeCorpAuthModal = this.closeCorpAuthModal.bind(this)
    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.handleStatusChange = this.handleStatusChange.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.showDialog = this.showDialog.bind(this)
    this.handleStartDatesChange = this.handleStartDatesChange.bind(this)
    this.handleEndDatesChange = this.handleEndDatesChange.bind(this)
    this.openOperLogModal = this.openOperLogModal.bind(this)
    this.hideOperLogModal = this.hideOperLogModal.bind(this)

    this.openCorpAuthVoucherModal = this.openCorpAuthVoucherModal.bind(this)
    this.closeCorpAuthVoucherModal = this.closeCorpAuthVoucherModal.bind(this)
    this.openExportConfirm = this.openExportConfirm.bind(this)
    this.closeExportConfirm = this.closeExportConfirm.bind(this)
    this.openMassDownloadConfirm = this.openMassDownloadConfirm.bind(this)
    this.closeMassDownloadConfirm = this.closeMassDownloadConfirm.bind(this)
    this.showCreditDialog = this.showCreditDialog.bind(this)
    this.showAllVouchers = this.showAllVouchers.bind(this)
    this.hideAllVouchers = this.hideAllVouchers.bind(this)
    this.toggleOps = this.toggleOps.bind(this)
    this.clearOps = this.clearOps.bind(this)

    this.openAuthResultUploadModal = this.openAuthResultUploadModal.bind(this)
    this.closeAuthResultUploadModal = this.closeAuthResultUploadModal.bind(this)
    this.handleAuthResultConfirm = this.handleAuthResultConfirm.bind(this)


    this.assetColumns = [
      {
        text: '授信时间',
        name: 'borrow_time',
        withTitle: true,
        style: {'width': '200px', textAlign: 'center'}
      },
      {
        text: '授信状态',
        name: 'asset_credit_status',
        style: {'width': '200px', textAlign: 'center'},
        renderDom: row => <FormatEnterpriseAssetCredit value={row.asset_credit_status} />
      },
      {
        text: '借款人名称',
        name: 'borrow_name',
        style: {textAlign: 'center'}
      },
      {
        text: '营业执照号',
        name: 'borrow_business_license',
        style: {'width': '260px', textAlign: 'center'}
      },
      {
        text: '查看', style: {textAlign: 'center','width': '150px',}, renderDom: row => {
          const {_buttons} = self.props

            return (
              <div styleName="table-ops">

                <a href="javascript:" onClick={(e) => self.toggleOps(e, row)}>单据</a>
                <div styleName={(row.asset_org_code == self.state.opsAssetOrgCode && row.borrow_business_license == self.state.opsBorrowBusinessLicense) ? "show-ops" : 'hidden-ops'}>
                  {_buttons.includes("corp_auth_detail") &&
                  <a href="javascript:" onClick={() => self.openCorpAuthModal(row)}>授信详情</a>}

                  {_buttons.includes("corp_auth_voucher") && <a href="javascript:" onClick={() => {
                    self.openCorpAuthVoucherModal(row)
                  }}>资料</a>}
                  {_buttons.includes("corp_auth_credit_credit") && <a href="javascript:" onClick={(e) => self.showCreditDialog(e,row)}>征信</a>}
                  {_buttons.includes("corp_auth_credit") && <a href="javascript:" onClick={(e) => self.showDialog(e,row)}>授信记录</a>}
                  {_buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
                </div>
              </div>
            )

        }
      }
    ]

    this.fundColumns = [
      {
        text: '授信时间',
        name: 'borrow_time',
        withTitle: true,
        style: {'width': '200px', textAlign: 'center'}
      },
      {
        text: '授信状态',
        name: 'fund_credit_status',
        style: {'width': '200px', textAlign: 'center'},
        renderDom: row => <FormatEnterpriseFundCredit value={row.fund_credit_status} />
      },
      {
        text: '资产方',
        name: 'asset_org_code',
        style: {'width': '200px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.asset_org_code}/>
      },
      {
        text: '借款人名称',
        name: 'borrow_name',
        style: {textAlign: 'center'}
      },
      {
        text: '营业执照号',
        name: 'borrow_business_license',
        style: {'width': '260px', textAlign: 'center'}
      },
      {
        text: '查看', style: {textAlign: 'center','width': '150px',}, renderDom: row => {
        const {_buttons} = self.props

        return (
          <div styleName="table-ops">

            <a href="javascript:" onClick={(e) => self.toggleOps(e, row)}>单据</a>
            <div styleName={(row.asset_org_code == self.state.opsAssetOrgCode && row.borrow_business_license == self.state.opsBorrowBusinessLicense) ? "show-ops" : 'hidden-ops'}>
              {_buttons.includes("corp_auth_detail") &&
              <a href="javascript:" onClick={() => self.openCorpAuthModal(row)}>授信详情</a>}

              {_buttons.includes("corp_auth_voucher") && <a href="javascript:" onClick={() => {
                self.openCorpAuthVoucherModal(row)
              }}>资料</a>}
              {_buttons.includes("corp_auth_credit_credit") && <a href="javascript:" onClick={(e) => self.showCreditDialog(e,row)}>征信</a>}
              {_buttons.includes("corp_auth_credit") && <a href="javascript:" onClick={(e) => self.showDialog(e,row)}>授信记录</a>}
            </div>
          </div>
        )

      }
      }
    ]

    this.adminColumns = [
      {
        text: '授信时间',
        name: 'borrow_time',
        withTitle: true,
        style: {'width': '250px', textAlign: 'center'}
      },
      {
        text: '授信状态',
        name: 'asset_credit_status',
        style: {'width': '250px', textAlign: 'center'},
        renderDom: row => <FormatEnterpriseAssetCredit value={row.asset_credit_status} />
      },
      {
        text: '资产方',
        name: 'asset_org_code',
        style: {'width': '250px', textAlign: 'center'},
        renderDom: row => <FormatOrgCode value={row.asset_org_code}/>
      },
      {
        text: '借款人名称',
        name: 'borrow_name',
        style: {textAlign: 'center'}
      },
      {
        text: '营业执照号',
        name: 'borrow_business_license',
        style: {'width': '260px', textAlign: 'center'}
      },
      {
        text: '查看', style: {textAlign: 'center','width': '150px',}, renderDom: row => {
          const {_buttons} = self.props

        return (
          <div styleName="table-ops">
            <a href="javascript:" onClick={(e) => self.toggleOps(e, row)}>单据</a>
            <div styleName={(row.asset_org_code == self.state.opsAssetOrgCode && row.borrow_business_license == self.state.opsBorrowBusinessLicense) ? "show-ops" : 'hidden-ops'}>
              {_buttons.includes("corp_auth_detail") &&
              <a href="javascript:" onClick={() => self.openCorpAuthModal(row)}>订单</a>}

              {_buttons.includes("corp_auth_voucher") && <a href="javascript:" onClick={() => {
                self.openCorpAuthVoucherModal(row)
              }}>资料</a>}
              {_buttons.includes("corp_auth_credit_credit") && <a href="javascript:" onClick={(e) => self.showCreditDialog(e,row)}>征信</a>}

              {_buttons.includes("corp_auth_detail") && <a href="javascript:" onClick={(e) => self.showDialog(e,row)}>授信记录</a>}
              {_buttons.includes("oper_log") && <a href="javascript:" onClick={() => self.openOperLogModal(row)}> 日志</a>}
            </div>
          </div>
        )
        }
      }
    ]



    this.detailColumns = [{
      text: '资金方',
      name: 'fund_org_code',
      style: {'width': '200px', textAlign: 'center'},
      renderDom: row => <FormatOrgCode value={row.fund_org_code}/>
    },{
      text: '授信状态',
      name: 'fund_credit_status',
      style: {'width': '200px', textAlign: 'center'},
      renderDom: row => <FormatEnterpriseFundCredit value={row.fund_credit_status} />
    },{
      text: '授信额度（万）',
      name: 'fund_credit_fee',
      style: {'width': '200px', textAlign: 'center'}
    },{
      text: '失败原因',
      name: 'fund_credit_refuse_reason',
      style: {textAlign: 'center'}
    }]

    this.creditDetailColumns = [{
      text: '授信机构',
      name: 'credit_org',
      style: {'width': '200px', textAlign: 'center'},
      renderDom: row => <FormatEnterpriseCreditCreditOrg value={row.credit_org} />
    },{
      text: '授信结果',
      name: 'credit_result',
      style: {'width': 'auto', textAlign: 'center'}
    }]

    this.searchBarItems = [
      {
        label: "资产方:",
        type:"custom",
        dom: (user_type === 2) ?
          <AssetRelatedUserFromSelector onChange={this.handleAssetOrgChange} fundOrgCode={session.org_code} userFrom="1"/>:
          <AssetUserFromSelector onChange={this.handleAssetOrgChange} userFrom="1"/>
      },
      {
        label: "授信状态:",
        type:"custom",
        dom: <EnterprimseCreditSelector onChange={this.handleStatusChange} multiple={true}/>
      },
      {
        label: "借款人名称:",
        type:"text",
        props:{
          ref:(input) => {this.corpName = input;}
        }
      },
      {
        label: "授信日期:",
        type:"daterange",
        props:{
          showClearDate:true,
          onDatesChange:self.handleDatesChange,
          output:"date",
          style: {width: "100%"}
        }
      }
    ]

      this.voucherColumns = [{
        text: '资料名称',
        name: 'voucher_name',
        withTitle: true,
        style: {maxWidth: "200px", overflow: 'hidden', textOverflow: 'ellipsis'}
      }, {
        text: '资料下载地址',
        name: 'voucher_url',
        withTitle: true,
        style: {maxWidth: "600px", overflow: 'hidden', textOverflow: 'ellipsis'},
        renderDom: (row) => (<a href={row['voucher_url']} download target="_blank">{row['voucher_url']}</a>)
      }]

    this.corpAuthColumns = [
      {text: '资产方机构号', name: 'asset_org_code'},
      {text: '营业执照号', name: 'borrow_business_license'},
      {text: '资产方授信状态', name: 'asset_credit_status', renderDom: row => <FormatEnterpriseAssetCredit value={row.asset_credit_status}/>},
      {text: '借款人名称', name: 'borrow_name'},
      {text: '组织机构代码', name: 'borrow_org_code'},
      {text: '开户许可证', name: 'borrow_account_licence'},
      {text: '信用代码证', name: 'borrow_credit_code'},
      {text: '税务登记证', name: 'borrow_tax_registration'},
      {text: '企业类型', name: 'borrow_enterprise_type', renderDom: row => <FormatEnterpriseAssetCreditBorrowEnterpriseType value={row.borrow_enterprise_type}/>},
      {text: '借款主体类型', name: 'borrow_type', renderDom: row => <FormatEnterpriseAssetCreditBorrowType value={row.borrow_type}/>},
      {text: '注册地址', name: 'borrow_registered_address'},
      {text: '经营地址', name: 'borrow_manage_address'},
      {text: '成立日期', name: 'borrow_register_date'},
      {text: '法人姓名', name: 'borrow_corporate_name'},
      {text: '法人身份证号', name: 'borrow_corporate_certificate_no'},
      {text: '联系人手机号', name: 'borrow_phone'},
      {text: '借款人邮箱', name: 'borrow_mail'},
      {text: '开户行', name: 'borrow_bank'},
      {text: '开户支行', name: 'borrow_branch_bank'},
      {text: '开户名称', name: 'borrow_bank_account_name'},
      {text: '开户银行账号', name: 'borrow_bank_account_no'},
      {text: '开户地址', name: 'borrow_bank_account_address'},
      {text: '行业', name: 'industry'},
      {text: '借款人收入及负债', name: 'income'},
      {text: '实缴资本（元）', name: 'paid_in_capital'},

    ]


  }

  componentDidMount() {
    this.handleSearch()
  }

  handleSearch(index) {
    const {type} = this.props
    let myIndex = ( typeof index == 'undefined') ? 1: index
    this.setState({index: myIndex})
    return this.props.searcher({
      pageIndex: myIndex,
      borrow_name: this.corpName.value,
      borrow_date_start: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00'),
      borrow_date_end: this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59'),
      fund_credit_status: type === 2 ? this.state.status : undefined,
      asset_credit_status: type !== 2 ? this.state.status : undefined,
      min_fee: this.minInput && this.minInput.value,
      max_fee: this.maxInput && this.maxInput.value,
      assetOrgCode: this.state.assetOrgCode,
      fundOrgCode: this.state.fundOrgCode,
      type: this.props.type
    })
  }

  showDialog(e, row) {
    e.preventDefault()
    e.stopPropagation()
    const _row = {...row}
    const {type} = this.props
    //let org_code = type === 3 ? _row.asset_org_code : this.props._session.org_code
    let org_code=_row.asset_org_code
    this.setState({_row}, ()=> {
      this.props.detailSearcher({
        assetOrgCode: org_code,
        fundOrgCode: this.state.fundOrgCode,
        borrow_business_license: _row.borrow_business_license
      })
    })
  }

  showCreditDialog(e, row) {
    e.preventDefault()
    e.stopPropagation()
    const _row = {...row}
    const {messageSetter} = this.props
    //let org_code = type === 3 ? _row.asset_org_code : this.props._session.org_code
    let org_code=_row.asset_org_code
    this.setState({_row}, ()=> {
      this.props.creditSearcher({
        assetOrgCode: org_code,
        borrow_business_license: _row.borrow_business_license,
      }).promise.then(({error_response:error})=>{
        if(error){
          this.clearOps()
          messageSetter(error.message,"WARN")
        }
      })
    })
  }


  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  handleDatesChange({startDate, endDate}) {
    this.setState({startDate, endDate}, this.handleSearch)
  }

  handleStatusChange(rows) {
    this.setState({status: rows.map(r=>r.value), index: 1}, this.handleSearch)
  }

  handleAssetOrgChange(row) {
    this.setState({assetOrgCode: row.value, index: 1}, this.handleSearch)
  }

  handleFundOrgChange(row) {
    this.setState({fundOrgCode: row.value, index: 1}, this.handleSearch)
  }

  openCorpAuthModal(row) {
    this.setState(Object.assign({}, this.state, {showCorpAuthModal: true, corpAuth: row}))
  }

  closeCorpAuthModal() {
    this.setState(Object.assign({}, this.state, {showCorpAuthModal: false, corpAuth: undefined}))
  }
  handleStartDatesChange(date) {
    this.setState({startDate:date}, this.handleSearch)
  }
  handleEndDatesChange(date) {
    this.setState({endDate:date}, this.handleSearch)
  }


  openCorpAuthVoucherModal(row) {
    this.setState({showVoucher: true})
    this.props.corpAuthVoucherSearcher({asset_org_code: row.asset_org_code,borrow_business_license:row.borrow_business_license})
  }

  closeCorpAuthVoucherModal() {
    this.setState({showVoucher: false})
    this.props.resetCorpAuthVoucher()
  }

  openMassDownloadConfirm() {
    this.setState({confirmMassDownload: true})
  }

  closeMassDownloadConfirm() {
    this.setState({confirmMassDownload: false})
  }

  openExportConfirm() {
    this.setState({confirmExport: true})
  }

  closeExportConfirm() {
    this.setState({confirmExport: false})
  }

  showAllVouchers() {
    const {type} = this.props
    this.setState({showAllVoucher: true})
    this.props.filterCorpAuthVoucherSearcher({
      borrow_name: this.corpName.value,
      borrow_date_start: this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00'),
      borrow_date_end: this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59'),
      fund_credit_status: type === 2 ? this.state.status : undefined,
      asset_credit_status: type !== 2 ? this.state.status : undefined,
      min_fee: this.minInput && this.minInput.value,
      max_fee: this.maxInput && this.maxInput.value,
      assetOrgCode: this.state.assetOrgCode,
      fundOrgCode: this.state.fundOrgCode,
      type: this.props.type
    })
  }

  hideAllVouchers() {
    this.setState({showAllVoucher: false})
    this.props.resetFilteredCorpAuthVoucher()
  }

  handleExport() {
    const {type} = this.props
    var {messageSetter} = this.props
    this.handleSearch().promise.then(({response})=>{
      if(response.success){
        if(response.total <= window.EDI_CLIENT.exportMaxRows){
          var browserType = getBrowserType(),
            queryString = `/corpAuth/export?borrow_name=${this.corpName && this.corpName.value ? this.corpName.value : ''}&borrow_date_start=${this.state.startDate && this.state.startDate.format('YYYY-MM-DD 00:00:00') || ''}&borrow_date_end=${this.state.endDate && this.state.endDate.format('YYYY-MM-DD 23:59:59') || ''}&asset_org_code=${this.state.assetOrgCode}&asset_credit_status=${type !== 2 ? this.state.status : ''}&fund_credit_status=${type === 2 ? this.state.status : ''}`
          messageSetter("导出即将开始","INFO")
          setTimeout(()=>{
            if (browserType == "Chrome") {
              this.hiddenLink.href = queryString
              this.hiddenLink.click()
            } else if (browserType == 'Safari') {
              //this.hiddenLink.href = queryString
              window.location.href = queryString
            } else if (browserType == 'Firefox') {
              //this.hiddenLink.href = queryString
              window.location.href = queryString
            } else {
              window.open(queryString, '_blank')
            }
          },2000)
        } else {
          messageSetter(`系统目前仅支持${window.EDI_CLIENT.exportMaxRows/10000}万条以内的导出，推荐按天导出`,"WARN")
        }
      }
    })
  }

  toggleOps(e, row) {
    e.preventDefault();
    e.stopPropagation();
    const {opsAssetOrgCode, opsBorrowBusinessLicense} = this.state
    if (opsAssetOrgCode == row.asset_org_code && opsBorrowBusinessLicense == row.borrow_business_license) {
      this.setState({opsAssetOrgCode: '', opsBorrowBusinessLicense: ''})
    } else {
      this.setState({opsAssetOrgCode: row.asset_org_code, opsBorrowBusinessLicense: row.borrow_business_license})
    }
  }

  clearOps() {
    if (this.state.opsAssetOrgCode && this.state.opsBorrowBusinessLicense) {
      this.setState({opsAssetOrgCode: '', opsBorrowBusinessLicense: ''})
    }
  }

  componentWillMount() {
    window.addEventListener("click", this.clearOps)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.clearOps);
  }

  openOperLogModal(row) {
    this.setState({
      operLogModalKey: row.asset_org_code + ',' + row.borrow_business_license,
      showOperLogModal: true
    })
  }

  hideOperLogModal() {
    this.setState({
      showOperLogModal: false
    })
  }

  openAuthResultUploadModal(){
    this.props.resetAuthUploadDetail()
    this.setState({showAuthResultUploadModal: true})
  }
  closeAuthResultUploadModal(){
    this.handleSearch()
    this.setState({showAuthResultUploadModal: false})
  }

  handleAuthResultConfirm(){
    const {authResultCreator} = this.props
    let promise = authResultCreator.apply(this, arguments).promise
    /*promise.then(({response})=>{
      if(response && response.success && !response.unmatched){
        //this.handleSearch()
        //this.closeAuthResultUploadModal()
      }
    })*/
    return promise
  }

  render() {
    const self = this
    const {corpAuth, navigateTo, type, _buttons, authResultMatcher} = this.props
    const column = type === 1 ? this.assetColumns : type === 2 ? this.fundColumns : this.adminColumns
    const {detail, creditDetail} = corpAuth

    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <div className="pull-left"  style={{marginRight: '1rem'}}>
            <button type="submit" className="btn icon-btn btn-primary" style={{marginLeft: 0}}>
              <i className="fa fa-search"></i>搜索
            </button>
          </div>
          {_buttons.includes("corp_auth_export") &&
          <button type="button" className="btn icon-btn btn-danger pull-right" onClick={this.openExportConfirm}>
            <i className="fa fa-download"></i>订单导出
          </button>
          }
          {(type != 2) && _buttons.includes("corp_auth_create") && <button type="button" className="btn icon-btn btn-success pull-right" onClick={()=>{navigateTo("createCorpCredit")}}>
            <i className="fa fa-plus"></i>授信创建
          </button>}
          {_buttons.includes("corp_auth_voucher_download") &&
          <button type="button" className="btn icon-btn btn-danger pull-right" onClick={this.openMassDownloadConfirm}>
            <i className="fa fa-files-o"></i>资料下载
          </button>
          }
          {(type != 2) && _buttons.includes("corp_auth_supplement") && <button type="button" className="btn icon-btn btn-warning pull-right" onClick={()=>{navigateTo("supplementCorpCredit")}}>
            <i className="fa fa-plus-circle"></i>资料补充
          </button>}

          {_buttons.includes("corp_auth_auth_result_upload") &&
          <button type="button" className="btn icon-btn btn-warning pull-right" onClick={this.openAuthResultUploadModal}>
            <i className="fa fa-upload"></i>上传授信结果
          </button>}

        </SearchBar>

        <div className="wrapper">
          <Datatable columns={column} rows={corpAuth.rows} index={this.state.index} searcher={this.handleSearch}
                     total={corpAuth.total}/>
        </div>

        {this.state.showCorpAuthModal &&
        <Modal data={[this.state.corpAuth]} title="授信详情" columns={this.corpAuthColumns} closer={this.closeCorpAuthModal}/>
        }

        {this.state.showVoucher  && corpAuth.voucherList && corpAuth.voucherList.length > 0 &&
        <TableMode columns={this.voucherColumns} data={corpAuth.voucherList} title="资料下载" closer={this.closeCorpAuthVoucherModal}/>
        }
        {this.state.showAllVoucher && corpAuth.allVouchers && corpAuth.allVouchers.length > 0 &&
        <VoucherTableMode columns={this.voucherColumns} data={corpAuth.allVouchers} title="订单搜索结果所含资料一览"
                          closer={this.hideAllVouchers}/>
        }
        {this.state.confirmExport && <Dialog confirm={(e) => {
          self.handleExport(e)
          self.closeExportConfirm()
        }} title="请确认" closer={this.closeExportConfirm} size="modal-md">
          超大量导出订单会存在失败的可能或下载速度慢，建议减少单次下载量<br/>
          系统目前仅支持{window.EDI_CLIENT.exportMaxRows/10000}万条以内的导出，如有更多数据需要导出，请另行联系我们<br />
          您确定要对{corpAuth.total}条订单数据做导出操作么?
        </Dialog>
        }
        {this.state.confirmMassDownload && <Dialog confirm={(e) => {
          self.showAllVouchers(e)
          self.closeMassDownloadConfirm()
        }} title="请确认" closer={this.closeMassDownloadConfirm} size="modal-md">
          超大量数据检索会存在失败的可能或速度慢<br/>
          您确定要对{corpAuth.total}条订单数据逐条检索查询出所有资料么?
        </Dialog>
        }


        <a download="true" className="hidden" target="_blank" ref={(link) => {this.hiddenLink = link}}/>
        { detail && detail.length > 0 && <TableMode columns={this.detailColumns} data={detail} title="企业授信记录" corpName={this.state._row.borrow_name} closer={this.props.closeDetail} />}
        { creditDetail && creditDetail.length > 0 && <TableMode columns={this.creditDetailColumns} data={creditDetail} title="企业征信" corpName={this.state._row.borrow_name} closer={this.props.closeCreditDetail} />}
        { this.state.showOperLogModal &&
        <OperLogModal  tableName={'t_enterprise_asset_credit'} tableKey={this.state.operLogModalKey} title="企业授信日志"
                      closer={ this.hideOperLogModal } />
        }
        {this.state.showAuthResultUploadModal && <AuthResultUploadModal detail={corpAuth.uploadDetail} matcher={authResultMatcher} closer={this.closeAuthResultUploadModal} confirm={this.handleAuthResultConfirm} working={corpAuth.working} title="上传授信结果"/>}

      </div>
    )
  }
}
