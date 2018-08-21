/**
 * 作者：石奇峰
 * 功能：EDI系统的统一配置，用于连接action，业务模块，菜单和reducer
 * */

import Selectors from "./selectors"
import {actions} from './actions'
import AdminStatisticsPlatform from '../components/Statistics/platform'
import AssetAccount from '../components/AssetAccount'
import AssetSetting from '../components/AssetSetting'
//import CollectionPlan from '../components/CollectionPlan'
import CorpAuth from '../components/CorpAuth'
import CorpOrders from '../components/CorpOrders'
import Orders from '../components/Orders'
import CreateAssetOrder from '../components/CreateAssetOrder'
import CreateCorpAssetOrder from '../components/CreateCorpAssetOrder'
import CreateCorpCredit from '../components/CreateCorpCredit'
import FundSupplyPlan from '../components/FundSupplyPlan'
import LoginLogs from '../components/LoginLogs'
import OperTableLogs from '../components/OperTableLogs'
import PlatformUseFee from '../components/PlatformUseFee'
import Profile from '../components/Profile'
import Repayment from '../components/Repayment'
import RequirementPlan from '../components/RequirementPlan'
import RequirementPlanNew from '../components/RequirementPlan/new'
import Statistics from '../components/Statistics'
import AfterRepaymentStatistics from '../components/AfterRepaymentStatistics'
import SettleMethod from '../components/SettleMethod'
//import AccountInfo from '../components/AccountInfo'
import BalanceStatistics from '../components/BalanceStatistics'
import RepaymentPlan from '../components/RepaymentPlan'
import SupplementAssetOrder from '../components/SupplementAssetOrder'
import SupplementCorpAssetOrder from '../components/SupplementCorpAssetOrder'
import SupplementCorpCredit from '../components/SupplementCorpCredit'
import UserManagement from '../components/UserManagement'
import SubUserManagement from '../components/SubUserManagement'
import MenuManagement from '../components/MenuManagement'
import CooperatorInfo from '../components/CooperatorInfo'
import RoleManagement from '../components/RoleManagement'
import FinanceLoan from "../components/FinanceLoan"
import FinanceRepayment from "../components/FinanceRepayment"
import FinanceServiceSettlement from "../components/FinanceServiceSettlement"
import PersonalCertificate from "../components/PersonalCertificate"
import EnterpriseCertificate from "../components/EnterpriseCertificate"
import MixedCertificate from "../components/MixedCertificate"
import EnterprisePublicity from '../components/PublicityManagement/EnterprisePublicity'
import PersonalPublicity from '../components/PublicityManagement/PersonalPublicity'
import SearchPublicityDetail from '../components/PublicityManagement/SearchPublicityDetail'
import SearchPersonalPublicityDetail from '../components/PublicityManagement/SearchPersonalPublicityDetail'
import CooperatorApiAsset from "../components/CooperatorApiAsset"
import CooperatorApiFund from "../components/CooperatorApiFund"
import UserAttribute from "../components/UserAttribute"
import UserAttributeManagement from "../components/UserAttributeManagement"
import CooperatorAccountInfo from "../components/CooperatorInfo/accountInfo"
import CooperatorBussinessSpecifica from '../components/CooperatorBusinessSpecifica';
import AfterRepaymentOrder from '../components/AfterRepaymentOrder';
import WithDraw from '../components/Withdraw';

