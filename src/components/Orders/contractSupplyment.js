import React, { Component } from "react";
import PropTypes from "prop-types";
import { escCloser } from "../../utils/etc";
import Datatable from "../Datatable";
import Selector from "../../redux/selectors";
import style from "./style.scss";
import { connect } from "react-redux";
import { actions } from "../../redux/actions";
import CSSModules from "react-css-modules";
import Select from "../Select";
import FileSaver from "file-saver";
import { fastExport } from "../../utils/etc";

@CSSModules(style, { allowMultiple: true })
class Modal extends Component {
  constructor(props) {
    super(props);
    var self = this,
      session = props._session,
      user_type = (session && session.user_type) || -1;
    this.xhr = null;
    this.now = Date.now();
    this.handleProgress = this.handleProgress.bind(this);
    this.resetXHR = this.resetXHR.bind(this);
    this.renderUpload = this.renderUpload.bind(this);
    this.renderSwitch = this.renderSwitch.bind(this);
    this.renderMatcher = this.renderMatcher.bind(this);
    this.renderResult = this.renderResult.bind(this);
    this.mapperChanger = this.mapperChanger.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleFileReset = this.handleFileReset.bind(this);

    this.columns = [
      {
        text: "平台订单号",
        name: "order_no"
      },
      {
        text: "合同类型",
        name: "contract_type",
        renderDom: row => {
          const cont = this.props.contractType.find(
            item => item.value === row.contract_type
          );
          return (cont && cont.label) || row.contract_type;
        }
      },
      {
        text: "合同号",
        name: "contract_number"
      },
      {
        text: "合同地址",
        name: "contract_url"
      }
    ];

    this.errorColumns = [{ text: "结果", name: "_reason" }, ...this.columns];
    this.successColumns = [
      {
        text: "结果",
        name: "_reason",
        renderDom: () => "成功"
      }
    ].concat(this.columns.slice(0));

    this.state = {
      user_type,
      map: null,
      uploadFile: null,
      data: {},
      mapper: null,
      message: {},
      progress: null,
      enableConfirmBtn: true,
      tab: 1
    };

    this.old_map = this.columns.map(r => ({
      label: r.text,
      value: r.text,
      id: r.name
    }));
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const { detail, working } = nextProps;
    let { mapper } = this.state;
    if (!working) {
      let obj = {};
      if (detail && detail.ngHeaders && !mapper) {
        obj.mapper = this.old_map;
      }
      obj.progress = null;
      this.setState(obj);
    }
  }

  componentWillMount() {
    const { closer } = this.props;
    this.escCloser = escCloser(closer);
    window.addEventListener("keydown", this.escCloser);
  }

  componentWillUnmount() {
    const { closer } = this.props;
    this.escCloser = escCloser(closer);
    window.removeEventListener("keydown", this.escCloser);
  }

  resetXHR(runner) {
    if (
      this.xhr &&
      this.xhr.constructor &&
      this.xhr.constructor.name == "XMLHttpRequest"
    ) {
      this.xhr.abort();
      this.xhr = null;
      this.setState({ progress: null }, runner);
    } else {
      typeof runner == "function" && runner();
    }
  }
  handleProgress(e) {
    if (this._reactInternalInstance) {
      this.setState({
        progress: {
          total: e.total,
          loaded: e.loaded,
          percent: `${Math.floor(100 * e.loaded / e.total)}%`
        }
      });
    }
  }
  selectTab = (e, tab) => {
    e.preventDefault();
    e.stopPropagation();
    if (tab !== this.state.tab) {
      this.setState({ tab });
    }
  };

  handleExport = e => {
    e.preventDefault();
    e.stopPropagation();
    const { tab } = this.state;
    const { detail, contractType } = this.props;
    const { matched, unmatched } = detail;
    let title = "";
    let csv = "";
    if (tab === 1) {
      title = `匹配成功结果`;
      if (matched.length > 400000) {
        csv = `\ufeff结果,平台订单号,合同类型,合同号,合同地址\r\n${matched
          .map(
            item =>
              "成功," +
              (item.order_no || "") +
              "," +
              (contractType.find(con => con.value === item.contract_type)
                .label ||
                item.contract_type ||
                "") +
              "," +
              (item.contract_number || "") +
              "," +
              (item.contract_url || "")
          )
          .join("\r\n")}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        FileSaver.saveAs(blob, `${title}.csv`);
      } else {
        fastExport(matched, this.successColumns, title + ".xlsx");
      }
    } else {
      title = `匹配失败结果`;
      if (matched.length > 400000) {
        csv = `\ufeff结果,平台订单号,合同类型,合同号,合同地址\r\n${unmatched
          .map(
            item =>
              (item._reason || "") +
              "," +
              (item.order_no || "") +
              "," +
              (contractType.find(con => con.value === item.contract_type)
                .label ||
                item.contract_type ||
                "") +
              "," +
              (item.contract_number || "") +
              "," +
              (item.contract_url || "")
          )
          .join("\r\n")}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        FileSaver.saveAs(blob, `${title}.csv`);
      } else {
        fastExport(unmatched, this.errorColumns, title + ".xlsx");
      }
    }
  };

