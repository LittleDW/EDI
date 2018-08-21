import React, { Component } from "react";
import Proptypes from "prop-types";
import Select from "../Select";
import AssetRelatedSelectorPage from "../Select/AssetRelatedSelectorPage";
import FundRelatedSelectorPage from "../Select/FundRelatedSelectorPage";

export default class Filter extends Component {
  constructor(props) {
    super();
    const { session } = props;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    this.state = {
      year: `${year}`,
      month: `${month < 10 ? "0" + month : month}`,
      assetOrgCode: session.user_type === 1 ? session.org_code : "",
      fundOrgCode: session.user_type === 2 ? session.org_code : ""
    };
  }

  componentDidMount() {
    this.triggerPropSearch()
  }


  calculateYearList = () => {
    const year = new Date().getFullYear() - 1;
    let yearList = [];
    for (let i = year; i <= year + 3; i++) {
      yearList.push({
        label: `${i} 年`,
        value: `${i}`
      });
    }
    return yearList;
  };

  calculateMonthList = () => {
    let monthList = [];
    for (let i = 1; i <= 12; i++) {
      if (i < 10) {
        monthList.push({
          label: `${i}月`,
          value: `0${i}`
        });
      } else {
        monthList.push({
          label: `${i}月`,
          value: `${i}`
        });
      }
    }
    return monthList;
  };

  handleDateChange = ({ year, month }) => {
    this.setState({ year, month }, this.triggerPropSearch);
  };

  handleFundOrgChange = ({ value }) => {
    this.setState(
      {
        fundOrgCode: value
      },
      this.triggerPropSearch
    );
  };

  handleAssetOrgChange = ({ value }) => {
    this.setState(
      {
        assetOrgCode: value
      },
      this.triggerPropSearch
    );
  };

  handleYearChange = ({ value }) => {
    const oldYear = this.state.year;
    if (oldYear === value) {
      return;
    }
    this.setState({ year: value }, this.triggerPropSearch);
  };

  handleMonthChange = ({ value }) => {
    const oldMonth = this.state.month;
    if (oldMonth === value) {
      return;
    }
    this.setState({ month: value }, this.triggerPropSearch);
  };

  triggerPropSearch = () => {
    const { year, month, assetOrgCode, fundOrgCode } = this.state;
    this.props.handleChange({ year, month, assetOrgCode, fundOrgCode });
  };

  render() {
    const { user_type: userType } = this.props.session;
    const { year, month } = this.state;
    return (
      <div>
        <div className="col-sm-2">
          <Select
            noEmpty={true}
            defaultValue={year}
            onChange={this.handleYearChange}
            options={this.calculateYearList()}
          />
        </div>
        <div className="col-sm-2">
          <Select
            noEmpty={true}
            defaultValue={month}
            onChange={this.handleMonthChange}
            options={this.calculateMonthList()}
          />
        </div>
        {userType !== 1 && (
          <div className={"col-sm-3"}>
            <label className="col-sm-3 filter-form__static-text">
              <span>资产方</span>
            </label>
            <div className="col-sm-8">
              <AssetRelatedSelectorPage
                onChange={this.handleAssetOrgChange}
                fundOrgCode={this.state.fundOrgCode}
              />
            </div>
          </div>
        )}
        {userType !== 2 && (
          <div className={"col-sm-3"}>
            <label className="col-sm-3 filter-form__static-text">
              <span>资金方</span>
            </label>
            <div className="col-sm-8">
              <FundRelatedSelectorPage
                onChange={this.handleFundOrgChange}
                assetOrgCode={this.state.assetOrgCode}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

Filter.proptypes = {
  session: Proptypes.object.isRequired,
  handleChange: Proptypes.func.isRequired
};
