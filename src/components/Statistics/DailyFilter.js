import React, { Component } from 'react'
import CSSModules from 'react-css-modules';
import SingleDatePicker from '../SingleDatePicker'
import style from "../../styles/modules.scss"
import moment from 'moment'

@CSSModules(style, {allowMultiple: true})
export default class DailyFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      date: moment().subtract(1, 'days').format('YYYY-MM-DD')
    }
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleDateChange(date) {
    this.setState({date}, this.handleSearch)
  }

  handleSearch() {
    const {date} = this.state
    const startDate = date
    const endDate = startDate
    this.props.handleDateChange({startDate, endDate})
  }

  render() {
    const {date} = this.state
    return (
      <div>
        <div className="col-sm-4">
          <label className="col-sm-2 text-right filter-form__static-text"><span>时间：</span></label>
          <div className="col-sm-10">
            <SingleDatePicker onDateChange={this.handleDateChange} date={date} isOutsideRange={date => date.isAfter(moment(), 'day') || date.isSame(moment(), 'day')}/>
          </div>
        </div>
        <div className="col-sm-2">
          <button type="button" className="btn icon-btn btn-primary pull-left" onClick={this.handleSearch} >
            <i className="fa fa-search"></i>搜索
          </button>
        </div>
      </div>
    )
  }
}
