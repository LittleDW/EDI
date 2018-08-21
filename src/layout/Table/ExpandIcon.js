import React from 'react';
import PropTypes from 'prop-types';
import shallowequal from 'shallowequal';

export default class ExpandIcon extends React.Component {
  static propTypes = {
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    expandable: PropTypes.any,
    expanded: PropTypes.bool,
    needIndentSpaced: PropTypes.bool,
    onExpand: PropTypes.func,
    textNode: PropTypes.node
  };

  shouldComponentUpdate(nextProps) {
    return !shallowequal(nextProps, this.props);
  }

  render() {
    const { expandable, prefixCls, onExpand, needIndentSpaced, expanded, record, textNode } = this.props;
    if (expandable) {
      const expandClassName = expanded ? 'expanded' : 'collapsed';
      if (!expanded) {
        return <a href="javascript:;" onClick={e => onExpand(record, e)}><span>{textNode}</span><i className="fa fa-caret-down" style={{marginLeft: '5px'}}></i></a>
      } else {
        return <a href="javascript:;" onClick={e => onExpand(record, e)}><span>{textNode}</span><i className="fa fa-caret-up" style={{marginLeft: '5px'}}></i></a>
      }
    } else {
      return <span>{textNode}</span>
    }
  }
}
