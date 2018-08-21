/* eslint-disable no-undef */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { escCloser } from '../../utils/etc';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import CheckboxTree from 'react-checkbox-tree';
import style from './style.scss';
import CSSModules from 'react-css-modules';
import _ from 'lodash';

@CSSModules(style)
export default class TreeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menus: [],
      checked: [],
      expanded: [],
      loading: false,
      firstCheck: true,
    };

    let { checked, expanded, data } = props;
    if (data && data.length > 0) {
      data.forEach(item => {
        item.icon = <i className={`fa ${item.icon}`} />;
      });
      this.state.menus = data.copyWithin(0);
    }
    if (checked && checked.length > 0) {
      checked = _.intersection(checked, expanded);
      this.state.checked = checked.copyWithin(0);
    }
    if (expanded && expanded.length > 0) {
      this.state.expanded = expanded.copyWithin(0);
    }

    this.handleConfirm = this.handleConfirm.bind(this);
    this.getParentsMap = this.getParentsMap.bind(this);
    this.handleRoleCheck = this.handleRoleCheck.bind(this);
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    let { checked, expanded, data } = nextProps;
    checked = _.intersection(checked, expanded);
    if (data && data.length > 0) {
      data.forEach(item => {
        item.icon = <i className={`fa ${item.icon}`} />;
      });
    }
    this.setState({
      checked,
      expanded,
      menus: data,
      loading: false,
    });
  }
  componentWillMount() {
    const { closer } = this.props;
    this.escCloser = escCloser(closer);
    window.addEventListener('keydown', this.escCloser);
  }
  componentWillUnmount() {
    const { closer } = this.props;
    this.escCloser = escCloser(closer);
    window.removeEventListener('keydown', this.escCloser);
  }

  handleConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    const { confirm } = this.props;
    let finalCheckedSet = new Set(this.state.checked);
    let finalParentsMap = new Map();
    this.getParentsMap(this.state.menus, [], finalParentsMap, finalCheckedSet);

    for (let check of this.state.checked) {
      if (finalParentsMap.get(check) != undefined && finalParentsMap.get(check).length > 0) {
        for (let parent of finalParentsMap.get(check)) {
          finalCheckedSet.add(parent);
        }
      }
    }

    confirm(e, Array.from(finalCheckedSet));
  }

  getParentsMap(nodes, pid, parentsMap, checkedSet) {
    for (let node of nodes) {
      if (node.children.length > 0) {
        checkedSet.delete(node.value);
        this.getParentsMap(node.children, [...pid, node.value], parentsMap, checkedSet);
      } else {
        parentsMap.set(node.value, pid);
      }
    }
  }
  handleRoleCheck = (e) => {
    const role_id = e.target.value;
    const roleInst = this.props.roleList.rows.find(r=> r.role_id === role_id);
    this.setState({ ...this.state, loading: true, firstCheck: false });
     this.props.handleRoleCheck(role_id, roleInst.role_type);
  };
  render() {
    const { closer, title, message, roleList = {} } = this.props;
    const { loading = false } = this.state;
    const { rows = [], total } = roleList;
    return (
      <div className="modal fade fade in" role="dialog">
        <div className="modal-backdrop fade in" onClick={closer} />
        <div className="modal-dialog" role="document">
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={closer}>
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body" styleName="tree__modal-body">
              {total > 0 && (
                <div
                  className="form-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <label className="col-xs-2 control-label">预设角色:</label>
                  <div className="col-xs-10" style={{ paddingTop: '7px' }}>
                    <select
                      className="form-control"
                      onChange={this.handleRoleCheck}
                      disabled={this.state.loading}
                      style={{width: 'auto', maxWidth: '400px'}}
                    >
                      {this.state.firstCheck && <option value={-1}>选择模板</option>}
                      {rows.map((r, index) => {
                        return (
                          <option ref={o => this.option = o} key={index} value={r.role_id}>
                            {r.role_name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}
              {total > 0 && <hr />}
              <CheckboxTree
                nodes={this.state.menus}
                checked={this.state.checked}
                expanded={this.state.expanded}
                onCheck={checked => this.setState({ checked })}
                onExpand={expanded => this.setState({ expanded })}
              />
            </div>
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-primary pull-right"
                onClick={this.handleConfirm}
              >
                确定
              </button>
              <button type="button" className="btn btn-default pull-right" onClick={closer}>
                关闭
              </button>
              {message &&
                message.text &&
                message.type == 'FAIL' && (
                  <p className="dialog-message text-danger">
                    <i className="fa fa-warning" /> {message.text}
                  </p>
                )}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

TreeModal.propTypes = {
  checked: PropTypes.array,
  expanded: PropTypes.array,
};
