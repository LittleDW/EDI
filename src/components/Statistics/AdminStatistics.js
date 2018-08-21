import React, {Component} from 'react'
import DailyFilter from './DailyFilter';
import WeeklyFilter from '../Common/WeeklyFilter';
import MonthlyFilter from './MonthlyFilter';
import AdminTab1 from './AdminTab1'
import Tab2 from './Tab2'
import Tab3 from './Tab3'
import AssetRelatedUserFromSelectorPage from '../Select/AssetRelatedUserFromSelectorPage'
import FundRelatedUserFromSelectorPage from '../Select/FundRelatedUserFromSelectorPage'
import AssetUserFromSelectorPage from '../Select/AssetUserFromSelectorPage'
import FundUserFromSelectorPage from '../Select/FundUserFromSelectorPage'


export default class AdminStatistics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startDate: '',
      endDate: '',
      fundOrgCode: '',
      assetOrgCode: '',
      deadline_id: '',
      tab: 1,
      showChart: false,
    }

    this.selectTab = this.selectTab.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleOrgChange = this.handleOrgChange.bind(this)
    this.handleDeadlineChange = this.handleDeadlineChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleLastTwoTabSearch = this.handleLastTwoTabSearch.bind(this)
    this.searchTotalData = this.searchTotalData.bind(this)
    this.searchOrgData = this.searchOrgData.bind(this)
    this.searchDeadlineData = this.searchDeadlineData.bind(this)

    this.renderAssetOrganizations = () => {
      const {assetOrgCode} = this.state
      return (
        <AssetUserFromSelectorPage onChange={this.handleAssetOrgChange} extValue={assetOrgCode} userFrom={"1"} optionStyle={{'max-height': '300px'}}/>
      )
    }

    this.renderFundOrganizations = () => {
      const {fundOrgCode} = this.state
      return (
        <FundUserFromSelectorPage onChange={this.handleFundOrgChange} extValue={fundOrgCode} userFrom={"1"} optionStyle={{'max-height': '300px'}}/>
      )
    }

    this.handleFundOrgChange = ({value}) => {
      if (value === this.state.fundOrgCode) {
        return
      }
      this.setState({fundOrgCode: value}, this.handleLastTwoTabSearch)
    }

    this.handleAssetOrgChange = ({value}) => {
      if (value === this.state.assetOrgCode) {
        return
      }
      this.setState({assetOrgCode: value}, this.handleLastTwoTabSearch)
    }

    this.renderSelect = () => {
      const {assetOrgCode, fundOrgCode} = this.state
      const {Role} = this.props
      const extValue = Role === '2' ? assetOrgCode : fundOrgCode
      if (Role === '2') {
        return (
          <AssetRelatedUserFromSelectorPage onChange={this.handleSecondSelectChange} extValue={extValue} fundOrgCode={fundOrgCode} userFrom={"1"} allowEmpty optionStyle={{'max-height': '300px'}}/>
        )
      } else {
        return (
          <FundRelatedUserFromSelectorPage onChange={this.handleSecondSelectChange} extValue={extValue} assetOrgCode={assetOrgCode} userFrom={"1"} allowEmpty optionStyle={{'max-height': '300px'}}/>
        )
      }
    }

    this.handleSecondSelectChange = ({value}) => {
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

  selectTab(e, tab) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({tab})
  }

  handleDateChange({startDate, endDate}) {
    if (startDate === this.state.startDate && endDate === this.state.endDate) {
      return
    }
    this.setState({startDate, endDate}, this.handleSearch)
  }

  handleSearch() {
    this.searchTotalData()
    this.handleLastTwoTabSearch()
  }

  handleLastTwoTabSearch() {
    this.searchOrgData()
    this.searchDeadlineData()
  }

  searchTotalData() {
    const {startDate, endDate} = this.state
    const role = this.props.Role
    this.props.getTotalList({startDate, endDate, role}).promise.then(() => {
      this.setState({showChart: true})
    })
  }

  searchOrgData() {
    let {startDate, endDate, assetOrgCode, fundOrgCode, deadline_id} = this.state
    const role = this.props.Role
    this.props.getFundStatisticsFundOrAsset({startDate, endDate, assetOrgCode, fundOrgCode, role, deadline_id})
  }

  handleOrgChange(org_code) {
    const {Role} = this.props
    if (Role === '1') {
      this.setState({fundOrgCode: org_code}, this.searchDeadlineData)
    }
    else {
      this.setState({assetOrgCode: org_code}, this.searchDeadlineData)
    }
  }

  searchDeadlineData() {
    const {startDate, endDate, deadline_id, assetOrgCode, fundOrgCode} = this.state
    const role = this.props.Role
    this.props.getFundStatisticsDeadline({startDate, endDate, deadline_id, assetOrgCode, fundOrgCode, role})
  }

  handleDeadlineChange({value: deadline_id}) {
    if (deadline_id === this.state.deadline_id) {
      return
    }
    this.setState({deadline_id}, this.searchOrgData)
  }

  render() {
    const {Period, Role, fundStatistics, dictionary, deadlineList} = this.props
    const {tab, deadline_id, showChart} = this.state
    const {totalList, orgDataList, deadlineDataList} = fundStatistics
    return (
      <div className='component'>
        <form className='clearfix filter-form'>
          <div className='row info-row'>
            {Period === '0' && <DailyFilter handleDateChange={this.handleDateChange}/>}
            {Period === '1' && <div className='col-sm-8 info-row'>
              <WeeklyFilter handleDateChange={this.handleDateChange} whichWeek={'last'}/></div>}
            {Period === '2' && <MonthlyFilter handleDateChange={this.handleDateChange}/>}
          </div>
        </form>
        <div className='wrapper'>
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={(tab === 1) ? 'active' : ''} onClick={e => this.selectTab(e, 1)}><a
              href="javascript:;">满标统计</a></li>
            <li role="presentation" className={(tab === 2) ? 'active' : ''} onClick={e => this.selectTab(e, 2)}><a
              href="javascript:;">{Role === '1' ? '资金方分布' : '资产方分布'}</a></li>
            <li role="presentation" className={(tab === 3) ? 'active' : ''} onClick={e => this.selectTab(e, 3)}><a
              href="javascript:;">期限分布</a></li>
          </ul>
          <span className="unit">单位：万元</span>
          {tab === 1 && <div>
            <AdminTab1 data={totalList} dictionary={dictionary}
                       role={Role} showChart={showChart}/>
          </div>}
          {tab === 2 && <div>
            <Tab2 data={orgDataList} dictionary={dictionary}
                  options={deadlineList}
                  search={this.handleDeadlineChange} role={Role} extValue={deadline_id}>
              <div>{Role === '1' && <div className="col-sm-3">
                <label className="col-sm-4 filter-form__static-text">
                  <span>资产方:</span>
                </label>
                <div className="col-sm-8">
                  {this.renderAssetOrganizations()}
                </div>
              </div>}
                {Role === '2' && <div className="col-sm-3">
                  <label className="col-sm-4 filter-form__static-text">
                    <span>资金方:</span>
                  </label>
                  <div className="col-sm-8">
                    {this.renderFundOrganizations()}
                  </div>
                </div>}
              </div>
            </Tab2>
          </div>}
          {tab === 3 && <div>
            <Tab3 data={deadlineDataList} dictionary={dictionary} role={Role}>
              <div>{Role === '1' && <div className="col-sm-3">
                <label className="col-sm-4 filter-form__static-text">
                  <span>资产方:</span>
                </label>
                <div className="col-sm-8">
                  {this.renderAssetOrganizations()}
                </div>
              </div>}
                {Role === '2' && <div className="col-sm-3">
                  <label className="col-sm-4 filter-form__static-text">
                    <span>资金方:</span>
                  </label>
                  <div className="col-sm-8">
                    {this.renderFundOrganizations()}
                  </div>
                </div>}
                <div className="col-sm-3">
                  <label className="col-sm-4 filter-form__static-text">
                    <span>{Role === '2' ? '资产方:' : '资金方'}</span>
                  </label>
                  <div className="col-sm-8">
                    {this.renderSelect()}
                  </div>
                </div>
              </div>
            </Tab3>
          </div>}
        </div>
      </div>
    )
  }
}

