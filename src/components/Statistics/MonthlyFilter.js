import React, { Component } from 'react'
import CSSModules from 'react-css-modules';
import Select from '../Select'
import style from "../../styles/modules.scss"

@CSSModules(style, {allowMultiple: true})
export default class MonthlyFilter extends Component {
  constructor(props) {
    super(props)
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    this.state = {
      year: `${year}`,
      month: `${month < 10 ? '0' + month : month}`
    }
    this.calculateYearList = this.calculateYearList.bind(this)
    this.calculateMonthList = this.calculateMonthList.bind(this)
    this.handleYearChange = this.handleYearChange.bind(this)
    this.handleMonthChange = this.handleMonthChange.bind(this)
    this.handleSearch = () => {
      const {year, month} = this.state
      if (year && month) {
        let startDate = `${year}-${month}-01`
        let endDate = `${year}-${month}-31`
        this.props.handleDateChange({startDate, endDate})
      }
    }
  }

  componentDidMount() {
    this.handleSearch()
  }

  calculateYearList() {
    const year = new Date().getFullYear() - 1
    let yearList = []
    for (let i = year; i <= year + 3; i++) {
      yearList.push({
        label: `${i} 年`,
        value: `${i}`
      })
    }
    return yearList
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
    const {year, month} = this.state
    return (
      <div>
        <div className="col-sm-2">
          <Select noEmpty={true} defaultValue={year} onChange={this.handleYearChange} options={this.calculateYearList()}/>
        </div>
        <div className="col-sm-2">
          <Select noEmpty={true} defaultValue={month} onChange={this.handleMonthChange} options={this.calculateMonthList()}/>
        </div>
      </div>
    )
  }
}

