/*
 * @Author Osborn
 * @File utils.js
 * @Created Date 2018-05-02 14-21
 * @Last Modified: 2018-05-02 14-21
 * @Modified By: Osborn
 */

const _ = require('lodash');

const compareChangesWithKey = (prevData, nextData, key) => {
  const common = _.intersectionBy(prevData, nextData, key);
  const deleted = _.differenceBy(common, prevData, key);
  const inserted = _.differenceBy(common, nextData, key);
  return {
    deleted,
    inserted,
  };
};
const compareChanges = (prevData, nextData) => {
  const common = _.intersection(prevData, nextData);
  const deleted = _.difference(common, prevData);
  const inserted = _.difference(common, nextData);
  return {
    deleted,
    inserted,
  };
};

module.exports = {
  compareChangesWithKey,
  compareChanges,
};
