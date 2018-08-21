import React, {Component} from "react";
import NestedTable from "./NestedTable";
import SingleDatePicker from "../SingleDatePicker";
import AssetUserFromSelectorPage from '../Select/AssetUserFromSelectorPage'
import FundUserFromSelectorPage from '../Select/FundUserFromSelectorPage'
import Dialog from "../Dialog";
import moment from "moment";
import PropTypes from "prop-types";
import {formatNumber, formatOrganizationCode} from "../../utils/etc";
import Select from "../Select";
import SearchBar from '../Common/SearchBar'
import OperLogModal from "../Modal/OperLogModal";
import DeadlineFeeModal from './DeadlineFeeModal'
import AssetSettingModal from './AssetSettingModal'
import {FormatDeadline} from "../Formatter";

export default class AssetSetting extends Component {
  constructor(props) {
    super(props);
    const {_session} = props
    this.state = {
      match_date: moment().format("YYYY-MM-DD"),
      showMode: false,
      showDeadlineMode: false,
      showOperLogModal: false,
      operLogModalTableName: '',
      operLogModalKey: '',
      assetOrgCode:_session.user_type === 1 ? _session.org_code: '',
      fundOrgCode:_session.user_type === 2 ? _session.org_code: '',
      _row: null,
      message: "",
      action_type: '',
      captchaMap: {},
      text: "发送验证码"
    };
    this.getIndex = this.getIndex.bind(this);
    const self = this;
    this.staticColumns = [
      {
        text: "序号",
        name: "product_no",
        style: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "80px",
          maxWidth: "80px",
          minWidth: "80px",
          textAlign: "center"
        },
        total: '总计', // NestedTable显示总计标志位  true: 显示  string: 具体的值
        renderDom: this.getIndex
      }, {
        text: "资金方",
        name: "fund_org_code",
        style: {
          width: "130px",
          maxWidth: "130px",
          minWidth: "130px",
          textAlign: "left",
          overflow: 'hidden'
        },
        renderDom: row => `${this.formatOrganizationCode(row.fund_org_code)}(${row.fund_org_code})`
      }, {
        text: "资产方供给量",
        name: "asset_fee",
        style: {
          width: "9%",
          textAlign: "center"
        },
        total: true,
        renderDom: row => formatNumber(row.asset_fee / 1000000)
      }, {
        text: "资金方募集量",
        name: "fund_fee",
        style: {
          width: "9%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center"
        },
        total: true,
        renderDom: row => formatNumber(row.fund_fee / 1000000)
      }, {
        text: "目标匹配量/日",
        name: "max_fee",
        style: {
          width: "9%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center"
        },
        total: true,
        renderDom: row => formatNumber(row.max_fee / 1000000)
      }, {
        text: "最小匹配量/日",
        name: "min_fee",
        style: {
          width: "9%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center"
        },
        total: true,
        renderDom: row => formatNumber(row.min_fee / 1000000)
      }, {
        text: "已匹配量/日",
        name: "finish_max_fee",
        style: {
          width: "9%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center"
        },
        total: true,
        renderDom: row => formatNumber(row.finish_max_fee / 1000000)
      }, {
        text: "存量资产上限",
        name: "stock_day_count",
        style: {
          width: "9%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center"
        },
        renderDom: row => row.is_check_stock === 0 ? "关" : row.stock_day_count
      }, {
        text: "优先级",
        name: "priority",
        style: {
          width: "9%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center"
        }
      }, {
        text: "操作",
        style: {
          textAlign: "center",
          width: "100px",
          maxWidth: "100px",
          minWidth: "100px",
        },
        renderDom: row => {
          return (
            <div styleName="table-ops">
              {Array.isArray(this.props._buttons) && this.props._buttons.includes("distribution_setting_update") && <a
                className={`btn btn-link ${moment(this.state.match_date).isBefore(moment(), "day")
                  ? "disabled"
                  : ""}`}
                href="javascript:"
                onClick={() => self.openMode(row)}>修改</a>}
              {Array.isArray(this.props._buttons) && this.props._buttons.includes("oper_log") && <a
                className="btn btn-link"
                href="javascript:"
                onClick={() => self.openOperLogModal(row)}>日志</a>}
            </div>
          );
        }
      }
    ];
    if (this.props._session.user_type === 2) {
      const obj = {
        text: "资产方",
        name: "asset_org_code",
        style: {
          width: "130px",
          maxWidth: "130px",
          minWidth: "130px",
          textAlign: "left",
          overflow: 'hidden'
        },
        renderDom: row => `${this.formatOrganizationCode(row.asset_org_code)}(${row.asset_org_code})`
      }
      this.staticColumns = [...this.staticColumns.slice(0, 1), ...[obj], ...this.staticColumns.slice(2)]
      this.staticColumns.splice(-3, 2)
      this.staticColumns[this.staticColumns.length - 1] = {
        text: "操作",
        style: {
          textAlign: "center",
          width: "100px",
          maxWidth: "100px",
          minWidth: "100px",
        }
      }
    } else if (this.props._session.user_type === 3) {
      const obj = {
          text: '资产方',
          name: 'asset_org_code',
          style: {
            width: '130px',
            maxWidth: "130px",
            minWidth: "130px",
            textAlign: 'left',
            overflow: 'hidden'
          },
        renderDom: row => `${this.formatOrganizationCode(row.asset_org_code)}(${row.asset_org_code})`
        }
      this.staticColumns.splice(1,0,obj)
    }
    this.columns = this.staticColumns.slice(0);

