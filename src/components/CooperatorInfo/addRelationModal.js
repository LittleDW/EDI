import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {escCloser} from '../../utils/etc'
import Datatable from "../Datatable";
import Selector from '../../redux/selectors'
import style from './style.scss'
import {connect} from "react-redux";
import {actions} from "../../redux/actions";
import CSSModules from 'react-css-modules'
import Select from "../Select";
import UserTypeSelector from '../Select/UserTypeSelectorPage'
import OrgRelatedUserTypeSelector from '../Select/OrgRelatedUserTypeSelectorPage'

@CSSModules(style, {allowMultiple: true})
class Modal extends Component {
  constructor(props) {
    super(props)
    var self = this, session = props._session
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleOrgChange = this.handleOrgChange.bind(this)
    this.handleUserTypesChange = this.handleUserTypesChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)

    this.columns = [
      {
        text: '机构编码',
        name: 'org_code',
      },
      {
        text: '合作方全称',
        name: 'user_full_name',
      },
      {
        text: '合作方简称',
        name: 'user_name',
      }
    ]

    this.state = {
      userType: "",
      orgCode: "",
      data:[],
      message:{},
    }
  }

  componentDidMount() {
    this.handleSearch()
  }

  componentWillReceiveProps(nextProps) {
    const {relationRows} = nextProps
    if (relationRows && relationRows.length) {
      this.state.data = [...relationRows]
    } else {
      this.state.data = []
    }

  }

  componentWillMount() {
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.addEventListener("keydown", this.escCloser)
  }

  componentWillUnmount() {
    const {closer} = this.props
    this.escCloser = escCloser(closer)
    window.removeEventListener("keydown", this.escCloser);
  }

  handleConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const {confirm} = this.props
    let {orgCode, data} = this.state
    confirm(e, orgCode, data)
  }

  handleOrgChange(row) {
    this.setState({orgCode: row.value}, this.handleSearch)
  }

  handleUserTypesChange(row) {
    this.setState({userType: row.value}, this.handleSearch)
  }

  handleSearch() {
    const {searcher} = this.props
    searcher({org_code: this.state.orgCode})
  }

  render() {
    const {closer, message, title, userTypes} = this.props
    return (
      <div className="modal fade in" styleName="modal" role="dialog">
        <div className="modal-backdrop fade in" onClick={closer}></div>
        <div className="modal-dialog modal-lg" role="document">
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={closer}><span
                aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              <div styleName="block relation-block">
                <div className="form-group">
                  <h4 className="col-sm-4 control-label">添加元机构:</h4>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label">用户类型</label>
                  <div className="col-sm-8"><UserTypeSelector onChange={this.handleUserTypesChange} options={userTypes && userTypes.slice(0, 2) || []}/></div>
                </div>
                <div className="form-group">
                  <label className="col-sm-4 control-label asterisk">机构名</label>
                  <div className="col-sm-8"><OrgRelatedUserTypeSelector onChange={this.handleOrgChange} userType={this.state.userType} defaultUserTypes={[1,2]}/></div>
                </div>
                <div className="form-group">
                  <h4 className="col-sm-4 control-label">合作方信息:</h4>
                </div>
                <div className="row">
                  <div className="col-sm-8 col-sm-offset-2" styleName="scroller">
                    <Datatable columns={this.columns} rows={this.state.data} noPgaging={true} withCheckbox={true}/>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary pull-right" onClick={this.handleConfirm} ref={(submitBtn)=>{this.submitBtn = submitBtn}}>确定</button>
              <button type="button" className="btn btn-default pull-right" onClick={closer}>关闭</button>
              {message && message.text && (message.type == "FAIL") &&
              <p className="dialog-message text-danger"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type == "INFO") &&
              <p className="dialog-message text-info"><i className="fa fa-warning"></i> {message.text}</p>}
              {message && message.text && (message.type == "SUCCESS") &&
              <p className="dialog-message text-success"><i className="fa fa-warning"></i> {message.text}</p>}
            </div>
          </form>
        </div>
      </div>
    )
  }
}
Modal.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE: PropTypes.func,
}


const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message || state.message,
  _session: state._session,
  userTypes: Selector.getUserTypes(state),
  relationRows: state.cooperatorInfo.relationRows,
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)

