/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-04-02 13-45
 */

const { sequelizeDB } = require('../../../schema');
const Dao = require('./cooperatorDao');

const cooperatorInfoQueryAndCount = (req, params) => {
  const dao = Dao(req);
  const { fund_org_code, asset_org_code, page_index } = params;
  return dao.cooperatorInfoQueryAndCount({
    fund_org_code,
    asset_org_code,
    page_index,
  });
};

const userSearchByUserFullName = (req, params) => {
  const dao = Dao(req);
  const { user_full_name, user_type } = params;
  return dao.userSearchByUserFullName({ user_full_name, user_type });
};

const maxOrgCodeSearchByUserType = (req, params) => {
  const dao = Dao(req, '');
  const { user_type } = params;
  return dao.maxOrgCodeSearchByUserType({ user_type });
};

const createUserAndDictionary = (req, params, dicParams, t) => {
  const dao = Dao(req);
  return Promise.all([dao.userManageCreate(params, t), dao.dictionaryCreate(dicParams, t)]);
};
const cooperatorInfoPreCount = (req, params) => {
  const dao = Dao(req);
  return dao.cooperatorInfoPreCount(params);
};

const accountsCreate = (req, params, t) => {
  const { asset_org_code, fund_org_code } = params;
  const dao = Dao(req);
  return Promise.all([
    dao.assetAccountCreate({ asset_org_code, fund_org_code, account_purpose: '001' }, t),
    dao.fundAccountCreate({ asset_org_code, fund_org_code, account_purpose: '002' }, t),
    dao.fundAccountCreate({ asset_org_code, fund_org_code, account_purpose: '003' }, t),
    dao.cooperatorInfoCreate({ asset_org_code, fund_org_code }, t),
  ]);
};

const userSearchByOrgCode = (req, params) => {
  const dao = Dao(req);
  return dao.userSearchByOrgCode(params);
};
const userFullNameCheck = (req, params) => {
  const dao = Dao(req);
  return dao.userFullNameCheck(params);
};
const updateUserOrAndDictionary = async (req, params, dictionaryParams, isSame = false) => {
  const dao = Dao(req);
  if (isSame) {
    const t = await sequelizeDB.transaction();
    try {
      const [[userUpdatedAffectRows], [dictionaryUpdatedAffectRows]] = await Promise.all([
        dao.userManageUpdate(params, t),
        dao.dictionaryUpdate(dictionaryParams, t),
      ]);
      await t.commit();
      return [userUpdatedAffectRows, dictionaryUpdatedAffectRows];
    } catch (e) {
      await t.rollback();
      throw new Error(e.message);
    }
  } else {
    const [userUpdatedAffectRows] = await dao.userManageUpdate(params);
    return [userUpdatedAffectRows];
  }
};

const cooperatorInfoQueryOne = (req, params) => {
  const dao = Dao(req);
  return dao.cooperatorInfoQueryOne(params);
};

const deleteAccounts = async (req, params) => {
  const dao = Dao(req);
  const t = await sequelizeDB.transaction();
  try {
    await Promise.all([
      dao.assetAccountDelete({ ...params, account_purpose: '001' }, t),
      dao.fundAccountDelete({ ...params, account_purpose: '002' }, t),
      dao.fundAccountDelete({ ...params, account_purpose: '003' }, t),
      dao.cooperatorInfoDelete(params, t),
    ]);
    await t.commit();
  } catch (e) {
    console.log(e);
    await t.rollback();
  }
};
const notAddedRelationQuery = (req, params, isAsset = false) => {
  const dao = Dao(req);
  if (isAsset) {
    return dao.notAddRelationAssetOrgQuery(params);
  }
  return dao.notAddRelationFundOrgQuery(params);
};
const addedRelationQuery = (req, params, isAsset = false) => {
  const dao = Dao(req);
  if (isAsset) {
    return dao.addedRelationAssetOrgQuery(params);
  }
  return dao.addedRelationFundOrgQuery(params);
};

const cooperatorInfoCreate = async (req, relationOrgCodes, orgCode, isAsset) => {
  const dao = Dao(req);
  const t = await sequelizeDB.transaction();
  try {
    await Promise.all(relationOrgCodes.map((r) => {
      if (isAsset) {
        return dao.cooperatorInfoCreate(
          {
            asset_org_code: r,
            fund_org_code: orgCode,
          },
          t,
        );
      }
      return dao.cooperatorInfoCreate(
        {
          asset_org_code: orgCode,
          fund_org_code: r,
        },
        t,
      );
    }));
    await t.commit();
  } catch (e) {
    console.log(e);
    await t.rollback();
    throw new Error('合作关系添加失败');
  }
};
const cooperatorInfoSupplement = (req) => {
  const dao = Dao(req);
  return dao.cooperatorInfoSupplement();
};

module.exports = {
  cooperatorInfoQueryAndCount,
  userSearchByUserFullName,
  maxOrgCodeSearchByUserType,
  createUserAndDictionary,
  cooperatorInfoPreCount,
  accountsCreate,
  // update
  userSearchByOrgCode,
  userFullNameCheck,
  updateUserOrAndDictionary,
  cooperatorInfoQueryOne,
  // delete
  deleteAccounts,
  // others
  notAddedRelationQuery,
  addedRelationQuery,
  cooperatorInfoCreate,
  cooperatorInfoSupplement,
};
