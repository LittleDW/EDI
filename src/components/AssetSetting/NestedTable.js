/* eslint-disable no-undef */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import myStyle from '../Datatable/style.scss';
import { formatNumber } from '../../utils/etc';
import { measureScrollbar } from '../../utils/etc';

const SCROLLWIDTH = measureScrollbar();

@CSSModules(myStyle, { allowMultiple: true })
export default class NestedTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: props.rows,
      __expandList: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { rows } = nextProps;
    const { __expandList } = this.state;
    const expandList = [];
    __expandList.forEach((item) => {
      if (
        rows.some(
          (row) =>
            row.asset_org_code === item.asset &&
            row.fund_org_code === item.fund,
        )
      ) {
        expandList.push(item);
      }
    });
    this.setState({ rows, __expandList: expandList });
  }

  expandSubtable = (row) => {
    const { rows, __expandList } = this.state;
    const index = rows.findIndex((item) => item === row);
    let newRows = rows.slice();
    const asset = newRows[index]['asset_org_code'];
    const fund = newRows[index]['fund_org_code'];
    const expandList = __expandList.slice();
    const it = expandList.findIndex(
      (item) => item['asset'] === asset && item['fund'] === fund,
    );
    if (it !== -1) {
      expandList.splice(it, 1);
    } else {
      expandList.push({
        asset,
        fund,
      });
    }
    this.setState({ rows: newRows, __expandList: expandList });
  };

  renderTHColumns = (column, i) => {
    return (
      <th style={column.style} key={i}>
        <span>{column.text}</span>
      </th>
    );
  };

  renderTDColumns = (row, column, j) => {
    if (j === 0) {
      return (
        <td
          key={j}
          style={column.style}
          title={column.withTitle ? row[column.name] : ''}
        >
          <a
            styleName="subtable-switch"
            href="javascript:;"
            onClick={() => this.expandSubtable(row)}
          >
            {column.renderDom ? column.renderDom(row) : row[column.name]}
            <i
              className={`fa ${
                this.judgeExpandOrNot(row) ? 'fa-caret-up' : 'fa-caret-down'
              }`}
              aria-hidden="true"
            />
          </a>
        </td>
      );
    } else {
      return (
        <td
          key={j}
          style={column.style}
          title={column.withTitle ? row[column.name] : ''}
        >
          {column.renderDom ? column.renderDom(row) : row[column.name]}
        </td>
      );
    }
  };

  renderSubtable = (row) => {
    let subRows = [];
    if (this.props.filterSubRow) {
      subRows = this.props.filterSubRow(this.props.subRows, row);
    } else {
      const iterName = this.props.columns[1].name;
      subRows = this.props.subRows.filter(
        (item) => item[iterName] === row[iterName],
      );
    }
    return subRows.map((subRow, index) => {
      return this.renderSubRows(subRow, index, subRows.length);
    });
  };

  renderSubRows = (subRow, index, count) => {
    const { subColumns } = this.props;
    return (
      <tr key={index}>
        {subColumns.map((col, colIndex) =>
          this.renderSubTDColumns(subRow, col, index, colIndex, count),
        )}
      </tr>
    );
  };

  renderSubTDColumns = (row, column, index, colIndex, count) => {
    if (index === 0) {
      return (
        <td
          key={colIndex}
          style={column.style}
          title={column.withTitle ? row[column.name] : ''}
          rowSpan={column.rowSpan ? count : 1}
        >
          {column.renderDom ? column.renderDom(row) : row[column.name]}
        </td>
      );
    } else {
      if (column.rowSpan) {
        return null;
      }
      return (
        <td
          key={colIndex}
          style={column.style}
          title={column.withTitle ? row[column.name] : ''}
        >
          {column.renderDom ? column.renderDom(row) : row[column.name]}
        </td>
      );
    }
  };

  renderRows = (row, columns, i) => {
    return [
      <tr key={i}>{columns.map((r, j) => this.renderTDColumns(row, r, j))}</tr>,
      this.judgeExpandOrNot(row) && this.renderSubtable(row),
    ];
  };

  renderTotalRow = (rows, columns) => {
    return (
      <tr
        key={'total'}
        className={'edi-table__sumrow'}
        style={{ textAlign: 'center' }}
      >
        {columns.map((col, i) => (
          <td key={i} style={col.style}
          >
            {col.total === true
              ? formatNumber(
                  rows.length > 0 &&
                    rows.map((item) => item[col.name]).reduce((a, b) => {
                      return a + b;
                    }) / 1000000,
                )
              : col.total
                ? col.total
                : ''}
          </td>
        ))}
      </tr>
    );
  };

  judgeExpandOrNot = (row) => {
    const { __expandList } = this.state;
    const index = __expandList.findIndex(
      (item) =>
        item.asset === row.asset_org_code && item.fund === row.fund_org_code,
    );
    return index !== -1;
  };

  render() {
    const { columns, rows, showTotalRow, bodyHeight, wrapMinWidth, style } = this.props;
    return (
      <div style={{ ...style, marginRight: `${SCROLLWIDTH}px`, minWidth: wrapMinWidth || '1200px' }}>
        <div
          key="header"
          style={{ marginRight: `-${SCROLLWIDTH}px` }}
          className={myStyle.scrollHeader}
        >
          <table className={myStyle.datatable}>
            <thead>
              <tr>{columns.map(this.renderTHColumns)}</tr>
            </thead>
          </table>
        </div>
        <div
          key="body"
          style={{
            maxHeight: bodyHeight || '18rem',
            marginBottom: '-6px',
            marginRight: `-${SCROLLWIDTH}px`,
          }}
          className={myStyle.scrollBody}
        >
          <table className={myStyle.datatable}>
            <tbody>
              {rows &&
                rows.map((row, i) => {
                  return this.renderRows(row, columns, i);
                })}
            </tbody>
          </table>
        </div>
        <div
          key="total"
          style={{ marginRight: `-${SCROLLWIDTH}px` }}
          className={myStyle.scrollHeader}
        >
        <table className={myStyle.datatable}>
            <tbody>
              {rows.length > 0 &&
                showTotalRow &&
                this.renderTotalRow(rows, columns)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

NestedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  subColumns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  subRows: PropTypes.array.isRequired,
  showTotalRow: PropTypes.bool,
  filterSubRow: PropTypes.func,
  searcher: PropTypes.func,
};