export const CONTAINERS = {
  AdminStatisticsPlatformPage: {
    subentry: "platform",
    component: AdminStatisticsPlatform,
    mapStateToProps: (state, ownProps) => ({
      ADMIN_STATISTICS: state.adminStatistics,
      DEADLINELIST: Selectors.getDeadlineList(state),
    }),
    mapDispatchToProps: {
      CALL_WEEK_DATE_INFO: actions.CALL_WEEK_DATE_INFO,
      FUND_WEEK_RESET: actions.FUND_WEEK_RESET,
      CALL_SIMPLY_LOG_TABLE: actions.CALL_SIMPLY_LOG_TABLE,
      CALL_ADMIN_STATISTICS_PLATFORM: actions.CALL_ADMIN_STATISTICS_PLATFORM,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      initWeekAndDate: props.CALL_WEEK_DATE_INFO,
      resetWeekInfo: props.FUND_WEEK_RESET,
      deadlineList: props.DEADLINELIST,
      adminStatistics: props.ADMIN_STATISTICS,
      simplyLogTable:props.CALL_SIMPLY_LOG_TABLE,
      getData: props.CALL_ADMIN_STATISTICS_PLATFORM, ...propsExtension
    })
  },
  AssetAccountPage: {//edit by zby 20171215
    subentry: "asset_account",
    component: AssetAccount,
    mapStateToProps: (state, ownProps) => ({
      ASSET_ACCOUNT: state.assetAccount
    }),
    mapDispatchToProps: {
      CALL_ASSET_ACCOUNT: actions.CALL_ASSET_ACCOUNT,
      CALL_ASSET_ACCOUNT_UPDATE: actions.CALL_ASSET_ACCOUNT_UPDATE,
      CALL_DIC: actions.CALL_DIC,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      data: props.ASSET_ACCOUNT,
      searcher: props.CALL_ASSET_ACCOUNT,
      assetAccountUpdate: props.CALL_ASSET_ACCOUNT_UPDATE,
      callDic: props.CALL_DIC,
      dictionary: props.DICTIONARY,
      resetMessage: props.RESET_MESSAGE,
      setMessage: props.SET_MESSAGE,
      _session: props._SESSION, ...propsExtension
    })
  },
  AssetSettingPage: {
    subentry: ["asset_setting", "fund_setting", "admin_setting"],
    component: AssetSetting,
    mapStateToProps: (state, ownProps) => ({
      FEE_SETTING: state.feeSetting,
      DEAD_LINE: state.dictionary.deadlineList,
    }),
    mapDispatchToProps: {
      CALL_ASSET_SETTING: actions.CALL_ASSET_SETTING,
      CALL_ASSET_SETTING_CAPTCHA: actions.CALL_ASSET_SETTING_CAPTCHA,
      CALL_ASSET_SETTING_UPDATE: actions.CALL_ASSET_SETTING_UPDATE,
      CALL_ASSET_SETTING_UPDATE_DEADLINE: actions.CALL_ASSET_SETTING_UPDATE_DEADLINE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      feeSetting: props.FEE_SETTING,
      dictionary: props.DICTIONARY,
      deadline: props.DEAD_LINE,
      sendCaptcha: props.CALL_ASSET_SETTING_CAPTCHA,
      getData: props.CALL_ASSET_SETTING,
      saveData: props.CALL_ASSET_SETTING_UPDATE,
      saveDeadlineData: props.CALL_ASSET_SETTING_UPDATE_DEADLINE,
      ...propsExtension
    })
  },
  /*CollectPlanPage: {
    subentry: "collection_plan",
    component: CollectionPlan,
    mapStateToProps: (state, ownProps) => ({
      COLLECT: state.collect,
    }),
    mapDispatchToProps: {
      CALL_COLWEEK: actions.CALL_COLWEEK,
      CALL_COLWEEK_UPDATE: actions.CALL_COLWEEK_UPDATE,
      CALL_COLWEEK_HISTORY: actions.CALL_COLWEEK_HISTORY,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      collect: props.COLLECT,
      searchData: props.CALL_COLWEEK,
      save: props.CALL_COLWEEK_UPDATE,
      getHistory: props.CALL_COLWEEK_HISTORY,
      ...propsExtension
    })
  },*/
  CorpAuthPage: {
    subentry: "corp_auth",
    component: CorpAuth,
    mapStateToProps: (state, ownProps) => ({
      CORP_AUTH: state.corpAuth,
      ORDER_REPAYMENT: state.orderRepayment,
      ORDER_PAYMENT: state.orderPayment,
      ORDER_ADVANCE: state.orderAdvance,
      ORDER_ACCOUNT: state.orderAccount,
      TYPE: Selectors.getUserType(state)
    }),
    mapDispatchToProps: {
      CALL_CORP_AUTH: actions.CALL_CORP_AUTH,
      CALL_CORP_AUTH_DETAIL: actions.CALL_CORP_AUTH_DETAIL,
      CALL_CORP_AUTH_CREDIT_DETAIL: actions.CALL_CORP_AUTH_CREDIT_DETAIL,
      RESET_CORP_AUTH_DETAIL: actions.RESET_CORP_AUTH_DETAIL,
      RESET_CORP_AUTH_CREDIT_DETAIL: actions.RESET_CORP_AUTH_CREDIT_DETAIL,
      CALL_CORP_AUTH_VOUCHER: actions.CALL_CORP_AUTH_VOUCHER,
      RESET_CORP_AUTH_VOUCHER: actions.RESET_CORP_AUTH_VOUCHER,
      CALL_FILTER_CORP_AUTH_VOUCHER: actions.CALL_FILTER_CORP_AUTH_VOUCHER,
      RESET_FILTERED_CORP_AUTH_VOUCHER: actions.RESET_FILTERED_CORP_AUTH_VOUCHER,
      RESET_CORP_AUTH_UPLOAD_DETAIL: actions.RESET_CORP_AUTH_UPLOAD_DETAIL,
      CALL_CORP_AUTH_AUTH_RESULT_MATCH: actions.CALL_CORP_AUTH_AUTH_RESULT_MATCH,
      CALL_CORP_AUTH_AUTH_RESULT_CREATE: actions.CALL_CORP_AUTH_AUTH_RESULT_CREATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      corpAuth: props.CORP_AUTH,
      searcher: props.CALL_CORP_AUTH,
      detailSearcher: props.CALL_CORP_AUTH_DETAIL,
      creditSearcher: props.CALL_CORP_AUTH_CREDIT_DETAIL,
      closeDetail: props.RESET_CORP_AUTH_DETAIL,
      closeCreditDetail: props.RESET_CORP_AUTH_CREDIT_DETAIL,
      filterCorpAuthVoucherSearcher: props.CALL_FILTER_CORP_AUTH_VOUCHER,
      resetFilteredCorpAuthVoucher: props.RESET_FILTERED_CORP_AUTH_VOUCHER,
      corpAuthVoucherSearcher: props.CALL_CORP_AUTH_VOUCHER,
      resetCorpAuthVoucher: props.RESET_CORP_AUTH_VOUCHER,
      authResultMatcher: props.CALL_CORP_AUTH_AUTH_RESULT_MATCH,
      authResultCreator: props.CALL_CORP_AUTH_AUTH_RESULT_CREATE,
      resetAuthUploadDetail: props.RESET_CORP_AUTH_UPLOAD_DETAIL,
      type: props.TYPE,
      dictionary: props.DICTIONARY,
      _session: props._SESSION,
      messageSetter: props.SET_MESSAGE, ...propsExtension
    })
  },
  CorpOrdersPage: {
    subentry: "corp_orders",
    component: CorpOrders,
    mapStateToProps: (state, ownProps) => ({
      CORP_ORDERS: state.corpOrders,
      TYPE: Selectors.getUserType(state),
      CONTRACTTYPE:Selectors.getOrderContractType(state)
    }),
    mapDispatchToProps: {
      CALL_CORP_ORDER: actions.CALL_CORP_ORDER,
      CALL_CORP_ORDER_REPAYMENT: actions.CALL_CORP_ORDER_REPAYMENT,
      CALL_CORP_ORDER_PAYMENT: actions.CALL_CORP_ORDER_PAYMENT,
      CALL_CORP_ORDER_ADVANCE: actions.CALL_CORP_ORDER_ADVANCE,
      CALL_CORP_ORDER_ACCOUNT: actions.CALL_CORP_ORDER_ACCOUNT,
      CALL_CORP_ORDER_VOUCHER: actions.CALL_CORP_ORDER_VOUCHER,
      CALL_CORP_ORDER_CONTRACT: actions.CALL_CORP_ORDER_CONTRACT,
      CALL_CORP_ORDER_SERVICE: actions.CALL_CORP_ORDER_SERVICE,
      CALL_CORP_ORDER_CREDIT: actions.CALL_CORP_ORDER_CREDIT,
      RESET_CORP_ORDER_REPAYMENT: actions.RESET_CORP_ORDER_REPAYMENT,
      RESET_CORP_ORDER_PAYMENT: actions.RESET_CORP_ORDER_PAYMENT,
      RESET_CORP_ORDER_ADVANCE: actions.RESET_CORP_ORDER_ADVANCE,
      RESET_CORP_ORDER_ACCOUNT: actions.RESET_CORP_ORDER_ACCOUNT,
      RESET_CORP_ORDER_CONTRACT: actions.RESET_CORP_ORDER_CONTRACT,
      RESET_CORP_ORDER_SERVICE: actions.RESET_CORP_ORDER_SERVICE,
      RESET_CORP_ORDER_VOUCHER: actions.RESET_CORP_ORDER_VOUCHER,
      RESET_CORP_ORDER_CREDIT: actions.RESET_CORP_ORDER_CREDIT,
      CALL_FILTER_CORP_ORDER_VOUCHER: actions.CALL_FILTER_CORP_ORDER_VOUCHER,
      RESET_FILTERED_CORP_ORDER_VOUCHER: actions.RESET_FILTERED_CORP_ORDER_VOUCHER,
      RESET_CORP_ORDER_UPLOAD_DETAIL: actions.RESET_CORP_ORDER_UPLOAD_DETAIL,
      CALL_CORP_ORDER_CHECK_RESULT_MATCH: actions.CALL_CORP_ORDER_CHECK_RESULT_MATCH,
      CALL_CORP_ORDER_CHECK_RESULT_CREATE: actions.CALL_CORP_ORDER_CHECK_RESULT_CREATE,
      CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH: actions.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH,
      CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE: actions.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE,
      CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_MATCH: actions.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_MATCH,
      CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_CREATE: actions.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_CREATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      corpOrders: props.CORP_ORDERS, searcher: props.CALL_CORP_ORDER,
      orderRepaymentSearcher: props.CALL_CORP_ORDER_REPAYMENT, resetOrderRepayment: props.RESET_CORP_ORDER_REPAYMENT,
      orderPaymentSearcher: props.CALL_CORP_ORDER_PAYMENT, resetOrderPayment: props.RESET_CORP_ORDER_PAYMENT,
      filterOrderVoucherSearcher: props.CALL_FILTER_CORP_ORDER_VOUCHER,
      resetFilteredOrderVoucher: props.RESET_FILTERED_CORP_ORDER_VOUCHER,
      orderAdvanceSearcher: props.CALL_CORP_ORDER_ADVANCE, resetOrderAdvance: props.RESET_CORP_ORDER_ADVANCE,
      orderAccountSearcher: props.CALL_CORP_ORDER_ACCOUNT, resetOrderAccount: props.RESET_CORP_ORDER_ACCOUNT,
      orderContractSearcher: props.CALL_CORP_ORDER_CONTRACT, resetOrderContract: props.RESET_CORP_ORDER_CONTRACT,
      resetOrderService: props.RESET_CORP_ORDER_SERVICE,
      orderServiceSearcher: props.CALL_CORP_ORDER_SERVICE,
      orderCreditSearcher: props.CALL_CORP_ORDER_CREDIT, resetOrderCredit: props.RESET_CORP_ORDER_CREDIT,
      resetOrderVoucher: props.RESET_CORP_ORDER_VOUCHER,
      orderVoucherSearcher: props.CALL_CORP_ORDER_VOUCHER,
      checkResultMatcher: props.CALL_CORP_ORDER_CHECK_RESULT_MATCH,
      checkResultCreator: props.CALL_CORP_ORDER_CHECK_RESULT_CREATE,
      accountDetailMatcher: props.CALL_CORP_ORDER_ACCOUNT_DETAIL_MATCH,
      accountDetailCreator: props.CALL_CORP_ORDER_ACCOUNT_DETAIL_CREATE,
      resetOrderUploadDetail: props.RESET_CORP_ORDER_UPLOAD_DETAIL,
      contractSupplymentMatcher: props.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_MATCH,
      contractSupplymentCreator: props.CALL_CORP_ORDER_CONTRACT_SUPPLYMENT_CREATE,
      type: props.TYPE,
      contractType: props.CONTRACTTYPE,
      dictionary: props.DICTIONARY, _session: props._SESSION,
      messageSetter: props.SET_MESSAGE, ...propsExtension
    })
  },
  CreateAssetOrderPage: {
    subentry: "orders.create_asset_order",
    component: CreateAssetOrder,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.assetOrders,
      ORG_CODES: Selectors.getOrgCodes(state),
      ASSET_USERS: Selectors.getAssetOrgCodes(state)
    }),
    mapDispatchToProps: {
      CALL_MATCH_ASSET_ORDER: actions.CALL_MATCH_ASSET_ORDER,
      CALL_CREATE_ASSET_ORDER: actions.CALL_CREATE_ASSET_ORDER,
      RESET_ASSET_ORDER: actions.RESET_ASSET_ORDER,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_ASSET_ORDER, assetOrders: props.ASSET_ORDERS,
      assetUsers: props.ASSET_USERS, fundUsers: props.FUND_USERS, createAssetOrder: props.CALL_CREATE_ASSET_ORDER,
      resetMessage: props.RESET_MESSAGE, message: props.message, setMessage: props.SET_MESSAGE,
      resetAssetOrder: props.RESET_ASSET_ORDER, orgCodes: props.ORG_CODES, ...propsExtension
    })
  },
  CreateCorpAssetOrderPage: {
    subentry: "corp_orders.create_corp_asset_order",
    component: CreateCorpAssetOrder,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.corpAssetOrders,
      ORG_CODES: Selectors.getOrgCodes(state),
      ASSET_USERS: Selectors.getAssetOrgCodes(state)
    }),
    mapDispatchToProps: {
      CALL_MATCH_CORP_ASSET_ORDER: actions.CALL_MATCH_CORP_ASSET_ORDER,
      CALL_CREATE_CORP_ASSET_ORDER: actions.CALL_CREATE_CORP_ASSET_ORDER,
      RESET_CORP_ASSET_ORDER: actions.RESET_CORP_ASSET_ORDER,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_CORP_ASSET_ORDER, assetOrders: props.ASSET_ORDERS,
      assetUsers: props.ASSET_USERS, fundUsers: props.FUND_USERS, createAssetOrder: props.CALL_CREATE_CORP_ASSET_ORDER,
      resetMessage: props.RESET_MESSAGE, message: props.MESSAGE, setMessage: props.SET_MESSAGE,
      resetAssetOrder: props.RESET_CORP_ASSET_ORDER, orgCodes: props.ORG_CODES, ...propsExtension
    })
  },
  CreateCorpCreditPage: {
    subentry: "corp_auth.create_corp_credit",
    component: CreateCorpCredit,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.corpCredit,
      ORG_CODES: Selectors.getOrgCodes(state),
      ASSET_USERS: Selectors.getAssetOrgCodes(state),
    }),
    mapDispatchToProps: {
      CALL_MATCH_CORP_CREDIT: actions.CALL_MATCH_CORP_CREDIT,
      CALL_CREATE_CORP_CREDIT: actions.CALL_CREATE_CORP_CREDIT,
      RESET_CORP_CREDIT: actions.RESET_CORP_CREDIT,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_CORP_CREDIT, assetOrders: props.ASSET_ORDERS,
      assetUsers: props.ASSET_USERS, createAssetOrder: props.CALL_CREATE_CORP_CREDIT,
      resetMessage: props.RESET_MESSAGE, message: props.MESSAGE, setMessage: props.SET_MESSAGE,
      resetAssetOrder: props.RESET_CORP_CREDIT, orgCodes: props.ORG_CODES, ...propsExtension
    })
  },
  SupplementAssetOrderPage: {
    subentry: "orders.supplement_asset_order",
    component: SupplementAssetOrder,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.supplementAssetOrder,
      ORG_CODES: Selectors.getOrgCodes(state),
      ASSET_USERS: Selectors.getAssetOrgCodes(state)
    }),
    mapDispatchToProps: {
      CALL_MATCH_SUPPLEMENT_ASSET_ORDER: actions.CALL_MATCH_SUPPLEMENT_ASSET_ORDER,
      CALL_SUPPLEMENT_ASSET_ORDER: actions.CALL_SUPPLEMENT_ASSET_ORDER,
      RESET_SUPPLEMENT_ASSET_ORDER: actions.RESET_SUPPLEMENT_ASSET_ORDER,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_SUPPLEMENT_ASSET_ORDER,
      assetOrders: props.ASSET_ORDERS, assetUsers: props.ASSET_USERS,
      createAssetOrder: props.CALL_SUPPLEMENT_ASSET_ORDER, resetMessage: props.RESET_MESSAGE,
      message: props.MESSAGE, setMessage: props.SET_MESSAGE, resetAssetOrder: props.RESET_SUPPLEMENT_ASSET_ORDER,
      orgCodes: props.ORG_CODES, ...propsExtension
    })
  },
  SupplementCorpAssetOrderPage: {
    subentry: "corp_orders.supplement_corp_asset_order",
    component: SupplementCorpAssetOrder,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.supplementCorpAssetOrder,
      ORG_CODES: Selectors.getOrgCodes(state),
      ASSET_USERS: Selectors.getAssetOrgCodes(state)
    }),
    mapDispatchToProps: {
      CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER: actions.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER,
      CALL_CORP_SUPPLEMENT_ASSET_ORDER: actions.CALL_CORP_SUPPLEMENT_ASSET_ORDER,
      RESET_SUPPLEMENT_CORP_ASSET_ORDER: actions.RESET_SUPPLEMENT_CORP_ASSET_ORDER,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_SUPPLEMENT_CORP_ASSET_ORDER,
      assetOrders: props.ASSET_ORDERS, assetUsers: props.ASSET_USERS,
      createAssetOrder: props.CALL_CORP_SUPPLEMENT_ASSET_ORDER, resetMessage: props.RESET_MESSAGE,
      message: props.MESSAGE, setMessage: props.SET_MESSAGE,
      resetAssetOrder: props.RESET_SUPPLEMENT_CORP_ASSET_ORDER, orgCodes: props.ORG_CODES, ...propsExtension
    })
  },
  SupplementCorpCreditPage: {
    subentry: "corp_auth.supplement_corp_credit",
    component: SupplementCorpCredit,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.supplementCorpCredit,
      ORG_CODES: Selectors.getOrgCodes(state),
      ASSET_USERS: Selectors.getAssetOrgCodes(state)
    }),
    mapDispatchToProps: {
      CALL_MATCH_SUPPLEMENT_CORP_CREDIT: actions.CALL_MATCH_SUPPLEMENT_CORP_CREDIT,
      CALL_SUPPLEMENT_CORP_CREDIT: actions.CALL_SUPPLEMENT_CORP_CREDIT,
      RESET_SUPPLEMENT_CORP_CREDIT: actions.RESET_SUPPLEMENT_CORP_CREDIT,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_SUPPLEMENT_CORP_CREDIT,
      assetOrders: props.ASSET_ORDERS,
      assetUsers: props.ASSET_USERS, createAssetOrder: props.CALL_SUPPLEMENT_CORP_CREDIT,
      resetMessage: props.RESET_MESSAGE, message: props.MESSAGE, setMessage: props.SET_MESSAGE,
      resetAssetOrder: props.RESET_SUPPLEMENT_CORP_CREDIT, orgCodes: props.ORG_CODES, ...propsExtension
    })
  },
  FundSupplyPlanPage: {
    subentry: "fund_supply_plan",
    component: FundSupplyPlan,
    mapStateToProps: (state, ownProps) => ({
      FUND_SUPPLY: state.fundSupply,
    }),
    mapDispatchToProps: {
      CALL_FUND_SUPPLY_WEEKLY: actions.CALL_FUND_SUPPLY_WEEKLY,
      CALL_FUND_SUPPLY_DAILY: actions.CALL_FUND_SUPPLY_DAILY,
      CALL_FUND_SUPPLY_REQUIRE: actions.CALL_FUND_SUPPLY_REQUIRE,
      CALL_FUND_SUPPLY_COLLECT: actions.CALL_FUND_SUPPLY_COLLECT,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      fundSupply: props.FUND_SUPPLY,
      getWeeklyData: props.CALL_FUND_SUPPLY_WEEKLY,
      getDailyData: props.CALL_FUND_SUPPLY_DAILY,
      getAssetData: props.CALL_FUND_SUPPLY_REQUIRE,
      getFundData: props.CALL_FUND_SUPPLY_COLLECT,
      ...propsExtension
    })
  },
  LoginLogsPage: {
    subentry: "login_logs",
    component: LoginLogs,
    mapStateToProps: (state, ownProps) => ({
      LOGIN_LOGS: state.loginLogs
    }),
    mapDispatchToProps: {
      CALL_LOGIN_LOG: actions.CALL_LOGIN_LOG,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION, data: props.LOGIN_LOGS, searcher: props.CALL_LOGIN_LOG, dictionary: props.DICTIONARY,
      resetMessage: props.RESET_MESSAGE, ...propsExtension
    })
  },
  OperTableLogsPage: {
    subentry: "oper_table_logs",
    component: OperTableLogs,
    mapStateToProps: (state, ownProps) => ({
      OPER_TABLE_LOGS: state.operTableLogs
    }),
    mapDispatchToProps: {
      CALL_OPER_TABLE_LOG_SEARCH: actions.CALL_OPER_TABLE_LOG_SEARCH,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION, data: props.OPER_TABLE_LOGS, searcher: props.CALL_OPER_TABLE_LOG_SEARCH, dictionary: props.DICTIONARY,
      resetMessage: props.RESET_MESSAGE, ...propsExtension
    })
  },
  PlatformUseFeePage: {
    subentry: "platform_use_fee",
    component: PlatformUseFee,
    mapStateToProps: (state, ownProps) => ({
      PLATFORM_USE_FEE: state.platformUseFee
    }),
    mapDispatchToProps: {
      CALL_PLATFORM_USE_FEE_BILL_SEARCH: actions.CALL_PLATFORM_USE_FEE_BILL_SEARCH,
      CALL_PLATFORM_USE_FEE_BILL_REDUCE: actions.CALL_PLATFORM_USE_FEE_BILL_REDUCE,
      CALL_PLATFORM_USE_FEE_PAY_SEARCH: actions.CALL_PLATFORM_USE_FEE_PAY_SEARCH,
      CALL_PLATFORM_USE_FEE_PAY_ADD: actions.CALL_PLATFORM_USE_FEE_PAY_ADD,
      CALL_PLATFORM_USE_FEE_FEE_SEARCH: actions.CALL_PLATFORM_USE_FEE_FEE_SEARCH,
      CALL_PLATFORM_USE_FEE_FEE_UPDATE: actions.CALL_PLATFORM_USE_FEE_FEE_UPDATE,
      CALL_PLATFORM_USE_FEE_EMAIL_SEARCH: actions.CALL_PLATFORM_USE_FEE_EMAIL_SEARCH,
      CALL_PLATFORM_USE_FEE_PAY_NOTICE: actions.CALL_PLATFORM_USE_FEE_PAY_NOTICE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      data: props.PLATFORM_USE_FEE,
      billSearcher: props.CALL_PLATFORM_USE_FEE_BILL_SEARCH,
      billReducer: props.CALL_PLATFORM_USE_FEE_BILL_REDUCE,
      paySearcher: props.CALL_PLATFORM_USE_FEE_PAY_SEARCH,
      payAdder: props.CALL_PLATFORM_USE_FEE_PAY_ADD,
      feeSearcher: props.CALL_PLATFORM_USE_FEE_FEE_SEARCH,
      feePatternUpdater: props.CALL_PLATFORM_USE_FEE_FEE_UPDATE,
      mailSearcher: props.CALL_PLATFORM_USE_FEE_EMAIL_SEARCH,
      payNoticer: props.CALL_PLATFORM_USE_FEE_PAY_NOTICE,
      dictionary: props.DICTIONARY,
      resetMessage: props.RESET_MESSAGE,
      messageSetter: props.SET_MESSAGE,
      ...propsExtension
    })
  },
  OrdersPage: {
    subentry: "orders",
    component: Orders,
    mapStateToProps: (state, ownProps) => ({
      ORDERS: state.orders,
      ORDER_REPAYMENT: state.orderRepayment,
      ORDER_PAYMENT: state.orderPayment,
      ORDER_ADVANCE: state.orderAdvance,
      ORDER_ACCOUNT: state.orderAccount,
      TYPE: Selectors.getUserType(state),
      CONTRACTTYPE:Selectors.getOrderContractType(state),
    }),
    mapDispatchToProps: {
      CALL_ORDER: actions.CALL_ORDER,
      CALL_ORDER_REPAYMENT: actions.CALL_ORDER_REPAYMENT,
      CALL_ORDER_PAYMENT: actions.CALL_ORDER_PAYMENT,
      CALL_ORDER_ADVANCE: actions.CALL_ORDER_ADVANCE,
      CALL_ORDER_ACCOUNT: actions.CALL_ORDER_ACCOUNT,
      CALL_ORDER_VOUCHER: actions.CALL_ORDER_VOUCHER,
      CALL_ORDER_CONTRACT: actions.CALL_ORDER_CONTRACT,
      CALL_ORDER_SERVICE: actions.CALL_ORDER_SERVICE,
      CALL_ORDER_CREDIT: actions.CALL_ORDER_CREDIT,
      RESET_ORDER_REPAYMENT: actions.RESET_ORDER_REPAYMENT,
      RESET_ORDER_PAYMENT: actions.RESET_ORDER_PAYMENT,
      RESET_ORDER_ADVANCE: actions.RESET_ORDER_ADVANCE,
      RESET_ORDER_ACCOUNT: actions.RESET_ORDER_ACCOUNT,
      RESET_ORDER_CONTRACT: actions.RESET_ORDER_CONTRACT,
      RESET_ORDER_SERVICE: actions.RESET_ORDER_SERVICE,
      RESET_ORDER_VOUCHER: actions.RESET_ORDER_VOUCHER,
      RESET_ORDER_CREDIT: actions.RESET_ORDER_CREDIT,
      CALL_FILTER_ORDER_VOUCHER: actions.CALL_FILTER_ORDER_VOUCHER,
      RESET_FILTERED_ORDER_VOUCHER: actions.RESET_FILTERED_ORDER_VOUCHER,
      RESET_ORDER_UPLOAD_DETAIL: actions.RESET_ORDER_UPLOAD_DETAIL,
      CALL_ORDER_CHECK_RESULT_MATCH: actions.CALL_ORDER_CHECK_RESULT_MATCH,
      CALL_ORDER_CHECK_RESULT_CREATE: actions.CALL_ORDER_CHECK_RESULT_CREATE,
      CALL_ORDER_ACCOUNT_DETAIL_MATCH: actions.CALL_ORDER_ACCOUNT_DETAIL_MATCH,
      CALL_ORDER_ACCOUNT_DETAIL_CREATE: actions.CALL_ORDER_ACCOUNT_DETAIL_CREATE,
      CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH: actions.CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH,
      CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE: actions.CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE,
      CALL_SIMPLY_LOG_IT: actions.CALL_SIMPLY_LOG_IT,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      orders: props.ORDERS, searcher: props.CALL_ORDER, orderRepayment: props.ORDER_REPAYMENT,
      resetOrderRepayment: props.RESET_ORDER_REPAYMENT, orderRepaymentSearcher: props.CALL_ORDER_REPAYMENT,
      orderPayment: props.ORDER_PAYMENT, orderPaymentSearcher: props.CALL_ORDER_PAYMENT,
      orderContractSearcher: props.CALL_ORDER_CONTRACT, orderVoucherSearcher: props.CALL_ORDER_VOUCHER,
      orderServiceSearcher: props.CALL_ORDER_SERVICE, filterOrderVoucherSearcher: props.CALL_FILTER_ORDER_VOUCHER,
      resetFilteredOrderVoucher: props.RESET_FILTERED_ORDER_VOUCHER,
      resetOrderPayment: props.RESET_ORDER_PAYMENT, orderAdvance: props.ORDER_ADVANCE,
      orderAdvanceSearcher: props.CALL_ORDER_ADVANCE, resetOrderAdvance: props.RESET_ORDER_ADVANCE,
      orderAccount: props.ORDER_ACCOUNT, orderAccountSearcher: props.CALL_ORDER_ACCOUNT,
      resetOrderAccount: props.RESET_ORDER_ACCOUNT, resetOrderContract: props.RESET_ORDER_CONTRACT,
      resetOrderService: props.RESET_ORDER_SERVICE,
      resetOrderVoucher: props.RESET_ORDER_VOUCHER, orderCreditSearcher: props.CALL_ORDER_CREDIT,
      resetOrderCredit: props.RESET_ORDER_CREDIT,
      contractSupplymentMatcher: props.CALL_ORDER_CONTRACT_SUPPLYMENT_MATCH,
      contractSupplymentCreator: props.CALL_ORDER_CONTRACT_SUPPLYMENT_CREATE,
      checkResultMatcher: props.CALL_ORDER_CHECK_RESULT_MATCH,
      checkResultCreator: props.CALL_ORDER_CHECK_RESULT_CREATE, accountDetailMatcher: props.CALL_ORDER_ACCOUNT_DETAIL_MATCH,
      accountDetailCreator: props.CALL_ORDER_ACCOUNT_DETAIL_CREATE, resetOrderUploadDetail: props.RESET_ORDER_UPLOAD_DETAIL,
      type: props.TYPE,
      contractType: props.CONTRACTTYPE,
      simplyLogIt: props.CALL_SIMPLY_LOG_IT,
      dictionary: props.DICTIONARY, _session: props._SESSION, messageSetter: props.SET_MESSAGE, ...propsExtension
    })
  },
  ProfilePage: {
    subentry: "profile",
    component: Profile,
    mapDispatchToProps: {
      CALL_USERINFO: actions.CALL_USERINFO,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, dictionary: props.DICTIONARY, callUpdateUser: props.CALL_USERINFO,
      resetMessage: props.RESET_MESSAGE, ...propsExtension
    })
  },
  RepaymentsPage: {
    subentry: "repayment",
    component: Repayment,
    mapStateToProps: (state, ownProps) => ({
      REPAYMENT: state.repayment,
      TYPE: Selectors.getUserType(state)
    }),
    mapDispatchToProps: {
      CALL_REPAYMENT: actions.CALL_REPAYMENT,
      CALL_REPAYMENT_UPDATE: actions.CALL_REPAYMENT_UPDATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      repayment: props.REPAYMENT, searcher: props.CALL_REPAYMENT, statusUpdater: props.CALL_REPAYMENT_UPDATE,
      _session: props._SESSION, type: props.TYPE, dictionary: props.DICTIONARY,
      messageSetter: props.SET_MESSAGE, ...propsExtension
    })
  },
  RequirementPlanPage: {
    subentry: "requirement_plan",
    component: RequirementPlan,
    mapStateToProps: (state, ownProps) => ({
      REQUIRE: state.require,
    }),
    mapDispatchToProps: {
      CALL_REQWEEK: actions.CALL_REQWEEK,
      CALL_REQWEEK_UPDATE: actions.CALL_REQWEEK_UPDATE,
      CALL_REQWEEK_HISTORY: actions.CALL_REQWEEK_HISTORY,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      require: props.REQUIRE,
      searchData: props.CALL_REQWEEK,
      save: props.CALL_REQWEEK_UPDATE,
      getHistory: props.CALL_REQWEEK_HISTORY,
      ...propsExtension
    })
  },
  DistributionPlan: {
    subentry: ["requirement_plan_new", "collection_plan_new"],
    component: RequirementPlanNew,
    mapStateToProps: (state, ownProps) => ({
      DISTRIPLAN: state.distriPlan,
      DICDEADLINELIST: state.dictionary.deadlineList
    }),
    mapDispatchToProps: {
      CALL_DISTRIPLAN: actions.CALL_DISTRIPLAN,
      CALL_DISTRIPLAN_UPDATE: actions.CALL_DISTRIPLAN_UPDATE,
      CALL_DISTRIPLAN_HISTORY: actions.CALL_DISTRIPLAN_HISTORY,
      CALL_USER_ATTRIBUTE_QUERY: actions.CALL_USER_ATTRIBUTE_QUERY,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      distriPlan: props.DISTRIPLAN,
      searchData: props.CALL_DISTRIPLAN,
      dicDeadlineList: props.DICDEADLINELIST,
      save: props.CALL_DISTRIPLAN_UPDATE,
      getHistory: props.CALL_DISTRIPLAN_HISTORY,
      getUserSetting: props.CALL_USER_ATTRIBUTE_QUERY,
      ...propsExtension
    })
  },
  StatisticsPage: {
    subentry: ['fund_collection_daily', 'fund_supply_daily', 'fund_collection_weekly', 'fund_supply_weekly', 'fund_collection_monthly', 'fund_supply_monthly'],
    component: Statistics,
    mapStateToProps: (state, ownProps) => ({
      FUND_STATISTICS: state.fundStatistics,
    }),
    mapDispatchToProps: {
      CALL_FUND_STATISTICS_TOTAL: actions.CALL_FUND_STATISTICS_TOTAL,
      CALL_FUND_STATISTICS_FUND_ASSET: actions.CALL_FUND_STATISTICS_FUND_ASSET,
      CALL_FUND_STATISTICS_DEADLINE: actions.CALL_FUND_STATISTICS_DEADLINE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      pathname: props.location.pathname,
      fundStatistics: props.FUND_STATISTICS,
      getTotalList: props.CALL_FUND_STATISTICS_TOTAL,
      getFundStatisticsFundOrAsset: props.CALL_FUND_STATISTICS_FUND_ASSET,
      getFundStatisticsDeadline: props.CALL_FUND_STATISTICS_DEADLINE,
      ...propsExtension
    })
  },
  AfterRepaymentStatisticsPage: {
    subentry: 'after-repayment-statistics',
    component: AfterRepaymentStatistics,
    mapStateToProps: (state, ownProps) => ({
      statAfterRepay: state.afterRepaymentStatistics,
    }),
    mapDispatchToProps: {
      search: actions.CALL_AFTER_REPAYMENT_STATISTICS
    }
  },
  SettleMethodPage: {
    subentry: 'settle_method',
    component: SettleMethod,
    mapStateToProps: (state, ownProps) => ({
      settleMethod: state.settleMethod,
      interestModeList: Selectors.getAssetFundInterestMode(state),
      serviceModeList: Selectors.getAssetFundServiceMode(state),
      userFromList: Selectors.getUserFrom(state),
    }),
    mapDispatchToProps: {
      search: actions.CALL_SETTLE_METHOD_SEARCH,
      update: actions.CALL_SETTLE_METHOD_UPDATE
    }
  },
