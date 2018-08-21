import React, {Component} from 'react'
import style from "./style.scss"
import Pagination from "../Pagination"
import DeadlineTable from './DeadlineTable'
import {formatNumber, formatOrganizationCode, unique, unique2} from '../../utils/etc'
import PieChart from '../Charts/pie'
import WeeklyFilter from '../Common/WeeklyFilter'
import CSSModules from 'react-css-modules'

@CSSModules(style, {allowMultiple: true})
export default class Requirement extends Component {
  constructor(props) {
    super(props)
    this.state = {
      week: '',
      year: '',
      startDate: '',
      endDate: '',
      data: [],
      deadlineData: [],
      columnArr: [],
      columnHisArr: [],
      rowArr: [],
      rowHisArr: [],
      hisList: [],
      isHistoryPage: false,
      index: 1,
      tab: 0
    }

    this.searchData = ({year, week, startDate, endDate}) => {
      this.setState({year, week, startDate, endDate})
      if (!this.state.isHistoryPage) {
        this.props.searchData({year, week})
      } else {
        this.searchHisData()
      }
    }

    this.searchHisData = (index) => {
      this.setState({
        index: index
          ? index
          : 1
      }, () => {
        let param = {
          asset_org_code: this.props._session.org_code,
          year: this.state.year,
          week: this.state.week,
          pageIndex: this.state.index
        }
        this.props.getHistory(param)
      })
    }

    this.deadlineValueChange = (value, index) => {
      let deadlineData = this.state.deadlineData.slice()
      deadlineData[index].plan_fee = value
      this.setState({deadlineData})
    }

    this.valueChange = (e, index) => {
      e.preventDefault();
      e.stopPropagation();
      if (isNaN(e.target.value)) {
        return
      }
      let data = this.state.data.slice()
      if (Number(e.target.value) < 0) {
        e.target.value *= -1
      } else if (Number(e.target.value) > 1000000) {
        e.target.value = 1000000
      }
      data[index].plan_fee = !e.target.value
        ? 0
        : Number(e.target.value) * 1000000
      this.setState(Object.assign({}, this.state, data))
    }

    this.renderColumns = (row, column, columnIndex) => {
      const {data} = this.state
      let index = -1
      for (let i = 0; i < data.length; i++) {
        if (data[i].plan_date === column.plan_date && data[i].fund_org_code === row) {
          index = i
          break
        }
      }
      if (this.props.require.readOnly) {
        return <td key={String(index)}>
          <span>{
            data[index].plan_fee !== ''
              ? formatNumber(data[index].plan_fee / 1000000)
              : '0'
          }</span>
        </td>
      } else if (index >= 0) {
        return <td key={String(index)}>
          <input type="text" styleName="table-input" value={data[index].plan_fee !== ''
            ? data[index].plan_fee / 1000000
            : '0'} maxLength="6" onChange={e => this.valueChange(e, index)}/>
        </td>
      } else {
        return <td key={String(columnIndex)}></td>
      }
    }

    this.renderHisColumns = (row, column, columnIndex) => {
      const {hisList} = this.state
      let index = -1
      for (let i = 0; i < hisList.length; i++) {
        if (hisList[i].week_name === column.week_name && hisList[i].year === row.year && hisList[i].week === row.week) {
          index = i
          break
        }
      }
      if (index >= 0) {
        return <td key={String(index)}>
          {formatNumber(hisList[index].plan_fee / 1000000)}
        </td>
      } else {
        return <td key={String(columnIndex)}></td>
      }
    }

    this.renderTotalColumn = (row) => {
      let sum = 0
      for (let data of this.state.data) {
        if (data.fund_org_code === row) {
          sum += Number(data.plan_fee)
        }
      }
      return <td>
        {formatNumber(sum / 1000000)}
      </td>
    }

    this.renderTotalRow = () => {
      return <tr>
        <td>总计</td>
        {this.state.columnArr.map((col, i) => <td
          key={Number(i)}>{formatNumber(this.state.data.filter(item => item.plan_date === col.plan_date).map(item => item.plan_fee).reduce((a, b) => a + b) / 1000000)}</td>)}
        <td>{
          formatNumber(
            this.state.data.length > 0
              ? this.state.data.map(item => item.plan_fee).reduce((a, b) => a + b) / 1000000
              : 0)
        }</td>
      </tr>
    }

    this.renderHisTotalColumn = (row) => {
      let sum = 0
      for (let his of this.state.hisList) {
        if (his.year === row.year && his.week === row.week) {
          sum += Number(his.plan_fee)
        }
      }
      return <td>
        {formatNumber(sum / 1000000)}
      </td>
    }

    this.goToHistory = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.setState({isHistoryPage: true})
      this.searchHisData()
    }

