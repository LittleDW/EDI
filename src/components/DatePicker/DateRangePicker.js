import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {DateRangePicker as DateRangePickerWrapper} from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'
import style from './style.scss'

export default class DateRangePicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startDate: props.startDate ? moment(props.startDate) : null,
      endDate: props.endDate ? moment(props.endDate) : null,
      focusedStart: false,
      focusedEnd: false
    }
  }

  onDatesChange = ({ startDate, endDate }) =>{
    this.setState({startDate, endDate})
    if (this.props.output === 'date') {
      this.props.onDatesChange({ startDate, endDate })
    } else {
      this.props.onDatesChange({ startDate: startDate && startDate.format('YYYY-MM-DD') || '', endDate: endDate && endDate.format('YYYY-MM-DD') || ''})
    }
  }

  isOutsideRange = (date) =>{
    return date.isBefore('2015-01-01')
  }

  isDayHighlighted = (date) => {
    return date.isSame(moment().format('YYYY-MM-DD'), 'day')
  }

  resetState = () => {
    this.onDatesChange({startDate: null, endDate: null})
  }

  render() {
    return (
      <div className={`${style['DateRangePicker']} ${this.props.hideClearDate ? style['noClearBtn'] : ''}`}>
        <DateRangePickerWrapper
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          onDatesChange={this.onDatesChange} // PropTypes.func.isRequired
          focusedInput={this.state.focusedInput} // PropTypes.bool
          onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired
          monthFormat={"YYYY-MM"}
          displayFormat={"YYYY-MM-DD"}
          startDatePlaceholderText='开始时间'
          endDatePlaceholderText='结束时间'
          hideKeyboardShortcutsPanel={true}
          isDayHighlighted={this.isDayHighlighted}
          isOutsideRange={this.isOutsideRange}
          showClearDates={!this.props.hideClearDate}
          numberOfMonths={2}
          minimumNights={0}
        />
      </div>
    );
  }
}

DateRangePicker.propsType = PropTypes.shape({
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  onDatesChange: PropTypes.func.isRequired,
  c: PropTypes.func
})