/*  AccountInfoPage: {
    subentry: 'account_info',
    component: AccountInfo,
    mapStateToProps: (state, ownProps) => ({
      MENUS: state.managedMenus,
    }),
    mapSelectorToProps: (props, propsExtension) => ({...props, ...propsExtension})
  },*/
  BalanceStatisticsPage: {
    subentry: 'balance_statistics',
    component: BalanceStatistics,
    mapStateToProps: (state, ownProps) => ({
      balanceStatistics: state.balanceStatistics
    }),
    mapDispatchToProps: {
      search: actions.CALL_BALANCE_STATISTICS_SEARCH,
      searchTab4: actions.CALL_BALANCE_STATISTICS_SEARCH_TAB4,
    }
  },
  RepaymentPlanPage: {
    subentry: 'repayment_plan',
    component: RepaymentPlan,
    mapStateToProps: (state, ownProps) => ({
      data: state.repaymentPlan
    }),
    mapDispatchToProps: {
      CALL_REPAYMENT_PLAN: actions.CALL_REPAYMENT_PLAN,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      data: props.data,
      searcher: props.CALL_REPAYMENT_PLAN,
      dictionary: props.DICTIONARY,
      resetMessage: props.RESET_MESSAGE,
      _session: props._SESSION,
      ...propsExtension
    })
  },
  UserManagementPage: {
    subentry: "user_management",
    component: UserManagement,
    mapStateToProps: (state, ownProps) => ({
      USERS: state.managedUsers,
      USER_TYPES: Selectors.getUserTypes(state)
    }),
    mapDispatchToProps: {
      CALL_USER_MANAGEMENT_QUERY: actions.CALL_USER_MANAGEMENT_QUERY,
      CALL_USER_MANAGEMENT_CREATE: actions.CALL_USER_MANAGEMENT_CREATE,
      CALL_USER_MANAGEMENT_DELETE: actions.CALL_USER_MANAGEMENT_DELETE,
      CALL_USER_MANAGEMENT_UPDATE: actions.CALL_USER_MANAGEMENT_UPDATE,
      CALL_USER_MANAGEMENT_AUTH_SEARCH: actions.CALL_USER_MANAGEMENT_AUTH_SEARCH,
      CALL_USER_MANAGEMENT_AUTH: actions.CALL_USER_MANAGEMENT_AUTH,
      CALL_USER_MANAGEMENT_ATTRIBUTE_FIND: actions.CALL_USER_MANAGEMENT_ATTRIBUTE_FIND,
      CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE: actions.CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      users: props.USERS, searcher: props.CALL_USER_MANAGEMENT_QUERY, updater: props.CALL_USER_MANAGEMENT_UPDATE,
      creater: props.CALL_USER_MANAGEMENT_CREATE, userTypes: props.USER_TYPES,
      deleter: props.CALL_USER_MANAGEMENT_DELETE, dictionary: props.DICTIONARY, _session: props._SESSION,
      authSearcher: props.CALL_USER_MANAGEMENT_AUTH_SEARCH,
      auther: props.CALL_USER_MANAGEMENT_AUTH,
      userAttributeSearcher: props.CALL_USER_MANAGEMENT_ATTRIBUTE_FIND,
      userAttributeUpdater: props.CALL_USER_MANAGEMENT_ATTRIBUTE_UPDATE,
      messageSetter: props.SET_MESSAGE,
      callDic: props.CALL_DIC,
      messageResetter: props.RESET_MESSAGE, ...propsExtension
    })
  },
  SubUserManagementPage: {
    subentry: "sub_user_management",
    component: SubUserManagement,
    mapStateToProps: (state, ownProps) => ({
      SUB_USERS: state.managedSubUsers,
      USER_TYPES: Selectors.getUserTypes(state),
      RESTRICTION: Selectors.getRestrictedRelatedOrgs(state),
      ROLE_LIST: state.subUserManagementRole,
      ROLES: state.managedRoles,

    }),
    mapDispatchToProps: {
      CALL_SUB_USER_MANAGEMENT_QUERY: actions.CALL_SUB_USER_MANAGEMENT_QUERY,
      CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY: actions.CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY,
      CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE: actions.CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE,
      CALL_SUB_USER_MANAGEMENT_CREATE: actions.CALL_SUB_USER_MANAGEMENT_CREATE,
      CALL_SUB_USER_MANAGEMENT_DELETE: actions.CALL_SUB_USER_MANAGEMENT_DELETE,
      CALL_SUB_USER_MANAGEMENT_UPDATE: actions.CALL_SUB_USER_MANAGEMENT_UPDATE,
      CALL_SUB_USER_MANAGEMENT_AUTH_SEARCH: actions.CALL_SUB_USER_MANAGEMENT_AUTH_SEARCH,
      CALL_SUB_USER_MANAGEMENT_AUTH: actions.CALL_SUB_USER_MANAGEMENT_AUTH,
      CALL_SUB_USER_MANAGEMENT_ROLE_QUERY: actions.CALL_SUB_USER_MANAGEMENT_ROLE_QUERY,
      CALL_ROLE_MANAGEMENT_FUNC_SEARCH: actions.CALL_ROLE_MANAGEMENT_FUNC_SEARCH,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      subUsers: props.SUB_USERS,
      restriction: props.RESTRICTION,
      searcher: props.CALL_SUB_USER_MANAGEMENT_QUERY,
      restrictionSearcher: props.CALL_SUB_USER_MANAGEMENT_RESTRICTION_QUERY,
      updater: props.CALL_SUB_USER_MANAGEMENT_UPDATE,
      creater: props.CALL_SUB_USER_MANAGEMENT_CREATE,
      restrictionUpdater: props.CALL_SUB_USER_MANAGEMENT_RESTRICTION_UPDATE,
      deleter: props.CALL_SUB_USER_MANAGEMENT_DELETE,
      authSearcher: props.CALL_SUB_USER_MANAGEMENT_AUTH_SEARCH,
      auther: props.CALL_SUB_USER_MANAGEMENT_AUTH,
      roleSearch: props.CALL_SUB_USER_MANAGEMENT_ROLE_QUERY,
      roleList: props.ROLE_LIST,
      roles: props.ROLES,
      funcSearcher: props.CALL_ROLE_MANAGEMENT_FUNC_SEARCH,
      dictionary: props.DICTIONARY,
      _session: props._SESSION,
      userTypes: props.USER_TYPES,
      messageSetter: props.SET_MESSAGE,
      messageResetter: props.RESET_MESSAGE, ...propsExtension
    })
  },
  MenuManagementPage: {
    subentry: "menu_management",
    component: MenuManagement,
    mapStateToProps: (state, ownProps) => ({
      MENUS: state.managedMenus,
    }),
    mapDispatchToProps: {
      CALL_MENU_MANAGEMENT_QUERY: actions.CALL_MENU_MANAGEMENT_QUERY,
      CALL_MENU_MANAGEMENT_CREATE: actions.CALL_MENU_MANAGEMENT_CREATE,
      CALL_MENU_MANAGEMENT_DELETE: actions.CALL_MENU_MANAGEMENT_DELETE,
      CALL_MENU_MANAGEMENT_UPDATE: actions.CALL_MENU_MANAGEMENT_UPDATE,
      CALL_MENU_MANAGEMENT_UP: actions.CALL_MENU_MANAGEMENT_UP,
      CALL_MENU_MANAGEMENT_DOWN: actions.CALL_MENU_MANAGEMENT_DOWN,
      CALL_MENU_MANAGEMENT_DETAIL: actions.CALL_MENU_MANAGEMENT_DETAIL,
    },
    mapSelectorToProps: (props, propsExtension) => ({...props, ...propsExtension})
  },
  CooperatorInfoPage: {
    subentry: "cooperator_info",
    component: CooperatorInfo,
    mapStateToProps: (state, ownProps) => ({
      COOPERATORS: state.cooperatorInfo,
    }),
    mapDispatchToProps: {
      CALL_COOPERATOR_INFO_QUERY: actions.CALL_COOPERATOR_INFO_QUERY,
      CALL_COOPERATOR_INFO_CREATE: actions.CALL_COOPERATOR_INFO_CREATE,
      CALL_COOPERATOR_INFO_DELETE: actions.CALL_COOPERATOR_INFO_DELETE,
      CALL_COOPERATOR_INFO_UPDATE: actions.CALL_COOPERATOR_INFO_UPDATE,
      CALL_DIC: actions.CALL_DIC,
      CALL_COOPERATOR_INFO_SEARCH_RELATION: actions.CALL_COOPERATOR_INFO_SEARCH_RELATION,
      CALL_COOPERATOR_INFO_ADD_RELATION: actions.CALL_COOPERATOR_INFO_ADD_RELATION,
      CALL_COOPERATOR_INFO_SEARCH_ADDED_RELATION: actions.CALL_COOPERATOR_INFO_SEARCH_ADDED_RELATION,
      CALL_COOPERATOR_INFO_SUPPLY_INFO: actions.CALL_COOPERATOR_INFO_SUPPLY_INFO,
    },
    mapSelectorToProps: (props, propsExtension) => ({...props, ...propsExtension})
  },
  RoleManagementPage: {
    subentry: "role_management",
    component: RoleManagement,
    mapStateToProps: (state, ownProps) => ({
      ROLES: state.managedRoles,
      ROLE_TYPE: Selectors.getUserTypes(state)
    }),
    mapDispatchToProps: {
      CALL_ROLE_MANAGEMENT_QUERY: actions.CALL_ROLE_MANAGEMENT_QUERY,
      CALL_ROLE_MANAGEMENT_CREATE: actions.CALL_ROLE_MANAGEMENT_CREATE,
      CALL_ROLE_MANAGEMENT_DELETE: actions.CALL_ROLE_MANAGEMENT_DELETE,
      CALL_ROLE_MANAGEMENT_UPDATE: actions.CALL_ROLE_MANAGEMENT_UPDATE,
      CALL_ROLE_MANAGEMENT_FUNC_SEARCH: actions.CALL_ROLE_MANAGEMENT_FUNC_SEARCH,
      CALL_ROLE_MANAGEMENT_FUNC_UPDATE: actions.CALL_ROLE_MANAGEMENT_FUNC_UPDATE,
      CALL_ROLE_MANAGEMENT_USER_SEARCH: actions.CALL_ROLE_MANAGEMENT_USER_SEARCH,
      CALL_ROLE_MANAGEMENT_USER_ADD_SEARCH: actions.CALL_ROLE_MANAGEMENT_USER_ADD_SEARCH,
      CALL_ROLE_MANAGEMENT_USER_ADD: actions.CALL_ROLE_MANAGEMENT_USER_ADD,
      CALL_ROLE_MANAGEMENT_USER_DELETE: actions.CALL_ROLE_MANAGEMENT_USER_DELETE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      roles: props.ROLES,
      searcher: props.CALL_ROLE_MANAGEMENT_QUERY,
      updater: props.CALL_ROLE_MANAGEMENT_UPDATE,
      creater: props.CALL_ROLE_MANAGEMENT_CREATE,
      deleter: props.CALL_ROLE_MANAGEMENT_DELETE,
      funcSearcher: props.CALL_ROLE_MANAGEMENT_FUNC_SEARCH,
      funcUpdater: props.CALL_ROLE_MANAGEMENT_FUNC_UPDATE,
      userSearcher: props.CALL_ROLE_MANAGEMENT_USER_SEARCH,
      userAddSearcher: props.CALL_ROLE_MANAGEMENT_USER_ADD_SEARCH,
      userAdder: props.CALL_ROLE_MANAGEMENT_USER_ADD,
      userDeleter: props.CALL_ROLE_MANAGEMENT_USER_DELETE,
      roleTypes: props.ROLE_TYPE,
      dictionary: props.DICTIONARY, _session: props._SESSION,
      messageSetter: props.SET_MESSAGE,
      messageResetter: props.RESET_MESSAGE,
      ...propsExtension
    })
  },
  CooperatorApiAssetPage: {
    subentry: "cooperator_api_asset",
    component: CooperatorApiAsset,
    mapStateToProps: (state, ownProps) => ({
      COOPERATOR_API_ASSET: state.cooperatorApiAsset,
    }),
    mapDispatchToProps: {
      CALL_COOPERATOR_API_ASSET_QUERY: actions.CALL_COOPERATOR_API_ASSET_QUERY,
      CALL_COOPERATOR_API_ASSET_DELETE: actions.CALL_COOPERATOR_API_ASSET_DELETE,
      CALL_COOPERATOR_API_ASSET_UPDATE: actions.CALL_COOPERATOR_API_ASSET_UPDATE,
      CALL_COOPERATOR_API_ASSET_CREATE: actions.CALL_COOPERATOR_API_ASSET_CREATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      data: props.COOPERATOR_API_ASSET,
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      searcher: props.CALL_COOPERATOR_API_ASSET_QUERY,
      updater: props.CALL_COOPERATOR_API_ASSET_UPDATE,
      deleter: props.CALL_COOPERATOR_API_ASSET_DELETE,
      creater: props.CALL_COOPERATOR_API_ASSET_CREATE,
      messageSetter: props.SET_MESSAGE,
      messageResetter: props.RESET_MESSAGE,
      ...propsExtension
    })
  },
  CooperatorApiFundPage: {
    subentry: "cooperator_api_fund",
    component: CooperatorApiFund,
    mapStateToProps: (state, ownProps) => ({
      COOPERATOR_API_FUND: state.cooperatorApiFund,
    }),
    mapDispatchToProps: {
      CALL_COOPERATOR_API_FUND_QUERY: actions.CALL_COOPERATOR_API_FUND_QUERY,
      CALL_COOPERATOR_API_FUND_DELETE: actions.CALL_COOPERATOR_API_FUND_DELETE,
      CALL_COOPERATOR_API_FUND_UPDATE: actions.CALL_COOPERATOR_API_FUND_UPDATE,
      CALL_COOPERATOR_API_FUND_CREATE: actions.CALL_COOPERATOR_API_FUND_CREATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      data: props.COOPERATOR_API_FUND,
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      searcher: props.CALL_COOPERATOR_API_FUND_QUERY,
      updater: props.CALL_COOPERATOR_API_FUND_UPDATE,
      deleter: props.CALL_COOPERATOR_API_FUND_DELETE,
      creater: props.CALL_COOPERATOR_API_FUND_CREATE,
      messageSetter: props.SET_MESSAGE,
      messageResetter: props.RESET_MESSAGE,
      ...propsExtension
    })
  },
  UserAttributePage: {
    subentry: "user_attribute",
    component: UserAttribute,
    mapStateToProps: (state, ownProps) => ({
      USER_ATTRIBUTE: state.userAttribute,
      DEADLINE: state.dictionary.deadlineList,
    }),
    mapDispatchToProps: {
      CALL_USER_ATTRIBUTE_QUERY: actions.CALL_USER_ATTRIBUTE_QUERY,
      CALL_USER_ATTRIBUTE_SAVE: actions.CALL_USER_ATTRIBUTE_SAVE,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      userAttribute: props.USER_ATTRIBUTE,
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      deadlineList: props.DEADLINE,
      searcher: props.CALL_USER_ATTRIBUTE_QUERY,
      saver: props.CALL_USER_ATTRIBUTE_SAVE,
      setMessage: props.SET_MESSAGE,
      messageResetter: props.RESET_MESSAGE,
      ...propsExtension
    })
  },
  UserAttributeManagementPage: {
    subentry: "user_attribute_management",
    component: UserAttributeManagement,
    mapStateToProps: (state, ownProps) => ({
      USER_ATTRIBUTE_MANAGEMENT: state.userAttributeManagement,
      DEADLINE: state.dictionary.deadlineList,
    }),
    mapDispatchToProps: {
      CALL_USER_ATTRIBUTE_MANAGEMENT_QUERY: actions.CALL_USER_ATTRIBUTE_MANAGEMENT_QUERY,

    },
    mapSelectorToProps: (props, propsExtension) => ({
      data: props.USER_ATTRIBUTE_MANAGEMENT,
      _session: props._SESSION,
      dictionary: props.DICTIONARY,
      deadlineList: props.DEADLINE,
      searcher: props.CALL_USER_ATTRIBUTE_MANAGEMENT_QUERY,
      setMessage: props.SET_MESSAGE,
      messageResetter: props.RESET_MESSAGE,
      ...propsExtension
    })
  },
  FinanceLoanPage: {
    subentry: "finance_loan",
    component: FinanceLoan,
    mapStateToProps: (state, ownProps) => ({
      financeLoan: state.financeLoan,
      assetRelatedOrgCode: Selectors.getRelatedAssetOrgsWithUserFrom(state)
    }),
    mapDispatchToProps: {
      searcher: actions.CALL_FINANCE_LOAN_SEARCH,
      reset: actions.RESET_FINANCE_LOAN,
      appender: actions.CALL_FINANCE_LOAN_CREATE_HISTORICAL_DETAIL,
      creator: actions.CALL_FINANCE_LOAN_CREATE_NEW_DETAIL,
      matcher: actions.CALL_FINANCE_LOAN_MATCH_DETAIL,
      changeStatus: actions.CALL_FINANCE_LOAN_CHANGE_STATUS,
    }
  },
  FinanceRepaymentPage: {
    subentry: "finance_repayment",
    component: FinanceRepayment,
    mapStateToProps: (state, ownProps) => ({financeRepayment: state.financeRepayment,}),
    mapDispatchToProps: {
      searcher: actions.CALL_FINANCE_REPAYMENT_SEARCH,
      reset: actions.RESET_FINANCE_REPAYMENT,
      creator: actions.CALL_FINANCE_REPAYMENT_CREATE_NEW_DETAIL,
      matcher: actions.CALL_FINANCE_REPAYMENT_MATCH_DETAIL,
      changeStatus: actions.CALL_FINANCE_REPAYMENT_CHANGE_STATUS,
    }
  },
  FinanceServiceSettlementPage: {
    subentry: "finance_service_settlement",
    component: FinanceServiceSettlement,
    mapStateToProps: (state, ownProps) => ({financeService: state.financeService,}),
    mapDispatchToProps: {
      searcher: actions.CALL_FINANCE_SERVICE_SEARCH,
      reset: actions.RESET_FINANCE_SERVICE,
      creator: actions.CALL_FINANCE_SERVICE_CREATE_NEW_DETAIL,
      matcher: actions.CALL_FINANCE_SERVICE_MATCH_DETAIL,
      changeStatus: actions.CALL_FINANCE_SERVICE_SETTLEMENT_CHANGE_STATUS,
    }
  },
  AfterRepaymentOrderPage: {
    subentry: "after_repayment_order",
    component: AfterRepaymentOrder,
    mapStateToProps: (state, ownProps) => ({afterRepaymentOrder: state.afterRepaymentOrder,}),
    mapDispatchToProps: {
      searcher: actions.CALL_AFTER_REPAYMENT_ORDER_SEARCH,
      reset: actions.RESET_AFTER_REPAYMENT_ORDER,
      creator: actions.CALL_AFTER_REPAYMENT_ORDER_CREATE_NEW_DETAIL,
      matcher: actions.CALL_AFTER_REPAYMENT_ORDER_MATCH_DETAIL,
      changeStatus: actions.CALL_AFTER_REPAYMENT_ORDER_CHANGE_STATUS,
    }
  },
  PersonalCertificatePage: {
    subentry: "personal_certificate",
    component: PersonalCertificate,
    mapStateToProps: (state, ownProps) => ({
      CERTIFICATE: state.certificate,
    }),
    mapDispatchToProps: {
      CALL_CERTIFICATE_HOST_GET: actions.CALL_CERTIFICATE_HOST_GET,
      RESET_CERTIFICATE: actions.RESET_CERTIFICATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({...props, ...propsExtension})
  },
  EnterpriseCertificatePage: {
    subentry: "enterprise_certificate",
    component: EnterpriseCertificate,
    mapStateToProps: (state, ownProps) => ({
      CERTIFICATE: state.certificate,
    }),
    mapDispatchToProps: {
      CALL_CERTIFICATE_HOST_GET: actions.CALL_CERTIFICATE_HOST_GET,
      RESET_CERTIFICATE: actions.RESET_CERTIFICATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({...props, ...propsExtension})
  },
  MixedCertificatePage: {
    subentry: "mixed_certificate",
    component: MixedCertificate,
    mapStateToProps: (state, ownProps) => ({
      CERTIFICATE: state.certificate,
    }),
    mapDispatchToProps: {
      CALL_CERTIFICATE_HOST_GET: actions.CALL_CERTIFICATE_HOST_GET,
      RESET_CERTIFICATE: actions.RESET_CERTIFICATE,
    },
    mapSelectorToProps: (props, propsExtension) => ({...props, ...propsExtension})
  },
  EnterprisePublicityPage: {
    subentry: 'enterprise_publicity',
    component: EnterprisePublicity,
    mapStateToProps: (state, ownProps) => ({
      publicityList: state.enterprisePublicity
    }),
    mapDispatchToProps: {
      search: actions.CALL_ENTERPRISE_PUBLICITY_SEARCH,
      searchExport: actions.CALL_ENTERPRISE_PUBLICITY_SEARCH_EXPORT,
    }
  },
  PersonalPublicity: {
    subentry: 'personal_publicity',
    component: PersonalPublicity,
    mapStateToProps: (state, ownProps) => ({
      publicityList: state.personalPublicity,
    }),
    mapDispatchToProps: {
      search: actions.CALL_PERSONAL_PUBLICITY_SEARCH,
      searchExport: actions.CALL_PERSONAL_PUBLICITY_SEARCH_EXPORT,
    }
  },
  SearchEnterprisePublicityDetailPage: {
    subentry: "enterprise_publicity.search_enterprise_publicity_detail",
    component: SearchPublicityDetail,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.enterprisePublicityDetail,
      PARENT_PATH: "enterprisePublicity"
    }),
    mapDispatchToProps: {
      CALL_MATCH_ENTERPRISE_PUBLICITY: actions.CALL_MATCH_ENTERPRISE_PUBLICITY,
      CALL_CREATE_ENTERPRISE_PUBLICITY: actions.CALL_CREATE_ENTERPRISE_PUBLICITY,
      RESET_ENTERPRISE_PUBLICITY: actions.RESET_ENTERPRISE_PUBLICITY,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_ENTERPRISE_PUBLICITY,
      assetOrders: props.ASSET_ORDERS,
      parentPath: props.PARENT_PATH,
      createAssetOrder: props.CALL_CREATE_ENTERPRISE_PUBLICITY, resetMessage: props.RESET_MESSAGE,
      message: props.MESSAGE, setMessage: props.SET_MESSAGE, resetAssetOrder: props.RESET_ENTERPRISE_PUBLICITY,
      ...propsExtension
    })
  },
  SearchPersonalPublicityDetailPage: {
    subentry: "personal_publicity.search_personal_publicity_detail",
    component: SearchPersonalPublicityDetail,
    mapStateToProps: (state, ownProps) => ({
      MESSAGE: state.message,
      ASSET_ORDERS: state.personalPublicityDetail,
      PARENT_PATH: "personalPublicity"
    }),
    mapDispatchToProps: {
      CALL_MATCH_PERSONAL_PUBLICITY: actions.CALL_MATCH_PERSONAL_PUBLICITY,
      CALL_CREATE_PERSONAL_PUBLICITY: actions.CALL_CREATE_PERSONAL_PUBLICITY,
      RESET_PERSONAL_PUBLICITY: actions.RESET_PERSONAL_PUBLICITY,
    },
    mapSelectorToProps: (props, propsExtension) => ({
      session: props._SESSION, matchAssetOrder: props.CALL_MATCH_PERSONAL_PUBLICITY,
      assetOrders: props.ASSET_ORDERS,
      parentPath: props.PARENT_PATH,
      createAssetOrder: props.CALL_CREATE_PERSONAL_PUBLICITY, resetMessage: props.RESET_MESSAGE,
      message: props.MESSAGE, setMessage: props.SET_MESSAGE, resetAssetOrder: props.RESET_PERSONAL_PUBLICITY,
      ...propsExtension
    })
  },
  CooperatorAccountInfoPage: {
    subentry: "cooperator_account_info",
    component: CooperatorAccountInfo,
    mapStateToProps: (state, ownProps) => ({
      COOPERATOR_ACCOUNTS: state.cooperatorAccount,
    }),
    mapDispatchToProps: {
      CALL_COOPERATOR_ACCOUNT_INFO_QUERY: actions.CALL_COOPERATOR_ACCOUNT_INFO_QUERY,
      RESET_COOPERATOR_ACCOUNT_INFO: actions.RESET_COOPERATOR_ACCOUNT_INFO,
    },
  },
  CooperatorBusinessSpecifica: {
    subentry: "cooperator_business_specifica",
    component: CooperatorBussinessSpecifica,
    mapStateToProps: (state, ownProps) => ({
      COOPERATOR_BUSINESS_SPECIFICA: state.cooperatorBusinessSpecifica,
    }),
    mapDispatchToProps: {
      searcher: actions.CALL_COOPERATOR_BUSINESS_SPECIFICA_QUERY,
    },
  },
  WithDraw: {
    subentry: "withdraw",
    component: WithDraw,
    mapStateToProps: (state, ownProps) => ({
      withDraw: state.withDraw,
      getOrderWithdrawStatus:Selectors.getOrderWithdrawStatus(state),
    }),
    mapDispatchToProps: {
      searcher: actions.CALL_WITHDRAW,
    }
  }
}
