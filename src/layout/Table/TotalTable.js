import React from 'react';
import PropTypes from 'prop-types';
import { measureScrollbar } from './utils';
import BaseTable from './BaseTable';

export default function TotalTable(props, { table }) {
  const { prefixCls, scroll, showTotalRow } = table.props;
  const { columns, fixed, tableClassName, handleBodyScrollLeft, expander } = props;
  const { saveRef } = table;
  const headStyle = {};

  // if (scroll.y) {
  //   // Add negative margin bottom for scroll bar overflow bug
  //   const scrollbarWidth = measureScrollbar('horizontal');
  //   if (scrollbarWidth > 0 && !fixed) {
  //     headStyle.marginBottom = `-${scrollbarWidth}px`;
  //     headStyle.paddingBottom = '0px';
  //   }
  // }

  if (!showTotalRow) {
    return null;
  }

  return (
    <div
      key="totalTable"
      ref={fixed ? null : saveRef('totalTable')}
      className={`${prefixCls}-total`}
      style={headStyle}
      onScroll={handleBodyScrollLeft}
    >
      <BaseTable
        tableClassName={tableClassName}
        hasHead={false}
        hasBody={false}
        hasTotal
        fixed={fixed}
        columns={columns}
        expander={expander}
      />
    </div>
  );
}

TotalTable.propTypes = {
  fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  columns: PropTypes.array.isRequired,
  tableClassName: PropTypes.string.isRequired,
  handleBodyScrollLeft: PropTypes.func.isRequired,
  expander: PropTypes.object.isRequired,
};

TotalTable.contextTypes = {
  table: PropTypes.any,
};
