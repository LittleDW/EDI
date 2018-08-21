import React, {PureComponent} from "react";
import style from "./style.scss";
import Pagination from "../Pagination";
import PropTypes from "prop-types";
import {formatOrganizationCode, unique} from "../../utils/etc";
import PieChart from "../Charts/pie";
import WeeklyFilter from "../Common/WeeklyFilter";
import CSSModules from "react-css-modules";
import DynamicColInputTableRowspan from "./DynamicColInputTableRowspan";
import DynamicColInputTable from "./DynamicColInputTable";
import {FormatDeadline} from "../Formatter";

@CSSModules(style, {allowMultiple: true})
export default class DistriPlan extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      week: "",
      year: "",
      startDate: "",
      endDate: "",
      data: [],
      deadlineData: [],
      isHistoryPage: false,
      index: 1,
      promise: null,
      tab: 0
    };
  }

  componentDidMount() {
    this.setState({promise: this.props.getUserSetting().promise})
  }

  searchData = ({year, week, startDate, endDate}) => {
    const {promise} = this.state
    this.setState({year, week, startDate, endDate});
    if (!this.state.isHistoryPage) {
      promise.then(data => {
        const {userAttr} = this.props.distriPlan
        const {is_deadline_favor} = userAttr
        const hasFavor = is_deadline_favor === 1
        data.response && data.response.success && this.props.searchData({year, week, hasFavor}).promise.then(result => {
          if (result && result.response) {
            const {data, deadlineData} = result.response
            this.setState({
              data,
              deadlineData
            })
          }
        })
      })
    } else {
      promise.then(data => {
        const {userAttr} = this.props.distriPlan
        const {is_deadline_favor} = userAttr
        const hasFavor = is_deadline_favor === 1
        data.response && data.response.success && this.searchHisData().promise.then(result => {
          if (result && result.response) {
            const {hisList} = result.response
            this.setState({
              hisList,
            })
          }
        })
      })
    }
  };

  searchHisData = (index) => {
    this.setState({
      index: index
        ? index
        : 1
    }, () => {
      let param = {
        org_code: this.props._session.org_code,
        year: this.state.year,
        week: this.state.week,
        pageIndex: this.state.index
      };
      this.props.getHistory(param);
    });
  };

  deadlineValueChange = (deadlineData) => {
    this.setState({deadlineData});
  };

  valueChange = (data) => {
    this.setState({data});
  };

  goToHistory = () => {
    this.setState({isHistoryPage: true});
    this.searchHisData();
  };

  selectTab = (tab) => {
    this.setState({tab});
  };

  leaveHistory = () => {
    this.setState({isHistoryPage: false});
  };

  init = () => {
    this.setState({promise: this.props.getUserSetting().promise}, () => {
      this.weekliFilter.getWrappedInstance().reset();
    })
  };

  submit = () => {
    const {startDate, endDate, data, deadlineData} = this.state;
    const org_code = this.props._session.org_code;
    const {userAttr} = this.props.distriPlan
    const {product_deadline, is_deadline_favor} = userAttr
    const hasFavor = is_deadline_favor === 1, preferedDeadline = product_deadline ? product_deadline.split(',') : []

    const {is_deadline_favor: deadlineFavor, partner_nature: deadlineList} = this.props.distriPlan;
    if (startDate && endDate) {
      this.props.save({startDate, endDate, org_code, data, deadlineData, deadlineFavor, deadlineList, hasFavor, preferedDeadline});
    }
  };

  render() {
    const self = this;
    const {distriPlan, dictionary, _buttons, dicDeadlineList, _session} = this.props;
    const {hisList, userAttr, readOnly, total} = distriPlan
    const deadlineList = userAttr && userAttr.product_deadline ? userAttr.product_deadline.split(',') : []
    let {tab, deadlineData, data} = this.state;
    return (<div className="component">
      <form className="filter-form">
        <div className="row info-row">
          <div className="col-sm-2">
            <button type="button" className="btn btn-primary pull-left" onClick={this.init}
                    style={{marginRight: "10px"}}>
              <i className="fa fa-refresh"></i>
            </button>
            {this.state.isHistoryPage &&
            <a className="pull-left btn btn-link" styleName="filter-form__showPages"
               onClick={(e) => this.leaveHistory(e)}>返回</a>}
            {
              !this.state.isHistoryPage && _buttons.includes("submit_plan") &&
              <button type="button" className="btn icon-btn btn-primary pull-left" disabled={distriPlan.readOnly}
                      onClick={(e) => self.submit(e)}>
                <i className="fa fa-search"></i>提交
              </button>
            }
          </div>
          {!this.state.isHistoryPage &&
          <div className="col-sm-8"><WeeklyFilter handleDateChange={this.searchData} ref={(ref) => {
            this.weekliFilter = ref;
          }}/></div>}
        </div>
        {!this.state.isHistoryPage && <p styleName="filter-form__tips">请在给定的时间范围前设置计划数值，过期将不可修改</p>}
        {
          !this.state.isHistoryPage && <div styleName="filter-form__rules">
            <p>*请务必于每周五17:00点提交下周计划，17:00后不可更改。<br/> * 如果没有维护下周{_session.user_type === 1 ? '需求' : '募集'}计划，默认使用上周数据。</p>
          </div>
        }
      </form>
      <div className="wrapper">
        {
          !this.state.isHistoryPage && <div>
            <ul className="nav nav-tabs" role="tablist">
              <li role="presentation" className={(
                tab === 0)
                ? "active"
                : ""} onClick={() => this.selectTab(0)}>
                <a href="javascript:;">产品期限</a>
              </li>
              {/* <li role="presentation" className={(
                tab === 1)
                ? "active"
                : ""} onClick={() => this.selectTab(1)}>
                <a href="javascript:;">{_session.user_type === 2 ? "资产方" : "资金方"}</a>
              </li> */}
            </ul>
            {tab === 1 &&
            <a className="pull-right btn btn-link" styleName="filter-form__check-history"
               onClick={() => this.goToHistory()}>查看历史记录</a>}
            <span className="unit">单位：万元</span>
            {
              tab === 0 && <div>
                <p style={{
                  marginTop: "10px"
                }}>{_session.user_type !== 2 ? '请根据平台实际情况填写每日不同产品期限对应的需求量' : '请根据平台实际情况填写每日不同产品期限对应的募集量'}</p>
                <div styleName="wrapper__left-area">
                  {userAttr.is_deadline_favor === 1 && <DynamicColInputTable data={deadlineData} title="日期/产品期限" columnIterator="week_name"
                                    rowIterator="deadline_id" valueIterator="plan_fee" filterRow={row => deadlineList.includes(row.deadline_id)}
                                    valueChange={this.deadlineValueChange} renderRow={row => <FormatDeadline value={row.deadline_id} />}
                                    readOnly={readOnly}/>}
                  {userAttr.is_deadline_favor !== 1 && <DynamicColInputTableRowspan data={deadlineData} title="日期/产品期限" columnIterator="week_name"
                                    rowIterator="deadline_id" valueIterator="plan_fee"
                                    valueChange={this.deadlineValueChange} renderRow={row => <FormatDeadline value={row.deadline_id} />}
                                    readOnly={readOnly}/>}
                </div>
                <div styleName="wrapper__right-area">
                  {userAttr.is_deadline_favor === 1 && <PieChart data={unique(deadlineData.filter(row => deadlineList.includes(row.deadline_id)), "deadline_id").map((item) => {
                    return {
                      value: deadlineData.filter(d => d.deadline_id === item.deadline_id).map(item => item.plan_fee / 1000000).reduce((a, b) => a + b),
                      name: dicDeadlineList.find(dic => dic.deadline_id === item.deadline_id) && dicDeadlineList.find(dic => dic.deadline_id === item.deadline_id).deadline_name
                    };
                  })} title="产品期限分布" width={"95%"} height={"50%"}/>}
                  {userAttr.is_deadline_favor === 1 && <PieChart data={unique(deadlineData.filter(row => deadlineList.includes(row.deadline_id)), "plan_date").map((item) => {
                    return {
                      value: deadlineData.filter(d => d.plan_date === item.plan_date).map(item => item.plan_fee / 1000000).reduce((a, b) => a + b),
                      name: `${item.week_name}`
                    };
                  })} title="产品日期分布" width={"95%"} height={"50%"} type={"loop"}/>}
                  {userAttr.is_deadline_favor !== 1 && <PieChart data={unique(deadlineData.filter(row => row.deadline_id === '100'), "plan_date").map((item) => {
                    return {
                      value: deadlineData.filter(d => d.deadline_id === '100' && d.plan_date === item.plan_date).map(item => item.plan_fee / 1000000).reduce((a, b) => a + b),
                      name: `${item.week_name}`
                    };
                  })} title="产品日期分布" width={"95%"} height={"50%"} type={"loop"}/>}
                </div>
              </div>
            }
            {
              tab === 1 && <div>
                <p style={{
                  marginTop: "10px"
                }}>{_session.user_type === 2 ? '请根据平台实际情况填写每日不同资产方对应的募集量' : '请根据平台实际情况填写每日不同资金方对应的需求量'}</p>
                <div className="wrapper__table-scroll">
                  <DynamicColInputTable data={data} title="日期/供给量（万元）" columnIterator="week_name" rowIterator={_session.user_type === 2 ? "asset_org_code" : "fund_org_code"}
                                    valueIterator="plan_fee"
                                    renderRow={(row) => `${formatOrganizationCode(row[_session.user_type === 2 ? "asset_org_code" : "fund_org_code"], dictionary)}(${row[_session.user_type === 2 ? "asset_org_code" : "fund_org_code"]})`}
                                    valueChange={this.valueChange} readOnly={readOnly}/>
                </div>
              </div>
            }
          </div>
        }
        {
          this.state.isHistoryPage && [<DynamicColInputTable key={'table'} data={hisList} title="日期/供给量（万元）" columnIterator="week_name"
                                                         rowIterator="week" valueIterator="plan_fee"
                                                         renderRow={(row) => `${row.year}年第${row.week}周（${row.start_date}至${row.end_date}）`}
                                                         readOnly={true} showTotalRow={false}/>,
            <Pagination key={'pagination'} searcher={this.searchHisData} index={this.state.index}
                        total={total}/>
          ]
        }
      </div>
    </div>);
  }
}

DistriPlan.propTypes = {
  distriPlan: PropTypes.object.isRequired
}
