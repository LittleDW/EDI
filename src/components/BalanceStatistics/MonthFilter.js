import React, { Component } from "react";
import PropTypes from "prop-types";
import MonthSelect from "./MonthSelect";
import moment from "moment";
import Select from "../Select";
import AssetSelector from "../Select/AssetSelectorPage";
import FundSelector from "../Select/FundSelectorPage";

export default class MonthFilter extends Component {
  constructor(props) {
    super(props);
    const orgType = props.userType !== 2 ? "fund_org_code" : "asset_org_code";
    this.state = {
      startDate: null,
      endDate: null,
      staticStartDate: moment()
        .subtract(1, "month")
        .format("YYYY-MM-DD"),
      staticEndDate: moment()
        .subtract(1, "day")
        .format("YYYY-MM-DD"),
      assetList: "",
      fundList: "",
      orgType
    };
    this.startDate = null;
    this.endDate = null;
    this.handleStartMonthChange = startDate => {
      if (this.state.startDate !== startDate) {
        this.setState({ startDate }, this.handleDateChange);
      }
    };
    this.handleEndMonthChange = endDate => {
      if (this.state.endDate !== endDate) {
        this.setState({ endDate }, this.handleDateChange);
      }
    };
    this.handleDateChange = () => {
      const { startDate, endDate, orgType } = this.state;
      if (
        startDate &&
        endDate &&
        (this.startDate !== startDate || this.endDate !== endDate)
      ) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.props.handleDateChange({ startDate, endDate, orgType });
      }
    };
    this.handleOrgChange = () => {
      const { assetList, fundList } = this.state;
      this.props.handleOrgChange({ assetList, fundList });
    };
    this.selectAsset = list => {
      console.log(list);
      const assetList = list.map(item => item.value).join(",");
      if (assetList === this.state.assetList) {
        return;
      }
      this.setState({ assetList }, this.handleOrgChange);
    };

    this.selectFund = list => {
      const fundList = list.map(item => item.value).join(",");
      if (fundList === this.state.fundList) {
        return;
      }
      this.setState({ fundList: fundList }, this.handleOrgChange);
    };

    this.orgList = [
      {
        label: "资金方",
        value: "fund_org_code"
      },
      {
        label: "资产方",
        value: "asset_org_code"
      }
    ];

    this.selectOrgType = ({ value }) => {
      if (value === this.state.orgType) {
        return;
      }
      this.setState(
        {
          orgType: this.props.userType === 3 ? value : this.props.userType === 1 ? "fund_org_code" : "asset_org_code"
        },
        () => {
          const { startDate, endDate, orgType } = this.state;
          if (startDate && endDate) {
            this.props.handleDateChange({ startDate, endDate, orgType });
          }
        }
      );
    };
  }

  componentDidMount() {
    if (this.props.userType === 3) {
      this.handleOrgChange();
    }
  }

  render() {
    const { tab, userType } = this.props;
    const { staticStartDate, staticEndDate } = this.state;
    return (
      <div>
        <div
          className="col-sm-2"
          style={userType === 3 && tab !== 4 ? {} : { display: "none" }}
        >
          {
            <Select
              options={this.orgList}
              onChange={this.selectOrgType}
              noEmpty={true}
            />
          }
        </div>
        <div
          className="col-sm-3"
          style={userType === 3 && tab === 4 ? {} : { display: "none" }}
        >
          <label className="col-sm-3 filter-form__static-text">资产方：</label>
          <div className="col-sm-9">
            <AssetSelector onChange={this.selectAsset} multiple />
          </div>
        </div>
        <div
          className="col-sm-3"
          style={userType === 3 && tab === 4 ? {} : { display: "none" }}
        >
          <label className="col-sm-3 filter-form__static-text">资金方：</label>
          <div className="col-sm-9">
            <FundSelector onChange={this.selectFund} multiple />
          </div>
        </div>
        <div style={tab === 1 || tab === 2 ? {} : { display: "none" }}>
          <div className="col-sm-4">
            <MonthSelect
              monthsBefore={12}
              allowedMonthBefore={moment().format("YYYY-MM")}
              handleDateChange={this.handleStartMonthChange}
            />
          </div>
          <div className="col-sm-1 filter-form__static-text_center">到</div>
          <div className="col-sm-4">
            <MonthSelect allowedMonthBefore={moment().format("YYYY-MM")} handleDateChange={this.handleEndMonthChange} />
          </div>
        </div>
        <div className="col-sm-8" style={tab === 3 ? {} : { display: "none" }}>
          <div className="col-sm-2 filter-form__static-text_center">
            {staticStartDate}
          </div>
          <div className="col-sm-1 filter-form__static-text_center">到</div>
          <div className="col-sm-2 filter-form__static-text_center">
            {staticEndDate}
          </div>
        </div>
      </div>
    );
  }
}

MonthFilter.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  handleOrgChange: PropTypes.func.isRequired,
  tab: PropTypes.number.isRequired,
  userType: PropTypes.number
};
