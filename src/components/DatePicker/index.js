import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {SingleDatePicker} from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'
import style from './style.scss'

export default class DatePicker extends Component {
  constructor(props) {
		super(props)
		this.state = {
			startDate: props.startDate ? moment(props.startDate) : null,
			endDate: props.endDate ? moment(props.endDate) : null,
			focusedStart: false,
			focusedEnd: false
		}
		this.onStartDateChange = this.onStartDateChange.bind(this)
		this.onEndDateChange = this.onEndDateChange.bind(this)
		this.onClose = this.onClose.bind(this)
		this.isOutsideRange = this.isOutsideRange.bind(this)
		this.isDayHighlighted = this.isDayHighlighted.bind(this)
	}

	onClose(date) {

	}

	onStartDateChange(startDate) {
		this.setState({startDate}, () => {
			this.props.onDatesChange({startDate: this.state.startDate, endDate: this.state.endDate})
		})
	}

	onEndDateChange(endDate) {
		this.setState({endDate}, () => {
			this.props.onDatesChange({startDate: this.state.startDate, endDate: this.state.endDate})
		})
	}

	isOutsideRange(date) {
		return date.isBefore('2015-01-01')
	}

	isDayHighlighted(date) {
		return date.isSame(moment().format('YYYY-MM-DD'), 'day')
	}

  render() {
    return (
			<div className={`${style['DatePicker']} ${style[this.props.hideClearDate ? 'noClearBtn' : '']}`}>
				<SingleDatePicker
					date={this.state.startDate}
					onDateChange={this.onStartDateChange} // PropTypes.func.isRequired
					focused={this.state.focusedStart} // PropTypes.bool
					onFocusChange={({ focused }) => this.setState({ focusedStart: focused })} // PropTypes.func.isRequired
					monthFormat={"YYYY-MM"}
					displayFormat={"YYYY-MM-DD"}
					placeholder={'开始时间'}
					hideKeyboardShortcutsPanel={true}
					isDayHighlighted={this.isDayHighlighted}
					isOutsideRange={this.isOutsideRange}
					showClearDate={!this.props.hideClearDate}
          numberOfMonths={1}
				/>
				<i className="fa fa-arrow-right" aria-hidden="true"></i>
				<SingleDatePicker
					date={this.state.endDate} // momentPropTypes.momentObj or null
					onDateChange={this.onEndDateChange} // PropTypes.func.isRequired
					focused={this.state.focusedEnd} // PropTypes.bool
					onFocusChange={({ focused }) => this.setState({ focusedEnd: focused })} // PropTypes.func.isRequired
					monthFormat={"YYYY-MM"}
					displayFormat={"YYYY-MM-DD"}
					placeholder={'结束时间'}
					hideKeyboardShortcutsPanel={true}
					isDayHighlighted={this.isDayHighlighted}
					isOutsideRange={this.isOutsideRange}
					showClearDate={!this.props.hideClearDate}
          numberOfMonths={1}
				/>
			</div>
		);
  }
}

DatePicker.propsType = PropTypes.shape({
	startDate: PropTypes.object,
	endDate: PropTypes.object,
	onDateChange: PropTypes.func.isRequired
})
