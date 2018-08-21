/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-04-02 11-21
 */

const _ = require('lodash');

const validator = require('./validator');
const { sequelizeDB } = require('../../schema');
const cooperatorService = require('../../services').business.cooperator;
const { getMySQLFieldValue, uuidv4 } = require('../../util');

const COOPERATOR_ORG_CODE1 = 'A1505';
const COOPERATOR_ORG_CODE2 = 'F1506';

const search = async (req, res, next) => {
  const { pageIndex } = req.body;
  const myPageIndex = _.isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  let params = getMySQLFieldValue(Object.assign({}, req.body, { pageIndex: myPageIndex }));
  const { user_type } = req.session.profile;
  switch (user_type) {
    case 1:
      params.order_column = 'fund_user_from, fund_org_code, asset_org_code';
      params = Object.assign({}, params, {
        asset_org_code: req.session.profile.org_code,
      });
      break;
    case 2:
      params.order_column = 'asset_user_from, asset_org_code, fund_org_code';
      params = Object.assign({}, params, {
        fund_org_code: req.session.profile.org_code,
      });
      break;
    default:
      params.order_column = 'fund_user_from, fund_org_code, asset_org_code';
  }

  const { count, rows } = await cooperatorService.cooperatorInfoQueryAndCount(req, params);
  return res.json({ success: true, rows, total: count });
};

const create = async (req, res, next) => {
  const {
    user_type, user_name, user_full_name, linkman, mobile, email,
  } = req.body;
  const user_id = uuidv4();
  const params = getMySQLFieldValue(Object.assign({}, req.body, {
    user_id,
    user_from: 2,
    user_status: 1,
    user_account: user_id,
    password: user_id.md5(),
  }));
  let searchParams = null;
  let asset_org_code = null;
  let fund_org_code = null;


  validator.validateWithUserType(req.session.profile.user_type, {
    user_full_name,
    user_name,
    linkman,
    mobile,
    email,
  });

  const userInst = await cooperatorService.userSearchByUserFullName(req, params);

  let cooperatorOrgCode = user_type === 5 ? COOPERATOR_ORG_CODE1 : COOPERATOR_ORG_CODE2;
  const t = await sequelizeDB.transaction();
  try {
    if (_.isEmpty(userInst)) {
      const maxOrgCodeInstance = await cooperatorService.maxOrgCodeSearchByUserType(req, params);
      let newOrgCode = null;
      if (
        _.isEmpty(maxOrgCodeInstance.dataValues) ||
        _.isEmpty(maxOrgCodeInstance.dataValues.max_org_code)
      ) {
        newOrgCode = `${cooperatorOrgCode}001`;
      } else {
        const maxOrgCode = maxOrgCodeInstance.dataValues.max_org_code;
        let orgNum = (parseInt(maxOrgCode.slice(6), 10) + 1).toString();
        while (orgNum.length < 3) {
          orgNum = `0${orgNum}`;
        }
        newOrgCode = `${cooperatorOrgCode}${orgNum}`;
      }
      params.org_code = newOrgCode;

      const dicParams = {
        table_name: 't_user',
        col_name: 'org_code',
        para_key: newOrgCode,
        para_value: user_name,
      };
      cooperatorOrgCode = newOrgCode;
      const [
        userCreatedInstance,
        dicCreatedInstance,
      ] = await cooperatorService.createUserAndDictionary(req, params, dicParams, t);
      if (_.isEmpty(userCreatedInstance)) {
        throw new Error('用户添加失败');
      }
      if (_.isEmpty(dicCreatedInstance)) {
        throw new Error('字典添加失败');
      }
    } else {
      cooperatorOrgCode = userInst.org_code;
    }
    if (user_type === 5) {
      asset_org_code = cooperatorOrgCode;
      fund_org_code = req.session.profile.org_code;
      searchParams = {
        fund_org_code,
        order_column: 'asset_user_from, asset_org_code',
      };
    } else {
      asset_org_code = req.session.profile.org_code;
      fund_org_code = cooperatorOrgCode;
      searchParams = {
        asset_org_code,
        order_column: 'fund_user_from, fund_org_code',
      };
    }

    const cooperatorCount = await cooperatorService.cooperatorInfoPreCount(req, {
      asset_org_code,
      fund_org_code,
    });
    if (cooperatorCount > 0) {
      throw new Error(`合作方[${params.user_full_name}]已存在`);
    }
    const [
      assetAccountCreatedInst,
      fundAccountCreatedInst,
      fundAccountCreatedInst2,
      cooperatorInfoCreatedInst,
    ] = await cooperatorService.accountsCreate(
      req,
      {
        asset_org_code,
        fund_org_code,
      },
      t,
    );
    if (_.isEmpty(assetAccountCreatedInst)) {
      throw new Error('资产方账号添加失败');
    }
    if (_.isEmpty(fundAccountCreatedInst) || _.isEmpty(fundAccountCreatedInst2)) {
      throw new Error('资金方账号添加失败');
    }
    if (_.isEmpty(cooperatorInfoCreatedInst)) {
      throw new Error('合作关系添加失败');
    }
    await t.commit();
    const { count, rows } = await cooperatorService.cooperatorInfoQueryAndCount(req, {
      ...searchParams,
      page_index: 0,
    });
    if (count < 1) {
      throw new Error('已创建，但查找失败');
    }
    if (_.isEmpty(rows)) {
      throw new Error('无记录');
    }
    return res.json({
      success: true,
      rows,
      total: count,
    });
  } catch (e) {
    console.log(e);
    await t.rollback();
    throw new Error(e.message || '更新失败');
  }
};

