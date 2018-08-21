import React, {Component} from 'react'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'

export default class AxisChart extends Component {
  constructor(props) {
    super(props)
    // #449d44
    this.countColor = '#E0E0E0'
    this.feeColor = '#689F38'
    this.colors = ['#2196F3', '#FDD835', '#FB8C00', '#C2185B', '#7B1FA2', '#303F9F', '#78909C', '#8D6E63']
    this.state = {
      options: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: {
              show: true,
              readOnly: false
            },
            magicType: {
              show: true,
              type: ['line', 'bar']
            },
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        legend: {
          data: [{name: `${props.type}笔数`}, {name: `${props.type}金额（万元）`, textStyle: {color: this.feeColor}}, ...props.deadlineList.map((item, i) => {
            return {name: item.deadline_name, textStyle: {color: this.colors[i]}}
          })]
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: `${props.type}笔数`,
            min: 0
          }, {
            type: 'value',
            name: `${props.type}金额：万元`,
            min: 0
          }
        ],
        series: [
          {
            name: `${props.type}笔数`,
            type: 'bar',
            data: [],
            itemStyle: {
              normal: {
                color: this.countColor
              }
            }

          }, {
            name: `${props.type}金额（万元）`,
            type: 'line',
            data: [],
            yAxisIndex: 1,
            zlevel: 2,
            animation: false,
            itemStyle: {
              normal: {
                color: this.feeColor,
              }
            },
            lineStyle: {
              normal: {
                color: this.feeColor,
                width: 3
              }
            }
          }, ...props.deadlineList.map((item, i) => {
            return {
              name: item.deadline_name,
              type: 'line',
              data: [],
              yAxisIndex: 1,
              animation: false,
              itemStyle: {
                normal: {
                  color: this.colors[i]
                }
              },
              lineStyle: {
                normal: {
                  width: 2,
                  color: this.colors[i]
                }
              }
            }
          })
        ]
      },
      chart: null
    }
    this.initPie = this.initPie.bind(this)
    this.updatePie = this.updatePie.bind(this)
  }

  initPie() {
    let {options} = this.state
    let chart = echarts.init(this.element)
    chart.setOption(options)
    this.setState({chart})
  }

  updatePie() {
    const {chart} = this.state
    const {deadlineList} = this.props
    if (!chart) {
      return
    }
    const {dateList, countList, feeList} = this.props.data
    if (!Array.isArray(dateList) || !Array.isArray(countList) || !Array.isArray(feeList)) {
      return
    }
    let {options} = this.state
    options.xAxis[0].data = dateList.slice()
    options.series[0].data = countList.slice()
    options.series[1].data = feeList.slice()
    let max = Math.max(...countList)
    let unit = Math.pow(10, Math.max(String(parseInt(max)).length - 2), 1)
    let max1 = (Math.ceil(max / unit) + 1) * unit
    let interval1 = max1 / 5
    max = Math.max(...feeList, ...deadlineList.map(item => Math.max(...this.props.data[item.deadline_name])))
    unit = Math.pow(10, Math.max(String(parseInt(max)).length - 2), 1)
    let max2 = (Math.ceil(max / unit) + 1) * unit
    let interval2 = max2 / 5
    options.yAxis[0].max = max1
    options.yAxis[0].interval = interval1
    options.yAxis[1].max = max2
    options.yAxis[1].interval = interval2
    deadlineList.forEach((deadline, i) => {
      options.series[i + 2].data = this.props.data[deadline.deadline_name]
    })
    this.state.chart.setOption(options)
  }

  componentDidMount() {
    this.initPie()
  }

  componentDidUpdate() {
    this.updatePie()
  }


  componentWillUnmount() {
    this.state.chart.dispose()
  }


  render() {
    const {
      width = '600px',
      height = '400px'
    } = this.props
    return (<div style={{
      width: `${width}`,
      height: `${height}`
    }} ref={(element) => this.element = element}></div>)
  }
}
