import React, {Component} from 'react'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import {formatNumber} from "../../utils/etc";
import {List, is, fromJS} from 'immutable'

export default class PieChart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      options: {
        tooltip: {
          trigger: 'item',
          position: 'inside',
          formatter: (param) => {
            return `${param.name}: ${formatNumber(param.value)}(${param.percent}%)`
          }
        },
        series: [
          {
            name: props.title,
            type: 'pie',
            radius: props.type === 'loop' ? ['50%', '70%'] : '55%',
            data: this.formatData(props.data),
            label: {
              normal: {
                show: true,
                formatter: '{b}({d}%)'
              }
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      chart: null
    }
    this.initPie = this.initPie.bind(this)
    this.updatePie = this.updatePie.bind(this)
  }

  componentDidMount() {
    this.initPie()
  }

  initPie(callback) {
    let chart = echarts.init(this.element)
    chart.setOption(this.state.options)
    this.setState({chart}, callback)
  }

  formatData(list) {
    let data = list.slice()
    data = data.slice().filter(item => Number(item.value) !== 0)
    if (data.length === 0) {
      data = list.slice()
    }
    return data

  }

  updatePie() {
    let {title, data} = this.props
    let series = this.state.options.series
    series[0].data = this.formatData(data)
    series[0].title = title
    if (this.state.chart) {
      this.state.chart.setOption({series})
    } else {
      this.initPie(() => {
        this.state.chart.setOption({series})
      })
    }
  }

  shouldComponentUpdate(nextProps) {
    if (!is(fromJS(this.props.data), fromJS(nextProps.data))) {
      return true
    }
    return false
  }

  componentDidUpdate() {
    this.updatePie()
  }

  componentWillUnmount() {
    this.state.chart.clear()
    this.state.chart.dispose()
  }

  render() {
    const {width = '600px', height = '400px'} = this.props
    return (
      <div style={{width: `${width}`, height: `${height}`}} ref={(element) => this.element = element}></div>
    )
  }
}
