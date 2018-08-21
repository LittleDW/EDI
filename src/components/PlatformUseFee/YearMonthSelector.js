import React, { Component } from 'react'
import CSSModules from 'react-css-modules';
import Select from '../Select'
import style from "../../styles/modules.scss"
import moment from 'moment'

@CSSModules(style, {allowMultiple: true})
export default class YearMonthSelector extends Component {
  constructor(props) {
    super(props)
    const nextMonth = moment()
    const year = props.defaultYear ? props.defaultYear : nextMonth.year()
    const month = props.defaultMonth ? props.defaultMonth : nextMonth.month() + 1
      this.state = {
      year: `${year}`,
      month: `${month < 10 ? '0' + month : month}`
    }
    this.calculateYearList = this.calculateYearList.bind(this)
    this.calculateMonthList = this.calculateMonthList.bind(this)
    this.handleYearChange = this.handleYearChange.bind(this)
    this.handleMonthChange = this.handleMonthChange.bind(this)
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleSearch = () => {
    const {year, month} = this.state
    this.props.handleDateChange({year, month})
  }

  calculateYearList() {
    const year = new Date().getFullYear() - 5
    let yearList = []
    for (let i = year; i <= year + 5; i++) {
      yearList.push({
        label: `${i} 年`,
        value: `${i}`
      })
    }
    // 领导要求默认倒序排列 modified by zhangjunjie on 2018-04-17
    return yearList.reverse()
  }

  calculateMonthList() {
    let monthList = []
    for (let i = 1; i <= 12; i++) {
      if (i < 10) {
        monthList.push({
          label: `${i}月`,
          value: `0${i}`
        })
      } else {
        monthList.push({
          label: `${i}月`,
          value: `${i}`
        })
      }
    }
    return monthList
  }

  handleYearChange({value}) {
    const oldYear = this.state.year
    if (oldYear === value) {
      return
    }
    this.setState({year: value}, this.handleSearch)
  }

  handleMonthChange({value}) {
    const oldMonth = this.state.month
    if (oldMonth === value) {
      return
    }
    this.setState({month: value}, this.handleSearch)
  }

  render() {
    const {defaultYear, defaultMonth, yearStyle, monthStyle, noEmpty, calculateYearList, optionStyle} = this.props
    let {year, month} = this.state

    return (
      <div>
        <div className="pull-left" style={yearStyle?yearStyle:{}}>
            <Select noEmpty={noEmpty!=undefined?noEmpty:true} defaultValue={defaultYear!=undefined?defaultYear:year} onChange={this.handleYearChange} options={calculateYearList?calculateYearList:this.calculateYearList()} optionStyle={optionStyle}/>
        </div>
        <div className="pull-left" style={monthStyle?monthStyle:{marginLeft: '3px'}}>
            <Select noEmpty={noEmpty!=undefined?noEmpty:true} defaultValue={defaultMonth!=undefined?defaultMonth:month} onChange={this.handleMonthChange} options={this.calculateMonthList()} optionStyle={optionStyle}/>
        </div>
      </div>
    )
  }
}

