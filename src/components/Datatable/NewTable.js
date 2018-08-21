import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import Datatable from '../../layout/Table';
import '../../styles/table/index.scss';
import { unique, flattenTableData } from '../../utils/etc';
// import Datatable from './index'

export default class NestCustomRowTable extends Component {
  constructor(props) {
    super(props);
    this.handleProps = (props) => {
      const {
        data,
        rowIterator,
        subRowIterator,
        columnIterator,
        valueIterator,
        renderRow,
        renderColumn,
        renderValue,
        title,
        showRowTotal,
        showColumnTotal,
      } = props;
      let _columns = unique(data, columnIterator);
      let columns = [
        {
          title: title,
          key: rowIterator,
          dataIndex: rowIterator,
          fixed: 'left',
          align: 'center',
          countable: '总计',
          style: {
            width: '120px',
            minWidth: '120px',
            maxWidth: '120px',
            overflow: 'hidden',
          },
          render: (value, row) => (
            <span>
              {renderRow
                ? renderRow(row[rowIterator])
                : row[rowIterator]}
            </span>
          ),
        },
      ].concat(
        _columns.map((column) => {
          return {
            title: renderColumn
              ? renderColumn(column[columnIterator])
              : column[columnIterator],
            key: column[columnIterator],
            dataIndex: column[columnIterator],
            countable: true,
            align: 'right',
            style: {
              width: '120px',
              minWidth: '120px',
              maxWidth: '120px',
              overflow: 'hidden',
            },
            render: (value, row) => (
              <span>
                {renderValue
                  ? renderValue(row[column[columnIterator]])
                  : row[column[columnIterator]]}
              </span>
            ),
          };
        }),
      );
      if (showColumnTotal) {
        columns.push({
          title: '总计',
          key: '__totalColumn__',
          dataIndex: '__totalColumn__',
          fixed: 'right',
          align: 'right',
          style: {
            width: '120px',
            minWidth: '120px',
            maxWidth: '120px',
            overflow: 'hidden',
          },
          render: (value, row) => (
            <span>
              {renderValue
                ? renderValue(row['__totalColumn__'])
                : row['__totalColumn__']}
            </span>
          ),
          countable: true,
        });
      }
      return { columns };
    };

    this.groupData = (
      data,
      rowIterator,
      columnIterator,
      valueIterator,
      showColumnTotal,
    ) => {
      const rows = flattenTableData(
        data,
        rowIterator,
        columnIterator,
        valueIterator,
      );
      if (showColumnTotal) {
        let _columns = unique(data, columnIterator);
        rows.forEach((row) => {
          let sum = 0;
          _columns.forEach((column) => {
            try {
              sum = Big(sum)
                .plus(row[column[columnIterator]] || 0)
                .valueOf();
            } catch (error) {
              sum = 0;
            }
          });
          row.__totalColumn__ = sum;
        });
      }
      return rows;
    };
  }
  render() {
    const {
      data,
      subData,
      rowIterator,
      subRowIterator,
      columnIterator,
      valueIterator,
      showRowTotal,
      showColumnTotal,
      groupSubData,
      bodyHeight,
    } = this.props;
    const { columns } = this.handleProps(this.props);
    const rows = this.groupData(
      data,
      rowIterator,
      columnIterator,
      valueIterator,
      showColumnTotal,
    );
    if (subData && subRowIterator && groupSubData) {
      const subRows = this.groupData(
        subData,
        subRowIterator,
        columnIterator,
        valueIterator,
        showColumnTotal,
      );
      rows.forEach((row) => {
        const children = subRows.filter((subRow) =>
          groupSubData(row[rowIterator], subRow[subRowIterator]),
        );
        children.forEach(
          (subRow) => (subRow[rowIterator] = subRow[subRowIterator]),
        );
        row.children = children.slice();
      });
    }
    if (rows && rows.length > 0 && columns && columns.length > 2) {
      return (
        <Datatable
          data={rows}
          columns={columns}
          useFixedHeader
          className="bordered"
          rowKey={(record) => record[this.props.rowIterator]}
          scroll={{ x: columns.length * 120, y: bodyHeight || 250 }}
          style={{ width: `${columns.length * 120 + 20}px`, maxWidth: '100%' }}
          showTotalRow={showRowTotal}
        />
      );
    } else {
      return <span>数据加载中...</span>;
    }
  }
}

NestCustomRowTable.propTypes = {
  data: PropTypes.array.isRequired,
  rowIterator: PropTypes.string.isRequired,
  subRowIterator: PropTypes.string,
  columnIterator: PropTypes.string.isRequired,
  valueIterator: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  renderRow: PropTypes.func,
  renderColumn: PropTypes.func,
  renderValue: PropTypes.func,
  showRowTotal: PropTypes.bool,
  showColumnTotal: PropTypes.bool,
  groupSubData: PropTypes.func,
  scroll: PropTypes.bool,
};
