/*
 * @Author zhangjunjie
 * @File platformUseFeeService.js
 * @Created Date 2018-05-30 17-30
 * @Last Modified: 2018-05-30 17-30
 * @Modified By: zhangjunjie
 */

const Model = require('../super');
const dao = require('../../../dao');
const _ = require('lodash');

const {
  EdiPayBill: EdiPayBillDao,
  EdiPayEmail: EdiPayEmailDao,
  EdiPayDetail: EdiPayDetailDao,
} = dao.Edi;

const { User: UserDao, UserAttribute: UserAttributeDao } = dao.User;

class PlatformUseFeeService extends Model {
  ediPayBillCount(params = {}) {
    const {
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
    } = params;
    if (_.isEmpty(month)) {
      throw new Error('查询失败，时间参数不正确');
    }
    return EdiPayBillDao(this.info, ['asset', 'fund', 'admin']).count({
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
    });
  }
  ediPayBillQuery(params = {}) {
    const {
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
    } = params;
    if (_.isEmpty(month)) {
      throw new Error('查询失败，时间参数不正确');
    }
    return EdiPayBillDao(this.info, ['asset', 'fund', 'admin']).query({
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
    });
  }
  ediPayBillQueryByKey(params = {}) {
    const {
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
    } = params;
    if (_.isEmpty(month)) {
      throw new Error('查询失败，时间参数不正确');
    }
    return EdiPayBillDao(this.info, ['asset', 'fund', 'admin']).queryByKey({
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
    });
  }
  ediPayBillUpdate(params = {}, transaction = null) {
    const { org_code, month, order_reduce_fee } = params;
    if (_.isEmpty(org_code) || _.isEmpty(month)) {
      throw new Error('更新失败，缺少关键参数');
    }
    return EdiPayBillDao(this.info, ['admin']).nativeUpdate(
      {
        order_reduce_fee,
      },
      {
        where: {
          org_code,
          month,
        },
        transaction,
      },
    );
  }
  ediPayBillReducePreMonth(params = {}, transaction = null) {
    const { org_code, month, reduce_val } = params;

    if (_.isEmpty(org_code) || _.isEmpty(month)) {
      throw new Error('更新失败，缺少关键参数');
    }

    return EdiPayBillDao(this.info, ['admin']).ediPayBillReducePreMonth(
      { org_code, month, reduce_val: reduce_val || 0 },
      transaction,
    );
  }
  ediPayBillStatistics(params = {}) {
    const {
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
      restriction,
    } = params;
    if (_.isEmpty(month)) {
      throw new Error('查询失败，时间参数不正确');
    }
    return EdiPayBillDao(this.info, ['asset', 'fund', 'admin']).statistics({
      month,
      user_type,
      org_code,
      platform_pay_mode,
      page_index,
      restriction,
    });
  }

  ediPayBillQueryMaxMonth(params = {}) {
    const { org_code } = params;
    if (_.isEmpty(org_code)) {
      throw new Error('查询失败，机构号不正确');
    }
    return EdiPayBillDao(this.info, ['admin']).queryMaxMonth({
      org_code,
    });
  }

  ediPayBillPayFeeUpdate(params = {}, transaction = null) {
    const { org_code, pay_fee } = params;
    return EdiPayBillDao(this.info, ['asset', 'fund', 'admin']).updateFee(
      {
        org_code,
        pay_fee,
      },
      transaction,
    );
  }

  ediPayEmailAdd(params = {}, transaction = null) {
    const { org_code, email } = params;
    if (_.isEmpty(org_code) || _.isEmpty(email)) {
      throw new Error('增加失败，缺少关键参数');
    }
    return EdiPayEmailDao(this.info, [
      'asset',
      'fund',
      'admin',
    ]).dao.findOrCreate({
      where: {
        org_code,
        email,
      },
      defaults: {
        org_code,
        email,
      },
      transaction,
    });
  }

  ediPayEmailSearch(params = {}) {
    const { org_code, email } = params;
    return EdiPayEmailDao(this.info, ['asset', 'fund', 'admin']).query({
      org_code,
      email,
    });
  }

  ediPayDetailQuery(params = {}) {
    const {
      create_time_start,
      create_time_end,
      pay_date_start,
      pay_date_end,
      user_type,
      org_code,
      page_index,
    } = params;
    return EdiPayDetailDao(this.info, ['asset', 'fund', 'admin']).query({
      create_time_start,
      create_time_end,
      pay_date_start,
      pay_date_end,
      user_type,
      org_code,
      page_index,
    });
  }

  ediPayDetailCount(params = {}) {
    const {
      create_time_start,
      create_time_end,
      pay_date_start,
      pay_date_end,
      user_type,
      org_code,
    } = params;
    return EdiPayDetailDao(this.info, ['asset', 'fund', 'admin']).count({
      create_time_start,
      create_time_end,
      pay_date_start,
      pay_date_end,
      user_type,
      org_code,
    });
  }

  ediPayDetailAdd(params = {}, transaction = null) {
    const { pay_no, org_code, pay_date, pay_fee, comment } = params;
    return EdiPayDetailDao(this.info, ['asset', 'fund', 'admin']).nativeCreate(
      { pay_no, org_code, pay_date, pay_fee, comment },
      {
        transaction,
        hooks: false
      },
    );
  }

  ediFeePatternCount(params = {}) {
    const { user_type, org_code } = params;
    return UserDao(this.info, ['asset', 'fund', 'admin']).ediFeePatternCount({
      user_type,
      org_code,
    });
  }

  ediFeePatternQuery(params = {}) {
    const { user_type, org_code, page_index } = params;
    return UserDao(this.info, ['asset', 'fund', 'admin']).ediFeePatternQuery({
      user_type,
      org_code,
      page_index,
    });
  }

  userAttributeUpdateForFeePattern(params = {}, transaction = null) {
    const {
      user_id,
      platform_pay_mode,
      platform_use_rate,
      adjust_platform_use_rate,
      adjust_effect_month,
      platform_pay_scope,
    } = params;
    if (!user_id) {
      throw new Error('更新失败，缺少user_id');
    }
    return UserAttributeDao(this.info, [
      'asset',
      'fund',
      'admin',
    ]).nativeUpdateRaw(
      {
        platform_pay_mode,
        platform_use_rate,
        adjust_platform_use_rate,
        adjust_effect_month,
        platform_pay_scope,
      },
      {
        where: {
          user_id,
        },
        transaction,
      },
    );
  }

  userAttributeQueryForFeePattern(params = {}) {
    const { user_id } = params;
    if (!user_id) {
      throw new Error('更新失败，缺少user_id');
    }
    return UserAttributeDao(this.info, [
      'asset',
      'fund',
      'admin',
    ]).freePatternQueryAll({ user_id });
  }
}

module.exports = (req) => new PlatformUseFeeService(req);
