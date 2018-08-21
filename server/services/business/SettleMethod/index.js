/**
 * @Author zhangjunjie
 * @Date 2018/4/17 16:43
 * @Description: 结算方式 SettleMethod Service
 */

const {
  getMySQLFieldValue,
  thunkifyEvent,
  appendUUID,
  oss,
} = require('../../../util');
const { sequelizeDB } = require('../../../schema');
const settleMethodDao = require('./settleMethodDao');

const search = async (req) => {
  let { fundOrgCode, assetOrgCode } = req.body;
  let params = getMySQLFieldValue({
    fundOrgCode,
    assetOrgCode,
  });

  const methodList = await settleMethodDao(req).search(params);
  methodList.forEach((item) => {
    item.total_rate = parseFloat(item.total_rate);
  });
  return { methodList };
};

const update = async (busboy, req) => {
  const params = {};
  const fieldThunk = thunkifyEvent({
    emitter: busboy,
    event: 'field',
    gen: function*(fieldname, val) {
      params[fieldname] = val;
    },
  });
  const fileThunk = thunkifyEvent({
    emitter: busboy,
    event: 'file',
    gen: function*(fieldname, file, filename) {
      yield fieldThunk.collect();
      let result = yield oss.putStream(`${appendUUID(filename)}`, file);
      params[fieldname] = result.url;
    },
  });
  return thunkifyEvent({
    emitter: busboy,
    event: 'finish',
    count: 1,
    gen: function*() {
      yield fieldThunk.collect();
      yield fileThunk.collect();
      const t = yield sequelizeDB.transaction();
      try {
        yield settleMethodDao(req).update(params, t);
        t.commit();
      } catch (error) {
        t.rollback();
        throw new Error(error.message || '更新失败，请重试');
      }
    },
  }).collect();
};

module.exports = {
  search,
  update,
};
