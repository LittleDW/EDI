/*
 * Created by Osborn on Fri Mar 09 2018
 */

import React, { Component } from 'react';
import Datatable from '../Datatable';
import SearchBar from '../Common/SearchBar';
import PropTypes from 'prop-types';
import AssetUserFromSelectorPage from '../Select/AssetUserFromSelectorPage'

export default class CooperatorBusinessSpecifica extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 1,
      assetOrgCode: '',
    };
    this.getIndex = this.getIndex.bind(this);
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this);
    this.renderSearchBar = this.renderSearchBar.bind(this);
    this.clearOps = this.clearOps.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.rowColumns = [
      {
        text: '序号',
        name: 'fund_org_code',
        renderDom: this.getIndex,
        style: {
          width: '80px',
          overflow: 'hidden',
          textAlign: 'center',
          textOverflow: 'ellipsis',
        },
      },
      {
        text: '资金方',
        name: 'fund_org_name',
        style: {
          width: '240px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
        },
      },
      {
        text: '监管银行',
        name: 'fund_supervise_bank',
        style: {
          width: '400px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
        },
      },
      {
        text: '地址',
        name: 'fund_specifica_url',
        style: {
          overflow: 'hidden',
          textAlign: 'center',
          textOverflow: 'ellipsis',
        },
      },
    ];
    this.searchBarItems = [
      {
        label: '资产方:',
        type: 'custom',
        dom: <AssetUserFromSelectorPage noEmpty onChange={this.handleAssetOrgChange} userFrom={"1"}/>,
      },
    ];
  }

  handleAssetOrgChange(row) {
    this.setState({ assetOrgCode: row.value }, this.handleSearch);
  }

  componentWillMount() {
    window.addEventListener('click', this.clearOps);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clearOps);
  }
  componentDidMount() {
    this.handleSearch();
  }
  clearOps() {
    if (this.state.opsUserId) {
      this.setState({ ...this.state, opsUserId: undefined });
    }
  }
  getIndex(row) {
    return this.props.COOPERATOR_BUSINESS_SPECIFICA.rows.indexOf(row) + 1;
  }
  onSearch = e => {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  };
  handleSearch = index => {
    index = index || 1;
    // const { index: currentIndex } = this.state;
    if (this.props._SESSION.user_type === 3 && !this.state.assetOrgCode) {
      return;
    }
    // if (index !== currentIndex) {
    this.setState({ index });
    return this.props.searcher({
      pageIndex: index,
      assetOrgCode: this.state.assetOrgCode,
    });
    // }
  };
  renderSearchBar() {
    return this.props._SESSION.user_type === 1 ? null : (
      <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
        <button type="submit" className="btn icon-btn btn-primary pull-right">
          <i className="fa fa-search" />搜索
        </button>
      </SearchBar>
    );
  }

  render() {
    const { COOPERATOR_BUSINESS_SPECIFICA: specifics } = this.props;
    return (
      <div className="component">
        {this.renderSearchBar()}
        <div className="wrapper">
          <Datatable
            columns={this.rowColumns}
            rows={specifics.rows}
            total={specifics.total}
            index={this.state.index}
            searcher={this.handleSearch}
          />
        </div>
      </div>
    );
  }
}
CooperatorBusinessSpecifica.propTypes = {
  searcher: PropTypes.func.isRequired,
  COOPERATOR_BUSINESS_SPECIFICA: PropTypes.object,
};