  handleFileChange(e) {
    e.preventDefault();
    e.stopPropagation();
    var file = e.currentTarget.files[0];
    this.setState({ uploadFile: file, enableConfirmBtn: true }, () => {
      this.submitBtn && this.submitBtn.focus();
      this.resetXHR();
    });
  }
  handleFileReset(e) {
    const { uploadFile } = this.state;
    if (uploadFile) {
      this.fileButton.value = "";
      this.setState({ uploadFile: null, mapper: null }, this.resetXHR);
    }
  }

  handleConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    const { confirm, matcher } = this.props,
      self = this;
    let { data, uploadFile, mapper } = this.state;

    this.resetXHR(() => {
      var formData = new FormData();
      formData.append("uploadFile", uploadFile);
      mapper && formData.append("mapper", JSON.stringify(mapper));
      let mc = matcher(formData);
      self.xhr = mc.xhr;
      mc.promise
        .then(({ response }) => {
          if (
            response &&
            response.success &&
            !response.ngHeaders &&
            (!response.unmatched || !response.unmatched.length)
          ) {
            this.resetXHR(() => {
              var formData = new FormData();
              formData.append(
                "data",
                JSON.stringify({
                  ...data,
                  details: JSON.stringify(response.matched)
                })
              );
              formData.append("uploadFile", uploadFile);
              let cfm = confirm(formData, { onProgress: self.handleProgress });
              this.xhr = null;
              cfm.then(() => {
                this.setState({ progress: null, enableConfirmBtn: false });
              });
            });
          }
        })
        .finally(() => {
          this.setState({ progress: null });
          this.xhr = null;
        });
    });
  }

  renderUpload() {
    const { uploadFile, progress } = this.state;
    return (
      <div className="block" styleName="finance-block">
        {progress && (
          <div className="progress edi_progress">
            <div
              className={`progress-bar progress-bar-striped active edi_progress-bar`}
              style={{ width: progress.percent }}
            />
          </div>
        )}
        <div className="form-group">
          <h4 className="col-sm-4 control-label">上传补充合同:</h4>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label asterisk">补充合同</label>
          <div className="col-sm-8">
            <label
              htmlFor={`${this.now}repayment`}
              className="btn icon-btn btn-default pull-left"
            >
              <i className="fa fa-upload" />
              {uploadFile ? "重新上传" : "上传补充合同"}
            </label>
            <input
              type="file"
              className="hidden"
              ref={button => {
                this.fileButton = button;
              }}
              hidden
              id={`${this.now}repayment`}
              onChange={this.handleFileChange}
              onClick={this.handleFileReset}
              accept=".xlsx, .xls, .csv"
            />
            <a
              target="_blank"
              href="/合同补充模版.xlsx"
              className="pull-left form-text"
              style={{ marginLeft: "1rem" }}
            >
              下载模板
            </a>
            {uploadFile && (
              <div
                className="pull-left form-text"
                style={{ marginLeft: "1rem" }}
              >
                {uploadFile.name}
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label" />
          <div className="col-sm-8">
            <p className="help-block">建议单次上传记录数控制在5000条以内</p>
          </div>
        </div>
        {this.renderSwitch()}
      </div>
    );
  }
  renderSwitch() {
    const { detail } = this.props;
    let { mapper } = this.state;
    if (detail) {
      if (mapper && Array.isArray(detail.ngHeaders)) {
        return this.renderMatcher();
      } else if (!detail.hiddleResult) {
        return this.renderResult();
      }
    }
  }
  renderMatcher() {
    const { detail } = this.props;
    let ngHeaders = detail.ngHeaders.map(r => ({ label: r, value: r })),
      { mapper } = this.state;
    return [
      <div className="form-group" key="secondStepHeader">
        <h4 className="col-sm-4 control-label">表头映射:</h4>
      </div>,
      ...this.columns.map((r, i) => {
        let mapTarget = mapper.find(s => s.id === r.name),
          defaultValue = (mapTarget && mapTarget.value) || "";
        return (
          <div className="form-group" key={i}>
            <label className="col-sm-4 control-label asterisk">{r.text}</label>
            <div className="col-sm-6">
              <Select
                onChange={this.mapperChanger(r.name)}
                noEmpty={true}
                options={ngHeaders}
                defaultValue={defaultValue}
              />
            </div>
          </div>
        );
      })
    ];
  }
  mapperChanger(target) {
    let self = this;
    return row => {
      let { mapper } = self.state;
      mapper.find(r => r.id == target).value = row.value;
      this.submitBtn && this.submitBtn.focus();
      self.setState({ mapper: [...mapper] });
    };
  }
  renderResult() {
    const { detail } = this.props;
    const { tab } = this.state;
    return [
      <div className="form-group" key="thirdStepHeader">
        <h4 className="col-sm-2 col-sm-offset-2">匹配结果:</h4>
      </div>,
      <div
        className="col-sm-8 col-sm-offset-2"
        styleName="scroller"
        key={"result"}
      >
        <ul className="nav nav-tabs col-sm-12" role="tablist" key={"ul"}>
          <li
            role="presentation"
            className={tab === 1 ? "active" : ""}
            onClick={e => this.selectTab(e, 1)}
          >
            <a href="javascript:;">
              匹配成功结果（{detail.matched ? detail.matched.length : 0}条）
            </a>
          </li>
          <li
            role="presentation"
            className={tab === 2 ? "active" : ""}
            onClick={e => this.selectTab(e, 2)}
          >
            <a href="javascript:;">
              匹配失败结果（{detail.unmatched ? detail.unmatched.length : 0}条）
            </a>
          </li>
        </ul>
        {((tab === 1 && detail.matched && detail.matched.length > 0) ||
          (tab === 2 && detail.unmatched && detail.unmatched.length > 0)) && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleExport}
            style={{ position: "absolute", top: "0", right: "1rem" }}
          >
            导出
          </button>
        )}
        {tab === 1 && (
          <div key={"tab1"} style={{ width: "100%", clear: "both" }}>
            <Datatable
              columns={this.successColumns}
              rows={detail.matched}
              noPgaging={true}
              style={{ overflow: "auto", padding: "1rem 0" }}
            />
          </div>
        )}
        {tab === 2 && (
          <div key={"tab2"} style={{ width: "100%", clear: "both" }}>
            <Datatable
              columns={this.errorColumns}
              rows={detail.unmatched}
              noPgaging={true}
              style={{ overflow: "auto", padding: "1rem 0" }}
            />
          </div>
        )}
      </div>
    ];
  }

  render() {
    const { closer, message, title } = this.props;
    return (
      <div className="modal fade in" role="dialog">
        <div className="modal-backdrop fade in" onClick={closer} />
        <div className="modal-dialog modal-lg" role="document">
          <form className="modal-content form-horizontal">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={closer}
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">{this.renderUpload()}</div>
            <div className="modal-footer">
              <button
                type="submit"
                className={`btn btn-primary pull-right ${
                  !this.state.enableConfirmBtn ? "disabled" : ""
                }`}
                onClick={this.handleConfirm}
                ref={submitBtn => {
                  this.submitBtn = submitBtn;
                }}
              >
                确定
              </button>
              <button
                type="button"
                className="btn btn-default pull-right"
                onClick={closer}
              >
                关闭
              </button>
              {message &&
                message.text &&
                message.type == "FAIL" && (
                  <p className="dialog-message text-danger">
                    <i className="fa fa-warning" /> {message.text}
                  </p>
                )}
              {message &&
                message.text &&
                message.type == "INFO" && (
                  <p className="dialog-message text-info">
                    <i className="fa fa-warning" /> {message.text}
                  </p>
                )}
              {message &&
                message.text &&
                message.type == "SUCCESS" && (
                  <p className="dialog-message text-success">
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
Modal.propTypes = {
  message: PropTypes.object,
  RESET_MESSAGE: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
  message: ownProps.message || state.message,
  _session: state._session
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    RESET_MESSAGE: actions.RESET_MESSAGE,
    matcher: ownProps.matcher
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