    this.searchBarItems = [
      {
        label: "资产方:",
        type:"custom",
        dom:  <AssetUserFromSelectorPage onChange={this.handleAssetOrgChange} userFrom={'1'}/>
      },
      {
        label: "资金方:",
        type:"custom",
        dom: <FundUserFromSelectorPage onChange={this.handleFundOrgChange} userFrom={'1'}/>
      },
      {
        label: "日期:",
        type:"date",
        props:{
          onDateChange:self.onDateChange,
          showClearDate:false,
          noEmpty:true,
          style: {width: "100%"}
        }
      }
    ]


    this.subColumns = [{
      text: "",
      name: "",
      rowSpan: true,
      style: {
        textAlign: "center"
      },
      renderDom: () => <span>产品期限</span>
    }, {
      text: "",
      name: "deadline_id",
      style: {
        textAlign: "left"
      },
      renderDom: (row) => <FormatDeadline value={row.deadline_id}/>
    }, {
      text: "资产方供给量",
      name: "asset_fee",
      style: {
        textAlign: "center"
      },
      renderDom: row => formatNumber(row.asset_fee / 1000000)
    }, {
      text: "资金方募集量",
      name: "fund_fee",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center"
      },
      renderDom: row => formatNumber(row.fund_fee / 1000000)
    }, {
      text: "目标匹配量/日",
      name: "max_fee",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center"
      },
      renderDom: row => formatNumber(row.max_fee / 1000000)
    }, {
      text: "最小匹配量/日",
      name: "min_fee",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center"
      },
      renderDom: row => formatNumber(row.min_fee / 1000000)
    }, {
      text: "已匹配量/日",
      name: "finish_max_fee",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center"
      },
      renderDom: row => formatNumber(row.finish_max_fee / 1000000)
    }, {
      text: "存量资产上限",
      name: "stock_day_count",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center"
      },
      renderDom: row => row.is_check_stock === 0 ? "关" : row.stock_day_count
    }, {
      text: "优先级",
      name: "priority",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center"
      }
    }, {
      text: "操作",
      style: {
        textAlign: "center",
      },
      renderDom: row => {
        return (
          <div styleName="table-ops">
            {Array.isArray(this.props._buttons) && this.props._buttons.includes("distribution_setting_update") && <a
              className={`btn btn-link ${moment(this.state.match_date).isBefore(moment(), "day")
                ? "disabled"
                : ""}`}
              href="javascript:"
              onClick={() => self.openDeadlineMode(row)}>修改</a>}
            {Array.isArray(this.props._buttons) && this.props._buttons.includes("oper_log") && <a
              className="btn btn-link"
              href="javascript:"
              onClick={() => self.openDeadlineOperLogModal(row)}>日志</a>}
          </div>
        );
      }
    }];

    if (this.props._session.user_type === 3) {
      const obj = {
        text: "",
        name: "",
        style: {
          width: "120px",
          textAlign: "center"
        },
        renderDom: row => <span></span>
      }
      this.subColumns.splice(2, 0, obj)
    } else if (this.props._session.user_type === 2) {
      this.subColumns.splice(-3, 2)
    }
  }

  componentDidMount() {
    this.handleSearch()
  }
  componentWillUnmount() {
    const {captchaMap} = this.state;
    // 清除所有计时器，避免内存泄漏
    for (let key in captchaMap) {
      if (captchaMap[key].intervalId) {
        clearInterval(captchaMap[key].intervalId);
      }
    }
  }

  handleSearch = () => {
    const {assetOrgCode, fundOrgCode, match_date} = this.state
    this.props.getData({assetOrgCode, fundOrgCode, match_date})
  }

  onDateChange = (match_date) => {
    this.setState({
      match_date
    }, this.handleSearch);
  };


  handleAssetOrgChange = ({value}) => {
    this.setState({
      assetOrgCode: value
    })
    const {fundOrgCode, match_date} = this.state
    this.props.getData({
      match_date,
      assetOrgCode: value,
      fundOrgCode: fundOrgCode
    })
  }

  handleFundOrgChange = ({value}) => {
    this.setState({
      fundOrgCode: value
    })
    const {assetOrgCode, match_date} = this.state
    this.props.getData({
      match_date,
      assetOrgCode: assetOrgCode,
      fundOrgCode: value
    })
  }

  openDeadlineOperLogModal = (row) => {
    this.setState({
      operLogModalKey: `${row.fund_org_code},${row.asset_org_code},${row.deadline_id},${row.match_date}`,
      operLogModalTableName: 't_asset_fund_deadline_fee',
      action_type: '',
      showOperLogModal: true
    });
  };
  openOperLogModal = (row) => {
    this.setState({
      operLogModalKey: `${row.fund_org_code},${row.asset_org_code}`,
      operLogModalTableName: 't_asset_fund',
      action_type: 'assetSetting',
      showOperLogModal: true
    })
  };

  hideOperLogModal = () => {
    this.setState({
      showOperLogModal: false
    });
  };

  updateDeadline = (_row) => {
    let {fund_org_code, asset_org_code, asset_fee, fund_fee, match_date, deadline_id, _captcha} = _row;
    asset_fee = asset_fee * 1000000;
    fund_fee = fund_fee * 1000000;
    const {user_type} = this.props._session
    if (user_type === 1) {
      asset_org_code = this.props._session.org_code
    } else if (user_type === 2){
      fund_org_code = this.props._session.org_code
    }
    this.props.saveDeadlineData({
      asset_org_code,
      fund_org_code,
      asset_fee: user_type === 2 ? undefined : asset_fee,
      fund_fee: user_type === 1 ? undefined : fund_fee,
      match_date,
      deadline_id,
      captcha: _captcha
    }).promise.then(data => {
      data.response && data.response.success && this.setState({showDeadlineMode: false}, this.handleSearch)
    })
  };

  update = (_row) => {
    let {asset_org_code, fund_org_code, priority, match_date, is_check_stock, stock_day_count} = _row
    is_check_stock = Number(is_check_stock)
    this.props.saveData({asset_org_code, fund_org_code, priority, match_date, is_check_stock, stock_day_count}).promise.then(data => {
      data.response && data.response.success && this.setState({showMode: false}, this.handleSearch)
    })
  }

  openMode(row) {
    let fund_name = this.formatOrganizationCode(row.fund_org_code)
    row['fund_name'] = fund_name
    let _row = {
      ...row
    }
    _row.asset_fee = _row.asset_fee / 1000000
    _row.fund_fee = formatNumber(_row.fund_fee / 1000000)
    _row.max_fee = formatNumber(_row.max_fee / 1000000)
    _row.min_fee = formatNumber(_row.min_fee / 1000000)
    _row.finish_max_fee = formatNumber(_row.finish_max_fee / 1000000)
    _row.is_check_stock = String(_row.is_check_stock)
    _row.priority = _row.priority ? _row.priority : '0'
    this.setState({_row: _row, showMode: true})
  }

  openDeadlineMode = (row) => {
    const {captchaMap} = this.state;
    const {user_type} = this.props._session
    row["fund_name"] = this.formatOrganizationCode(row.fund_org_code);
    row["asset_name"] = this.formatOrganizationCode(row.asset_org_code);
    let _row = {
      ...row
    };
    _row.asset_fee = user_type === 2 ? formatNumber(_row.asset_fee / 1000000) : _row.asset_fee / 1000000;
    _row.fund_fee = user_type === 1 ? formatNumber(_row.fund_fee / 1000000) : _row.fund_fee / 1000000;
    _row.max_fee = formatNumber(_row.max_fee / 1000000);
    _row.min_fee = formatNumber(_row.min_fee / 1000000);
    _row.finish_max_fee = formatNumber(_row.finish_max_fee / 1000000);
    _row.is_check_stock = String(_row.is_check_stock);
    const id = `${_row.asset_org_code},${_row.fund_org_code},${_row.deadline_id}`;
    let arr = {...captchaMap};
    if (!captchaMap[id]) {
      arr[id] = {
        capDisabled: false,
        count: 0
      };

    }
    this.setState({_row: _row, showDeadlineMode: true, captchaMap: arr});
  };
  hideMode = () => {
    this.setState({showMode: false, showDeadlineMode: false});
  };

  getIndex = (row) => {
    return this.props.feeSetting.assetList.indexOf(row) + 1;
  };

  formatOrganizationCode = (s) => {
    var {dictionary} = this.props;
    return formatOrganizationCode(s, dictionary);
  };

  sendCaptcha = () => {
    const {captchaMap, _row} = this.state;
    const {_session, deadline} = this.props
    const id = `${_row.asset_org_code},${_row.fund_org_code},${_row.deadline_id}`;
    if (!captchaMap[id] || !captchaMap[id].capDisabled || captchaMap[id].count === 0) {
      let ddName = deadline.find(item => item.deadline_id === _row.deadline_id)['deadline_name']
      this.props.sendCaptcha({
        fund_org_code: _row.fund_org_code,
        asset_org_code: _row.asset_org_code,
        match_date: _row.match_date,
        deadline_id: _row.deadline_id,
        deadline_name: ddName ? ddName : ''
      });
      let count = 120;
      const intervalId = setInterval(() => {
        if (count <= 0) {
          clearInterval(intervalId);
          const {captchaMap} = this.state;
          let _capMap = {
            ...captchaMap,
            [id]: {
              capDisabled: false,
              count: 0
            }
          };
          this.setState({captchaMap: _capMap});
        } else {
          const {captchaMap} = this.state;
          let _capMap = {
            ...captchaMap,
            [id]: {
              capDisabled: true,
              count,
              intervalId
            }
          };
          this.setState({captchaMap: _capMap});
          count--;
        }
      }, 1000);
    }
  };


  render() {
    let self = this;
    const {assetList, deadlineList, enableCaptcha} = this.props.feeSetting;
    const {_row, captchaMap, match_date} = this.state;
    const {user_type} = this.props._session
    const id = _row && `${_row.asset_org_code},${_row.fund_org_code},${_row.deadline_id}`;
    const title = _row ? `${user_type === 1 ? '资产' : user_type === 2 ? '资金' : ''}分配设置（${match_date}）` : ''
    return (
      <div className="component">
        {user_type != 3 && <form className="filter-form">
          <div className="row info-row">
            <div className="col-sm-2">
              <button type="button" className="btn btn-primary" onClick={self.handleSearch}
                      style={{marginRight: "10px"}}>
                <i className="fa fa-refresh"></i>
              </button>
              <SingleDatePicker
                onDateChange={this.onDateChange}
                isOutsideRange={(date) => date.isAfter(moment().endOf("week"), "day")} noEmpty={true}/>
            </div>
          </div>
        </form>}
        {user_type === 3 && <SearchBar items={this.searchBarItems} searcher={self.handleSearch}>
          <button type="button" className="btn icon-btn btn-primary pull-right" onClick={self.handleSearch}>
            <i className="fa fa-search"></i>搜索
          </button>
        </SearchBar>}
        <div className="wrapper">
          <span className="unit__without-tab">单位：万元</span>
          <div className="wrapper__table-scroll">
            <NestedTable
              columns={this.columns}
              subColumns={this.subColumns}
              rows={assetList}
              subRows={deadlineList}
              showTotalRow={true}
              bodyHeight={"18rem"}
              filterSubRow={user_type === 3 ? (subRows, row) => subRows.filter(subRow => subRow['fund_org_code'] === row['fund_org_code'] && subRow['asset_org_code'] === row['asset_org_code']) : null}
            />
          </div>
          <div className="wrapper__content-tips">
            {user_type != 2 && <p>* 默认取资产方周计划中在各资金方中计划的数值
              <br/>* 可实时修改本周数据（不早于当日）
              <br/>* 可存在多个同优先级数值，优先级数值越小，优先级越高。优先级0为最高</p>}
            {user_type == 2 && <p>* 默认取资金方周计划中在各资产方中计划的数值
              <br/>* 可实时修改本周数据（不早于当日）</p>}
          </div>
        </div>
        {this.state.showDeadlineMode && _row &&
          <DeadlineFeeModal title={title} _row={_row} _session={this.props._session} captchaSetting={captchaMap[id]} update={this.updateDeadline} sendCaptcha={this.sendCaptcha} hideMode={this.hideMode} enableCaptcha={enableCaptcha}/>
        }
        {this.state.showMode && _row &&
          <AssetSettingModal title={title} _row={_row} update={this.update} hideMode={this.hideMode} userType={user_type}/>
        }
        {this.state.showOperLogModal &&
        <OperLogModal data={this.state.data} actionType={this.state.action_type} tableName={this.state.operLogModalTableName} tableKey={this.state.operLogModalKey}
                      title="资产分配日志"
                      closer={this.hideOperLogModal}/>}
      </div>
    );
  }
}

AssetSetting.propTypes = {
  deadline: PropTypes.array.isRequired,
  getData: PropTypes.func.isRequired,
  sendCaptcha: PropTypes.func.isRequired,
  saveDeadlineData: PropTypes.func.isRequired
};
