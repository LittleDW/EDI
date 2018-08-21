import React, { Component } from 'react';
import Dialog from '../Dialog';
import moment from 'moment';
import CSSModules from 'react-css-modules';
import Datatable from '../Datatable';
import OperLogModal from '../Modal/OperLogModal';
import FundRelatedUserFromSelector from '../Select/FundRelatedUserFromSelectorPage';
import AssetRelatedUserFromSelector from '../Select/AssetRelatedUserFromSelectorPage';
import FundUserFromSelector from '../Select/FundUserFromSelectorPage';
import AssetUserFromSelector from '../Select/AssetUserFromSelectorPage';
import OrderStatusSelector from '../Select/OrderStatusSelectorPage';
import DeadlineSelector from '../Select/DeadlineSelectorPage';
import OrderWithDrawStatusSelector from '../Select/OrderWithdrawStatusSelectorPage';
import {
  FormatOrderStatus,
  FormatOrderBorrowPeriod,
  FormatOrderBorrowType,
  FormatOrderBorrowCertificateType,
  FormatOrderBorrowCardType,
  FormatOrderBorrowPayMode,
  FormatOrderBusinessType,
  FormatOrderRefuseType,
  FormatOrderContractType,
  FormatOrgCode,
  FormatOrderRepaymentMode,
  FormatOrderCreditOrg,
  FormatOrderDataFrom,
} from '../Formatter';
import SearchBar from '../Common/SearchBar';
import Modal from './modal';
import { getBrowserType, isMobile } from '../../utils/etc';
import style from './style.scss';

