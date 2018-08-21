import React, {Component} from 'react'
import Datatable from '../Datatable'
import Select from '../Select'
import style from "./style.scss"
import CSSModules from 'react-css-modules';
import DeadlineTable from '../RequirementPlan/DeadlineTable'
import PieChart from '../Charts/pie'
import {formatNumber, unique} from '../../utils/etc'
import WeeklyFilter from '../Common/WeeklyFilter'
import AssetSelectorPage from '../Select/AssetSelectorPage'
import FundSelectorPage from '../Select/FundSelectorPage'
import AssetUserFromSelectorPage from '../Select/AssetUserFromSelectorPage'
import FundUserFromSelectorPage from '../Select/FundUserFromSelectorPage'

@CSSModules(style, {allowMultiple: true})
export default class FundSupplyPlan extends Component {
  constructor(props) {
    super(props)

    this.weekList = [
      '周一',
      '周二',
      '周三',
      '周四',
      '周五',
      '周六',
      '周日'
    ]
    this.state = {
      week_name: this.weekList[0],
      year: '',
      week: '',
      tab: 0,
      weekList: [],
      dailyList: [],
      assetList: [],
      fundList: [],
      assetOrgCode: '',
      fundOrgCode: ''
    }
    this.columns = [
      {
        text: '期限',
        name: 'deadline_name',
        withTitle: true,
        style: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center'
        }
      }, {
        text: '资金方',
        name: 'fund_fee',
        style: {
          textAlign: 'center',
          width: '240px'
        },
        renderDom: (row) => formatNumber(row.fund_fee)
      }, {
        text: '资产方',
        name: 'asset_fee',
        style: {
          textAlign: 'center',
          width: '240px'
        },
        renderDom: (row) => formatNumber(row.asset_fee)
      }, {
        text: '差额',
        name: 'result_fee',
        style: {
          textAlign: 'center',
          width: '240px'
        },
        renderDom: (row) => formatNumber(row.result_fee)
      }
    ]
    this.selectTab = this.selectTab.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.weekChange = this.weekChange.bind(this)
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this)
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fundSupply.weekList !== nextProps.fundSupply.weekList) {
      let weekList = nextProps.fundSupply.weekList.slice()
      let fund_fee = weekList && weekList.length > 0 && weekList.map(item => item.fund_fee).reduce(function (a, b) {
        return a + b
      })
      let asset_fee = weekList && weekList.length > 0 && weekList.map(item => item.asset_fee).reduce(function (a, b) {
        return a + b
      })
      let result_fee = weekList && weekList.length > 0 && weekList.map(item => item.result_fee).reduce(function (a, b) {
        return a + b
      })
      weekList.push({deadline_name: "总计", fund_fee, asset_fee, result_fee})
      this.setState({weekList})
    }
    if (this.props.fundSupply.dailyList !== nextProps.fundSupply.dailyList) {
      let dailyList = nextProps.fundSupply.dailyList.slice()
      let fund_fee = dailyList && dailyList.length > 0 && dailyList.map(item => item.fund_fee).reduce(function (a, b) {
        return a + b
      })
      let asset_fee = dailyList && dailyList.length > 0 && dailyList.map(item => item.asset_fee).reduce(function (a, b) {
        return a + b
      })
      let result_fee = dailyList && dailyList.length > 0 && dailyList.map(item => item.result_fee).reduce(function (a, b) {
        return a + b
      })
      dailyList.push({deadline_name: "总计", fund_fee, asset_fee, result_fee})

      this.setState({dailyList})
    }
  }


  handleSearch() {
    const {week, year, assetOrgCode, fundOrgCode} = this.state
    this.props.getWeeklyData({week, year})
    this.props.getAssetData({week, year, asset_org_code: assetOrgCode})
    this.props.getFundData({week, year, fund_org_code: fundOrgCode})
    this.weekChange()
  }

  handleFundOrgChange({value}) {
    const {week, year, fundOrgCode} = this.state
    if (value === fundOrgCode) {
      return
    }
    this.props.getFundData({fund_org_code: value, week, year})
    this.setState({
      fundOrgCode: value
    })
  }

  handleAssetOrgChange({value}) {
    const {week, year, assetOrgCode} = this.state
    if (value === assetOrgCode) {
      return
    }
    this.props.getAssetData({asset_org_code: value, week, year})
    this.setState({
      assetOrgCode: value
    })
  }

  weekChange(week_name) {
    const {week, year} = this.state
    if (week_name && week_name.value && week_name.value === this.state.week_name) {
      return
    }
    this.setState({
      week_name: week_name && week_name.value
        ? week_name.value
        : this.state.week_name
    }, () => {
      this.props.getDailyData({week_name: this.state.week_name, week, year})
    })
  }

  selectTab(e, tab) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({tab})
  }

  handleDateChange({week, year}) {
    this.setState({week, year}, this.handleSearch)
  }

  render() {
    const {tab, weekList, dailyList} = this.state
    const {assetList, fundList} = this.props.fundSupply
    const day = new Date().getDay()
    const whichWeek = day > 0 && day < 5 ? 'this' : 'next'
    return (<div className='component'>
      <form className='clearfix filter-form'>
        <div className="row info-row">
          <div className="col-sm-8">
            <WeeklyFilter handleDateChange={this.handleDateChange} whichWeek={whichWeek}/>
          </div>
        </div>
      </form>
      <div className='wrapper'>
        <ul className="nav nav-tabs" role="tablist">
          <li role="presentation" className={(
            tab == 0)
            ? 'active'
            : ''} onClick={e => this.selectTab(e, 0)}>
            <a href="javascript:;">周供需计划</a>
          </li>
          <li role="presentation" className={(
            tab == 1)
            ? 'active'
            : ''} onClick={e => this.selectTab(e, 1)}>
            <a href="javascript:;">日供需计划</a>
          </li>
          <li role="presentation" className={(
            tab == 2)
            ? 'active'
            : ''} onClick={e => this.selectTab(e, 2)}>
            <a href="javascript:;">资产方需求计划</a>
          </li>
          <li role="presentation" className={(
            tab == 3)
            ? 'active'
            : ''} onClick={e => this.selectTab(e, 3)}>
            <a href="javascript:;">资金方募集计划</a>
          </li>
        </ul>
        <span className="unit">单位：万元</span>
        {
          tab == 0 && <div className="wrapper__tab-area">
            <Datatable columns={this.columns} rows={weekList} noPgaging={true}/>
          </div>
        }
        {
          tab == 1 && <div className="wrapper__tab-area">
              <div className="col-sm-3 col-sm-offset-4">
                <label className="col-sm-3 filter-form__static-text">
                  <span>日供需计划</span>
                </label>
                <div className="col-sm-6">
                  <Select onChange={this.weekChange} multiple={false} noEmpty={true} defaultValue={this.state.week_name}
                          options={this.weekList.map((r) => ({label: r, value: r}))}/>
                </div>
              </div>
            <div styleName="wrapper__tab-area__content">
              <Datatable columns={this.columns} rows={dailyList} noPgaging={true}/>
            </div>
          </div>
        }
        {
          tab == 2 && <div className="wrapper__tab-area">
              <div className="col-sm-3 col-sm-offset-4">
                <label className="col-sm-3 filter-form__static-text">
                  <span>资产方</span>
                </label>
                <div className="col-sm-6">
                  <AssetUserFromSelectorPage onChange={this.handleAssetOrgChange} defaultValue={this.state.assetOrgCode} userFrom={"1"} optionStyle={{maxHeight: '220px'}}/>
                </div>
              </div>
            <div styleName="wrapper__tab-area__content">
              <div styleName="wrapper__left-area">
                <DeadlineTable deadlineData={assetList} readOnly={true}/>
              </div>
              <div styleName="wrapper__right-area">
                <PieChart data={unique(assetList, 'deadline_id').map((item) => {
                  return {
                    value: assetList.filter(d => d.deadline_id === item.deadline_id).map(item => item.plan_fee).reduce((a, b) => a + b),
                    name: `${item.deadline_name}`
                  }
                })} title="产品期限分布" width={'95%'} height={'50%'}/>
                <PieChart data={unique(assetList, 'plan_date').map((item) => {
                  return {
                    value: assetList.filter(d => d.plan_date === item.plan_date).map(item => item.plan_fee).reduce((a, b) => a + b),
                    name: `${item.week_name}`
                  }
                })} title="产品日期分布" width={'95%'} height={'50%'} type={"loop"}/>
              </div>
            </div>
          </div>

        }
        {
          tab == 3 && <div className="wrapper__tab-area">
              <div className="col-sm-3 col-sm-offset-4">
                <label className="col-sm-3 filter-form__static-text">
                  <span>资金方</span>
                </label>
                <div className="col-sm-6">
                  <FundUserFromSelectorPage onChange={this.handleFundOrgChange} defaultValue={this.state.fundOrgCode} userFrom={"1"} optionStyle={{maxHeight: '220px'}}/>
                </div>
              </div>
              <div styleName="wrapper__tab-area__content">
                <div styleName="wrapper__left-area">
                  <DeadlineTable deadlineData={fundList} readOnly={true}/>
                </div>
                <div styleName="wrapper__right-area">
                  <PieChart data={unique(fundList, 'deadline_id').map((item) => {
                    return {
                      value: fundList.filter(d => d.deadline_id === item.deadline_id).map(item => item.plan_fee).reduce((a, b) => a + b),
                      name: `${item.deadline_name}`
                    }
                  })} title="产品期限分布" width={'100%'} height={'50%'}/>
                  <PieChart data={unique(fundList, 'plan_date').map((item) => {
                    return {
                      value: fundList.filter(d => d.plan_date === item.plan_date).map(item => item.plan_fee).reduce((a, b) => a + b),
                      name: `${item.week_name}`
                    }
                  })} title="产品日期分布" width={'100%'} height={'50%'} type={"loop"}/>
                </div>
              </div>
          </div>}
      </div>
    </div>)
  }
}

