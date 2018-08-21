import React, {Component} from "react";
import PropTypes from "prop-types";
import {FormatDeadline} from "../Formatter";
import Select from "../Select";

class DeadlineFeeModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      _row: props._row
    }

  }

  updatePriority = (e) => {
    let {value} = e.target
    if (isNaN(value)) {
      return
    }
    const {_row} = this.state
    if (value > 100) {
      value = 100
    }
    let row = {
      ..._row,
      priority: value
    }
    this.setState({_row: row})
  }

  checkStockChange = ({value}) => {
    const {_row} = this.state
    let row = {
      ..._row,
      is_check_stock: value
    }
    this.setState({_row: row});
  };

  stockCountChange = ({value}) => {
    const {_row} = this.state
    let row = {
      ..._row,
      stock_day_count: value
    }
    this.setState({_row: row});
  };

  update = () => {
    const {_row} = this.state
    if (_row.priority === null || _row.priority === undefined || _row.priority < 0 || _row.priority > 100) {
      return
    }
    this.props.update(_row)
  }

  render() {
    const {title, userType} = this.props
    const {_row} = this.state
    return (
      <div className="modal fade fade in edi-dialog" role="dialog">
        <div className="modal-backdrop fade in" onClick={this.props.hideMode}></div>
        <div className="modal-dialog modal-lg" role="document">
          <form className="modal-content form-horizontal" onSubmit={this.update}>
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={this.props.hideMode}><span
                aria-hidden="true">×</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              <div className='block'>
                {userType === 1 && <div className="form-group">
                  <label className="col-sm-4 control-label">资金方:</label>
                  <div className="col-sm-5 form-text">
                    {_row.fund_name}
                  </div>
                </div>}
                {userType === 2 && <div className="form-group">
                  <label className="col-sm-4 control-label">资产方:</label>
                  <div className="col-sm-5 form-text">
                    {_row.asset_name}
                  </div>
                </div>}
                <div className="form-group">
                  <label className="col-sm-4 control-label">调整时间:</label>
                  <div className="col-sm-5 form-text">
                    {_row.match_date}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">资产方供给量（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.asset_fee}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">资金方募集量（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.fund_fee}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">目标匹配量/日（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.max_fee}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">最小匹配量/日（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.min_fee}
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">已匹配量/日（万元）:</label>
                  <div className="col-sm-5 form-text">
                    {_row.finish_max_fee}
                  </div>
                </div>
                {userType !== 2 && <div className="form-group">
                  <label className="col-sm-4 control-label">优先级:</label>
                  <div className="col-sm-4">
                    <input type="text" value={_row.priority} onChange={this.updatePriority}/>
                  </div>
                  {(!_row["priority"] || _row['priority'] < 0 || _row['priority'] > 100) && <div className="col-sm-3 form-text">
                    <span>优先级为0-100的整数</span>
                  </div>}
                </div>}
                {userType !== 2 && <div className="form-group">
                  <label className="col-sm-4 control-label">存量资产上限验证:</label>
                  <div className="col-sm-5">
                    <Select
                      noEmpty={true}
                      onChange={this.checkStockChange}
                      options={[
                        {
                          label: '开',
                          value: '1'
                        }, {
                          label: '关',
                          value: '0'
                        }
                      ]}
                      defaultValue={String(_row.is_check_stock)}/>
                  </div>
                </div>}
                {userType !== 2 && <div className="form-group">
                  <label className="col-sm-4 control-label">存量资产上限:</label>
                  <div className="col-sm-3">
                    <Select
                      noEmpty={true}
                      disabled={_row.is_check_stock === '0'}
                      onChange={this.stockCountChange}
                      options={[
                        {
                          label: '1',
                          value: 1
                        }, {
                          label: '2',
                          value: 2
                        }, {
                          label: '3',
                          value: 3
                        }, {
                          label: '4',
                          value: 4
                        }, {
                          label: '5',
                          value: 5
                        }, {
                          label: '6',
                          value: 6
                        }, {
                          label: '7',
                          value: 7
                        }, {
                          label: '8',
                          value: 8
                        }, {
                          label: '9',
                          value: 9
                        }, {
                          label: '10',
                          value: 10
                        }, {
                          label: '11',
                          value: 11
                        }, {
                          label: '12',
                          value: 12
                        }
                      ]}
                      defaultValue={_row.stock_day_count}/>
                  </div>
                  <div className="col-sm-3 form-control-static">* 近30天日均满标量</div>
                </div>}
                {userType === 3 && <div className="form-group">
                  <div className="col-sm-5 col-sm-offset-4">验证开启后，若存量资产超过上限，则系统将不再进行资产匹配，直至资产存量恢复至限额以下</div>
                </div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary pull-right" onClick={this.update}>确定</button>
              <button type="button" className="btn btn-default pull-right" onClick={this.props.hideMode}>关闭</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

DeadlineFeeModal.propTypes = {
  title: PropTypes.string.isRequired,
  _row: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired,
  hideMode: PropTypes.func.isRequired,
};

export default DeadlineFeeModal;