const update = async (req, res, next) => {
  const {
    org_code, user_full_name, user_name, linkman, mobile, email,
  } = req.body;
  const params = getMySQLFieldValue(Object.assign({}, req.body));
  const { user_type } = req.session.profile;
  validator.validateWithUserType(user_type, {
    org_code,
    user_full_name,
    user_name,
    linkman,
    mobile,
    email,
  });

  const userWithOrgCodeInst = await cooperatorService.userSearchByOrgCode(req, params);
  if (_.isEmpty(userWithOrgCodeInst)) {
    throw new Error('查无此用户');
  }
  Object.assign(params, { user_id: userWithOrgCodeInst.user_id });
  const userCheckInst = await cooperatorService.userFullNameCheck(req, {
    user_full_name,
    user_type: userWithOrgCodeInst.user_type,
    org_code: userWithOrgCodeInst.org_code,
  });
  if (!_.isEmpty(userCheckInst)) {
    throw new Error('资产方全称已存在，请改变资产方全称');
  }
  const isSame =
    userWithOrgCodeInst.org_code !== org_code || userWithOrgCodeInst.user_name !== user_name;
  await cooperatorService.updateUserOrAndDictionary(
    req,
    params,
    {
      table_name: 't_user',
      col_name: 'org_code',
      para_key: org_code,
      para_value: user_name,
      old_table_name: 't_user',
      old_col_name: 'org_code',
      old_para_key: userWithOrgCodeInst.org_code,
      old_para_value: userWithOrgCodeInst.user_name,
    },
    isSame,
  );

  let asset_org_code = null;
  let fund_org_code = null;
  if (userWithOrgCodeInst.user_type === 5) {
    asset_org_code = org_code;
    fund_org_code = req.session.profile.org_code;
  } else {
    asset_org_code = req.session.profile.org_code;
    fund_org_code = org_code;
  }

  const cooperatorInst = await cooperatorService.cooperatorInfoQueryOne(req, {
    asset_org_code,
    fund_org_code,
  });
  if (_.isEmpty(cooperatorInst)) {
    throw new Error('已更新但查无记录');
  }
  return res.json({ success: true, data: cooperatorInst.dataValues });
};