    this.selectTab = (e, tab) => {
      e.preventDefault();
      e.stopPropagation()
      this.setState({tab})
    }

    this.leaveHistory = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.setState({isHistoryPage: false})
    }

    this.init = () => {
      this.weekliFilter.getWrappedInstance().reset()
    }

    this.submit = () => {
      const {startDate, endDate, data, deadlineData} = this.state
      const asset_org_code = this.props._session.org_code
      if (startDate && endDate) {
        this.props.save({startDate, endDate, asset_org_code, data, deadlineData})
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.require.data != nextProps.require.data) {
      let {data, deadlineData, readOnly} = nextProps.require
      let columnArr = unique(data, 'week_name').map(item => {
        return {week_name: item.week_name, plan_date: item.plan_date}
      })
      data.forEach(item => {
        if (item.plan_fee === null) {
          item.plan_fee = 0
        }
      })
      let rowArr = unique(data, 'fund_org_code').map(item => item.fund_org_code)
      if (readOnly) {
        deadlineData.forEach(item => item.plan_fee = item.plan_fee / 1000000)
      }
      this.setState({data, deadlineData, rowArr, columnArr})
    }
    if (this.props.require.hisList != nextProps.require.hisList) {
      const {hisList} = nextProps.require
      let columnHisArr = unique(hisList, 'week_name').map(item => {
        return {week_name: item.week_name}
      })
      let rowHisArr = unique2(hisList, 'week', 'year')
      this.setState({hisList: hisList, rowHisArr, columnHisArr})
    }
  }

  render() {
    const self = this
    const {require, dictionary, _buttons} = this.props
    const {tab, deadlineData} = this.state
    return (<div className="component">
      <form className="filter-form">
        <div className="row info-row">
          <div className="col-sm-2">
            <button type="button" className="btn btn-primary pull-left" onClick={this.init}
                    style={{marginRight: '10px'}}>
              <i className="fa fa-refresh"></i>
            </button>
            {this.state.isHistoryPage &&
            <a className="pull-left btn btn-link" styleName="filter-form__showPages" onClick={(e) => this.leaveHistory(e)}>返回</a>}
            {
              !this.state.isHistoryPage && _buttons.includes('requirement_plan_submit') &&
              <button type="button" className="btn icon-btn btn-primary pull-left" disabled={require.readOnly}
                      onClick={(e) => self.submit(e)}>
                <i className="fa fa-search"></i>提交
              </button>
            }
          </div>
          {!this.state.isHistoryPage &&
          <div className="col-sm-8"><WeeklyFilter handleDateChange={this.searchData} ref={(ref) => {
            this.weekliFilter = ref
          }}/></div>}
        </div>
        {!this.state.isHistoryPage && <p styleName="filter-form__tips">请在给定的时间范围前设置计划数值，过期将不可修改</p>}
        {
          !this.state.isHistoryPage && <div styleName="filter-form__rules">
            <p>*请务必于每周五17:00点提交下周计划，17:00后不可更改。<br/> * 如果没有维护下周需求计划，默认使用上周数据。</p>
          </div>
        }
      </form>
      <div className="wrapper">
        {
          !this.state.isHistoryPage && <div>
            <ul className="nav nav-tabs" role="tablist">
              <li role="presentation" className={(
                tab === 0)
                ? 'active'
                : ''} onClick={e => this.selectTab(e, 0)}>
                <a href="javascript:;">产品期限</a>
              </li>
              <li role="presentation" className={(
                tab === 1)
                ? 'active'
                : ''} onClick={e => this.selectTab(e, 1)}>
                <a href="javascript:;">资金方</a>
              </li>
            </ul>
            {tab === 1 &&
            <a className="pull-right btn btn-link" styleName="filter-form__check-history" onClick={(e) => this.goToHistory(e)}>查看历史记录</a>}
            <span className="unit">单位：万元</span>
            {
              tab === 0 && <div>
                <p style={{
                  marginTop: '10px'
                }}>请根据平台实际情况填写每日不同产品期限对应的需求量</p>
                <div styleName="wrapper__left-area">
                  <DeadlineTable deadlineData={deadlineData} valueChange={this.deadlineValueChange}
                                 readOnly={require.readOnly}/>
                </div>
                <div styleName="wrapper__right-area">
                  <PieChart data={unique(deadlineData, 'deadline_id').map((item) => {
                    return {
                      value: deadlineData.filter(d => d.deadline_id === item.deadline_id).map(item => require.readOnly ? item.plan_fee : item.plan_fee / 1000000).reduce((a, b) => a + b),
                      name: `${item.deadline_name}`
                    }
                  })} title="产品期限分布" width={'95%'} height={'50%'}/>
                  <PieChart data={unique(deadlineData, 'plan_date').map((item) => {
                    return {
                      value: deadlineData.filter(d => d.plan_date === item.plan_date).map(item => require.readOnly ? item.plan_fee : item.plan_fee / 1000000).reduce((a, b) => a + b),
                      name: `${item.week_name}`
                    }
                  })} title="产品日期分布" width={'95%'} height={'50%'} type={"loop"}/>
                </div>
              </div>
            }
            {
              tab === 1 && <div>
                <p style={{
                  marginTop: '10px'
                }}>请根据平台实际情况填写每日不同资金方对应的需求量</p>
                <div className="wrapper__table-scroll">
                  <table styleName="datatable-input">
                    <thead>
                    <tr>
                      <th style={{
                        width: '250px'
                      }}>日期/供给量
                      </th>
                      {
                        this.state.columnArr.map((item, i) => <th key={i.toString()}>
                          {item.week_name}
                        </th>)
                      }
                      <th style={{
                        width: '150px'
                      }}>总计
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      self.state.rowArr.map((row, rowIndex) => {
                        return <tr key={String(rowIndex)}>
                          <td>
                            {`${formatOrganizationCode(row, dictionary)}(${row})`}
                          </td>
                          {self.state.columnArr.map((column, columnIndex) => self.renderColumns(row, column, columnIndex))}
                          {self.renderTotalColumn(row)}
                        </tr>
                      })
                    }
                    {self.renderTotalRow()}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        }
        {
          this.state.isHistoryPage && [<table styleName="datatable">
              <thead>
              <tr>
                <th>日期/供给量（万元）</th>
                {
                  this.state.columnHisArr.map((item, i) => <th key={i.toString()}>
                    {item.week_name}
                  </th>)
                }
                <th>总计</th>
              </tr>
              </thead>
              <tbody>
              {
                self.state.rowHisArr.map((row, rowIndex) => {
                  return <tr key={String(rowIndex)}>
                    <td className={style["hisRow"]}>
                      <span>{row.year}年第{row.week}周（{row.start_date}至{row.end_date}）</span>
                    </td>
                    {self.state.columnHisArr.map((column, columnIndex) => self.renderHisColumns(row, column, columnIndex))}
                    {self.renderHisTotalColumn(row)}
                  </tr>
                })
              }
              </tbody>
            </table>,
            <Pagination searcher={this.searchHisData} index={this.state.index}
                        total={require.total}/>
          ]
        }
      </div>
    </div>)
  }
}