@CSSModules(style, { allowMultiple: true })
export default class WithDraw extends Component {
  constructor(props) {
    super(props);
    var self = this,
      session = props._SESSION,
      user_type = (session && session.user_type) || -1;
    this.state = {
      user_type,
      index: 1,
      withdrawStatus: [],
      assetOrgCode: user_type === 1 ? session.org_code : '',
      fundOrgCode: user_type === 2 ? session.org_code : '',
      orderRepaymentNo: '',
      orderPaymentNo: '',
      orderAccountNo: '',
      orderAdavnceNo: '',
      orderNo: '',
      today: moment().format('yyyy-MM-dd'),
      paymentStartDate: null,
      paymentEndDate: null,
      startCreateTime: null,
      endCreateTime: null,
      opsOrderNo: '',
      confirmExport: false,
      confirmMassDownload: false,
    };
    this.isMobile = isMobile();
    this.handleSearch = this.handleSearch.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.hasOpsColumn = this.hasOpsColumn.bind(this);
    this.handleFundOrgChange = this.handleFundOrgChange.bind(this);
    this.handlePaymentDatesChange = this.handlePaymentDatesChange.bind(this);
    this.handleDatesChange = this.handleDatesChange.bind(this);
    this.handleWithdrawStatusChange = this.handleWithdrawStatusChange.bind(this);
    this.handleAssetOrgChange = this.handleAssetOrgChange.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.openOrderModal = this.openOrderModal.bind(this);
    this.closeOrderModal = this.closeOrderModal.bind(this);
    this.openNewWindow = this.openNewWindow.bind(this);
    this.openExportConfirm = this.openExportConfirm.bind(this);
    this.closeExportConfirm = this.closeExportConfirm.bind(this);

    this.column = [
      {
        text: '平台订单号',
        name: 'order_no',
        withTitle: true,
        style: {
          maxWidth: window.innerWidth < 1650 ? '240px' : '',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
      {
        text: '提现状态',
        name: 'order_status',
        style: { width: '80px', textAlign: 'center' },
        renderDom: (row) =>
          {
            const result = this.props.getOrderWithdrawStatus.find((s) => s.value === row.withdraw_status)
            return result && result.label || row.withdraw_status
          },
      },
      {
        text: '资金方',
        name: 'fund_org_code',
        style: { width: '80px', textAlign: 'center' },
        renderDom: (row) => <FormatOrgCode value={row.fund_org_code} />,
      },
      //{text: '资金方订单号', name: 'fund_order_no',style: {width:'80px','maxWidth': '300px',overflow: 'hidden',textOverflow: 'ellipsis'}},
      {
        text: '资产方订单号',
        name: 'asset_order_no',
        style: {
          maxWidth: window.innerWidth < 1650 ? '290px' : '',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
      { text: '到账日期', name: 'payment_date', style: { width: '80px', textAlign: 'center' } },
      { text: '借款日期', name: 'borrow_date', style: { width: '80px', textAlign: 'center' } },
      { text: '借款金额（元）', name: 'borrow_fee', style: { width: '120px', textAlign: 'right' } },
      { text: '借款人名称', name: 'borrow_name', style: { width: '80px', textAlign: 'center' } },

      {
        text: '操作',
        style: { width: '80px', textAlign: 'center' },
        renderDom: (row) => {
          const { _buttons } = self.props;
          return (
            row.t_fund_api.api_url &&
            _buttons.includes('withdraw_api') && (
              <div styleName="table-ops">
                {
                  <a href="javascript:" onClick={() => self.openNewWindow(row)}>
                    提现
                  </a>
                }
              </div>
            )
          );
        },
      },
      {
        text: '查看',
        style: { textAlign: 'center', width: '80px' },
        renderDom: (row) => {
          const { _buttons } = self.props;
          let hasOpsColumn = self.hasOpsColumn();
          if (hasOpsColumn) {
            return (
              <div styleName="table-ops">
                {_buttons.includes('withdraw_detail') && (
                  <a href="javascript:" onClick={() => self.openOrderModal(row)}>
                    订单
                  </a>
                )}
              </div>
            );
          } else {
            return '无权操作';
          }
        },
      },
    ];
    this.orderColumns = [
      { text: '平台订单号', name: 'order_no' },
      {
        text: '订单状态',
        name: 'order_status',
        renderDom: (row) => <FormatOrderStatus value={row.order_status} />,
      },
      {
        text: '提现状态',
        name: 'withdraw_status',
        renderDom: (row) =>
          this.props.getOrderWithdrawStatus.find((s) => s.value === row.withdraw_status).label,
      },
      {
        text: '到账时间',
        name: 'payment_date',
      },
      { text: '资产方机构号', name: 'asset_org_code' },
      {
        text: '资产方机构名',
        name: 'asset_org_code',
        renderDom: (row) => <FormatOrgCode value={row.asset_org_code} />,
      },
      { text: '资产方订单号', name: 'asset_order_no' },
      { text: '借款日期', name: 'borrow_date' },
      {
        text: '借款主体类型',
        name: 'borrow_type',
        renderDom: (row) => <FormatOrderBorrowType value={row.borrow_type} />,
      },
      { text: '借款人名称', name: 'borrow_name' },
      {
        text: '借款人证件类型',
        name: 'borrow_certificate_type',
        renderDom: (row) => (
          <FormatOrderBorrowCertificateType value={row.borrow_certificate_type} />
        ),
      },
      { text: '借款人证件号', name: 'borrow_certificate_no' },
      { text: '借款人银行预留手机号', name: 'borrow_phone' },
      { text: '借款人邮箱', name: 'borrow_mail' },
      { text: '借款人开户行', name: 'borrow_bank' },
      {
        text: '借款人银行卡类型',
        name: 'borrow_card_type',
        renderDom: (row) => <FormatOrderBorrowCardType value={row.borrow_card_type} />,
      },
      { text: '借款人银行卡号', name: 'borrow_card_no' },
      { text: '借款人所属地区', name: 'borrow_area' },
      { text: '借款人工作地址', name: 'borrow_work_address' },
      { text: '借款人家庭地址', name: 'borrow_family_address' },
      { text: '借款人户籍地址', name: 'borrow_census_address' },
      {
        text: '借款支付方式',
        name: 'borrow_pay_mode',
        renderDom: (row) => <FormatOrderBorrowPayMode value={row.borrow_pay_mode} />,
      },
      { text: '借款用途', name: 'borrow_purpose' },
      { text: '借款金额（元）', name: 'borrow_fee' },
      {
        text: '借款期限单位',
        name: 'borrow_period',
        renderDom: (row) => <FormatOrderBorrowPeriod value={row.borrow_period} />,
      },
      { text: '借款期限', name: 'borrow_deadline' },
      { text: '借款人授信额度（元）', name: 'borrow_credit_fee' },
      { text: '借款人征信报告情况', name: 'borrow_credit_report' },
      { text: '借款人收入情况', name: 'borrow_income_report' },
      {
        text: '业务类型',
        name: 'business_type',
        renderDom: (row) => <FormatOrderBusinessType value={row.business_type} />,
      },
      { text: '收款账号名称', name: 'gathering_name' },
      { text: '收款账户开户行', name: 'gathering_bank' },
      { text: '收款账户号', name: 'gathering_card_no' },
      { text: '资金方机构号', name: 'fund_org_code' },
      {
        text: '资金方机构名',
        name: 'fund_org_code',
        renderDom: (row) => <FormatOrgCode value={row.fund_org_code} />,
      },
      { text: '资金方订单号', name: 'fund_order_no' },
      {
        text: '拒绝类型',
        name: 'refuse_type',
        renderDom: (row) => <FormatOrderRefuseType value={row.refuse_type} />,
      },
      { text: '拒绝原因', name: 'refuse_reason' },
      {
        text: '还款方式',
        name: 'repayment_mode',
        renderDom: (row) => <FormatOrderRepaymentMode value={row.repayment_mode} />,
      },
      { text: '借款人职业', name: 'occupation' },
      { text: '还款来源', name: 'repayment_from' },
      {
        text: '数据来源',
        name: 'data_from',
        renderDom: (row) => <FormatOrderDataFrom value={row.data_from} />,
      },
      {
        text: '授信机构',
        name: 'credit_org',
        renderDom: (row) => <FormatOrderCreditOrg value={row['credit_org']} />,
      },
      {
        text: '授信评分',
        name: 'credit_score',
      },
    ];
    this.searchBarItems = [
      {
        label: '资金方:',
        type: 'custom',
        dom: <FundUserFromSelector onChange={this.handleFundOrgChange} userFrom="1" />,
      },
      {
        label: '提现状态:',
        type: 'custom',
        dom: (
          <OrderWithDrawStatusSelector onChange={this.handleWithdrawStatusChange} multiple={true} />
        ),
      },

      {
        label: '到账时间:',
        type: 'group',
        props: {
          items: [
            {
              label: '到账时间',
              type: 'daterange',
              props: {
                onDatesChange: self.handlePaymentDatesChange,
                showClearDate: true,
                output: 'date',
                style: { width: '100%' },
                ref: (input) => {
                  this.paymentDatePicker = input;
                },
              },
              resetState: () => {
                if (this.paymentDatePicker) {
                  this.paymentDatePicker.resetState();
                }
              },
            },
            {
              label: '借款时间',
              type: 'daterange',
              props: {
                onDatesChange: self.handleDatesChange,
                showClearDate: true,
                output: 'date',
                style: { width: '100%' },
                ref: (input) => {
                  this.borrowTimePicker = input;
                },
              },
              resetState: () => {
                if (this.borrowTimePicker) {
                  this.borrowTimePicker.resetState();
                }
              },
            },
          ],
        },
      },
      // TODO 订单号分组切换时没有重新搜，这里可以以后会修正
      {
        label: '订单号:',
        type: 'group',
        props: {
          items: [
            {
              label: '平台订单号',
              type: 'text',
              props: {
                ref: (input) => {
                  this.platformCodeInput = input;
                },
              },
              resetState: () => {
                if (this.platformCodeInput) {
                  this.platformCodeInput.value = '';
                }
              },
            },
            {
              label: '资产订单号',
              type: 'text',
              props: {
                ref: (input) => {
                  this.assetCodeInput = input;
                },
              },
              resetState: () => {
                if (this.assetCodeInput) {
                  this.assetCodeInput.value = '';
                }
              },
            },
            {
              label: '证件号',
              type: 'text',
              props: {
                ref: (input) => {
                  this.borrowCertificateNoInput = input;
                },
              },
              resetState: () => {
                if (this.borrowCertificateNoInput) {
                  this.borrowCertificateNoInput.value = '';
                }
              },
            },
          ],
        },
      },
    ];
    if (user_type === 3) {
      this.searchBarItems = [
        {
          label: '资产方:',
          type: 'custom',
          dom: <AssetUserFromSelector onChange={this.handleAssetOrgChange} userFrom="1" />,
        },
        ,
        ...this.searchBarItems,
      ];
      this.column.splice(-2, 1);
      this.column.splice(2, 0, {
        text: '资产方',
        name: 'asset_org_code',
        style: { width: '80px', textAlign: 'center' },
        renderDom: (row) => <FormatOrgCode value={row.asset_org_code} />,
      });
    }
  }

  componentWillMount() {
    window.addEventListener('click', this.clearOps);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clearOps);
  }
  handleSearch(index) {
    let myIndex =
      (this.platformCodeInput && this.platformCodeInput.value) ||
      (this.assetCodeInput && this.assetCodeInput.value) ||
      typeof index == 'undefined'
        ? 1
        : index;
    this.setState({ index: myIndex, opsOrderNo: '' });
    return this.props.searcher({
      pageIndex: myIndex,
      orderNo: this.platformCodeInput && this.platformCodeInput.value,
      assetOrderNo: this.assetCodeInput && this.assetCodeInput.value,
      borrowCertificateNo: this.borrowCertificateNoInput && this.borrowCertificateNoInput.value,
      paymentStartDate:
        this.state.paymentStartDate && this.state.paymentStartDate.format('YYYY-MM-DD 00:00:00'),
      paymentEndDate:
        this.state.paymentEndDate && this.state.paymentEndDate.format('YYYY-MM-DD 00:00:00'),
      borrowStartDate:
        this.state.borrowStartDate && this.state.borrowStartDate.format('YYYY-MM-DD 00:00:00'),
      borrowEndDate:
        this.state.borrowEndDate && this.state.borrowEndDate.format('YYYY-MM-DD 23:59:59'),
      withdrawStatus: this.state.withdrawStatus,
      assetOrgCode: this.state.assetOrgCode,
      fundOrgCode: this.state.fundOrgCode,
    });
  }
  componentDidMount() {
    this.handleSearch();
  }
  handleAssetOrgChange(row) {
    this.setState({ assetOrgCode: row.value, index: 1 }, this.handleSearch);
  }
  openNewWindow(row) {
    const { api_url } = row.t_fund_api;
    const url = api_url;
    const name = '_blank';
    const width = 768;
    const height = 1024;
    const left = (window.screen.availWidth - 10 - width) / 2;
    // const left = Number((screen.width / 2) - (700 / 2));
    const specs = `width=${width},height=${height},left=${left},status=no,directories=no`;
    const newWindow = window.open(url, name, specs);
    newWindow.focus();
  }
  openOrderModal(row) {
    this.setState(Object.assign({}, this.state, { orderNo: row.order_no, withdraw: row }));
  }
  closeOrderModal() {
    this.setState(Object.assign({}, this.state, { orderNo: '', withdraw: undefined }));
  }
  hasOpsColumn() {
    let { _buttons } = this.props;
    return (
      Array.isArray(_buttons) &&
      (_buttons.includes('withdraw_detail') || _buttons.includes('withdraw_log'))
    );
  }
  handleWithdrawStatusChange(rows) {
    this.setState({ withdrawStatus: rows.map((r) => r.value), index: 1 }, this.handleSearch);
  }
  handleFundOrgChange(row) {
    this.setState({ fundOrgCode: row.value, index: 1 }, this.handleSearch);
  }
  handlePaymentDatesChange({ startDate, endDate }) {
    this.setState({ paymentStartDate: startDate, paymentEndDate: endDate }, this.handleSearch);
  }
  handleDatesChange({ startDate, endDate }) {
    this.setState({ borrowStartDate: startDate, borrowEndDate: endDate }, this.handleSearch);
  }

  openExportConfirm() {
    this.setState({ confirmExport: true });
  }

  closeExportConfirm() {
    this.setState({ confirmExport: false });
  }

  handleExport() {
    var { SET_MESSAGE } = this.props;
    this.handleSearch().promise.then(({ response }) => {
      if (response.success) {
        if (response.total <= window.EDI_CLIENT.exportMaxRows) {
          const browserType = getBrowserType(),
            queryString = `/withdraw/export?orderNo=${(this.platformCodeInput &&
              this.platformCodeInput.value) ||
              ''}&assetOrderNo=${(this.assetCodeInput && this.assetCodeInput.value) ||
              ''}&fundOrgCode=${this.state.fundOrgCode}&assetOrgCode=${
              this.state.assetOrgCode
            }&borrowStartDate=${(this.state.borrowStartDate &&
              this.state.borrowStartDate.format('YYYY-MM-DD 00:00:00')) ||
              ''}&borrowEndDate=${(this.state.borrowEndDate &&
              this.state.borrowEndDate.format('YYYY-MM-DD 23:59:59')) ||
              ''}&paymentStartDate=${(this.state.paymentStartDate &&
              this.state.paymentStartDate.format('YYYY-MM-DD 00:00:00')) ||
              ''}&paymentEndDate=${(this.state.paymentEndDate &&
              this.state.paymentEndDate.format('YYYY-MM-DD 23:59:59')) ||
              ''}&withdrawStatus=${(this.state.withdrawStatus &&
              this.state.withdrawStatus.join(',')) ||
              ''}&borrowCertificateNo=${(this.borrowCertificateNoInput &&
              this.borrowCertificateNoInput.value) ||
              ''}`;
          SET_MESSAGE('导出即将开始', 'INFO');
          setTimeout(() => {
            if (browserType == 'Chrome') {
              this.hiddenLink.href = queryString;
              this.hiddenLink.click();
            } else if (browserType == 'Safari') {
              //this.hiddenLink.href = queryString
              window.location.href = queryString;
            } else if (browserType == 'Firefox') {
              //this.hiddenLink.href = queryString
              window.location.href = queryString;
            } else {
              window.open(queryString, '_blank');
            }
          }, 2000);
        } else {
          SET_MESSAGE(
            `系统目前仅支持${window.EDI_CLIENT.exportMaxRows / 10000}万条以内的导出，推荐按天导出`,
            'WARN',
          );
        }
      }
    });
  }
  onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleSearch();
  }
  render() {
    const { navigateTo, type, _buttons, withDraw } = this.props;
    const {
      confirmExport,
      confirmMassDownload,
      fundOrgCode,
      assetOrgCode,

      orderAccountNo,
    } = this.state;
    const self = this;
    return (
      <div className="component">
        <SearchBar items={this.searchBarItems} searcher={this.onSearch}>
          <div className="pull-left" style={{ width: '100px' }}>
            <button
              type="submit"
              className="btn icon-btn btn-primary"
              style={{ marginLeft: 0, width: '100px' }}
            >
              <i className="fa fa-search" />
              <span className="text">搜 索</span>
            </button>
          </div>

          {_buttons.includes('withdraw_export') && (
            <button
              type="button"
              className="btn icon-btn btn-danger pull-right"
              onClick={this.openExportConfirm}
            >
              <i className="fa fa-download" />
              <span className="text">订单导出</span>
            </button>
          )}
        </SearchBar>

        <div className="wrapper">
          <Datatable
            columns={this.column}
            rows={withDraw.rows}
            index={this.state.index}
            searcher={this.handleSearch}
            total={withDraw.total}
          />
          {withDraw.rows.length > 0 && (
            <div styleName="summa">
              <p>
                共<span>{withDraw.total}条</span>记录；借款金额总计<span>{withDraw.fee}</span>元
              </p>
            </div>
          )}
        </div>

        {this.state.orderNo && (
          <Modal
            data={[this.state.withdraw]}
            title="平台订单明细一览"
            columns={this.orderColumns}
            closer={this.closeOrderModal}
          />
        )}

        {confirmExport && (
          <Dialog
            confirm={(e) => {
              self.handleExport(e);
              self.closeExportConfirm();
            }}
            title="请确认"
            closer={this.closeExportConfirm}
            size="modal-md"
          >
            超大量导出订单会存在失败的可能或下载速度慢，建议减少单次下载量<br />
            系统目前仅支持{window.EDI_CLIENT.exportMaxRows /
              10000}万条以内的导出，如有更多数据需要导出，请另行联系我们<br />
            您确定要对{withDraw.total}条订单数据做导出操作么?
          </Dialog>
        )}
        <a
          download="true"
          className="hidden"
          target="_blank"
          ref={(link) => {
            this.hiddenLink = link;
          }}
        />
      </div>
    );
  }
}
