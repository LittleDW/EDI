/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-04-24 15-39
 * @Last Modified: 2018-04-24 15-39
 * @Modified By: Osborn
 */

// 1 template select
// 2 whitelist filter
// 3 variable map
// 4 column name map
// 3 specific logs

const _ = require('lodash');
const sequelize = require('sequelize');

const { logger } = require('../../util');

const TRANSLATION_DICTIONARY = require('./translationDictionary');
const LOG_TEMPLATE = require('./logTemplate');

class CustomLogs {
  updateLog(instance, options, actionText, that) {
    const {
      _changed = {}, _modelOptions = {}, _previousDataValues = {}, dataValues,
    } = instance;
    const {
      chineseFieldName,
      // chineseTableName,
      tableName = '',
      log = {},
    } = _modelOptions;
    const {
      profile: { org_code = '', user_id = '', sub_account: { user_id: sub_user_id = '' } = {} },
    } = that.options._visitor;
    const { primaryKeysOrder } = that.options;
    const { transaction = null, action_type = '', action_name = null } = options;
    const { primaryKeyAttributes } = that;
    const action = 'update';

    // flow
    const from_table_key = this.fromTableKeyGenerator(
      primaryKeyAttributes,
      primaryKeysOrder,
      dataValues,
    );
    const updatedItems = this.whiteListFilter(_changed, log.whiteList[action]);
    if (_.isEmpty(updatedItems)) {
      return false;
    }
    const sortedItems = this.sortByWitheList(updatedItems, log.whiteList[action]);
    const data = sortedItems.map((item) => this.dataPicker(item, _previousDataValues, dataValues));
    const customizedItems = this.customize(data);
    if (_.isEmpty(customizedItems)) {
      return false;
    }
    const mappedData = customizedItems.map((d) => this.dictionaryTranslate(tableName, d));
    const translatedData = this.columnNameTranslation(chineseFieldName, mappedData, log, options);
    const template = this.templateSelector(action, log.template[action]);
    const logText = template(action_name || actionText, translatedData);
    return this.persistLog(
      that,
      tableName,
      from_table_key,
      org_code,
      user_id,
      sub_user_id,
      logText,
      transaction,
      action_type,
    );
  }
  createLog(instance, options, actionText, that) {
    const { _modelOptions = {}, dataValues } = instance;
    const { chineseFieldName, tableName = '', log = {} } = _modelOptions;
    const {
      profile: { org_code = '', user_id = '', sub_account: { user_id: sub_user_id = '' } = {} },
    } = that.options._visitor;
    const { primaryKeysOrder } = that.options;
    const { transaction = null, action_type = '', action_name = null } = options;
    const { primaryKeyAttributes } = that;
    const action = 'create';
    // flow
    const from_table_key = this.fromTableKeyGenerator(
      primaryKeyAttributes,
      primaryKeysOrder,
      dataValues,
    );
    const createdItems = this.whiteListFilter({}, log.whiteList[action]);
    if (_.isEmpty(createdItems)) {
      return;
    }

    const data = createdItems.map((item) => this.dataPicker(item, {}, dataValues));
    const customizedItems = this.customize(data);
    if (_.isEmpty(customizedItems)) {
      return;
    }
    const mappedData = customizedItems.map((d) => this.dictionaryTranslate(tableName, d));
    const translatedData = this.columnNameTranslation(chineseFieldName, mappedData, log, options);
    const template = this.templateSelector(action, log.template[action]);
    const logText = template(action_name || actionText, translatedData);
    return this.persistLog(
      that,
      tableName,
      from_table_key,
      org_code,
      user_id,
      sub_user_id,
      logText,
      transaction,
      action_type,
    );
  }
  deleteLog(instance, options, actionText, that) {
    const { dataValues, _modelOptions = {} } = instance;
    const {
      chineseFieldName,
      // chineseTableName,
      tableName = '',
      log = {},
    } = _modelOptions;
    const {
      profile: { org_code = '', user_id = '', sub_account: { user_id: sub_user_id = '' } = {} },
    } = that.options._visitor;
    const { primaryKeysOrder } = that.options;
    const { transaction = null, action_type = '', action_name = null } = options;
    const { primaryKeyAttributes } = that;
    const action = 'delete';

    // flow
    const from_table_key = this.fromTableKeyGenerator(
      primaryKeyAttributes,
      primaryKeysOrder,
      dataValues,
    );
    const updatedItems = this.whiteListFilter({}, log.whiteList[action]);
    if (_.isEmpty(updatedItems)) {
      return false;
    }

    const data = updatedItems.map((item) => this.dataPicker(item, {}, dataValues));
    const customizedItems = this.customize(data);
    if (_.isEmpty(customizedItems)) {
      return false;
    }
    const mappedData = customizedItems.map((d) => this.dictionaryTranslate(tableName, d));
    const translatedData = this.columnNameTranslation(chineseFieldName, mappedData, log, options);
    const template = this.templateSelector(action, log.template[action]);
    const logText = template(action_name || actionText, translatedData);
    return this.persistLog(
      that,
      tableName,
      from_table_key,
      org_code,
      user_id,
      sub_user_id,
      logText,
      transaction,
      action_type,
    );
  }
  dictionaryTranslate(tableName = '', params = {}) {
    const clonedParams = _.clone(params);
    const { name, previousData, nextData } = clonedParams;
    const [translatedPreviousData, translatedNextData] = [previousData, nextData].map((data) => {
      if (!_.isNumber(data) && _.isEmpty(data)) {
        return null;
      }

      if (_.split(data, ',').length > 1) {
        return _.map(_.split(data, ','), (s) => {
          const result = _.find(
            TRANSLATION_DICTIONARY,
            (d) =>
              (d.t === tableName || d.t === '*') &&
              d.v === name &&
              (d.key === s || _.toString(d.key) === _.toString(s)),
          );
          if (!_.isEmpty(result)) {
            s = result.val;
          }
          return s;
        }).join(';');
      }
      if (_.split(data, ';').length > 1) {
        return _.map(_.split(data, ';'), (s) => {
          const result = _.find(
            TRANSLATION_DICTIONARY,
            (d) =>
              (d.t === tableName || d.t === '*') &&
              d.v === name &&
              (d.key === s || _.toString(d.key) === _.toString(s)),
          );
          if (!_.isEmpty(result)) {
            s = result.val;
          }
          return s;
        }).join(';');
      }

      const result = _.find(
        TRANSLATION_DICTIONARY,
        (d) =>
          (d.t === tableName || d.t === '*') &&
          d.v === name &&
          (d.key === data || _.toString(d.key) === _.toString(data)),
      );
      return (result && result.val) || data;
    });
    return {
      name,
      previousData: translatedPreviousData,
      nextData: translatedNextData,
    };
  }
  dictionaryTranslateMultiple(tableName = '', variableNames = [], params = {}) {
    const clonedParams = _.clone(params);
    _.map(variableNames, (variableName) => {
      const variable = clonedParams[variableName];
      if (_.isEmpty(variable)) {
      }
    });
  }
  columnNameTranslation(chineseFieldName = {}, items = [], log, options) {
    _.map(items, (i) => {
      const { name } = i;
      const { customFieldName = {} } = log;
      const { specialFieldName = {} } = options;
      i.name = specialFieldName[name] || customFieldName[name] || chineseFieldName[name] || name;
    });
    return items;
  }
  templateSelector(action = 'update', template = 'default') {
    return LOG_TEMPLATE[action][template] || LOG_TEMPLATE[action].default;
  }
  whiteListFilter(changed = {}, whiteList = []) {
    if (_.isEmpty(changed)) {
      return whiteList;
    }
    if (_.isEmpty(whiteList)) {
      return Object.keys(changed);
    }
    const result = [];
    Object.keys(changed).forEach((k) => {
      if (changed[k]) {
        if (whiteList.indexOf(k) > -1) {
          result.push(k);
        }
      }
    });
    return result;
  }
  sortByWitheList(changed = [], whiteList = []) {
    return changed.sort((a, b) => whiteList.indexOf(a) - whiteList.indexOf(b));
  }
  fromTableKeyGenerator(primaryKeyAttributes, primaryKeysOrder, dataValues) {
    return primaryKeyAttributes
      .sort((a, b) => primaryKeysOrder.indexOf(a) - primaryKeysOrder.indexOf(b))
      .map((k) => dataValues[k])
      .join(',');
  }
  dataPicker(columnName, previousData = {}, nextData = {}) {
    return {
      name: columnName,
      previousData: _.isNil(previousData[columnName]) ? null : previousData[columnName],
      nextData: _.isNil(nextData[columnName]) ? null : nextData[columnName],
    };
  }
  customize(data) {
    return data;
  }
  persistLog(
    that,
    from_table,
    from_table_key,
    from_org_code,
    create_user_id,
    sub_user_id,
    oper_log,
    transaction,
    action_type,
  ) {
    return that.sequelize.models.t_oper_log
      .create(
        {
          action_type,
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id,
          oper_log,
          oper_time: sequelize.fn('NOW'),
          rx_insertTime: sequelize.fn('NOW'),
          rx_updateTime: sequelize.fn('NOW'),
        },
        {
          hooks: false,
          transaction,
        },
      )
      .catch((err) => {
        console.error(`log error: ${err}`);
        logger.error(`记录操作日志时发生错误，${err}`);
      });
  }
}
module.exports = CustomLogs;
