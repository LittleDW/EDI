import React, { Component } from "react";
import Proptypes from "prop-types";
import NestStatisticsTable from "../BalanceStatistics/NestStatisticsTable";
import { formatStatisNumber, convertToString } from "../../utils/etc";

export default class Content extends Component {
  constructor(props) {
    super();
  }

  render() {
    const {monthList, dayList, orgType} = this.props
    return (
      <NestStatisticsTable
        data={monthList}
        subData={dayList}
        rowIterator={"statistics_month"}
        subRowIterator={"statistics_date"}
        valueIterator={"value"}
        columnIterator={orgType}
        title={"贷款发放时间"}
        renderValue={value => {
          if (typeof value === 'string' && value.includes('%')) {
            return value
          } else if (typeof value === 'string' && isNaN(parseInt(value))) {
            return value
          } else {
            return formatStatisNumber(convertToString(value, 0))
          }
        }}
        showRowTotal={false}
        showColumnTotal={false}
      />
    );
  }
}

Content.proptypes = {
  monthList: Proptypes.array.isRequired,
  dayList: Proptypes.array.isRequired,
  orgType: Proptypes.string.isRequired,
}