const remove = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body);
  const userType = req.session.profile.user_type;
  if (userType === 1 && _.isEmpty(params.fund_org_code)) {
    throw new Error('资金方不能为空');
  } else if (userType === 2 && _.isEmpty(params.asset_org_code)) {
    throw new Error('资产方名称不能为空');
  }
  let searchParams = null;
  if (userType === 2) {
    searchParams = {
      fund_org_code: req.session.profile.org_code,
      order_column: 'asset_user_from, asset_org_code',
    };
    params = { ...params, fund_org_code: req.session.profile.org_code };
  } else {
    searchParams = {
      asset_org_code: req.session.profile.org_code,
      order_column: 'fund_user_from, fund_org_code',
    };
    params = { ...params, asset_org_code: req.session.profile.org_code };
  }
  await cooperatorService.deleteAccounts(req, params);
  const { count, rows } = await cooperatorService.cooperatorInfoQueryAndCount(req, searchParams);
  if (count === 0) {
    throw new Error('无记录');
  }
  return res.json({ success: true, rows, total: count });
};

const searchRelation = async (req, res, next) => {
  const { org_code } = req.body;
  if (!org_code) {
    return res.json({ success: true, rows: [] });
  }
  const isAsset = org_code && org_code.startsWith('F');
  const resultSet = await cooperatorService.notAddedRelationQuery(req, { org_code }, isAsset);
  if (_.isEmpty(resultSet)) {
    throw new Error('无记录');
  }
  return res.json({ success: true, rows: resultSet });
};

const addRelation = async (req, res, next) => {
  const {
    orgCode,
    relationOrgCodes,
    assetOrgCode: asset_org_code,
    fundOrgCode: fund_org_code,
  } = req.body;
  if (_.isEmpty(relationOrgCodes)) {
    throw new Error('合作方不能为空');
  }
  const searchParams = {
    order_column: 'fund_user_from, fund_org_code',
    asset_org_code,
    fund_org_code,
  };
  const isAsset = orgCode && orgCode.startsWith('F');
  await cooperatorService.cooperatorInfoCreate(req, relationOrgCodes, orgCode, isAsset);
  const { count, rows } = await cooperatorService.cooperatorInfoQueryAndCount(req, searchParams);
  if (count === 0) {
    throw new Error('无记录');
  }
  return res.json({ success: true, rows, total: count });
};

const searchAddedRelation = async (req, res, next) => {
  const { org_code } = req.body;
  if (_.isEmpty(org_code)) {
    res.json({ success: true, rows: [] });
  }
  const isAsset = org_code && org_code.startsWith('F');
  const relationResultSet = await cooperatorService.addedRelationQuery(req, { org_code }, isAsset);
  if (_.isEmpty(relationResultSet)) {
    throw new Error('无记录');
  }
  return res.json({ success: true, rows: relationResultSet });
};

const supplyInfo = async (req, res, next) => {
  const { user_type, org_code } = req.session.profile;
  let params = getMySQLFieldValue(Object.assign({}, req.body, { pageIndex: 0 }));
  switch (user_type) {
    case 1:
      params.order_column = 'fund_user_from, fund_org_code, asset_org_code';
      params = Object.assign({}, params, { asset_org_code: org_code });
      break;
    case 2:
      params.order_column = 'asset_user_from, asset_org_code, fund_org_code';
      params = Object.assign({}, params, { fund_org_code: org_code });
      break;
    default:
      params.order_column = 'fund_user_from, fund_org_code, asset_org_code';
  }
  await cooperatorService.cooperatorInfoSupplement(req);
  const { count, rows } = await cooperatorService.cooperatorInfoQueryAndCount(req, params);
  if (count === 0) {
    throw new Error('无记录');
  }
  return res.json({ success: true, rows, total: count });
};

module.exports = {
  search,
  create,
  update,
  remove,
  searchRelation,
  addRelation,
  searchAddedRelation,
  supplyInfo,
};
