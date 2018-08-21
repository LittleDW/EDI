import React, { Component } from 'react'
import style from "./style.scss"
import CSSModules from 'react-css-modules';
import DailyFilter from "./DailyFilter";
import WeeklyFilter from "../Common/WeeklyFilter";
import MonthlyFilter from "./MonthlyFilter";
import Tab1 from './Tab1'
import Tab2 from './Tab2'
import Tab3 from './Tab3'
import AssetUserFromSelectorPage from '../Select/AssetUserFromSelectorPage'
import FundUserFromSelectorPage from '../Select/FundUserFromSelectorPage'

@CSSModules(style, {allowMultiple: true})
export default class Statistics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startDate: '',
      endDate: '',
      fundOrgCode: props.Role === '2' ? props._session.org_code : '',
      assetOrgCode: props.Role === '1' ? props._session.org_code : '',
      deadline_id: '',
      role: props.Role,
      tab: 1
    }

    this.selectTab = this.selectTab.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleOrgChange = this.handleOrgChange.bind(this)
    this.handleDeadlineChange = this.handleDeadlineChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.searchTotalData = this.searchTotalData.bind(this)
    this.searchOrgData = this.searchOrgData.bind(this)
    this.searchDeadlineData = this.searchDeadlineData.bind(this)

    this.renderSelect = () => {
      const {Role} = this.props
      const {assetOrgCode, fundOrgCode} = this.state
      if (Role === '2') {
        return (<AssetUserFromSelectorPage onChange={this.handleOrgChange} extValue={assetOrgCode} userFrom={"1"} optionStyle={{'max-height': '300px'}}/>)
      } else {
        return (<FundUserFromSelectorPage onChange={this.handleOrgChange} extValue={fundOrgCode} userFrom={"1"} optionStyle={{'max-height': '300px'}}/>)
      }
    }

    this.handleOrgChange = ({value}) => {
      if (this.props.Role === '1') {
        if (this.state.fundOrgCode === value) {
          return
        }
        this.setState({fundOrgCode: value}, this.searchDeadlineData)
      }
      else {
        if (this.state.assetOrgCode === value) {
          return
        }
        this.setState({assetOrgCode: value}, this.searchDeadlineData)
      }
    }


  }

  componentDidMount() {
  }

  selectTab(e, tab) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ tab })
  }

  handleDateChange({startDate, endDate}) {
    this.setState({startDate, endDate}, this.handleSearch)
  }

  handleSearch() {
    this.searchTotalData()
    this.searchOrgData()
    this.searchDeadlineData()
  }

  searchTotalData() {
    const {startDate, endDate, assetOrgCode, fundOrgCode, role} = this.state
    this.props.getTotalList({startDate, endDate, assetOrgCode, fundOrgCode, role})
  }

  searchOrgData() {
    let {startDate, endDate, assetOrgCode, fundOrgCode, role, deadline_id} = this.state
    this.props.getFundStatisticsFundOrAsset({startDate, endDate, assetOrgCode, fundOrgCode, role, deadline_id})
  }

  handleOrgChange(org_code) {
    const {Role} = this.props
    if (Role === '1') {
      this.setState({fundOrgCode: org_code}, this.searchDeadlineData)
    } else {
      this.setState({assetOrgCode: org_code}, this.searchDeadlineData)
    }
  }

  searchDeadlineData() {
    const {startDate, endDate, deadline_id, assetOrgCode, fundOrgCode, role} = this.state
    this.props.getFundStatisticsDeadline({startDate, endDate, deadline_id, assetOrgCode, fundOrgCode, role})
  }

  handleDeadlineChange({value: deadline_id}) {
    if (this.state.deadline_id === deadline_id) {
      return
    }
    this.setState({deadline_id}, this.searchOrgData)
  }

  render() {
    const { Period, Role, fundStatistics, dictionary, deadlineList } = this.props
    const {tab, deadline_id} = this.state
    const {totalList, orgDataList, deadlineDataList} = fundStatistics
    return (
      <div className='component'>
        <form className='clearfix filter-form'>
          <div className='row info-row'>
            {Period === '0' && <DailyFilter handleDateChange={this.handleDateChange}/>}
            {Period === '1' && <div className='row col-sm-8 info-row'><WeeklyFilter handleDateChange={this.handleDateChange} whichWeek={'last'}/></div>}
            {Period === '2' && <MonthlyFilter handleDateChange={this.handleDateChange}/>}
          </div>
        </form>
        <div className='wrapper'>
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={(tab === 1) ? 'active' : ''} onClick={e => this.selectTab(e, 1)}><a href="javascript:;">满标统计</a></li>
            <li role="presentation" className={(tab === 2) ? 'active' : ''} onClick={e => this.selectTab(e, 2)}><a href="javascript:;">{Role === '1' ? '资金方分布' : '资产方分布'}</a></li>
            <li role="presentation" className={(tab === 3) ? 'active' : ''} onClick={e => this.selectTab(e, 3)}><a href="javascript:;">期限分布</a></li>
          </ul>
          <span className="unit">单位：万元</span>
          <div>
            {tab === 1 && <div><Tab1 data={totalList} dictionary={dictionary} role={Role}/></div>}
            {tab === 2 && <div><Tab2 data={orgDataList} dictionary={dictionary} search={this.handleDeadlineChange} role={Role} extValue={deadline_id}/></div>}
            {tab === 3 && <div><Tab3 data={deadlineDataList} dictionary={dictionary} search={this.handleOrgChange} role={Role}>
              <div>
                {<div className="col-sm-3">
                  <label className="col-sm-4 filter-form__static-text">
                    <span>{Role === '2' ? '资产方:' : '资金方'}</span>
                  </label>
                  <div className="col-sm-8">
                    {this.renderSelect()}
                  </div>
                </div>}
              </div>
            </Tab3></div>}
          </div>
        </div>
      </div>
    )
  }
}
