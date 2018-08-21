import React, { Component } from 'react';
import Modal from '../Modal';
import Datatable from '../Datatable';
import TreeModal from '../TreeModal';
import Dialog from '../Dialog';
import OperLogModal from '../Modal/OperLogModal';
import SearchBar from '../Common/SearchBar';
import UserTypeSelector from '../Select/UserTypeSelectorPage';
import OrgRelatedUserTypeSelector from '../Select/OrgRelatedUserTypeSelectorPage';
import { FormatOrgCode, FormatUserType } from '../Formatter';
import { runInThisContext } from 'vm';

export default class SubUserManagement extends Component {
  constructor(props) {
    super();
    let self = this,
      session = props._session,
      user_type = (session && session.user_type) || -1;
    // let {restriction:{relatedFundOrgs, relatedAssetOrgs}} = props
    this.state = {
      index: 1,
      showMode: false,
      showTreeMode: false,
      opsUserId: '',
      data: {},
      message: {
        user_account: '',
        password: '',
        user_name: '',
        tel: '',
        mobile: '',
        email: '',
      },
      checked: [],
      expanded: [],
      menus: [],
      confirmDelete: false,
      deleteUserId: '',
      deleteUserAccount: '',
      showOperLogModal: false,
      userType: '',
      orgCode: '',
      checkAllWithFund: false,
      checkAllWithAsset: false,
      restriction: JSON.parse(JSON.stringify(props.restriction)),
      restrictionData: { fund: [], asset: [] },
    };
    this.showMode = this.showMode.bind(this);
    this.hideMode = this.hideMode.bind(this);
    this.update = this.update.bind(this);
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
    this.openModeToEdit = this.openModeToEdit.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.toggleOps = this.toggleOps.bind(this);
    this.clearOps = this.clearOps.bind(this);
    this.showTreeMode = this.showTreeMode.bind(this);
    this.hideTreeMode = this.hideTreeMode.bind(this);
    this.authorize = this.authorize.bind(this);
    this.openModeToAuth = this.openModeToAuth.bind(this);
    this.openDeleteConfirm = this.openDeleteConfirm.bind(this);
    this.closeDeleteConfirm = this.closeDeleteConfirm.bind(this);
    this.openOperLogModal = this.openOperLogModal.bind(this);
    this.hideOperLogModal = this.hideOperLogModal.bind(this);
    this.handleOrgChange = this.handleOrgChange.bind(this);
    this.handleUserTypesChange = this.handleUserTypesChange.bind(this);
    this.checkAllOrNoneWithFund = this.checkAllOrNoneWithFund.bind(this);
    this.checkAllOrNoneWithAsset = this.checkAllOrNoneWithAsset.bind(this);

    this.rowColumns = [
      {
        text: '用户账号',
        name: 'user_account',
        style: { maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' },
      },
      {
        text: '登陆账号',
        style: {
          maxWidth: window.innerWidth < 1650 ? '250px' : '',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        renderDom: (row) => `${row.main_user_account}:${row.user_account}`,
      },
      {
        text: '用户姓名',
        name: 'user_name',
        style: { maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' },
      },
      {
        text: '用户手机',
        name: 'mobile',
        style: { maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' },
      },
      {
        text: '用户邮箱',
        name: 'email',
        style: { maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' },
      },
      {
        text: '操作',
        style: { width: '80px', textAlign: 'center' },
        renderDom: (row) => {
          const { _buttons } = self.props;
          return (
            <div styleName="table-ops">
              <a href="javascript:" onClick={(e) => self.toggleOps(e, row)}>
                操作
              </a>
              <div styleName={row.sub_user_id == self.state.opsUserId ? 'show-ops' : 'hidden-ops'}>
                {Array.isArray(_buttons) &&
                  _buttons.includes('sub_user_management_auth') && (
                    <a href="javascript:" onClick={() => self.openModeToAuth(row)}>
                      功能权限
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('sub_user_management_restrict') && (
                    <a href="javascript:" onClick={() => self.openModeToRestriction(row)}>
                      数据权限
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('sub_user_management_update') && (
                    <a href="javascript:" onClick={() => self.openModeToEdit(row)}>
                      修改
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('sub_user_management_delete') && (
                    <a href="javascript:" onClick={(e) => self.openDeleteConfirm(row)}>
                      删除
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('sub_user_management_oper_log') && (
                    <a href="javascript:" onClick={() => self.openOperLogModal(row)}>
                      日志
                    </a>
                  )}
              </div>
            </div>
          );
        },
      },
    ];
    this.modalColumns = [
      {
        title: '用户账号及联系方式',
      },
      {
        name: 'user_account',
        text: '用户账号',
        type: 'text',
        labelClassName: 'asterisk',
        handleChange(e) {
          self.state.data.user_account = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return typeof row.user_account === undefined || !row.user_account
            ? '必填'
            : row.user_account.length > 50
              ? '用户账号不能超过50字'
              : null;
        },
      },
      {
        name: 'new_password',
        text: '新密码',
        type: 'password',
        labelClassName: 'asterisk',
        handleChange: (e) => {
          self.state.data.new_password = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          if (typeof row.new_password === undefined || !row.new_password) {
            return '必填';
          } else if (row.new_password != row.confirm_password) {
            return '新密码前后输入不一致';
          }
          return null;
        },
      },
      {
        name: 'confirm_password',
        text: '密码确认',
        type: 'password',
        labelClassName: 'asterisk',
        handleChange: (e) => {
          self.state.data.confirm_password = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          if (typeof row.confirm_password === undefined || !row.confirm_password) {
            return '必填';
          } else if (row.new_password != row.confirm_password) {
            return '新密码前后输入不一致';
          }
          return null;
        },
      },
      {
        name: 'user_name',
        text: '用户姓名',
        type: 'text',
        labelClassName: 'asterisk',
        handleChange(e) {
          self.state.data.user_name = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return typeof row.user_name === undefined || !row.user_name
            ? '必填'
            : row.user_name.length > 50
              ? '用户姓名不能超过50字'
              : null;
        },
      },
      {
        name: 'tel',
        text: '电话',
        type: 'text',
        handleChange(e) {
          self.state.data.tel = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return row.tel && row.tel.length > 50 ? '电话不能超过50字' : null;
        },
      },
      {
        name: 'mobile',
        text: '手机',
        type: 'text',
        handleChange(e) {
          self.state.data.mobile = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return row.mobile && row.mobile.length > 50 ? '手机不能超过50字' : null;
        },
      },
      {
        name: 'email',
        text: '邮箱',
        type: 'text',
        handleChange(e) {
          self.state.data.email = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return row.email && row.email.length > 50 ? '邮箱不能超过50字' : null;
        },
      },
    ];

    this.modalColumnsUpdate = [
      {
        title: '用户账号及联系方式',
      },
      {
        name: 'user_account',
        text: '用户账号',
        type: 'text',
        labelClassName: 'asterisk',
        handleChange(e) {
          self.state.data.user_account = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return typeof row.user_account === undefined || !row.user_account
            ? '必填'
            : row.user_account.length > 50
              ? '用户账号不能超过50字'
              : null;
        },
      },
      {
        name: 'new_password',
        text: '新密码',
        type: 'password',
        handleChange: (e) => {
          self.state.data.new_password = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          if (row.new_password != row.confirm_password) {
            return '新密码前后输入不一致';
          }
          return null;
        },
      },
      {
        name: 'confirm_password',
        text: '密码确认',
        type: 'password',
        handleChange: (e) => {
          self.state.data.confirm_password = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          if (row.new_password != row.confirm_password) {
            return '新密码前后输入不一致';
          }
          return null;
        },
      },
      {
        name: 'user_name',
        text: '用户姓名',
        type: 'text',
        labelClassName: 'asterisk',
        handleChange(e) {
          self.state.data.user_name = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return typeof row.user_name === undefined || !row.user_name
            ? '必填'
            : row.user_name.length > 50
              ? '用户姓名不能超过50字'
              : null;
        },
      },
      {
        name: 'tel',
        text: '电话',
        type: 'text',
        handleChange(e) {
          self.state.data.tel = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return row.tel && row.tel.length > 50 ? '电话不能超过50字' : null;
        },
      },
      {
        name: 'mobile',
        text: '手机',
        type: 'text',
        handleChange(e) {
          self.state.data.mobile = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return row.mobile && row.mobile.length > 50 ? '手机不能超过50字' : null;
        },
      },
      {
        name: 'email',
        text: '邮箱',
        type: 'text',
        handleChange(e) {
          self.state.data.email = e.target.value;
        },
        validate: () => {
          const row = self.state.data;
          return row.email && row.email.length > 50 ? '邮箱不能超过50字' : null;
        },
      },
    ];

    const checkboxRenderer = (array) => (row) =>
      array.map((item, index) => (
        <div className="col-sm-6 checkbox" key={index} style={{ overflow: 'hidden' }}>
          <label key={index} title={item.label}>
            <input
              type="checkbox"
              checked={item._checked}
              disabled={!this.state.restrictionFlag}
              onChange={(e) => {
                this.restrictionHandler(e, item);
              }}
            />
            {item.label}
          </label>
        </div>
      ));
    this.restrictionColumns = [
      {
        name: 'is_data_func',
        text: '使用数据权限',
        renderDom: (row) => (
          <div className="col-sm-6 checkbox">
            <label>
              <input
                type="checkbox"
                checked={this.state.restrictionFlag}
                onChange={this.restrictionFlagHandler}
              />
            </label>
          </div>
        ),
      },
    ];
    if (user_type == 1) {
      this.restrictionColumns = [
        ...this.restrictionColumns,
        {
          name: 'fund',
          text: '资金方数据权限',
          renderDom: (row) => (
            <div>
              <button
                disabled={!this.state.restrictionFlag}
                onClick={this.checkAllOrNoneWithFund}
                type="button"
                style={{ marginLeft: '20px' }}
                className="btn btn-default"
              >
                {this.state.checkAllWithFund ? '全不选' : '全选'}
              </button>
              <br />
              {checkboxRenderer(this.state.restriction.relatedFundOrgs)(row)}
            </div>
          ),
        },
      ];
    } else if (user_type == 2) {
      this.restrictionColumns = [
        ...this.restrictionColumns,
        {
          name: 'asset',
          text: '资产方数据权限',
          renderDom: (row) => (
            <div>
              <button
                disabled={!this.state.restrictionFlag}
                onClick={this.checkAllOrNoneWithAsset}
                type="button"
                style={{ marginLeft: '20px' }}
                className="btn btn-default"
              >
                {this.state.checkAllWithAsset ? '全不选' : '全选'}
              </button>
              <br />
              {checkboxRenderer(this.state.restriction.relatedAssetOrgs)(row)}
            </div>
          ),
        },
      ];
    } else {
      this.restrictionColumns = [
        ...this.restrictionColumns,
        {
          name: 'asset',
          text: '资产方数据权限',
          renderDom: (row) => (
            <div>
              <button
                disabled={!this.state.restrictionFlag}
                onClick={this.checkAllOrNoneWithAsset}
                type="button"
                style={{ marginLeft: '20px' }}
                className="btn btn-default"
              >
                {this.state.checkAllWithAsset ? '全不选' : '全选'}
              </button>
              <br />
              {checkboxRenderer(this.state.restriction.relatedAssetOrgs)(row)}
            </div>
          ),
        },
        {
          name: 'fund',
          text: '资金方数据权限',
          renderDom: (row) => (
            <div>
              <button
                disabled={!this.state.restrictionFlag}
                onClick={this.checkAllOrNoneWithFund}
                type="button"
                style={{ marginLeft: '20px' }}
                className="btn btn-default"
              >
                {this.state.checkAllWithFund ? '全不选' : '全选'}
              </button>
              <br />
              {checkboxRenderer(this.state.restriction.relatedFundOrgs)(row)}
            </div>
          ),
        },
      ];
    }

    this.searchBarItems = [
      {
        label: '用户账号:',
        type: 'text',
        props: {
          ref: (input) => {
            this.userAccountInput = input;
          },
        },
      },
      {
        label: '用户姓名:',
        type: 'text',
        props: {
          ref: (input) => {
            this.userNameInput = input;
          },
        },
      },
    ];

    this.rowColumnsAdmin = [
      {
        text: '用户类型',
        name: 'user_type',
        style: { maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' },
        renderDom: (row) => <FormatUserType value={row.user_type} />,
      },
      {
        text: '机构',
        name: 'org_code',
        style: { maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' },
        renderDom: (row) => <FormatOrgCode value={row.org_code} />,
      },
      ...this.rowColumns.slice(0, this.rowColumns.length - 1),
    ];

    this.searchBarItemsAdmin = [
      {
        label: '用户类型:',
        type: 'custom',
        renderDom: (row) => (
          <UserTypeSelector
            onChange={this.handleUserTypesChange}
            options={this.props && this.props.userTypes.slice(0, 3)}
          />
        ),
      },
      {
        label: '机构:',
        type: 'custom',
        renderDom: () => (
          <OrgRelatedUserTypeSelector
            onChange={this.handleOrgChange}
            userType={this.state.userType}
            defaultUserTypes={[1, 2, 3]}
          />
        ),
      },
      ...this.searchBarItems,
    ];
  }

  componentWillMount() {
    window.addEventListener('click', this.clearOps);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clearOps);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.subUsers.restrictionData &&
      this.props.subUsers.restrictionData !== nextProps.subUsers.restrictionData
    ) {
      let assets = nextProps.subUsers.restrictionData
          .filter((r) => r.user_type == '1')
          .map((r) => r.partner_org_code),
        funds = nextProps.subUsers.restrictionData
          .filter((r) => r.user_type == '2')
          .map((r) => r.partner_org_code);
      this.state.restriction.relatedFundOrgs.forEach((r) => {
        r._checked = funds.includes(r.value);
      });
      if (this.state.restriction.relatedFundOrgs.length === funds.length) {
        this.setState({
          checkAllWithFund: true,
        });
      } else {
        this.setState({
          checkAllWithFund: false,
        });
      }
      this.state.restriction.relatedAssetOrgs.forEach((r) => {
        r._checked = assets.includes(r.value);
      });
      if (this.state.restriction.relatedAssetOrgs.length === assets.length) {
        this.setState({
          checkAllWithAsset: true,
        });
      } else {
        this.setState({
          checkAllWithAsset: false,
        });
      }
    }

    if (this.props.subUsers.restrictionFlag !== nextProps.subUsers.restrictionFlag) {
      this.state.restrictionFlag = nextProps.subUsers.restrictionFlag;
    }
  }

  clearOps() {
    if (this.state.opsUserId) {
      this.setState({ ...this.state, opsUserId: undefined });
    }
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch(index) {
    const myIndex = this.userAccountInput.value || typeof index === 'undefined' ? 1 : index;
    this.state.index = myIndex;
    this.props.searcher({
      pageIndex: this.state.index,
      userAccount: this.userAccountInput.value,
      userName: this.userNameInput.value,
      userId: this.props._session.user_id,
      userType: this.state.userType,
      orgCode: this.state.orgCode,
    });
  }
  checkAllOrNoneWithFund() {
    const self = this;
    const isChecked = this.state.checkAllWithFund;
    this.setState({
      restriction: {
        ...this.state.restriction,
        relatedFundOrgs: self.state.restriction.relatedFundOrgs.map((r) => {
          r._checked = !isChecked;
          return r;
        }),
      },
      checkAllWithFund: !isChecked,
    });
  }

  checkAllOrNoneWithAsset() {
    const self = this;
    const isChecked = this.state.checkAllWithAsset;
    this.setState({
      restriction: {
        ...this.state.restriction,
        relatedAssetOrgs: self.state.restriction.relatedAssetOrgs.map((r) => {
          r._checked = !isChecked;
          return r;
        }),
      },
      checkAllWithAsset: !isChecked,
    });
  }
  hideMode() {
    this.setState({ showMode: false });
  }

  showMode() {
    this.setState({ showMode: true });
  }

  hideTreeMode() {
    this.setState({ showTreeMode: false });
  }

  showTreeMode() {
    this.setState({ showTreeMode: true });
  }

  hideRestrictionMode = () => {
    this.setState({ showRestrictionMode: false });
  };
  updateRestriction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if(this.state.restrictionFlag){
      if(!_.isEmpty(this.state.restriction.relatedAssetOrgs)){
        if(!this.state.restriction.relatedAssetOrgs.some(r=> r._checked === true)){
          this.props.messageSetter('请至少选择一个资产方', 'FAIL');
          return false;
        }
      }
      if(!_.isEmpty(this.state.restriction.relatedFundOrgs)){
        if(!this.state.restriction.relatedFundOrgs.some(r=> r._checked === true)){
          this.props.messageSetter('请至少选择一个资金方', 'FAIL');
          return false;
        }
      }
    }
    this.props.restrictionUpdater({
      data: [
        ...this.state.restriction.relatedAssetOrgs
          .filter((r) => r._checked)
          .map((r) => ({ partner_org_code: r.value, user_type: 1 })),
        ...this.state.restriction.relatedFundOrgs
          .filter((r) => r._checked)
          .map((r) => ({ partner_org_code: r.value, user_type: 2 })),
      ],
      sub_user_id: this.state.restrictedSubUser,
      is_data_func: this.state.restrictionFlag ? 1 : 0,
    });
    this.props.messageResetter();
    this.setState({ showRestrictionMode: false, restrictedSubUser: '' });
  };

  update(e) {
    e.preventDefault();
    e.stopPropagation();
    let { message } = this.state,
      valid = true;

    this.modalColumnsUpdate.map((r) => {
      message[r.name] = r.validate && r.validate();
    });

    for (const props in message) {
      if (message[props]) {
        valid = false;
      }
    }
    if (valid) {
      this.setState({ showMode: false });
      this.props.messageResetter();
      this.props.updater(this.state.data);
    } else {
      this.setState({ message: { ...message } });
    }
  }

  create(e) {
    e.preventDefault();
    e.stopPropagation();
    let { message } = this.state,
      valid = true;

    this.modalColumns.map((r) => {
      message[r.name] = r.validate && r.validate();
    });

    for (const props in message) {
      if (message[props]) {
        valid = false;
      }
    }
    if (valid) {
      this.setState({ showMode: false, index: 1, opsUserId: '' });
      this.userAccountInput.value = '';
      this.userNameInput.value = '';
      this.props.messageResetter();
      this.props.creater(this.state.data).promise.then(({ response }) => {
        if (response && response.success) {
          this.handleSearch(1);
        }
      });
    } else {
      this.setState({ message: { ...message } });
    }
  }

  delete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ index: 1 });
    this.userAccountInput.value = '';
    this.userNameInput.value = '';
    this.props.messageResetter();
    this.props.deleter({ sub_user_id: this.state.deleteUserId }).promise.then(({ response }) => {
      if (response && response.success) {
        this.handleSearch(1);
      }
    });
  }

  openModeToEdit(row) {
    if (row.sub_user_id) {
      this.modalColumns[1].readOnly = true;
    } else {
      this.modalColumns[1].readOnly = false;
    }
    this.setState({
      data: { ...row },
      showMode: true,
    });
  }

  openModeToAuth(row) {
    Promise.all([
      this.props.authSearcher({ user_id: row.user_id, sub_user_id: row.sub_user_id }).promise,
      this.props.roleSearch({ roleName: '' }).promise,
    ]).then(() => {
      this.setState({
        data: { ...row },
        showTreeMode: true,
      });
    });
  }

  openModeToRestriction = (row) => {
    this.props
      .restrictionSearcher({ sub_user_id: row.sub_user_id })
      .promise.then(({ response }) => {
        this.setState({
          restrictedSubUser: row.sub_user_id,
          showRestrictionMode: true,
        });
      });
  };

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  toggleOps(e, row) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.opsUserId == row.sub_user_id) {
      this.setState({ ...this.state, opsUserId: undefined });
    } else {
      this.setState({ ...this.state, opsUserId: row.sub_user_id });
    }
  }

  authorize(e, row) {
    e.preventDefault();
    e.stopPropagation();
    this.props.messageResetter();
    this.props.auther({ user_id: this.state.data.sub_user_id, checked: row });
    this.setState({ showTreeMode: false, opsUserId: '' });
  }

  openDeleteConfirm(row) {
    this.setState({
      confirmDelete: true,
      deleteUserId: row.sub_user_id,
      deleteUserAccount: row.user_account,
    });
  }
  closeDeleteConfirm() {
    this.setState({ confirmDelete: false, deleteUserId: '', deleteUserAccount: '' });
  }

  openOperLogModal(row) {
    this.setState({
      data: { ...row },
      showOperLogModal: true,
    });
  }

  hideOperLogModal() {
    this.setState({
      showOperLogModal: false,
    });
  }

  handleOrgChange(row) {
    this.setState({ orgCode: row.value, index: 1 }, this.handleSearch);
  }

  handleUserTypesChange(row) {
    this.setState({ userType: row.value, index: 1 }, this.handleSearch);
  }

  restrictionHandler = (e, row) => {
    // e.preventDefault();
    e.stopPropagation();
    row._checked = e.currentTarget.checked;
    this.restrictionColumns = [...this.restrictionColumns];
    let assetCheck = null;
    let fundCheck = null;
    if (this.state.restriction.relatedAssetOrgs.every((a) => a._checked === true)) {
      assetCheck = true;
    } else {
      assetCheck = false;
    }
    if (this.state.restriction.relatedFundOrgs.every((a) => a._checked === true)) {
      fundCheck = true;
    } else {
      fundCheck = false;
    }
    this.setState({
      checkAllWithFund: fundCheck,
      checkAllWithAsset: assetCheck,
    });
    this.forceUpdate();
  };

  restrictionFlagHandler = (e) => {
    e.stopPropagation();
    // row._checked = e.currentTarget.checked;
    this.restrictionColumns = [...this.restrictionColumns];
    this.setState({ restrictionFlag: e.currentTarget.checked });
    // this.forceUpdate();
  };

  handleRoleCheck = (roleId, roleType) => {
    this.props.funcSearcher({ role_id: roleId, role_type: roleType });
  };
  render() {
    const { subUsers, _buttons } = this.props;
    const self = this;
    return (
      <div className="component">
        <SearchBar
          items={
            this.props._session.user_type == 4 ? this.searchBarItemsAdmin : this.searchBarItems
          }
          searcher={this.onSearch}
        >
          <button type="submit" className="btn icon-btn btn-primary pull-left">
            <i className="fa fa-search" />搜索
          </button>
          {Array.isArray(_buttons) &&
            _buttons.includes('sub_user_management_create') && (
              <button
                type="button"
                className="btn icon-btn btn-primary pull-left"
                onClick={() => {
                  self.openModeToEdit({});
                }}
              >
                <i className="fa fa-plus" />创建
              </button>
            )}
        </SearchBar>
        <div className="wrapper">
          <Datatable
            columns={this.props._session.user_type == 4 ? this.rowColumnsAdmin : this.rowColumns}
            rows={subUsers.rows}
            index={this.state.index}
            searcher={this.handleSearch}
            total={subUsers.total}
          />
        </div>
        {this.state.showMode &&
          !this.state.data.sub_user_id && (
            <Modal
              data={this.state.data}
              columns={this.modalColumns}
              message={this.state.message}
              title="创建新子用户"
              closer={this.hideMode}
              confirm={this.create}
            />
          )}
        {this.state.showMode &&
          this.state.data.sub_user_id && (
            <Modal
              data={this.state.data}
              columns={this.modalColumnsUpdate}
              message={this.state.message}
              title="修改子用户"
              closer={this.hideMode}
              confirm={this.update}
            />
          )}
        {this.state.showRestrictionMode &&
          this.state.restrictedSubUser && (
            <Modal
              data={this.state.restriction}
              columns={this.restrictionColumns}
              message={this.state.message}
              title="子用户数据权限"
              closer={this.hideRestrictionMode}
              confirm={this.updateRestriction}
            />
          )}
        {this.state.showTreeMode && (
          <TreeModal
            data={this.props.subUsers.menus}
            checked={this.props.subUsers.checked}
            expanded={this.props.subUsers.expanded}
            closer={this.hideTreeMode}
            message={this.state.message}
            handleRoleCheck={this.handleRoleCheck.bind(this)}
            roleList={this.props.roleList}
            title="子用户功能权限"
            confirm={this.authorize}
          />
        )}
        {this.state.showOperLogModal && (
          <OperLogModal
            data={this.state.data}
            tableName="t_sub_user"
            tableKey={this.state.data.sub_user_id}
            title="子用户管理日志"
            closer={this.hideOperLogModal}
          />
        )}
        {this.state.confirmDelete && (
          <Dialog
            confirm={(e) => {
              self.delete(e);
              self.closeDeleteConfirm();
            }}
            title="请确认"
            closer={this.closeDeleteConfirm}
            size="modal-md"
          >
            确定要删除用户[{this.state.deleteUserAccount}]么?
          </Dialog>
        )}
      </div>
    );
  }
}
