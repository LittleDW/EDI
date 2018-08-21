import React, {Component} from 'react'
import CSSModules from 'react-css-modules';
import DatePicker from '../DatePicker/HOCDatePicker'
import AxitChart from '../Charts/axis'
import FileSaver from 'file-saver'
import moment from 'moment'
import style from './style.scss'
import {downloadUrl, fastExport} from "../../utils/etc";

@CSSModules(style, {allowMultiple: true})
export default class AdminStatisticsPlatform extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      endDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      tab: 1
    }
    this.calDataList = this.calDataList.bind(this)
    this.selectTab = this.selectTab.bind(this)
    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.exporter = this.exporter.bind(this)
  }

  componentDidMount() {
    this.handleSearch()
  }

  handleDatesChange({startDate, endDate}) {1
    this.setState({
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD')
    }, this.handleSearch)
  }

  handleSearch() {
    const {startDate, endDate} = this.state
    this.props.getData({startDate, endDate})
  }

  exporter() {
    const {adminStatistics, deadlineList} = this.props
    const {startDate, endDate, tab} = this.state
    const {platformList} = adminStatistics
    let data = []
    let title = ''
    if (tab === 1) {
      data = platformList.scaleList.slice()
      title = `规模统计(${startDate} ~ ${endDate})`
    } else {
      data = platformList.collectList.slice()
      title = `募集统计(${startDate} ~ ${endDate})`
    }
    let columns = [
      { text: '日期', name: 'borrow_date' },
      { text: `${tab === 1? '交易':'募集'}笔数`, name: 'borrow_count' },
      { text: `${tab === 1? '交易':'募集'}金额（万元）`, name: 'borrow_fee' },
      ...deadlineList.map(item => ({text:item.deadline_name,name:`d_${item.deadline_id}`,}))
    ]
    //let csv = `\ufeff日期,${tab === 1? '交易':'募集'}笔数,${tab === 1? '交易':'募集'}金额（万元）,${deadlineList.map(item => item.deadline_name).join(',')}\r\n${data.map(r => Object.keys(r).map(t => (typeof r[t] == "string") ? r[t].replace(",", "") : r[t]).join(",")).join("\r\n")}`
/*
    var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    FileSaver.saveAs(blob, `${title}.csv`);*/
    /*this.props.simplyLogTable({from_table:"t_order_voucher",action_type:"平台规模统计导出",params:{startDate, endDate}}).promise.then(({response})=>{
      if(response && response.success){
        downloadUrl(row.voucher_url)
      }
    })*/
    fastExport(data,columns,`${title}.xlsx`)
  }

  calDataList(list) {
    let dateList = list.map(item => item.borrow_date)
    let countList = list.map(item => item.borrow_count)
    let feeList = list.map(item => item.borrow_fee)
    let data = {
      dateList, countList, feeList
    }
    this.props.deadlineList.forEach(deadline => {
      let id = deadline['deadline_id']
      data[deadline['deadline_name']] = list.map(item => item[`d_${id}`])
    })
    return data
  }

  selectTab(e, tab) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({tab})
  }

  render() {
    const {adminStatistics, _buttons, deadlineList} = this.props
    const {platformList} = adminStatistics
    const {startDate, endDate, tab} = this.state
    const {collectList, scaleList} = platformList
    return (<div className='component'>
      <div className='wrapper__no-filter-form'>
        <div className="row info-row" style={{marginBottom: '20px'}}>
          <div className="col-sm-3">
            {startDate && endDate &&
            <DatePicker onDatesChange={this.handleDatesChange} startDate={startDate} endDate={endDate}
                        hideClearDate={true}/>}
          </div>
          <button type="button" className="btn icon-btn btn-success pull-left" onClick={this.handleSearch}>
            <i className="fa fa-search"></i>搜索
          </button>
          {_buttons.includes('fund_collection_monthly_export') && <div className="col-sm-1">
            <button type="button" className="btn icon-btn btn-success pull-right" onClick={this.exporter}>
              <i className="fa fa-download"></i>导出
            </button>
            <a download="true" className="hidden" target="_blank" ref={(link) => {
              this.hiddenLink = link
            }}></a>
          </div>}
        </div>
        <ul className="nav nav-tabs" role="tablist">
          <li role="presentation" className={(tab === 1) ? 'active' : ''} onClick={e => this.selectTab(e, 1)}><a
            href="javascript:;">规模统计</a></li>
          <li role="presentation" className={(tab === 2) ? 'active' : ''} onClick={e => this.selectTab(e, 2)}><a
            href="javascript:;">募集统计</a></li>
        </ul>
        <div className="col-sm-12" styleName="platform-wrapper">
          {tab === 1 && <AxitChart title="规模统计" type={'交易'} width={'100%'} height={'100%'} data={this.calDataList(scaleList)}
                       deadlineList={deadlineList} ref={ref => this.chart1 = ref}/>}
          {tab === 2 && <AxitChart title="募集统计" type={'募集'} width={'100%'} height={'100%'} data={this.calDataList(collectList)}
                                  deadlineList={deadlineList} ref={ref => this.chart2 = ref}/>}

        </div>
      </div>
    </div>)
  }
}

