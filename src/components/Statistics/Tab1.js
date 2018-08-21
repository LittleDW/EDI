import React, { Component } from 'react';
import CSSModule from 'react-css-modules';
import style from './style.scss';
import {
  formatStatisNumber,
  formatOrganizationCode,
  sumArray,
  unique,
} from '../../utils/etc';
import CSSModules from 'react-css-modules/dist/index';
import { measureScrollbar } from "../../utils/etc";

const SCROLLWIDTH = measureScrollbar()


@CSSModules(style, { allowMultiple: true })
export default class Tab1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columnArr: [],
      rowArr: [],
      key: props.role === '1' ? 'fund_org_code' : 'asset_org_code',
    };
    this.handleProps = this.handleProps.bind(this);
    this.renderColumns = this.renderColumns.bind(this);
    this.renderTotalColumn = this.renderTotalColumn.bind(this);
    this.renderTotalRow = this.renderTotalRow.bind(this);
  }

  componentDidMount() {
    this.handleProps(this.props);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.data !== prevProps.data ||
      this.props.role !== prevProps.role
    ) {
      this.handleProps();
    }
  }

  handleProps() {
    const data = [...this.props.data];
    let columnArr = unique(data, 'deadline_id').map((item) => {
      return {
        deadline_name: item.deadline_name,
        deadline_id: item.deadline_id,
      };
    });
    data.forEach((item) => {
      if (item.raise_fee === null) {
        item.raise_fee = 0;
      }
    });
    let key = this.props.role === '1' ? 'fund_org_code' : 'asset_org_code';
    let rowArr = unique(data, key).map((item) => item[key]);
    this.setState({ data, columnArr, rowArr, key });
  }

  renderColumns(row, column, columnIndex) {
    const { data } = this.state;
    let index = -1;
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].deadline_id === column.deadline_id &&
        data[i][this.state.key] === row
      ) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      return (
        <td key={String(index)}>
          {' '}
          <span>
            {Number(data[index].raise_fee) !== 0 ? data[index].raise_fee : '-'}
          </span>
        </td>
      );
    } else {
      return <td key={String(columnIndex)} />;
    }
  }

  renderTotalColumn(row) {
    return (
      <td className="datatable__total-area">
        {formatStatisNumber(
          sumArray(
            this.state.data.filter((item) => item[this.state.key] === row),
            'raise_fee',
          ),
        )}
      </td>
    );
  }

  renderTotalRow() {
    return (
      <tr className="datatable__total-area">
        <td>总计</td>
        {this.state.columnArr.map((col, i) => (
          <td key={Number(i)}>
            {formatStatisNumber(
              sumArray(
                this.state.data.filter(
                  (item) => item.deadline_id === col.deadline_id,
                ),
                'raise_fee',
              ),
            )}
          </td>
        ))}
        <td>{formatStatisNumber(sumArray(this.state.data, 'raise_fee'))}</td>
      </tr>
    );
  }

  render() {
    const { columnArr, rowArr } = this.state;
    const { role, dictionary } = this.props;
    return (
      <div className="wrapper__tab-area">
        <div style={{marginRight: `${SCROLLWIDTH}px`}}>
          {columnArr &&
            columnArr.length > 0 && (
              <div key="header" style={{ overflowY: 'scroll', marginRight: `-${SCROLLWIDTH}px` }}>
                <table styleName="datatable-10">
                  <thead>
                    <tr>
                      <th>{role === '1' ? '资金方' : '资产方'}</th>
                      {columnArr.map((col, i) => (
                        <th key={i}>{col.deadline_name}</th>
                      ))}
                      <th className="datatable__total-area">总计</th>
                    </tr>
                  </thead>
                </table>
              </div>
            )}
          {columnArr &&
            columnArr.length > 0 && (
              <div
                key="body"
                style={{ maxHeight: '19rem', overflowY: 'scroll', marginRight: `-${SCROLLWIDTH}px` }}
              >
                <table styleName="datatable-10">
                  <tbody>
                    {rowArr.map((row, i) => (
                      <tr key={i}>
                        <td>{`${formatOrganizationCode(
                          row,
                          dictionary,
                        )}(${row})`}</td>
                        {columnArr.map((column, columnIndex) =>
                          this.renderColumns(row, column, columnIndex),
                        )}
                        {this.renderTotalColumn(row)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          {columnArr &&
            columnArr.length > 0 && (
              <div
                key="total"
                style={{ maxHeight: '21.5rem', overflowY: 'scroll', marginRight: `-${SCROLLWIDTH}px` }}
              >
                <table styleName="datatable-10">
                  <tbody>
                    {this.renderTotalRow()}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    );
  }
}
