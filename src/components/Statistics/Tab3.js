import React, { Component } from 'react';
import CSSModule from 'react-css-modules';
import style from './style.scss';
import { formatStatisNumber, sumArray } from '../../utils/etc';

import { measureScrollbar } from "../../utils/etc";

const SCROLLWIDTH = measureScrollbar()
@CSSModule(style, { allowMultiple: true })
class Tab3 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
    };

    this.fundColumn = [
      {
        text: '存量',
        name: 'fund_stock_fee',
      },
      {
        text: '计划募集量',
        name: 'plan_fee',
      },
      {
        text: '匹配成功量',
        name: 'match_fee',
      },
      {
        text: '实际满标量',
        name: 'raise_fee',
      },
      {
        text: '募集完成率',
        name: 'raise_rate',
      },
      {
        text: '出账完毕量',
        name: 'account_fee',
      },
    ];

    this.assetColumn = [
      {
        text: '存量',
        name: 'fund_stock_fee',
      },
      {
        text: '计划供给量',
        name: 'plan_fee',
      },
      {
        text: '匹配成功量',
        name: 'match_fee',
      },
      {
        text: '实际满标量',
        name: 'raise_fee',
      },
      {
        text: '募集完成率',
        name: 'raise_rate',
      },
      {
        text: '资金到账量',
        name: 'expend_fee',
      },
    ];

    this.renderColumns = this.renderColumns.bind(this);
    this.renderTotalRow = this.renderTotalRow.bind(this);
    this.renderTotalRate = this.renderTotalRate.bind(this);
  }

  renderColumns(row, column, columnIndex) {
    return (
      <td key={String(columnIndex)}>
        <span>
          {row[column.name] !== null
            ? column.name === 'raise_rate'
              ? row[column.name] + '%'
              : Number(row[column.name]) === 0
                ? '-'
                : row[column.name]
            : column.name === 'raise_rate'
              ? '0.00%'
              : '-'}
        </span>
      </td>
    );
  }
  renderTotalRate() {
    const { data } = this.props;
    let val = (
      sumArray(data, 'raise_fee') *
      100 /
      sumArray(data, 'match_fee')
    ).toFixed(2);
    if (isNaN(val)) {
      return '0.00%';
    } else {
      return val + '%';
    }
  }

  renderTotalRow(columnArr) {
    const { data } = this.props;
    return (
      <tr className="datatable__total-area">
        <td>总计</td>
        {columnArr.map(
          (col, i) =>
            col.name !== 'raise_rate' ? (
              <td key={Number(i)} style={col.style}>
                {formatStatisNumber(sumArray(data, col.name))}
              </td>
            ) : (
              <td key={Number(i)}>{this.renderTotalRate()}</td>
            ),
        )}
      </tr>
    );
  }

  render() {
    const { value } = this.state;
    const { data, role } = this.props;
    const columnAll =
      role === '1' ? [...this.fundColumn] : [...this.assetColumn];
    const columnPart = [...columnAll]
      .slice(0, 1)
      .concat([...columnAll].slice(2));
    const columnArr = !value ? [...columnAll] : [...columnPart];
    return (
      <div className="wrapper__tab-area">
        <div className="row info-row" style={{width: '980px'}}>{this.props.children}</div>
        <div styleName="wrapper__tab-area__tab2">
          <div style={{marginRight: `${SCROLLWIDTH}px` }}>
            <div key="head" style={{ overflowY: 'scroll' , marginRight: `-${SCROLLWIDTH}px` }}>
              {data &&
                data.length > 0 && (
                  <table styleName="datatable">
                    <thead>
                      <tr>
                        <th>产品期限</th>
                        {columnArr.map((col, i) => <th key={i}>{col.text}</th>)}
                      </tr>
                    </thead>
                  </table>
                )}
            </div>
            <div key="body" style={{ maxHeight: '14.5rem', overflowY: 'scroll' , marginRight: `-${SCROLLWIDTH}px` }}>
              {data &&
                data.length > 0 && (
                  <table styleName="datatable">
                    <tbody>
                      {data.map((row, i) => (
                        <tr key={i}>
                          <td>{row.deadline_name}</td>
                          {columnArr.map((column, columnIndex) =>
                            this.renderColumns(row, column, columnIndex),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
            <div key="total" style={{ maxHeight: '15.5rem', overflowY: 'scroll' , marginRight: `-${SCROLLWIDTH}px` }}>
              {data &&
                data.length > 0 && (
                  <table styleName="datatable">
                    <tbody>
                      {this.renderTotalRow(columnArr)}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        </div>
        <p styleName="wrapper__content-tips-red">
          <i className="fa fa-info-circle" />{' '}
          存量＝匹配成功总额－上标完毕总额，募集完成率=实际满标量/匹配成功量
        </p>
        <br />
      </div>
    );
  }
}

export default CSSModule(Tab3, style, { allowMultiple: true });
