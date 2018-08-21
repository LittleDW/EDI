import { ACTIONS } from "../actions";

const afterRepaymentStatistics = (
  state = {
    loading: false,
    monthList: [],
    dayList: []
  },
  action
) => {
  const { type, response: res } = action;

  switch (type) {
    case ACTIONS.CALL_AFTER_REPAYMENT_STATISTICS.types.request:
      return { ...state, loading: true };
    case ACTIONS.CALL_AFTER_REPAYMENT_STATISTICS.types.success:
      return { ...state, loading: false, monthList: res.monthList, dayList: res.dayList };
    case ACTIONS.CALL_AFTER_REPAYMENT_STATISTICS.types.fail:
      return { ...state, loading: false, monthList: [], dayList: [] };
    default:
      return state;
  }
};

export default afterRepaymentStatistics;
