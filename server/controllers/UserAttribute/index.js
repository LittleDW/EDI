/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-03 16-47
 * @Last Modified: 2018-05-03 16-47
 * @Modified By: Osborn
 */

const _ = require('lodash');

const { sequelizeDB } = require('../../schema');
const userAttributeService = require('../../services').business.userAttribute;
const { getMySQLFieldValue } = require('../../util');

const search = async (req, res) => {
  const params = getMySQLFieldValue(Object.assign({}, req.body, { user_id: req.session.profile.user_id }));
  const resultSet = await userAttributeService.userAttributeQuery(req, params);
  if (_.isEmpty(resultSet)) {
    throw new Error('数据不存在');
  }
  // Fixme
  // is_deadline_favor is_debt_exchange 需要返回字符串，因为修改schema里的类型无法让这两个字段变为int型，所以这里手动修改下
  // zhangjunjie on 2018-05-07
  const rows = resultSet.map(r => r.dataValues)[0] || {};
  rows.is_deadline_favor = _.toNumber(rows.is_deadline_favor);
  rows.is_debt_exchange = _.toNumber(rows.is_debt_exchange);
  return res.json({ success: true, rows });
};
const save = async (req, res) => {
  const params = getMySQLFieldValue(Object.assign({}, req.body, {
    user_id: req.session.profile.user_id,
  }));
  const resultSet = await userAttributeService.userAttributeQuery(req, {
    user_id: params.user_id,
  });
  if (_.isEmpty(resultSet)) {
    throw new Error('数据不存在');
  }
  params.fund_org_code = resultSet[0].org_code;
  const t = await sequelizeDB.transaction();
  try {
    const [affectCount] = await userAttributeService.UserAttributeUpdate(req, params, t);
    if (affectCount < 1) {
      throw new Error('平台属性更新失败');
    }
    const { user_type } = req.session.profile;
    if (user_type === 2) {
      if (params.api_url) {
        const apiResultSet = await userAttributeService.UserAttributeFundApiUrlCheck(req, params);
        if (_.isEmpty(apiResultSet)) {
          const apiInst = await userAttributeService.UserAttributeFundApiUrlCreate(req, params, t);
          if (_.isEmpty(apiInst)) {
            throw new Error('业务端口更新失败');
          }
        } else {
          const [updateAffectCount] = await userAttributeService.UserAttributeFundApiUrlUpdate(
            req,
            params,
            t,
          );
          if (updateAffectCount < 1) {
            throw new Error('业务端口更新失败');
          }
        }
      } else {
        await userAttributeService.UserAttributeFundApiUrlDelete(req, params, t);
      }
    }
    await t.commit();
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    await t.rollback();
    throw new Error('更新失败');
  }
};

module.exports = {
  search,
  save,
};
