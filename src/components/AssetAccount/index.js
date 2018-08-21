import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import OperLogModal from '../Modal/OperLogModal'
import Datatable from '../Datatable/DatatableScroll'
import AssetRestrictedSelector from '../Select/AssetRestrictedSelectorPage'
import FundRestrictedSelector from '../Select/FundRestrictedSelectorPage'

/**
 * 作者：张宝玉
 * 模块：账户信息
 * */

export default class AssetAccount extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: 0,
      assetCode: "",
      fundCode: "",
      showMode: false,
      showOperLogModal: false,
      data: {},
      message: {
        gathering_name: '',
        gathering_bank: '',
        gathering_card_no: '',
      }
    }
    this.showMode = this.showMode.bind(this)
    this.hideMode = this.hideMode.bind(this)
    this.update = this.update.bind(this)
    this.openModeToEdit = this.openModeToEdit.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.customRender = this.customRender.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.renderFundOrganizations = this.renderFundOrganizations.bind(this)
    this.renderAssetOrganizations = this.renderAssetOrganizations.bind(this)
    this.getFundOrganizations = this.getFundOrganizations.bind(this)
    this.getAssetOrganizations = this.getAssetOrganizations.bind(this)
    this.formatOrganizationCode = this.formatOrganizationCode.bind(this)
    this.formatAssetAccountPurpose = this.formatAssetAccountPurpose.bind(this)
    this.formatFundAccountPurpose = this.formatFundAccountPurpose.bind(this)
    this.selectTab = this.selectTab.bind(this)
    this.getRowIndex = this.getRowIndex.bind(this)
    this.openOperLogModal = this.openOperLogModal.bind(this)
    this.hideOperLogModal = this.hideOperLogModal.bind(this)

    var self = this
    this.assetGatheringAccountColumns = [
      {
        text: '资金方机构编码',
        name: 'fund_org_code',
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center'}
        //renderDom: row => this.formatOrganizationCode(row.asset_org_code)
      },
      {
        text: '资金方简称',
        name: 'fund_org_name',
        withTitle: true,
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center', overflow: 'hidden'},
        renderDom: row => this.formatOrganizationCode(row.fund_org_code)
      },
      {
        text: '收款账户名称',
        name: 'gathering_name',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账户开户行',
        name: 'gathering_bank',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账号',
        name: 'gathering_card_no',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '账户用途',
        name: 'account_purpose',
        style: {width: '140px', maxWidth: '140px', minWidth: '140px', textAlign: 'left'},
        renderDom: row => this.formatAssetAccountPurpose(row.account_purpose)
      },
      {
        text: '操作', style: {textAlign: 'center', width: '80px', maxWidth: '80px', minWidth: '80px'}, renderDom: row => {
          const {_buttons} = self.props
          return (
            <div styleName="table-ops">
              {Array.isArray(_buttons) && _buttons.includes("asset_account_setting") &&
              <a href="javascript:" onClick={() => self.openModeToEdit(row)}>设置</a>}
              {Array.isArray(_buttons) && _buttons.includes("oper_log") &&
              <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
            </div>
          )
        }
      }
    ]

    this.assetViewAccountColumns = [
      {
        text: '资金方机构编码',
        name: 'fund_org_code',
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center'}
        //renderDom: row => this.formatOrganizationCode(row.asset_org_code)
      },
      {
        text: '资金方简称',
        name: 'fund_org_name',
        withTitle: true,
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center', overflow: 'hidden'},
        renderDom: row => this.formatOrganizationCode(row.fund_org_code)
      },
      {
        text: '收款账户名称',
        name: 'gathering_name',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账户开户行',
        name: 'gathering_bank',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账号',
        name: 'gathering_card_no',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '账户用途',
        name: 'account_purpose',
        style: {width: '140px', maxWidth: '140px', minWidth: '140px', textAlign: 'left'},
        renderDom: row => this.formatFundAccountPurpose(row.account_purpose)
      }
    ]

    this.fundGatheringAccountColumns = [
      {
        text: '资产方机构编码',
        name: 'asset_org_code',
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center'}
        //renderDom: row => this.formatOrganizationCode(row.asset_org_code)
      },
      {
        text: '资产方简称',
        name: 'asset_org_name',
        withTitle: true,
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center', overflow: 'hidden'},
        renderDom: row => this.formatOrganizationCode(row.asset_org_code)
      },
      {
        text: '收款账户名称',
        name: 'gathering_name',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账户开户行',
        name: 'gathering_bank',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账号',
        name: 'gathering_card_no',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '账户用途',
        name: 'account_purpose',
        style: {width: '140px', maxWidth: '140px', minWidth: '140px', textAlign: 'left'},
        renderDom: row => this.formatFundAccountPurpose(row.account_purpose)
      },
      {
        text: '操作', style: {textAlign: 'center', width: '100px', maxWidth: '100px', minWidth: '100px'}, renderDom: row => {
          const {_buttons} = self.props
          return (
            <div styleName="table-ops">
              {Array.isArray(_buttons) && _buttons.includes("asset_account_setting") &&
              <a href="javascript:" onClick={() => self.openModeToEdit(row)}>设置</a>}
              {Array.isArray(_buttons) && _buttons.includes("oper_log") &&
              <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
            </div>
          )
        }
      }
    ]

    this.fundViewAccountColumns = [
      {
        text: '资产方机构编码',
        name: 'asset_org_code',
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center'}
        //renderDom: row => this.formatOrganizationCode(row.asset_org_code)
      },
      {
        text: '资产方简称',
        name: 'asset_org_name',
        withTitle: true,
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center', overflow: 'hidden'},
        renderDom: row => this.formatOrganizationCode(row.asset_org_code)
      },
      {
        text: '收款账户名称',
        name: 'gathering_name',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账户开户行',
        name: 'gathering_bank',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账号',
        name: 'gathering_card_no',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '账户用途',
        name: 'account_purpose',
        style: {width: '140px', maxWidth: '140px', minWidth: '140px', textAlign: 'left'},
        renderDom: row => this.formatAssetAccountPurpose(row.account_purpose)
      }
    ]

    this.rowAccountColumns = [
      {
        text: '序号',
        name: 'num',
        style: {width: '80px', maxWidth: '80px', minWidth: '80px', textAlign: 'center'},
        renderDom: this.getRowIndex
      },
      {
        text: '资产方',
        name: 'asset_org_name',
        withTitle: true,
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center', overflow: 'hidden'},
        renderDom: row => this.formatOrganizationCode(row.asset_org_code)
      },
      {
        text: '资金方',
        name: 'asset_org_name',
        withTitle: true,
        style: {width: '120px', maxWidth: '120px', minWidth: '120px', textAlign: 'center', overflow: 'hidden'},
        renderDom: row => this.formatOrganizationCode(row.fund_org_code)
      },
      {
        text: '收款账户名称',
        name: 'gathering_name',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账户开户行',
        name: 'gathering_bank',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '收款账号',
        name: 'gathering_card_no',
        withTitle: true,
        style: {width: '200px', maxWidth: '200px', minWidth: '200px', textAlign: 'left', overflow: 'hidden'}
      },
      {
        text: '账户用途',
        name: 'account_purpose',
        style: {width: '140px', maxWidth: '140px', minWidth: '140px', textAlign: 'left'},
        renderDom: row => this.formatAssetAccountPurpose(row.account_purpose)
      },
      {
        text: '操作', style: {textAlign: 'center', width: '80px', maxWidth: '80px', minWidth: '80px'}, renderDom: row => {
          const {_buttons} = self.props
          return (
            <div>
              {Array.isArray(_buttons) && _buttons.includes("oper_log") &&
              <a href="javascript:" onClick={() => self.openOperLogModal(row)}>日志</a>}
            </div>
          )
        }
      }
    ]

    this.modalColumns = [
      {
        text: self.props._session.user_type == 1 ? '资金方机构号' : '合作方机构号',
        name: self.props._session.user_type == 1 ? 'fund_org_code' : 'asset_org_code',
        readOnly: true
      },
      {
        text: self.props._session.user_type == 1 ? '资金方简称' : '合作方简称',
        name: '',
        readOnly: true,
        renderDom: () => <div className="form-text">{self.props._session.user_type == 1 ? this.formatOrganizationCode(self.state.data.fund_org_code) : this.formatOrganizationCode(self.state.data.asset_org_code)}</div>
      },
      {
        text: '账户用途',
        name: '',
        readOnly: true,
        renderDom: () => <div className="form-text">{this.formatAssetAccountPurpose(self.state.data.account_purpose)}</div>
      },
      {
        name: 'gathering_name',
        text: '收款账户名称',
        type: 'text',
        handleChange(e) {
          self.state.data.gathering_name = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.gathering_name == undefined) || !row.gathering_name) ? "必填" : ((row.gathering_name.getUnicodeLength() > 50) ? "收款账户名称不能超过50字节" : null)
        }
      },
      {
        name: 'gathering_bank',
        text: '收款账户开户行',
        type: 'text',
        handleChange(e) {
          self.state.data.gathering_bank = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.gathering_bank == undefined) || !row.gathering_bank) ? "必填" : ((row.gathering_bank.getUnicodeLength() > 50) ? "收款账户开户行不能超过50字节" : null)
        }
      },
      {
        name: 'gathering_card_no',
        text: '收款账号',
        type: 'text',
        handleChange(e) {
          self.state.data.gathering_card_no = e.target.value
        },
        validate: () => {
          var row = self.state.data
          return ((typeof row.gathering_card_no == undefined) || !row.gathering_card_no) ? "必填" : ((row.gathering_card_no.getUnicodeLength() > 50) ? "收款账号不能超过50字节" : null)
        }
      }
      ]
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleSearch() {
    const {_session} = this.props
    this.props.searcher({
      assetOrgCode: _session && (_session.user_type == 1) ? _session.org_code : this.state.assetCode,
      fundOrgCode: _session && (_session.user_type == 2) ? _session.org_code : this.state.fundCode
    })
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

  hideOperLogModal() {
    this.setState({
      showOperLogModal: false
    })
  }

  update(e) {
    e.preventDefault();
    e.stopPropagation();
    let {message} = this.state, valid = true

    this.modalColumns.map(r => {
      message[r.name] = r.validate && r.validate()
    })

    for (var props in message) {
      if (message[props]) {
        valid = false
      }
    }
    if (valid) {
      this.setState({showMode: false})
      //const {old_password,new_password,confirm_password,user_name,mobile,email,user_id} = this.state.data
      this.props.resetMessage()
      this.props.assetAccountUpdate(this.state.data).promise.then(({response}) => {
        if (response.success) {
          return this.props.callDic().promise.then(({response}) => {
            this.props.setMessage("账户信息更新成功", "SUCCESS")
          })
        }
      })
    } else {
      this.setState({message: {...message}})
    }
  }

  openModeToEdit(row) {
    this.setState({
      data: {...row},
      showMode: true
    })
  }

  openOperLogModal(row) {
    this.setState({
      data: {...row},
      showOperLogModal: true
    })
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  formatOrganizationCode(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  formatAssetAccountPurpose(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_asset_account')).filter(r => (r.col_name == "account_purpose")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  formatFundAccountPurpose(s) {
    var {dictionary} = this.props,
      period = dictionary.filter(r => (r.table_name == 't_fund_account')).filter(r => (r.col_name == "account_purpose")),
      result = period.filter(r => (s == r.para_key))[0]
    return result ? result.para_value : s
  }

  getRowIndex(row) {
    return this.props.data.allRows.indexOf(row) + 1
  }

  handleAssetOrgChange(row) {
    let assetCode = row.value
    this.setState({assetCode}, () => {
      this.handleSearch()
    })
  }

  handleFundOrgChange(row) {
    let fundCode = row.value
    this.setState({fundCode}, () => {
      this.handleSearch()
    })
  }

  getFundOrganizations() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")).filter(r => r.para_key.startsWith("F"))
  }

  getAssetOrganizations() {
    var {dictionary} = this.props
    return dictionary.filter(r => (r.table_name == 't_user')).filter(r => (r.col_name == "org_code")).filter(r => r.para_key.startsWith("A"))
  }

  renderFundOrganizations() {
    var funds = this.getFundOrganizations()

    return (
      <FundRestrictedSelector onChange={this.handleFundOrgChange}/>
    )
  }

  renderAssetOrganizations() {
    var asset = this.getAssetOrganizations()

    return (
      <AssetRestrictedSelector onChange={this.handleAssetOrgChange}/>
    )
  }


  customRender() {
    const {user_type} = this.props._session
    return <div style={{position: 'absolute', bottom: '1.5rem', left: '2rem', color: 'red'}}>{`*请务必跟相关${user_type === 1 ? '资金方' : '资产方'}协商后再调整`}</div>
  }

  selectTab(e, tab) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({tab})
  }

  render() {

    const {data, _session} = this.props
    const {tab} = this.state

    return (
      <div className="component">
        <form className="filter-form clearfix" onSubmit={this.onSearch}>
          <div className="row info-row">
            {_session && (_session.user_type == 3 || _session.user_type == 2) &&
            <div className="col-sm-3">
              <label className="col-sm-3 filter-form__static-text">
                <span>资产方:</span>
              </label>
              <div className="col-sm-8">
                <AssetRestrictedSelector onChange={this.handleAssetOrgChange}/>
              </div>
            </div>
            }
            {_session && (_session.user_type == 3 || _session.user_type == 1) &&
            <div className="col-sm-3">
              <label className="col-sm-3 filter-form__static-text">
                <span>资金方:</span>
              </label>
              <div className="col-sm-8">
                <FundRestrictedSelector onChange={this.handleFundOrgChange}/>
              </div>
            </div>
            }
            <div className="col-sm-3">
              <button type="submit" className="btn icon-btn btn-primary pull-left">
                <i className="fa fa-search"></i>搜索
              </button>
            </div>
          </div>
        </form>

        {_session && (_session.user_type === 3) &&
        <div className="wrapper">
          <Datatable columns={this.rowAccountColumns} rows={data.allRows}
                     searcher={this.handleSearch} noPgaging={true} bodyHeight={"26rem"}/>
        </div>
        }

        {_session && (_session.user_type === 1) &&
        <div className="wrapper">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={(tab == 0) ? 'active' : ''} onClick={e => this.selectTab(e, 0)}>
              <a href="javascript:;">维护收款账户</a>
            </li>
            <li role="presentation" className={(tab == 1) ? 'active' : ''} onClick={e => this.selectTab(e, 1)}>
              <a href="javascript:;">查看资金方账户</a>
            </li>
          </ul>
          {
            tab == 0 &&
            <div className="wrapper__tab-area">
              <Datatable columns={this.assetGatheringAccountColumns} rows={data.assetRows}
                         searcher={this.handleSearch} noPgaging={true} style={{minWidth: '1242px', overflowX: 'auto'}} bodyHeight={"21rem"}/>
            </div>
          }
          {
            tab == 1 &&
            <div className="wrapper__tab-area">

              <Datatable columns={this.assetViewAccountColumns} rows={data.fundRows}
                         searcher={this.handleSearch} noPgaging={true} style={{minWidth: '1242px', overflowX: 'auto'}} bodyHeight={"21rem"}/>
            </div>
          }

        </div>
        }

        {_session && (_session.user_type == 2) &&
        <div className="wrapper">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={(tab == 0) ? 'active' : ''} onClick={e => this.selectTab(e, 0)}>
              <a href="javascript:;">维护收款账户</a>
            </li>
            <li role="presentation" className={(tab == 1) ? 'active' : ''} onClick={e => this.selectTab(e, 1)}>
              <a href="javascript:;">查看资产方账户</a>
            </li>
          </ul>
          {
            tab == 0 &&
            <div className="wrapper__tab-area">

              <Datatable columns={this.fundGatheringAccountColumns} rows={data.fundRows}
                         searcher={this.handleSearch} noPgaging={true} style={{minWidth: '1242px', overflowX: 'auto'}} bodyHeight={"21rem"}/>
            </div>
          }
          {
            tab == 1 &&
            <div className="wrapper__tab-area">

              <Datatable columns={this.fundViewAccountColumns} rows={data.assetRows}
                         searcher={this.handleSearch} noPgaging={true} style={{minWidth: '1242px', overflowX: 'auto'}} bodyHeight={"21rem"}/>
            </div>
          }

        </div>
        }

        {this.state.showMode &&
        <Modal data={this.state.data} columns={this.modalColumns} message={this.state.message}
               title={"设置" + this.formatAssetAccountPurpose(this.state.data.account_purpose)}
               closer={this.hideMode} customRender={this.customRender} confirm={this.update}/>}

        { this.state.showOperLogModal &&
        <OperLogModal data={this.state.data} tableName={this.state.data.account_purpose === '001' ? 't_asset_account' : 't_fund_account'} tableKey={this.state.data.fund_org_code+','+this.state.data.asset_org_code+','+this.state.data.account_purpose} title="账户信息日志"
               closer={ this.hideOperLogModal } /> }
      </div>
    )
  }
}

// 请务必跟相关资金方协商后再调整
