/*
 * File: super.js
 * File Created: Friday, 23rd March 2018 1:58:23 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: 2018-05-24 Thursday, 05:56:00
 * Modified By: zhangjunjie (zhangjunjie@rongcapital.cn>)
 */

const sequelize = require('sequelize');
const moment = require('moment');

const { Op, Model } = sequelize;
const { db } = require('../schema/index');
const _ = require('lodash');

module.exports = class Model {
  constructor(tableName, info = {}, accessList) {
    const { logInfo, accessControl, userType } = info;
    this.dao = db[tableName];
    this.db = db;
    this.chineseTableName = this.dao.options.chineseTableName;
    this.dao.options._visitor = logInfo;
    this.dao.options.accessControl = accessControl;
    this.dao.options.userType = userType;
    this.dao.options.accessList = accessList;

    if (!this.dao._migrated) {
      let tempCreate = this.dao.create.bind(this.dao),
        tempUpdate = this.dao.update.bind(this.dao),
        tempUpsert = this.dao.upsert.bind(this.dao),
        tempFindAll = this.dao.findAll.bind(this.dao),
        tempFindAndCountAll = this.dao.findAndCountAll.bind(this.dao);

      this.dao.create = function (values = {}, options = {}) {
        // 假如是log表的插入，禁止个表钩子触发
        if (
          this.tableName === 't_oper_log' ||
          this.tableName === 't_login_log' ||
          this.tableName === 't_oper_table_log'
        ) {
          options.hooks = false;
        }
        return tempCreate(
          {
            ...values,
            rx_insertTime: sequelize.fn('NOW'),
            rx_updateTime: sequelize.fn('NOW'),
          },
          options,
        );
      };

      this.dao.update = function (values = {}, options) {
        return tempUpdate({ ...values, rx_updateTime: sequelize.fn('NOW') }, options);
      };

      this.dao.upsert = function (values = {}, options) {
        return tempUpsert({ ...values, rx_updateTime: sequelize.fn('NOW') }, options);
      };

      this.dao.findPlainAll = function (options = {}) {
        const { nesting, include } = options;
        if (Array.isArray(include) && include.length && !nesting) {
          return tempFindAll(options).then(rows => {
            return [].concat.apply([],rows.map((r) => {
              let obj = r.constructor? r.get():r;
              let childList = [];
              include.forEach((i = {}) => {
                let { as, model: { tableName } = {} } = i,
                  alias = as || tableName,
                  child = obj[alias];
                if (Array.isArray(child) && child.length) {
                  if(child.length > 1){
                    childList = [...childList, ...child.map(r=>r.dataValues)]
                  } else {
                    _.defaults(obj, child[0].dataValues);
                  }
                } else if (!Array.isArray(child) && !_.isNil(child) && typeof child === 'object') {
                  _.defaults(obj, child.dataValues);
                }
                delete obj[alias];
              });
              if(Array.isArray(childList) && childList.length){
                return childList.map(r=>({...obj, ...r}))
              } else {
                return [obj]
              }
              //return obj;
            }))
          });
        }
        return tempFindAll(options);
      };

      this.dao.findAndCountPlainAll = function (options = {}) {
        const { nesting, include } = options;
        if (Array.isArray(include) && include.length && !nesting) {
          return tempFindAndCountAll(options).then(({ rows, count }) => {
            return ({
              rows: [].concat.apply([],rows.map((r) => {
                let obj = r.constructor? r.get():r;
                let childList = [];
                include.forEach((i = {}) => {
                  let { as, model: { tableName } = {} } = i,
                    alias = as || tableName,
                    child = obj[alias];
                  if (Array.isArray(child) && child.length) {
                    if(child.length > 1){
                      childList = [...childList, ...child.map(r=>r.dataValues)]
                    } else {
                      _.defaults(obj, child[0].dataValues);
                    }
                  } else if (!Array.isArray(child) && !_.isNil(child) && typeof child === 'object') {
                    _.defaults(obj, child.dataValues);
                  }
                  delete obj[alias];
                });
                if(Array.isArray(childList) && childList.length){
                  return childList.map(r=>({...obj, ...r}))
                } else {
                  return [obj]
                }
                //return obj;
              })),
              count,
            })
          });
        }
        return tempFindAndCountAll(options);
      };

      this.dao._migrated = true;
    }
  }

  /**
   * private
   * transform to date
   * @param {object} params
   * @param {string} start
   * @param {string} end
   */
  QueryParamsOfDateEnhancer(params, start, end) {
    if (_.isNumber(params[start]) || !_.isEmpty(params[start])) {
      params[start] = moment(params[start]);
    }
    if (_.isNumber(params[end]) || !_.isEmpty(params[end])) {
      params[end] = moment(params[end]);
    }
    return params;
  }

  /**
   * private
   * enhance number interval
   * @param {object} params
   * @param {object} where
   * @param {string} columnName
   * @param {string} start
   * @param {string} end
   */

  QueryParamsOfIntervalEnhancer(params, where, columnName, start, end) {
    // 增加字符串范围的功能 （modified by zhangjunjie in 2018-04-12）
    // 为了支持 数字类型 以及 字符串类型，以及date类型，故做如下改动
    if ((!_.isEmpty(params[start]) || _.isNumber(params[start])) && (!_.isEmpty(params[end]) || _.isNumber(params[end]))) {
      _.assign(where, {
        [columnName]: {
          [Op.between]: [params[start], params[end]],
        },
      });
    } else if ((!_.isEmpty(params[start]) || _.isNumber(params[start]))) {
      _.assign(where, {
        [columnName]: { [Op.gte]: params[start] },
      });
    } else if ((!_.isEmpty(params[end]) || _.isNumber(params[end]))) {
      _.assign(where, { [columnName]: { [Op.lte]: params[end] } });
    }
    return where;
  }
  /**
   * private
   * enhance date duration
   * @param {object} params
   * @param {object} where
   * @param {string} columnName
   * @param {string} start
   * @param {string} end
   */

  durationGenerator(params, where, columnName, start, end) {
    params = this.QueryParamsOfDateEnhancer(params, start, end);
    if (moment.isMoment(params[start]) && moment.isMoment(params[end])) {
      _.assign(where, {
        [columnName]: {
          [Op.between]: [params[start].format(), params[end].format()],
        },
      });
    } else if (moment.isMoment(params[start])) {
      _.assign(where, {
        [columnName]: { [Op.gte]: params[start].format() },
      });
    } else if (moment.isMoment(params[end])) {
      _.assign(where, { [columnName]: { [Op.lte]: params[end].format() } });
    }
    return where;
  }

  getChineseFieldName(name) {
    return this.dao.options.chineseFieldName[name];
  }

  queryParamsNumberSetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (_.isNumber(params[paramName])) {
      where[field] = params[paramName];
    }
    return where;
  }
  queryParamsStringSetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      where[field] = params[paramName];
    }
    return where;
  }
  queryParamsStringNESetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      where[field] = {
        [Op.ne]: params[paramName],
      };
    }
    return where;
  }
  queryParamsLikeSetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      where[field] = {
        [Op.like]: `%${params[paramName]}%`,
      };
    }
    return where;
  }
  queryParamsInSetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      let value = params[paramName];
      if (!Array.isArray(value) && !_.isEmpty(value)) {
        value = [value];
      }
      where[field] = {
        [Op.in]: value,
      };
    }
    return where;
  }
  queryParamsGTESetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      _.assign(where, { [field]: { [Op.gte]: params[paramName] } });
    }
    return where;
  }

  queryParamsGTSetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      _.assign(where, { [field]: { [Op.gt]: params[paramName] } });
    }
    return where;
  }

  queryParamsLTESetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      _.assign(where, { [field]: { [Op.lte]: params[paramName] } });
    }
    return where;
  }

  queryParamsLTSetupBuilder(params, where, field, paramName) {
    paramName = paramName || field;
    if (!_.isEmpty(params[paramName])) {
      _.assign(where, { [field]: { [Op.lt]: params[paramName] } });
    }
    return where;
  }

  tableNameGenerator(tableName) {
    return function (columnName) {
      return sequelize.col(`${tableName}.${columnName}`);
    };
  }
  filterEmptyData(options = {}) {
    if (_.isObject(options.where)) {
      // options.where = _.pickBy(options.where, _.identity);
      options.where = _.pickBy(options.where, i => _.isNumber(i) || _.isObject(i) || _.isSymbol(i) || !_.isEmpty(i));
    }
    return options;
  }
  filterInvalidValue(values = {}) {
    if (_.isObject(values)) {
      // values = _.pickBy(values, _.identity);
      values = _.pickBy(values, i => _.isNumber(i) || _.isObject(i) || _.isSymbol(i) || _.isString(i) || !_.isEmpty(i));
    }
    return values;
  }

  nativeQuery(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.findAll(options);
  }
  nativeQuerySingle(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.find(options);
  }
  nativeCreate(values = {}, options = {}) {
    options = this.filterEmptyData(options);
    values = this.filterInvalidValue(values);
    return this.dao.create(values, { individualHooks: true, ...options });
  }
  nativeDelete(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.destroy({ individualHooks: true, ...options });
  }
  nativeUpdate(values = {}, options = {}) {
    options = this.filterEmptyData(options);
    values = this.filterInvalidValue(values);
    return this.dao.update(values, { individualHooks: true, ...options });
  }
  nativeUpdateRaw(values = {}, options = {}) {
    return this.dao.update(values, { individualHooks: true, ...options });
  }
  nativeCount(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.count(options);
  }

  error(m) {
    throw new Error(m);
  }
};
