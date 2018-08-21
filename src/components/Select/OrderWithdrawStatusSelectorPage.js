/*
 * @Author Osborn
 * @File OrderStatusSelectorPage.1.js
 * @Created Date 2018-05-30 19-58
 * @Last Modified: 2018-05-30 19-58
 * @Modified By: Osborn
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from './index';
import Selectors from '../../redux/selectors';

class OrderWithdrawStatusSelectorPage extends Component {
  constructor(props) {
    super(props);
    this.resetState = this.resetState.bind(this);
  }
  resetState() {
    this.select.resetState();
  }
  componentWillReceiveProps(nextProps) {}

  render() {
    return (
      <Select
        {...this.props}
        ref={(select) => {
          this.select = select;
        }}
      />
    );
  }
}

OrderWithdrawStatusSelectorPage.propTypes = {
  options: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => ({
  options: ownProps.options || Selectors.getOrderWithdrawStatus(state),
});

export default connect(mapStateToProps, null, null, { withRef: true })(OrderWithdrawStatusSelectorPage);
