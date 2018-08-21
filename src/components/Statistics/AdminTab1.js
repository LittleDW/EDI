import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import style from './style.scss';
import {
  formatStatisNumber,
  formatOrganizationCode,
  unique,
  sumArray,
  convertToNumber,
} from '../../utils/etc';
import PieChart from '../Charts/pie';
import { measureScrollbar } from "../../utils/etc";

const SCROLLWIDTH = measureScrollbar()

@CSSModules(style, { allowMultiple: true })
export default class AdminTab1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columnArr: [],
      rowArr: [],
      total: 0,
      key: '',
      value: '',
      rowTotal: {},
    };
    this.handleProps = this.handleProps.bind(this);
    this.renderColumns = this.renderColumns.bind(this);
    this.renderTotalColumn = this.renderTotalColumn.bind(this);
    this.renderTotalRow = this.renderTotalRow.bind(this);
    this.calRate = this.calRate.bind(this);
  }

  componentDidMount() {
    this.handleProps(this.props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data) {
      this.handleProps();
    }
  }

  handleProps() {
    const key = this.props.role === '1' ? 'fund_org_code' : 'asset_org_code';
    const value = 'raise_fee';
    const data = [...this.props.data];
    let columnArr = unique(data, 'deadline_id').map((item) => {
      return {
        deadline_name: item.deadline_name,
        deadline_id: item.deadline_id,
      };
    });
    data.forEach((item) => {
      if (item[value] === null) {
        item[value] = 0;
      }
    });
    let rowArr = unique(data, [key]).map((item) => item[key]);
    let rowTotal = {};
    let total = 0;
    rowArr.forEach((row) => {
      let sum = data
        .filter((item) => item[key] === row)
        .map((item) => parseFloat(item[value] && item[value].replace(',', '')))
        .reduce((a, b) => a + b)
        .toFixed(0);
      rowTotal[row] = sum;
      total += Number(sum);
    });

    this.setState({ data, columnArr, rowArr, rowTotal, total, key, value });
  }

  calRate(value, row) {
    const { rowTotal } = this.state;
    let _value = Number(value * 100 / rowTotal[row]).toFixed(2);
    if (isNaN(_value) || _value === 0) {
      return '0.00%';
    } else {
      return String(_value) + '%';
    }
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
      let value =
        data[index][this.state.value] !== '0'
          ? data[index][this.state.value]
          : '-';
      return [
        <td key={String(index) + '_1'}>
          {' '}
          <span>{value}</span>
        </td>,
        <td key={String(index) + '_2'}>
          <span>
            {this.calRate(convertToNumber(data[index][this.state.value]), row)}
          </span>
        </td>,
      ];
    } else {
      return [
        <td key={String(columnIndex) + '_1'} />,
        <td key={String(columnIndex) + '_2'} />,
      ];
    }
  }

  renderTotalColumn(row) {
    return (
      <td className="datatable__total-area">
        {formatStatisNumber(
          sumArray(
            this.state.data.filter((item) => item[this.state.key] === row),
            this.state.value,
          ),
        )}
      </td>
    );
  }

  renderTotalRow() {
    const { total } = this.state;
    return (
      <tr className="datatable__total-area">
        <td>总计</td>
        {this.state.columnArr.map((col, i) => {
          let value = sumArray(
            this.state.data.filter(
              (item) => item.deadline_id === col.deadline_id,
            ),
            this.state.value,
          );
          return [
            <td key={Number(i) + '_1'}><span>{formatStatisNumber(value)}</span></td>,
            <td key={Number(i) + '_2'}><span>
              {total === 0
                ? '0.00%'
                : Number(value * 100 / total).toFixed(2) + '%'}</span>
            </td>,
          ];
        })}
        <td>
          {formatStatisNumber(sumArray(this.state.data, this.state.value))}
        </td>
      </tr>
    );
  }

  render() {
    const { columnArr, rowArr, data } = this.state;
    const { dictionary, role, showChart } = this.props;
    return (
      <div className="wrapper__tab-area">
        <div style={{ minWidth: '1298px', marginRight: `${SCROLLWIDTH}px`}}>
          <div key="head" style={{ overflowY: 'scroll', marginRight: `-${SCROLLWIDTH}px` }}>
            <table styleName="datatable-colspan">
              <thead>
                <tr>
                  <th>{role === '1' ? '资金方' : '资产方'}</th>
                  {columnArr.map((col, i) => (
                    <th key={i} colSpan={'2'}>
                      <span>{col.deadline_name}</span>
                    </th>
                  ))}
                  <th className="datatable__total-area">总计</th>
                </tr>
              </thead>
            </table>
          </div>
          <div key="body" style={{ maxHeight: '15.5rem', overflowY: 'scroll', marginRight: `-${SCROLLWIDTH}px` }}>
            <table styleName="datatable-colspan">
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
          <div key="total" style={{ maxHeight: '15.5rem', overflowY: 'scroll', marginRight: `-${SCROLLWIDTH}px` }}>
          <table styleName="datatable-colspan">
            <tbody>
                {this.renderTotalRow()}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ width: '50%', height: '20rem', display: 'inline-block' }}>
          {data &&
            showChart && (
              <PieChart
                data={unique(data, 'deadline_id').map((item) => {
                  return {
                    value: sumArray(
                      data.filter((d) => d.deadline_id === item.deadline_id),
                      this.state.value,
                    ),
                    name: `${item.deadline_name}`,
                  };
                })}
                title="产品期限分布"
                width={'100%'}
                height={'100%'}
              />
            )}
        </div>
        <div style={{ width: '50%', height: '20rem', display: 'inline-block' }}>
          {data &&
            showChart && (
              <PieChart
                data={unique(data, this.state.key).map((item) => {
                  return {
                    value: sumArray(
                      data.filter(
                        (d) => d[this.state.key] === item[this.state.key],
                      ),
                      this.state.value,
                    ),
                    name: `${formatOrganizationCode(
                      item[this.state.key],
                      dictionary,
                    )}`,
                  };
                })}
                title="产品期限分布"
                width={'100%'}
                height={'100%'}
                type={'loop'}
              />
            )}
        </div>
      </div>
    );
  }
}
