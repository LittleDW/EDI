import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CustomRowTable from '../Datatable/NewTable';
import Select from '../Select';
import CSSModules from 'react-css-modules';
import Dialog from '../Dialog';
import DateRangePicker from '../DatePicker/DateRangePicker';
import { formatStatisNumber, convertToString } from '../../utils/etc';
import FormatOrgCodePage from '../Formatter/FormatOrgCodePage';
import style from './style.scss';
import moment from 'moment';

@CSSModules(style)
export default class RepaymentPlan extends Component {
  constructor(props) {
    super(props);
    const { startDate, endDate } = this.handleProps(props);
    this.state = {
      tab: 0,
      loading: true,
      startDate,
      reloadDatepicker: false,
      endDate,
      orgType:
        props._session.user_type === 1 ? 'fund_org_code' : 'asset_org_code',
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.customRender = this.customRender.bind(this);
    this.handleUserTypeChange = this.handleUserTypeChange.bind(this);
    this.renderUserType = this.renderUserType.bind(this);

    this.selectTab = this.selectTab.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    const { startDate, endDate } = this.handleProps(this.props);
    this.setState(
      {
        tab: 0,
        loading: true,
        reloadDatepicker: true,
        startDate,
        endDate,
      },
      () => {
        this.setState(
          {
            reloadDatepicker: false,
          },
          this.handleSearch,
        );
      },
    );
  };

  handleProps = (props) => {
    const startDate = moment()
      .subtract(6, 'day')
      .format('YYYY-MM-DD');
    const endDate = moment()
      .add(1, 'month')
      .subtract(7, 'day')
      .format('YYYY-MM-DD');
    return { startDate, endDate };
  };

  handleSearch() {
    this.setState(
      {
        loading: true,
      },
      () => {
        const { _session } = this.props;
        const { startDate, endDate } = this.state;
        if (startDate && endDate) {
          this.props
            .searcher({
              userType:
                _session && _session.user_type == 3 ? this.state.orgType : '',
              startDate,
              endDate,
            })
            .promise.then(() => {
              this.setState({ loading: false });
            });
        }
      },
    );
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  formatOrgCode(s) {
    var { dictionary } = this.props,
      period = dictionary
        .filter((r) => r.table_name == 't_user')
        .filter((r) => r.col_name == 'org_code'),
      result = period.filter((r) => s == r.para_key)[0];
    return result ? result.para_value : s;
  }

  handleUserTypeChange({ value }) {
    let orgType = value;
    this.setState(
      {
        orgType,
      },
      this.handleSearch,
    );
  }

  handleDateChange = ({ startDate, endDate }) => {
    const { startDate: _startDate, endDate: _endDate } = this.state;
    if (startDate !== _startDate || endDate !== _endDate) {
      this.setState(
        {
          startDate,
          endDate,
        },
        this.handleSearch,
      );
    }
  };

  renderUserType() {
    let options = [
      { label: '资产方', value: 'asset_org_code' },
      { label: '资金方', value: 'fund_org_code' },
    ];
    return (
      <Select
        onChange={this.handleUserTypeChange}
        options={options}
        noEmpty={true}
        defaultValue={this.state.orgType}
      />
    );
  }

  customRender() {
    return (
      <div className="wrapper__content-tips">
        说明：统计结果未经精确计算与校验，仅供参考，实际以资金方的还款对账单提供为准！
      </div>
    );
  }

  selectTab(e, tab) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ tab });
  }

  render() {
    const { data, _session } = this.props;
    const {
      tab,
      orgType,
      startDate,
      endDate,
      loading,
      reloadDatepicker,
    } = this.state;

    return (
      <div className="component">
        <form className="clearfix filter-form">
          <div className="row info-row">
            <button
              type="button"
              className="btn btn-primary pull-left"
              onClick={this.init}
              style={{ marginLeft: '20px' }}
            >
              <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`} />
            </button>
            {_session.user_type === 3 && (
              <div className="col-sm-3">
              <label className="col-sm-3 filter-form__static-text">
                <span>类型:</span>
              </label>
              <div className="col-sm-7">{this.renderUserType()}</div>
              </div>
            )}
            <div className="col-sm-3">
              <label className="col-sm-3 filter-form__static-text">
                <span>时间:</span>
              </label>
              <div className="col-sm-8">
                {!reloadDatepicker && (
                  <DateRangePicker
                    onDatesChange={this.handleDateChange}
                    startDate={moment(startDate)}
                    endDate={moment(endDate)}
                    hideClearDate
                  />
                )}
              </div>
            </div>
          </div>
        </form>
        <div
          className={
            _session && _session.user_type == 3
              ? 'wrapper'
              : 'wrapper__no-filter-form wrapper'
          }
        >
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            说明：统计结果未经精确计算与校验，仅供参考，实际以资金方的还款对账单提供为准！
          </div>
          <ul className="nav nav-tabs" role="tablist">
            <li
              role="presentation"
              className={tab == 0 ? 'active' : ''}
              onClick={(e) => this.selectTab(e, 0)}
            >
              <a href="javascript:;">本息合计</a>
            </li>
            <li
              role="presentation"
              className={tab == 1 ? 'active' : ''}
              onClick={(e) => this.selectTab(e, 1)}
            >
              <a href="javascript:;">本金</a>
            </li>
            <li
              role="presentation"
              className={tab == 2 ? 'active' : ''}
              onClick={(e) => this.selectTab(e, 2)}
            >
              <a href="javascript:;">利息</a>
            </li>
          </ul>
          <span className="unit">单位：元</span>
          <div
            styleName={
              _session && _session.user_type == 3
                ? 'wrapper__tab-area__with-tips'
                : 'wrapper__no-filter__tab-area__with-tips'
            }
          >
            {tab == 0 &&
              data.rows.length > 0 && (
                  <CustomRowTable
                    data={data.rows}
                    rowIterator={'repayment_date'}
                    valueIterator={'all_fee'}
                    columnIterator={orgType}
                    title={'日期'}
                  showRowTotal
                  showColumnTotal
                    scroll={false}
                  useFixedHeader
                  bodyHeight={_session.user_type == 3 ? null : 250}
                  renderColumn={(value) => <FormatOrgCodePage value={value} />}
                    renderValue={(value) =>
                      formatStatisNumber(convertToString(value, 2))
                    }
                  />
              )}
            {tab == 1 && (
              <div>
                <CustomRowTable
                  data={data.rows}
                  rowIterator={'repayment_date'}
                  valueIterator={'principal_fee'}
                  columnIterator={orgType}
                  title={'日期'}
                  showRowTotal={true}
                  showColumnTotal
                  scroll={false}
                  bodyHeight={_session.user_type == 3 ? null : 250}
                  renderColumn={(value) => <FormatOrgCodePage value={value} />}
                  renderValue={(value) =>
                    formatStatisNumber(convertToString(value, 2))
                  }
                />
              </div>
            )}
            {tab == 2 && (
              <div>
                <CustomRowTable
                  data={data.rows}
                  rowIterator={'repayment_date'}
                  valueIterator={'interest_fee'}
                  columnIterator={orgType}
                  title={'日期'}
                  showRowTotal={true}
                  showColumnTotal
                  scroll={false}
                  bodyHeight={_session.user_type == 3 ? null : 250}
                  renderColumn={(value) => <FormatOrgCodePage value={value} />}
                  renderValue={(value) =>
                    formatStatisNumber(convertToString(value, 2))
                  }
                />
              </div>
            )}
            {tab == 3 && (
              <div>
                <CustomRowTable
                  data={data.rows}
                  rowIterator={'repayment_date'}
                  valueIterator={'service_fee'}
                  columnIterator={orgType}
                  title={'日期'}
                  showRowTotal={true}
                  showColumnTotal
                  bodyHeight={_session.user_type == 3 ? null : 250}
                  renderColumn={(value) => <FormatOrgCodePage value={value} />}
                  renderValue={(value) =>
                    formatStatisNumber(convertToString(value, 2))
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
