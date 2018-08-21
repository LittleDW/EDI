/* eslint-disable no-undef */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import myStyle from './style.scss';
import { measureScrollbar } from "../../utils/etc";

const SCROLLWIDTH = measureScrollbar();

@CSSModules(myStyle, { allowMultiple: true })
export default class DatatableScroll extends Component {
  constructor(props) {
    super(props);
  }

  renderTHColumns = (column, i) => {
    return (
      <th style={column.style} key={i}>
        {column.text}
      </th>
    );
  }

  renderTDColumns = (row, column, j) => {
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

  renderRows = (row, columns, i) => {
    const { rows } = this.props;

    return (
      <tr key={i}>
        {columns.map((r, j) => this.renderTDColumns(row, r, j))}
      </tr>
    );
  }

  render() {
    const {
      columns,
      rows,
      searcher,
      style,
      index,
      bodyHeight
    } = this.props;
    var self = this;
    return (
      <div style={{...style, marginRight: `${SCROLLWIDTH}px`}}>
        <div key="header" style={{ marginRight: `-${SCROLLWIDTH}px` }} className={myStyle.scrollHeader}>
          <table className={myStyle.datatable}>
            <thead>
              <tr>
                {columns.map(this.renderTHColumns)}
              </tr>
            </thead>
          </table>
        </div>
        {rows && rows.length > 0 && <div key="body" style={{ maxHeight: bodyHeight || '18rem', marginRight: `-${SCROLLWIDTH}px` }} className={myStyle.scrollBody}>
          <table className={myStyle.datatable}>
            <tbody>
              {rows &&
                rows.map((row, i) => {
                  return this.renderRows(row, columns, i);
                })}
            </tbody>
          </table>
        </div>}
      </div>
    );
  }
}

DatatableScroll.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  searcher: PropTypes.func,
  noPgaging: PropTypes.bool,
  withCheckbox: PropTypes.bool,
  withRadio: PropTypes.bool,
  style: PropTypes.object,
};
