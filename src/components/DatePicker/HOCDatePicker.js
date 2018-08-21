import React from 'react'
import DatePicker from './index'
import moment from 'moment'

export default (function HOCCustomDatePickerRange() {
  return class HOCCustomDatePickerRange extends DatePicker {
    isOutsideRange(date) {
      return date.isAfter(moment().subtract(1, 'day'), 'day')
    }
    render(){
      return super.render()
    }
  }
})()

