const sequelize = require('sequelize');
const moment = require('moment');
const _ = require('lodash');

const { db, sequelizeDB } = require('../../../server/schema');
process.env.NODE_ENV = 'test';

class DataMaintain {
  constructor(tableName) {
    this.dao = db[tableName];
  }

  filterEmptyData(options = {}) {
    if (_.isObject(options.where)) {
      // options.where = _.pickBy(options.where, _.identity);
      options.where = _.pickBy(
        options.where,
        (i) => _.isNumber(i) || _.isObject(i) || _.isSymbol(i) || !_.isEmpty(i),
      );
    }
    return options;
  }
  filterInvalidValue(values = {}) {
    if (_.isObject(values)) {
      // values = _.pickBy(values, _.identity);
      values = _.pickBy(
        values,
        (i) =>
          _.isNumber(i) ||
          _.isObject(i) ||
          _.isSymbol(i) ||
          _.isString(i) ||
          !_.isEmpty(i),
      );
    }
    return values;
  }

  nativeCreate(values = {}, options = {}) {
    options = this.filterEmptyData(options);
    values = this.filterInvalidValue(values);
    values.rx_insertTime = moment().format('YYYY-MM-DD HH:mm:ss');
    values.rx_updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    return this.dao.create(values, {
      ...options,
      hooks: false,
      individualHooks: false,
    });
  }

  nativeBulkCreate(values = [], options = {}) {
    options = this.filterEmptyData(options);
    values = this.filterInvalidValue(values);
    return this.dao.bulkCreate(values, {
      ...options,
      hooks: false,
      returning: true,
      individualHooks: false,
    });
  }
  nativeDelete(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.destroy({
      ...options,
      hooks: false,
      truncate: true,
      individualHooks: false,
    });
  }
  nativeQuery(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.findAll({ ...options, hooks: false });
  }
  nativeQuerySingle(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.find(options);
  }

  nativeUpdate(values = {}, options = {}, strict = false) {
    options = this.filterEmptyData(options);
    values = (!strict && this.filterInvalidValue(values)) || values;
    return this.dao.update(values, {
      ...options,
      hooks: false,
      individualHooks: false,
    });
  }
  nativeCount(options = {}) {
    options = this.filterEmptyData(options);
    return this.dao.count(options);
  }
}

module.exports = {
  DataMaintain,
  sequelizeDB,
};
