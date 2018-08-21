import React, { Component } from "react";
import PropTypes from "prop-types";
import Filter from "./Filter";
import Content from "./Content";
import _ from "lodash";
import {formatNumber, formatOrganizationCode, convertToStringNew} from "../../utils/etc";
import NestedTable from "../AssetSetting/NestedTable";

export default class AfterRepaymentStatistics extends Component {
  constructor(props) {
    super();
    const { _SESSION } = props;
    this.columns = [
      {
        text: "应还款日期",
        name: "statistics_month",
        style: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100px",
          maxWidth: "100px",
          minWidth: "100px",
          textAlign: "center"
        },
        total: '总计', // NestedTable显示总计标志位  true: 显示  string: 具体的值
      }, {
        text: "资产方",
        name: "asset_org_code",
        withTitle: true,
        style: {
          width: "130px",
          maxWidth: "130px",
          minWidth: "130px",
          textAlign: "left",
          overflow: "hidden",
          textOverflow: "ellipsis"
        },
        renderDom: row => `${this.formatOrganizationCode(row.asset_org_code)}(${row.asset_org_code})`
      },{
        text: "资金方",
        name: "fund_org_code",
        withTitle: true,
        style: {
          width: "130px",
          maxWidth: "130px",
          minWidth: "130px",
          textAlign: "left",
          overflow: "hidden",
          textOverflow: "ellipsis"
        },
        renderDom: row => `${this.formatOrganizationCode(row.fund_org_code)}(${row.fund_org_code})`
      },{
        text: "应收总笔数",
        name: "due_order_count",
        style: {
          width: "85px",
          maxWidth: "85px",
          minWidth: "85px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber(row.due_order_count)
      },{
        text: "应收总金额",
        name: "due_fee",
        style: {
          width: "105px",
          maxWidth: "105px",
          minWidth: "105px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber(row.due_fee / 100)
      },{
        text: "正常还款笔数",
        name: "paid_up_order_count",
        style: {
          width: "105px",
          maxWidth: "105px",
          minWidth: "105px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber(row.paid_up_order_count)
      },{
        text: "正常还款金额",
        name: "paid_up_fee",
        style: {
          width: "105px",
          maxWidth: "105px",
          minWidth: "105px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber(row.paid_up_fee / 100)
      },{
        text: "代偿笔数",
        name: "compensatory_order_count",
        style: {
          width: "85px",
          maxWidth: "85px",
          minWidth: "85px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber(row.compensatory_order_count)
      },{
        text: "代偿金额",
        name: "compensatory_fee",
        style: {
          width: "85px",
          maxWidth: "85px",
          minWidth: "85px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber(row.compensatory_fee / 100)
      },{
        text: "逾期笔数",
        name: "compensatory_order_count",
        style: {
          width: "85px",
          maxWidth: "85px",
          minWidth: "85px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber(row.due_order_count - row.paid_up_order_count - row.compensatory_order_count)
      },{
        text: "逾期金额",
        name: "compensatory_fee",
        style: {
          width: "85px",
          maxWidth: "85px",
          minWidth: "85px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => formatNumber((row.due_fee - row.paid_up_fee - row.compensatory_fee) / 100)
      },{
        text: "代偿金额占比",
        name: "paid_up_fee",
        style: {
          width: "105px",
          maxWidth: "105px",
          minWidth: "105px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => convertToStringNew(row.compensatory_fee / row.due_fee, true)
      },{
        text: "逾期金额占比",
        name: "paid_up_fee",
        style: {
          width: "105px",
          maxWidth: "105px",
          minWidth: "105px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right"
        },
        renderDom: row => convertToStringNew((row.due_fee - row.paid_up_fee - row.compensatory_fee) / row.due_fee, true)
      }]
    if (_SESSION.user_type === 1) {
      this.columns.splice(1,1)
    } else if (_SESSION.user_type === 2) {
      this.columns.splice(2, 1)
    }

    this.subColumns = [{...this.columns[0], name: "statistics_date",}].concat(this.columns.slice(1))
  }
  handleFilterChange = param => {
    const { year, month, assetOrgCode, fundOrgCode } = param;
    this.props.search({ year, month, assetOrgCode, fundOrgCode });
  };

  formatOrganizationCode = (s) => {
    var {DICTIONARY} = this.props;
    return formatOrganizationCode(s, DICTIONARY);
  };

  render() {
    const { _SESSION, statAfterRepay } = this.props;
    const { monthList, dayList } = statAfterRepay;
    return (
      <div className="component">
        <form className="clearfix filter-form">
          <div className="row info-row">
            <Filter session={_SESSION} handleChange={this.handleFilterChange} />
          </div>
        </form>
        <div className="wrapper">
          <span className="unit__without-tab">单位：元</span>
          <NestedTable
            columns={this.columns}
            subColumns={this.subColumns}
            rows={monthList}
            subRows={dayList}
            showTotalRow={false}
            wrapMinWidth="1300px"
            bodyHeight="23rem"
            filterSubRow={
              _SESSION.user_type === 3
                ? (subRows, row) =>
                    subRows.filter(
                      subRow =>
                        subRow["fund_org_code"] === row["fund_org_code"] &&
                        subRow["asset_org_code"] === row["asset_org_code"]
                    )
                : null
            }
          />
        </div>
      </div>
    );
  }
}

AfterRepaymentStatistics.propTypes = {
  _SESSION: PropTypes.object.isRequired,
  DICTIONARY: PropTypes.array.isRequired,
  search: PropTypes.func.isRequired,
  statAfterRepay: PropTypes.shape({
    dayList: PropTypes.array.isRequired,
    monthList: PropTypes.array.isRequired
  })
};
