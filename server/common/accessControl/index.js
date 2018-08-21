/*
 * @Author Osborn
 * @File AccessControl.js
 * @Created Date 2018-05-14 14-55
 * @Last Modified: 2018-05-14 14-55
 * @Modified By: Osborn
 */

const _ = require('lodash');
const { Op } = require('sequelize');

const SWITCH = true;

// 针对主表的权限过滤 对在字表中的权限并不生效.
class AccessControlHookLevel {
  constructor(accessControl, accessList, userType, options = {}, db = {}) {
    this.accessControl = accessControl;
    this.accessList = accessList;
    this.options = options;
    this.db = db;
    this.userType = this.userTypeMapping(userType);
  }
  userTypeMapping(userType) {
    switch (userType) {
      case 1:
        return 'asset';
      case 2:
        return 'fund';
      default:
        return 'admin';
    }
  }
  effectiveValidate() {
    return _.indexOf(this.accessList, this.userType) > -1;
  }
  tableNameSelector() {
    const targetFields = ['asset_org_code', 'fund_org_code', 'org_code'];
    const actualFields = targetFields.filter((t) => t in this.db.tableAttributes);
    if (actualFields.length === 3) {
      throw new Error('子用户数据权限设置不完整，请再次确认。');
    }
    this.actualFields = actualFields;
  }
  // useOrRelation(condition) {
  //   if ('asset_org_code' in condition && 'fund_org_code' in condition) {
  //     const { asset_org_code, fund_org_code } = condition;
  //     delete condition.asset_org_code;
  //     delete condition.fund_org_code;
  //     const or = condition[Op.or];
  //     if (_.isEmpty(or)) {
  //       condition[Op.or] = [{ asset_org_code }, { fund_org_code }];
  //     } else {
  //       condition[Op.or].push({ asset_org_code }).push({ fund_org_code });
  //     }
  //   }
  //   return condition;
  // }
  attachWhereParams(mapData) {
    const condition = {};
    Object.keys(mapData).forEach((m) => {
      const data = mapData[m];
      if (data.length === 1) {
        [condition[m]] = data;
      } else if (data.length > 1) {
        condition[m] = { [Op.in]: data };
      }
    });
    return condition;
  }
  replaceWhereParams(where, mapData) {
    const condition = _.cloneDeep(where);
    Object.keys(mapData).forEach((m) => {
      const data = mapData[m];
      if (_.isEmpty(data)) {
        delete condition[m];
        return;
      }
      if (_.isEmpty(condition[m])) {
        condition[m] = data.length > 1 ? { [Op.in]: data } : data[0];
      } else if (_.isObject(condition[m])) {
        const params = condition[m][Op.in];
        const filtered = _.intersection(params, data);
        switch (filtered.length) {
          case 0:
            delete condition[m];
            break;
          case 1:
            [condition[m]] = filtered;
            break;
          default:
            condition[m] = { [Op.in]: filtered };
        }
      } else {
        const filtered = _.intersection([condition[m]], data);
        if (filtered.length !== 0) {
          [condition[m]] = filtered;
        } else {
          throw new Error('子用户数据权限设置不完整，请再次确认。');
        }
      }
    });
    if (
      !_.has(condition, 'asset_org_code') &&
      !_.has(condition, 'fund_org_code') &&
      !_.has(condition, 'org_code')
    ) {
      throw new Error('子用户数据权限设置不完整，请再次确认。');
    }
    return condition;
  }
  executeQuery() {
    if (!SWITCH) {
      return;
    }
    // 配置文件配置
    if (!this.effectiveValidate()) {
      return;
    }
    // session 中没有权限信息
    if (_.isNull(this.accessControl)) {
      return;
    }
    const { assetDataRestriction, fundDataRestriction } = this.accessControl;
    // 权限信息为空
    if (_.isEmpty(assetDataRestriction) && _.isEmpty(fundDataRestriction)) {
      throw new Error('子用户数据权限设置不完整，请再次确认。');
    }
    // 获取表中字段名
    this.tableNameSelector();
    let { where = {} } = this.options;
    // 表中只有且只有org_code字段
    if (this.actualFields.indexOf('org_code') > -1) {
      const accessData = [...assetDataRestriction, ...fundDataRestriction];
      if (_.isEmpty(accessData)) {
        return;
      }
      // no condition
      if (_.isEmpty(where)) {
        where = this.attachWhereParams({ org_code: accessData });
      } else {
        where = this.replaceWhereParams(where, { org_code: accessData });
      }
    } else {
      const params = {};
      if (this.actualFields.indexOf('asset_org_code') > -1) {
        params.asset_org_code = assetDataRestriction;
      }
      if (this.actualFields.indexOf('fund_org_code') > -1) {
        params.fund_org_code = fundDataRestriction;
      }
      where = this.replaceWhereParams(where, params);
    }
    this.options.where = where;
  }
}
// 手动过滤传入的asset_org_code, fund_org_code, org_code
class AccessControl {
  static accessControlParamsFilter(req, field, param) {
    if (AccessControl.subUserCheck(req)) {
      let restriction = null;
      const dataRestriction = req.session.subUserDataRestriction;
      const camelField = _.camelCase(field);
      switch (camelField) {
        case 'assetOrgCode':
          restriction = dataRestriction.assetDataRestriction;
          break;
        case 'fundOrgCode':
          restriction = dataRestriction.fundDataRestriction;
          break;
        default:
          restriction = [
            ...dataRestriction.fundDataRestriction,
            ...dataRestriction.assetDataRestriction,
          ];
      }
      if (_.isEmpty(param)) {
        return restriction.length > 1 ? restriction : restriction[0];
      }
      if (_.isArray(param)) {
        const result = _.intersection(restriction, param);
        if (_.isEmpty(result)) {
          throw new Error('子用户数据权限设置不完整，请再次确认。');
        }
        return result.length > 1 ? result : result[0];
      }
      const result = _.indexOf(restriction, param);
      if (result === -1) {
        throw new Error('子用户数据权限设置不完整，请再次确认。');
      }
      return param;
    }
    return param;
  }
  static subUserCheck(req) {
    return !!req && req.session && req.session.subUserDataRestriction;
  }
}

module.exports = { AccessControlHookLevel, AccessControl };
