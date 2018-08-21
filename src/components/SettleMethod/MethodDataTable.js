import React, {Component} from 'react'
import Datatable from '../Datatable/DatatableScroll'
import FormatOrgCodePage from '../Formatter/FormatOrgCodePage'
import {formatOrganizationCode} from "../../utils/etc";


export default class MethodDataTable extends Component {
  constructor(props) {
    super(props)

    const self = this
    const {user_type} = props
    let assetColumnTemplate = [{
      text: '机构编码',
      name: 'fund_org_code',
      style: {textAlign: 'center', width: '100px', minWidth: '100px', maxWidth: '100px'}
    }, {
      text: '资金方',
      name: 'raise_fee',
      renderDom: (row) => <FormatOrgCodePage value={row.fund_org_code}/>,
      style: {textAlign: 'center', width: '120px', minWidth: '120px', maxWidth: '120px'}
    }, {
      text: '资金方全称',
      name: 'fund_user_full_name',
      style: {textAlign: 'center', width: '180px', minWidth: '180px', maxWidth: '180px', overflow: 'hidden'}
    },]
    let fundColumnTemplate = [{
      text: '机构编码',
      name: 'asset_org_code',
      style: {textAlign: 'center', width: '100px', minWidth: '100px', maxWidth: '100px'}
    }, {
      text: '资产方',
      name: 'raise_fee',
      renderDom: (row) => <FormatOrgCodePage value={row.asset_org_code}/>,
      style: {textAlign: 'center', width: '120px', minWidth: '120px', maxWidth: '120px'}
    }, {
      text: '资产方全称',
      name: 'asset_user_full_name',
      style: {textAlign: 'center', width: '180px', minWidth: '180px', maxWidth: '180px', overflow: 'hidden'}
    },]

    this.orgColumns = [{
      text: '序号',
      name: '',
      renderDom: (row) => self.props.data.indexOf(row) + 1,
      style: {textAlign: 'center', width: '50px', minWidth: '50px', maxWidth: '50px'}
    }, {
      text: '综合费率',
      name: 'total_rate',
      renderDom: row => <span>{`${row.total_rate}%`}</span>,
      style: {textAlign: 'center', width: '120px', minWidth: '120px', maxWidth: '120px'}
    }, {
      text: '计息方式',
      name: 'interest_mode',
      renderDom: row => {
        const mode = self.props.interestModeList.find(item => item.value === row.interest_mode);
        return mode ? mode.label : row.interest_mode
      },
      style: {textAlign: 'center', width: '120px', minWidth: '120px', maxWidth: '120px'}
    }, {
      text: '服务费结算方式',
      name: 'service_mode',
      renderDom: row => {
        const service = self.props.serviceModeList.find(item => item.value === row.service_mode);
        return service ? service.label : row.service_mode
      },
      style: {textAlign: 'center', width: '120px', minWidth: '120px', maxWidth: '120px'}
    }, {
      text: '附件',
      name: '',
      style: {textAlign: 'center', width: '300px', minWidth: '300px', maxWidth: '300px'},
      renderDom: row => {
        let result = []
        if (row.borrow_agreements_url) {
          result.push(<a href={row.borrow_agreements_url} target="_blank" download key={'borrow_agreements_url'}> 借款服务协议样本 </a>)
        }
        if (row.cooperative_agreements_url) {
          result.push(<a href={row.cooperative_agreements_url} target="_blank" download key={'cooperative_agreements_url'}> 合作协议 </a>)
        }
        if (row.due_diligence_url) {
          result.push(<a href={row.due_diligence_url} target="_blank" download key={'due_diligence_url'}> 尽调报告 </a>)
        }
        if (row.guarantee_url) {
          result.push(<a href={row.guarantee_url} target="_blank" download key={'guarantee_url'}> 担保函 </a>)
        }
        if (row.other_agreements_url) {
          result.push(<a href={row.other_agreements_url} target="_blank" download key={'other_agreements_url'}> 其他 </a>)
        }
        return result
      }
    }, {
      text: '来源',
      name: user_type === 1 ? 'fund_user_from': 'asset_user_from',
      renderDom: row => {
        const userFrom = self.props.userFromList.find(item => item.value === row[user_type === 1 ? 'fund_user_from': 'asset_user_from']);
        return userFrom ? userFrom.label : row.service_mode
      },
      style: {textAlign: 'center', width: '120px', minWidth: '120px', maxWidth: '120px'}
    }, {
      text: '操作',
      name: '',
      style: {textAlign: 'center', width: '120px', minWidth: '120px', maxWidth: '120px'},
      renderDom: row => (
        [(user_type !== 1 || row.fund_user_from === '2') && Array.isArray(this.props._buttons) && this.props._buttons.includes("settle_method_oper") ? <a  className="edi-mr-sm" href="javascript:" key={'setting'} onClick={(e) => this.toggleModal(row)}>设置</a> : '',
          Array.isArray(this.props._buttons) && this.props._buttons.includes("oper_log") ? <a className="edi-mr-sm" href="javascript:" key={'history'} onClick={() => this.props.openOperLogModal(row)}>日志</a> : ''

          ]

      )
    }]

    switch (user_type) {
      case 1:
        this.orgColumns.splice(1, 0, ...assetColumnTemplate);
        break;
      case 2:
        this.orgColumns.splice(1, 0, ...fundColumnTemplate);
        break;
      default:
        this.orgColumns.splice(1, 0, fundColumnTemplate[1]);
        this.orgColumns.splice(1, 0, assetColumnTemplate[1]);
        this.orgColumns.splice(-3)
        break;
    }

    this.toggleModal = (row) => {
      let _row = {...row}
      if (this.props.user_type === 1) {
        _row.orgCode = row.fund_org_code
        _row.orgFullName = row.fund_user_full_name
        _row.orgName = formatOrganizationCode(_row.orgCode, this.props.DICTIONARY)
      } else {
        _row.orgCode = row.asset_org_code
        _row.orgFullName = row.asset_user_full_name
        _row.orgName = formatOrganizationCode(_row.orgCode, this.props.DICTIONARY)
      }
      this.props.toggleModal(_row)
    }
  }

  render() {
    const {data} = this.props
    return (
      <Datatable columns={this.orgColumns} rows={data} bodyHeight='26rem'/>
    )
  }
}
