import React, { Component } from 'react'
import { SingleDatePicker as SDatePicker } from 'react-dates'
import PropTypes from 'prop-types'
import moment from 'moment'
import 'react-dates/lib/css/_datepicker.css'
import style from './style.scss'

export default class SingleDatePicker extends Component {
  constructor(props) {
		super(props)
    var {date, noEmpty} = props
		this.state = {
			date: date && moment(props.date) || noEmpty && moment() ||  null,
			focused: false,
		}
		this.onDateChange = this.onDateChange.bind(this)
		this.onClose = this.onClose.bind(this)
		this.isOutsideRange = this.isOutsideRange.bind(this)
		this.isDayHighlighted = this.isDayHighlighted.bind(this)
	}

	onClose(date) {

	}

	onDateChange(date) {
    let {output, onDateChange} = this.props;
		this.setState({date}, () => {
		  let {date:myDate} = this.state;
      (typeof onDateChange == "function")&&onDateChange((output != "date")&&myDate && myDate.format('YYYY-MM-DD') || myDate)
		})
	}

	isOutsideRange(date) {
		if (this.props.isOutsideRange) {
			return this.props.isOutsideRange(date)
		}
		return false
	}

	isDayHighlighted(date) {
		return date.isSame(moment().format('YYYY-MM-DD'), 'day')
	}

  render() {
    const {style:myStyle,showClearDate} = this.props
		const{ date, focused} = this.state
    return (
			<div className={`${style['DatePicker']}`} style={myStyle}>
				<SDatePicker
					date={date} // momentPropTypes.momentObj or null
					onDateChange={this.onDateChange} // PropTypes.func.isRequired
					focused={focused} // PropTypes.bool
					onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
					monthFormat={"YYYY-MM"}
					displayFormat={"YYYY-MM-DD"}
					placeholder={'选择日期'}
					hideKeyboardShortcutsPanel={true}
					isDayHighlighted={this.isDayHighlighted}
					isOutsideRange={this.isOutsideRange}
          numberOfMonths={1}
          showClearDate={showClearDate}
          showDefaultInputIcon={true}
				/>
			</div>
		);
  }
}

SingleDatePicker.propsType = PropTypes.shape({
	onDateChange: PropTypes.func.isRequired
})
