/*
 * Author: zhangjunjie
 * Title: 个人征信
 * Date: 2018-03-27
 */

import React, { Component } from 'react';
import SearchBar from '../../Common/SearchBar';
import CSSModules from 'react-css-modules';
import Datatable from '../../Datatable';
import {
  FormatTaskEnterprisePICrawStatus,
  FormatOrgCode,
} from '../../Formatter';
import UserTypeSelector from '../../Select/UserTypeSelectorPage';
import OrgSelector from '../../Select/OrgSelectorPage';
import { fastExport, formatOrganizationCode } from '../../../utils/etc';

const defaultUserType = ['1', '2'];

export default class PersonalPublicity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      pageIndex: 1,
      orgCode:
        props._SESSION.user_type === 2
          ? props._SESSION.org_code
          : props._SESSION.user_type === 1
            ? props._SESSION.org_code
            : '',
      allowedType: defaultUserType,
    };
    this.handleExport = this.handleExport.bind(this);

    const self = this;
    this.columns = [
      {
        text: '机构名称',
        name: 'org_code',
        style: { width: '120px', textAlign: 'center' },
        renderDom: row => <FormatOrgCode value={row.org_code} />,
      },
      {
        text: '查询时间',
        name: 'task_createtime',
        withTitle: true,
        style: { width: '120px', textAlign: 'center' },
      },
      {
        text: '名称',
        name: 'task_name',
        style: {
          maxWidth: window.innerWidth < 1650 ? '290px' : '',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
      {
        text: '查询数量（条）',
        name: 'total_count',
        style: { width: '120px', textAlign: 'center' },
      },
      {
        text: '状态',
        name: 'task_status',
        style: { width: '120px', textAlign: 'center' },
        renderDom: row => (
          <FormatTaskEnterprisePICrawStatus value={row.task_status} />
        ),
      },
      {
        text: '成功数量（条）',
        name: 'finish_count',
        style: { width: '120px', textAlign: 'center' },
      },
      {
        text: '失败数量（条）',
        name: 'fail_count',
        style: { width: '120px', textAlign: 'center' },
      },
      {
        text: '操作',
        name: 'task_status',
        style: { width: '120px', textAlign: 'center' },
        renderDom: row =>
          (row.task_status === 3 || row.task_status === '3') &&
          row.down_url != '' && (
            <a href={row.down_url} download>
              下载
            </a>
          ),
      },
    ];

    this.searchBarSetting = [
      {
        label: '用户类型:',
        type: 'custom',
        renderDom: () => (
          <UserTypeSelector
            onChange={this.handleUserTypesChange}
            allowedType={defaultUserType}
          />
        ),
      },
      {
        label: '机构:',
        type: 'custom',
        renderDom: () => (
          <OrgSelector
            onChange={this.handleOrgChange}
            allowedType={self.state.allowedType}
          />
        ),
      },
      {
        label: '查询开始日:',
        type: 'date',
        props: {
          onDateChange: self.handleStartDateChange,
          showClearDate: true,
          output: 'date',
          style: { width: '100%' },
        },
      },
      {
        label: '查询结束日:',
        type: 'date',
        props: {
          onDateChange: self.handleEndDateChange,
          showClearDate: true,
          output: 'date',
          style: { width: '100%' },
        },
      },
      {
        label: '名称:',
        type: 'text',
        props: {
          ref: input => {
            this.nameInput = input;
          },
        },
      },
    ];
    this.exportColumns = [
      {
        text: '机构名称',
        name: 'org_code',
        renderDom: row => formatOrganizationCode(row.org_code, self.props.DICTIONARY)
      },
      {
        text: '查询时间',
        name: 'task_createtime',
      },
      {
        text: '名称',
        name: 'task_name',
      },
      {
        text: '查询数量（条）',
        name: 'total_count',
      },
      {
        text: '状态',
        name: 'task_status',
        renderDom: row => {
          switch (row.task_status) {
            case '1':
              return '已创建';
            case '2':
              return '处理中';
            case '3':
              return '已完成';
            default:
              return '已创建';
          }
        },
      },
      {
        text: '成功数量（条）',
        name: 'finish_count',
      },
      {
        text: '失败数量（条）',
        name: 'fail_count',
      },
    ];
    if (this.props._SESSION.user_type != 3) {
      this.searchBarSetting = this.searchBarSetting.slice(2);
      this.columns = this.columns.slice(1);
      this.exportColumns= this.exportColumns.slice(1);
    }
  }

  componentDidMount() {
    this.handleSearch();
  }

  onSearch = e => {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  };

  handleSearch = index => {
    const pageIndex = index ? index : 1;
    this.setState({ pageIndex });
    const { startDate, endDate, orgCode } = this.state;
    return this.props.search({
      startDate: startDate && startDate.format('YYYY-MM-DD 00:00:00'),
      endDate: endDate && endDate.format('YYYY-MM-DD 23:59:59'),
      pageIndex,
      taskName: this.nameInput && this.nameInput.value,
      orgCode,
    });
  };

  handleStartDateChange = startDate => {
    this.setState(
      {
        startDate,
      },
      this.handleSearch
    );
  };

  handleEndDateChange = endDate => {
    this.setState(
      {
        endDate,
      },
      this.handleSearch
    );
  };

  handleAssetOrgChange = row => {
    this.setState({ assetOrgCode: row.value, pageIndex: 1 }, this.handleSearch);
  };

  handleFundOrgChange = row => {
    this.setState({ fundOrgCode: row.value, pageIndex: 1 }, this.handleSearch);
  };

  handleUserTypesChange = row => {
    const { allowedType, orgCode } = this.state;
    if (row.value == '' && (orgCode == '' || orgCode.includes('%'))) {
      this.setState(
        { allowedType: defaultUserType, orgCode: '' },
        this.handleSearch
      );
    } else if (row.value == '') {
      this.setState({ allowedType: defaultUserType });
    } else {
      if (row.value == '1' && (orgCode == '' || orgCode.includes('%'))) {
        this.setState(
          { allowedType: [row.value], orgCode: 'A1501%' },
          this.handleSearch
        );
      } else if (row.value == '2' && (orgCode == '' || orgCode.includes('%'))) {
        this.setState(
          { allowedType: [row.value], orgCode: 'F1502%' },
          this.handleSearch
        );
      } else {
        this.setState({ allowedType: [row.value] });
      }
    }
  };

  handleOrgChange = ({ value }) => {
    const { allowedType } = this.state;
    if (value == '' && allowedType.length === 1 && allowedType[0] === '1') {
      this.setState(
        {
          orgCode: 'A1501%',
        },
        this.handleSearch
      );
    } else if (
      value == '' &&
      allowedType.length === 1 &&
      allowedType[0] === '2'
    ) {
      this.setState(
        {
          orgCode: 'F1502%',
        },
        this.handleSearch
      );
    } else {
      this.setState(
        {
          orgCode: value,
        },
        this.handleSearch
      );
    }
  };
  handleExport = e => {
    e.preventDefault();
    e.stopPropagation();
    const { startDate, endDate, orgCode } = this.state;
    this.props.searchExport({
      startDate: startDate && startDate.format('YYYY-MM-DD 00:00:00'),
      endDate: endDate && endDate.format('YYYY-MM-DD 23:59:59'),
      taskName: this.nameInput && this.nameInput.value,
      orgCode,
    }).promise.then(({response}) => {
      if(response.rows && response.rows.length > 0){
        fastExport(response.rows, this.exportColumns, '个人征信导出.xlsx');
      }

    })

  };

  render() {
    const { publicityList, navigateTo, _buttons, _SESSION } = this.props;
    const { data } = publicityList;
    const self = this;
    return (
      <div className="component">
        <SearchBar items={this.searchBarSetting} searcher={this.onSearch}>
          <div className="pull-left" style={{ marginRight: '1rem' }}>
            <button
              type="submit"
              className="btn icon-btn btn-primary"
              style={{ marginLeft: 0 }}
            >
              <i className="fa fa-search" />搜索
            </button>
          </div>

          {Array.isArray(_buttons) &&
            _buttons.includes('personal_publicity_export') && (
              <button
                type="button"
                className="btn icon-btn btn-danger pull-right"
                onClick={this.handleExport}
              >
                <i className="fa fa-search" />导出
              </button>
            )}
          {Array.isArray(_buttons) &&
            _buttons.includes('personal_publicity_create') &&
            _SESSION.user_type !== 3 && (
              <button
                type="button"
                className="btn icon-btn btn-warning pull-right"
                onClick={() => {
                  navigateTo('searchPersonalPublicityDetail');
                }}
              >
                <i className="fa fa-search" />生成报告
              </button>
            )}
        </SearchBar>
        <div className="wrapper">
          <Datatable
            columns={this.columns}
            searcher={self.handleSearch}
            rows={data.rows}
            total={data.totalRow}
            index={this.state.pageIndex}
          />
          <p className="wrapper__content-tips">
            共 <span style={{ color: 'green' }}>{data.totalRow}</span>{' '}
            条记录：查询数量{' '}
            <span style={{ color: 'green' }}>{data.totalCount}条</span>，成功{' '}
            <span style={{ color: 'red' }}>{data.success}</span> 条， 失败{' '}
            <span style={{ color: 'red' }}>{data.fail}</span> 条
          </p>
        </div>
      </div>
    );
  }
}
