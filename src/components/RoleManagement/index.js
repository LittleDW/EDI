import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';
import Datatable from '../Datatable';
import Select from '../Select';
import TreeModal from '../TreeModal';
import Dialog from '../Dialog';
import OperLogModal from '../Modal/OperLogModal';
import RoleUserTableMode from './row-user-table-modal';

/**
 * 作者：张宝玉
 * 模块：角色管理
 * */

export default class RoleManagement extends Component {
  constructor() {
    super();
    this.state = {
      index: 1,
      roleUserSearchType: '1',
      showMode: false,
      showTreeMode: false,
      showUserMode: false,
      showOperLogModal: false,
      opsRoleId: '',
      data: {},
      message: {
        role_name: '',
        role_type: '',
        remark: '',
        sub_user_yn: '',
      },
      checked: [],
      expanded: [],
      menus: [],
      confirmDelete: false,
      deleteRoleId: '',
      deleteRoleName: '',
    };
    this.showMode = this.showMode.bind(this);
    this.hideMode = this.hideMode.bind(this);
    this.showUserMode = this.showUserMode.bind(this);
    this.hideUserMode = this.hideUserMode.bind(this);
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
    this.openModeToFunc = this.openModeToFunc.bind(this);
    this.openModeToUser = this.openModeToUser.bind(this);
    this.openDeleteConfirm = this.openDeleteConfirm.bind(this);
    this.closeDeleteConfirm = this.closeDeleteConfirm.bind(this);
    this.getRoleTypes = this.getRoleTypes.bind(this);
    this.openOperLogModal = this.openOperLogModal.bind(this);
    this.hideOperLogModal = this.hideOperLogModal.bind(this);

    var self = this;
    this.rowColumns = [
      {
        text: '角色名称',
        name: 'role_name',
        style: {
          maxWidth: '160px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
      {
        text: '角色类型',
        name: 'role_type',
        style: {
          maxWidth: '160px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        renderDom: row => this.formatRoleTypes(row.role_type),
      },
      {
        text: '账号类型',
        name: 'sub_user_yn',
        style: {
          maxWidth: '160px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        renderDom: row => (row.sub_user_yn === 'N' ? '主账号' : '子账号'),
      },
      {
        text: '备注',
        name: 'remark',
        style: {
          maxWidth: '160px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
      {
        text: '操作',
        style: { width: '80px', textAlign: 'center' },
        renderDom: row => {
          const { _buttons } = self.props;
          return (
            <div styleName="table-ops">
              <a href="javascript:" onClick={e => self.toggleOps(e, row)}>
                操作
              </a>
              <div
                styleName={
                  row.role_id == self.state.opsRoleId
                    ? 'show-ops'
                    : 'hidden-ops'
                }
              >
                {Array.isArray(_buttons) &&
                  _buttons.includes('role_management_user') && row.sub_user_yn === 'N' && (
                    <a
                      href="javascript:"
                      onClick={() => self.openModeToUser(row)}
                    >
                      角色用户
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('role_management_func') && (
                    <a
                      href="javascript:"
                      onClick={() => self.openModeToFunc(row)}
                    >
                      角色权限
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('role_management_update') &&
                  row.sys_yn == 'N' && (
                    <a
                      href="javascript:"
                      onClick={() => self.openModeToEdit(row)}
                    >
                      修改
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('role_management_delete') &&
                  row.sys_yn == 'N' && (
                    <a
                      href="javascript:"
                      onClick={e => self.openDeleteConfirm(row)}
                    >
                      删除
                    </a>
                  )}
                {Array.isArray(_buttons) &&
                  _buttons.includes('oper_log') && (
                    <a
                      href="javascript:"
                      onClick={() => self.openOperLogModal(row)}
                    >
                      日志
                    </a>
                  )}
              </div>
            </div>
          );
        },
      },
    ];

    (this.modalColumns = [
      {
        title: '角色权限',
      },
      {
        name: 'role_name',
        text: '角色名称',
        type: 'text',
        labelClassName: 'asterisk',
        handleChange(e) {
          self.state.data.role_name = e.target.value;
        },
        validate: () => {
          var row = self.state.data;
          return typeof row.role_name === undefined || !row.role_name
            ? '必填'
            : row.role_name.length > 100
              ? '角色名称不能超过100字'
              : null;
        },
      },
      {
        name: 'role_type',
        text: '权限类型',
        type: 'select',
        labelClassName: 'asterisk',
        noEmpty: true,
        getOptions: self.getRoleTypes,
        handleChange(row) {
          self.state.data.role_type = row.value;
        },
        validate: () => {
          var row = self.state.data;
          return typeof row.role_type === undefined || !row.role_type
            ? '必填'
            : null;
        },
      },
      {
        name: 'sub_user_yn',
        text: '账号类型',
        renderDom: () => {
          return (
            <span>
              <div className="col-sm-3 radio" style={{paddingTop: '0px'}}>
                <label>
                  <input
                    type="radio"
                    name="sub_user_yn"
                    value="N"
                    defaultChecked
                    onClick={self.handleChange.bind(self)}
                  />
                  主账号
                </label>
              </div>
              <div className="col-sm-3 radio" style={{paddingTop: '0px'}}>
                <label>
                  <input
                    type="radio"
                    name="sub_user_yn"
                    value="Y"
                    onClick={self.handleChange.bind(self)}
                  />
                  子账号
                </label>
              </div>
              </span>
          );
        },
      },
      {
        name: 'remark',
        text: '备注',
        type: 'text',
        handleChange(e) {
          self.state.data.remark = e.target.value;
        },
        validate: () => {
          var row = self.state.data;
          return row.remark && row.remark.length > 120
            ? '备注不能超过120字'
            : null;
        },
      },
    ]),
      (this.modifySelect1 = {
        name: 'role_type',
        text: '权限类型',
        labelClassName: 'asterisk',
        readOnly: true,
        renderDom: row => (
          <div>
            {
              self.props.roleTypes.find(item => item.value == row.role_type)
                .label
            }
          </div>
        ),
      });
      (this.modifySelect2 = {
        name: 'sub_user_yn',
        text: '账号类型',
        labelClassName: 'asterisk',
        readOnly: true,
        renderDom: row => (
          <span>
              <div className="col-sm-3 radio" style={{paddingTop: '0px'}}>
                <label>
                  <input
                    type="radio"
                    name="sub_user_yn"
                    value="N"
                    disabled
                    checked={row.sub_user_yn === 'N'}
                  />
                  主账号
                </label>
              </div>
              <div className="col-sm-3 radio" style={{paddingTop: '0px'}}>
                <label>
                  <input
                    type="radio"
                    name="sub_user_yn"
                    value="Y"
                    disabled
                    checked={row.sub_user_yn === 'Y'}
                  />
                  子账号
                </label>
              </div>
              </span>
        ),
      });

    this.modalModifyColumns = [...self.modalColumns];
    this.modalModifyColumns.splice(2, 1, self.modifySelect1);
    this.modalModifyColumns.splice(3, 1, self.modifySelect2);
  }

  componentWillMount() {
    window.addEventListener('click', this.clearOps);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clearOps);
  }

  clearOps() {
    if (this.state.opsRoleId) {
      this.setState({ ...this.state, opsRoleId: undefined });
    }
  }
  handleChange(e) {
    const data = this.state.data;
    data.sub_user_yn = e.target.value;
    this.setState({data});
  }
  componentDidMount() {
    this.handleSearch();
  }

  handleSearch(index) {
    let myIndex = typeof index === 'undefined' ? 1 : index;
    this.state.index = myIndex;
    this.props.searcher({
      pageIndex: this.state.index,
      roleName: this.roleNameInput.value,
      //userId:this.props._session.user_id,
    });
  }

  hideMode() {
    this.setState({ showMode: false });
  }

  showMode() {
    this.setState({ showMode: true });
  }

  hideUserMode() {
    this.setState({ showUserMode: false });
  }

  showUserMode() {
    this.setState({ showUserMode: true });
  }

  hideTreeMode() {
    this.setState({ showTreeMode: false });
  }

  showTreeMode() {
    this.setState({ showTreeMode: true });
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

  update(e) {
    e.preventDefault();
    e.stopPropagation();
    let { message } = this.state,
      valid = true;

    this.modalModifyColumns.map(r => {
      message[r.name] = r.validate && r.validate();
    });

    for (var props in message) {
      if (message[props]) {
        valid = false;
      }
    }
    if (valid) {
      this.props.messageResetter()
      this.props.updater(this.state.data).promise.then(({response:data}) => {
        data && data.success && this.setState({showMode: false})
      })
    } else {
      this.setState({ message: { ...message } });
    }
    this.hideMode();
  }

  create(e) {
    e.preventDefault();
    e.stopPropagation();
    let { message } = this.state,
      valid = true;

    const data = this.state.data;
    if (!data.sub_user_yn) {
      data.sub_user_yn = 'N';
    }
    this.modalColumns.map(r => {
      message[r.name] = r.validate && r.validate();
    });

    for (var props in message) {
      if (message[props]) {
        valid = false;
      }
    }
    if (valid) {
      this.roleNameInput.value = ''
      this.props.messageResetter()
      this.props.creater(this.state.data).promise.then(({response:data}) => {
        data && data.success && this.setState({showMode: false,index: 1, opsRoleId:''})
      })
    } else {
      this.setState({ message: { ...message } });
    }
  }

  delete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ index: 1 });
    this.roleNameInput.value = '';
    this.props.messageResetter();
    this.props.deleter({ role_id: this.state.deleteRoleId });
  }

  openModeToEdit(row) {
    this.setState({
      data: { ...row },
      showMode: true,
    });
  }

  openModeToFunc(row) {
    this.props
      .funcSearcher({ role_id: row.role_id, role_type: row.role_type })
      .promise.then(({ response }) => {
        this.setState({
          data: { ...row },
          showTreeMode: true,
        });
      });
  }

  openModeToUser(row) {
    this.setState({
      data: { ...row },
      showUserMode: true,
    });
    //this.props.userSearcher({role_id: row.role_id,role_type: row.role_type})
  }

  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }

  onUserSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleUserSearch();
  }

  formatRoleTypes(s) {
    var status = this.getRoleTypes();
    var result = status.filter(r => s == r.value)[0];
    return result ? result.label : s;
  }

  getRoleTypes() {
    var { roleTypes } = this.props;
    return roleTypes;
  }

  toggleOps(e, row) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.opsRoleId == row.role_id) {
      this.setState({ ...this.state, opsRoleId: undefined });
    } else {
      this.setState({ ...this.state, opsRoleId: row.role_id });
    }
  }

  authorize(e, row) {
    e.preventDefault();
    e.stopPropagation();
    this.props.messageResetter();
    this.props.funcUpdater({ role_id: this.state.data.role_id, checked: row });
    this.setState({ showTreeMode: false, opsRoleId: '' });
  }

  openDeleteConfirm(row) {
    this.setState({
      confirmDelete: true,
      deleteRoleId: row.role_id,
      deleteRoleName: row.role_name,
    });
  }
  closeDeleteConfirm() {
    this.setState({
      confirmDelete: false,
      deleteRoleId: '',
      deleteRoleName: '',
    });
  }

  render() {
    const { roles, _buttons } = this.props;
    var self = this;
    return (
      <div className="component">
        <form className="filter-form clearfix" onSubmit={this.onSearch}>
          <div className="row info-row">
            <div className="col-sm-4">
              <div className="form-group">
                <label className="col-sm-4">
                  <span>角色名称:</span>
                </label>
                <div className="col-sm-8">
                  <input
                    type="search"
                    placeholder=""
                    defaultValue=""
                    ref={input => {
                      this.roleNameInput = input;
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <button
                type="submit"
                className="btn icon-btn btn-primary pull-left edi-mr"
              >
                <i className="fa fa-search" />搜索
              </button>
              {Array.isArray(_buttons) &&
                _buttons.includes('role_management_create') && (
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
            </div>
          </div>
        </form>
        <div className="wrapper">
          <Datatable
            columns={this.rowColumns}
            rows={roles.rows}
            index={this.state.index}
            searcher={this.handleSearch}
            total={roles.total}
          />
        </div>
        {this.state.showMode &&
          !this.state.data.role_id && (
            <Modal
              data={this.state.data}
              columns={this.modalColumns}
              message={this.state.message}
              title="创建角色"
              closer={this.hideMode}
              confirm={this.create}
            />
          )}
        {this.state.showMode &&
          this.state.data.role_id && (
            <Modal
              data={this.state.data}
              columns={this.modalModifyColumns}
              message={this.state.message}
              title="修改角色"
              closer={this.hideMode}
              confirm={this.update}
            />
          )}
        {this.state.showTreeMode && (
          <TreeModal
            data={this.props.roles.menus}
            checked={this.props.roles.checked}
            expanded={this.props.roles.expanded}
            closer={this.hideTreeMode}
            message={this.state.message}
            title="角色权限设置"
            confirm={this.authorize}
          />
        )}
        {this.state.showUserMode && (
          <RoleUserTableMode
            title="角色用户管理"
            userData={roles.userRows}
            closer={this.hideUserMode}
            roleId={this.state.data.role_id}
            searcher={this.props.userSearcher}
            adder={this.props.userAdder}
            deleter={this.props.userDeleter}
            resetter={this.props.messageResetter}
          />
        )}
        {this.state.confirmDelete && (
          <Dialog
            confirm={e => {
              self.delete(e);
              self.closeDeleteConfirm();
            }}
            title="请确认"
            closer={this.closeDeleteConfirm}
            size="modal-md"
          >
            确定要删除角色[{this.state.deleteRoleName}]么?
          </Dialog>
        )}
        {this.state.showOperLogModal && (
          <OperLogModal
            data={this.state.data}
            tableName={'t_role'}
            tableKey={this.state.data.role_id}
            title="角色管理日志"
            closer={this.hideOperLogModal}
          />
        )}
      </div>
    );
  }
}
