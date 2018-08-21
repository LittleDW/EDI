import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Select from '../Select'
import moment from 'moment'


export default class MonthSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      year: props.monthsBefore ? moment().subtract(props.monthsBefore, 'months').year() : moment().year(),
      // TODO 石奇峰 moment().month() 显示的是上一个月的月份
      month: props.month ? (moment().subtract(props.monthsBefore, 'months').month() + 1) : (moment().month() + 1)
    }
  }

  getYearOptions = () => {
    const {monthsBefore, allowedMonthBefore} = this.props
    const startYear = monthsBefore ? moment().subtract(monthsBefore, 'months').year() : moment().year() - 1
    let endYear = startYear + 3
    if (allowedMonthBefore) {
      endYear = moment(allowedMonthBefore, 'YYYY-MM').year()
    }
    const yearList = []
    for (let i = startYear; i <= endYear; i++) {
      yearList.push({
        label: `${i}年`,
        value: i
      })
    }
    return yearList
  }

  getMonthOptions = () => {
    const {allowedMonthBefore} = this.props
    const {year} = this.state
    let endMonth = 12
    if (allowedMonthBefore) {
      const endYear = moment(allowedMonthBefore, 'YYYY-MM').year()
      if ( Number(year) > endYear) {
        endMonth = 0
      } else if (Number(year) === endYear) {
        endMonth = moment(allowedMonthBefore, 'YYYY-MM').month() + 1
      }
    }
    const monthList = []
    for (let i = 1; i <= endMonth; i++) {
      monthList.push({
        label: `${i}月`,
        value: i < 10 ? `0${i}` : `${i}`
      })
    }
    return monthList
  }

  yearChange = ({value}) => {
    const {year, month} = this.state
    if (year !== value) {
      this.setState({year: value})
      this.props.handleDateChange(`${value}-${month}`)
    }
  }
  monthChange = ({value}) => {
    const {year, month} = this.state
    if (month !== value) {
      this.setState({month:value})
      this.props.handleDateChange(`${year}-${value}`)
    }
  }

  render() {
    const {year, month} = this.state
    return (
      <div>
        <div className="col-sm-6">
          <Select options={this.getYearOptions()} defaultValue={year} noEmpty={true} onChange={this.yearChange}/>
        </div>
        <div className="col-sm-6">
          <Select options={this.getMonthOptions()} defaultValue={month} noEmpty={true} onChange={this.monthChange}/>
        </div>
      </div>
    )
  }
}

MonthSelect.propTypes = {
  monthsBefore: PropTypes.number,
  handleDateChange: PropTypes.func.isRequired
}
