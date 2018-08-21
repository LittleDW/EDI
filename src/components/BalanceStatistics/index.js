import React, { Component } from "react";
import MonthFilter from "./MonthFilter";
import NestCustomRowTable from '../Datatable/NewTable'
import CustomRowTable from "../Datatable/NewTable";
import { formatOrganizationCode, formatStatisNumber, convertToString } from "../../utils/etc";
import FormatOrgCodePage from "../Formatter/FormatOrgCodePage";

export default class BalanceStatistics extends Component {
  constructor(props) {
    super(props);
    const orgType =
      props._SESSION.user_type === 1 ? "fund_org_code" : "asset_org_code";
    this.state = {
      tab: 1,
      orgType: orgType
    };
  }

  selectTab = (e, tab) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ tab });
  };

  handleDateChange = ({ startDate, endDate, orgType }) => {
    this.setState({ orgType }, () => {
      this.props.search({ startDate, endDate, orgType });
    });
  };

  handleOrgChange = ({ assetList, fundList }) => {
    this.props.searchTab4({ assetList, fundList });
  };

  render() {
    const { balanceStatistics, _SESSION } = this.props;
    const { monthList, dayList, balanceList, balaStaList } = balanceStatistics;
    const { tab, orgType } = this.state;
    return (
      <div className="component">
        <form className="clearfix filter-form">
          <div className="row info-row">
            <MonthFilter
              handleDateChange={this.handleDateChange}
              handleOrgChange={this.handleOrgChange}
              tab={tab}
              userType={_SESSION.user_type}
            />
          </div>
        </form>
        <div className="wrapper">
          <p style={{ color: "red", margin: "0 0 8px 0" }}>
            提示：统计数据依据为“已确认”及“已结清”的对账单（统计维度为本金），为确保统计报表数据的准确性，请及时确认对账单
          </p>
          <ul className="nav nav-tabs" role="tablist">
            <li
              role="presentation"
              className={tab === 1 ? "active" : ""}
              onClick={e => this.selectTab(e, 1)}
            >
              <a href="javascript:;">放款统计表</a>
            </li>
            <li
              role="presentation"
              className={tab === 2 ? "active" : ""}
              onClick={e => this.selectTab(e, 2)}
            >
              <a href="javascript:;">还款统计表</a>
            </li>
            <li
              role="presentation"
              className={tab === 3 ? "active" : ""}
              onClick={e => this.selectTab(e, 3)}
            >
              <a href="javascript:;">余额情况表</a>
            </li>
            {_SESSION.user_type === 3 && (
              <li
                role="presentation"
                className={tab === 4 ? "active" : ""}
                onClick={e => this.selectTab(e, 4)}
              >
                <a href="javascript:;">余额信息汇总</a>
              </li>
            )}
          </ul>
          <span className="unit">单位：元</span>
          {tab === 4 && (
            <span style={{ position: "absolute", top: "52px", right: "30px" }}>
              数据来源：依据资产方财务数据
            </span>
          )}
          <div className="wrapper__tab-area" style={{ height: "24rem" }}>
            {tab === 1 && (
              <NestCustomRowTable
                data={monthList}
                subData={dayList}
                rowIterator={"statistics_month"}
                subRowIterator={"statistics_date"}
                valueIterator={"loan_fee"}
                columnIterator={orgType}
                title={"到账月/日"}
                showRowTotal={true}
                showColumnTotal={true}
                groupSubData={(value, subValue) => subValue.includes(value)}
                renderColumn={value => <FormatOrgCodePage value={value} />}
                renderValue={value => formatStatisNumber(convertToString(value, 2))}
              />
            )}
            {tab === 2 && (
              <NestCustomRowTable
                data={monthList}
                subData={dayList}
                rowIterator={"statistics_month"}
                subRowIterator={"statistics_date"}
                valueIterator={"repayment_fee"}
                columnIterator={orgType}
                title={"还款月/日"}
                showRowTotal={true}
                showColumnTotal={true}
                renderColumn={value => <FormatOrgCodePage value={value} />}
                renderValue={value => formatStatisNumber(convertToString(value, 2))}
              />
            )}
            {tab === 3 && (
              <NestCustomRowTable
                data={balanceList}
                rowIterator={"statistics_date"}
                valueIterator={"balance_fee"}
                columnIterator={orgType}
                title={"日期"}
                showRowTotal={true}
                showColumnTotal={true}
                renderColumn={value => <FormatOrgCodePage value={value} />}
                renderValue={value => formatStatisNumber(convertToString(value, 2))}
              />
            )}
            {tab === 4 &&
              _SESSION.user_type === 3 && (
                <CustomRowTable
                  data={balaStaList}
                  rowIterator={"asset_org_code"}
                  valueIterator={"balance_fee"}
                  columnIterator={"fund_org_code"}
                  title={"资产/资金"}
                  showRowTotal={true}
                  showColumnTotal={true}
                  renderRow={value => {
                    const name = formatOrganizationCode(value, this.props.DICTIONARY)
                    return <span title={name}>{name}</span>
                  }}
                  renderColumn={value => <FormatOrgCodePage value={value} />}
                  renderValue={value => formatStatisNumber(convertToString(value, 2))}
                  scroll={false}
                />
              )}
          </div>
        </div>
      </div>
    );
  }
}
