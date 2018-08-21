import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Selectors from "../../redux/selectors"
import Select from '../Select'

class WeeklyFilter extends Component {
  constructor(props) {
    super(props)
    let index = props.dateRange.findIndex(item => item.year === props.nextWeek.year && item.week === props.nextWeek.week)
    switch (props.whichWeek) {
      case 'this':
        index -= 1;
        break;
      case 'last':
        index -= 2;
        break;
      case 'next':
        break;
      default:
        break;
    }
    let originalWeek = index < 0 ? props.nextWeek : props.dateRange[index]
    this.state = {
      year: originalWeek.year,
      week: originalWeek.week,
      originalWeek,
      startDate: '',
      endDate: ''
    }

    this.renderYearSelect = this.renderYearSelect.bind(this)
    this.renderWeekSelect = this.renderWeekSelect.bind(this)
    this.yearChange = this.yearChange.bind(this)
    this.weekChange = this.weekChange.bind(this)
    this.reset = this.reset.bind(this)

  }

  reset() {
    const {year, week} = this.state.originalWeek
    if (year !== this.state.year || week !== this.state.week) {
      this.setState({year, week})
    } else {
      this.props.handleDateChange({year: this.state.year, week: this.state.week, startDate: this.state.startDate, endDate: this.state.endDate})
    }
  }

  yearChange({value}) {
    this.setState({year: value})
  }

  weekChange({value}) {
    this.setState({week: value})
    let {start_date: startDate, end_date: endDate} = this.props.dateRange.find(item => item.year === this.state.year && item.week === value)
    this.setState({startDate, endDate})
    if (startDate && endDate) {
      this.props.handleDateChange({year: this.state.year, week: value, startDate, endDate})
    }
  }


  renderYearSelect() {
    const {dateRange} = this.props
    const options = [...new Set(dateRange.map(date => date.year))].map(item => {
      return {label: `${item}年`, value: item}
    })
    return <Select options={options} noEmpty={true} onChange={this.yearChange} extValue={this.state.year}/>
  }

  renderWeekSelect() {
    const {dateRange} = this.props
    const {year, week} = this.state
    return <Select options={dateRange.filter(date => date.year === year).map(date => {
      return {label: `第${date.week}周`, value: date.week}
    })} noEmpty={true} onChange={this.weekChange} extValue={week}/>
  }


  render() {
    const {startDate, endDate} = this.state
    return (<div>
      <div className="col-sm-3">
        {this.renderYearSelect()}
      </div>
      <div className="col-sm-3">
        {this.renderWeekSelect()}
      </div>
      <div className="col-sm-4">
        <label className="col-sm-5 filter-form__static-text">
          <span>{startDate}</span><span style={{margin: '0 20px'}}>至</span><span>{endDate}</span>
        </label>
      </div>
    </div>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  nextWeek: Selectors.getNextWeek(state),
  dateRange: Selectors.getWeekAndDate(state)
})


WeeklyFilter.defaultProps = {
  whichWeek: 'next'
}

WeeklyFilter.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  whichWeek: PropTypes.string
};

export default connect(mapStateToProps, null, null, {withRef: true})(WeeklyFilter)
