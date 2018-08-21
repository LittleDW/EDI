/*
 * @Author Osborn
 * @File cooperatorDao.js
 * @Date 2018-04-02 13-45
 */

const sequelize = require('sequelize');
const _ = require('lodash');

const { Op } = sequelize;
const { sequelizeDB } = require('../../../schema');
const Super = require('../super');
const dao = require('../../../dao');

const {
  Combination: combinationDao,
  User: userDao,
  Common: commonDao,
  Asset: assetDao,
  Fund: fundDao,
} = dao;

class Cooperator extends Super {
  cooperatorInfoQueryAndCount(params = {}) {
    const { fund_org_code, asset_org_code, page_index } = params;
    return combinationDao
      .AssetFund(this.info, ['asset', 'fund', 'admin'])
      .queryAndCountAllInfo({ fund_org_code, asset_org_code }, page_index);
  }
  userSearchByUserFullName(params = {}) {
    const { user_full_name, user_type } = params;
    return userDao.User(this.info).userSearchByUserFullName({ user_full_name, user_type });
  }
  maxOrgCodeSearchByUserType(params = {}) {
    const { user_type } = params;
    return userDao.User(this.info).maxOrgCodeSearchByUserType({ user_type });
  }
  userManageCreate(params = {}, t = null) {
    const {
      user_id,
      user_type,
      user_from,
      org_code,
      user_account,
      password,
      user_name,
      user_full_name,
      rop_user_id,
      linkman,
      mobile,
      email,
    } = params;
    const user_status = 1;
    return userDao.User(this.info).nativeCreate(
      {
        user_id,
        user_type,
        user_from,
        org_code,
        user_account,
        password,
        user_name,
        user_full_name,
        rop_user_id,
        linkman,
        mobile,
        email,
        user_status,
      },
      {
        transaction: t,
        action_type: 'cooperator',
        specialFieldName: {
          mobile: '联系人联系方式',
          email: '联系人邮箱',
          user_name: '资金方简称',
          user_full_name: '资金方名称',
        },
      },
    );
  }

  dictionaryCreate(params = {}, t = null) {
    const {
      table_name, col_name, para_key, para_value,
    } = params;
    return commonDao.SysParaInfo(this.info).nativeCreate(
      {
        table_name,
        col_name,
        para_key,
        para_value,
      },
      { transaction: t },
    );
  }
  cooperatorInfoPreCount(params = {}) {
    const { asset_org_code, fund_org_code } = params;
    return combinationDao
      .AssetFund(this.info)
      .nativeCount({ where: { asset_org_code, fund_org_code } });
  }
  assetAccountCreate(params = {}, t) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    return assetDao.AssetAccount(this.info).nativeCreate(
      {
        fund_org_code,
        asset_org_code,
        account_purpose,
      },
      {
        transaction: t,
        hooks: false,
      },
    );
  }
  fundAccountCreate(params = {}, t) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    return fundDao.FundAccount(this.info).nativeCreate(
      {
        fund_org_code,
        asset_org_code,
        account_purpose,
      },
      {
        transaction: t,
        hooks: false,
      },
    );
  }
  cooperatorInfoCreate(params = {}, t) {
    const { fund_org_code, asset_org_code } = params;
    return combinationDao.AssetFund(this.info).nativeCreate(
      {
        fund_org_code,
        asset_org_code,
      },
      {
        transaction: t,
        action_type: 'cooperator',
      },
    );
  }
  userSearchByOrgCode(params = {}) {
    const { org_code } = params;
    return userDao.User(this.info).nativeQuerySingle({
      where: { org_code },
    });
  }
  userFullNameCheck(params = {}) {
    const { user_full_name, user_type, org_code } = params;
    return userDao.User(this.info).nativeQuery({
      where: {
        user_full_name,
        user_type,
        user_from: 2,
        org_code: { [Op.ne]: org_code },
      },
    });
  }
  userManageUpdate(params = {}, t = null) {
    const {
      user_type,
      org_code,
      user_account,
      user_name,
      user_full_name,
      rop_user_id,
      linkman,
      mobile,
      email,
    } = params;
    const { user_id } = params;
    return userDao.User(this.info).nativeUpdate(
      {
        user_type,
        org_code,
        user_account,
        user_name,
        user_full_name,
        rop_user_id,
        linkman,
        mobile,
        email,
      },
      {
        where: { user_id },
        transaction: t,
        action_type: 'cooperator',
        specialFieldName: {
          mobile: '联系人联系方式',
          email: '联系人邮箱',
          user_name: '资金方简称',
          user_full_name: '资金方名称',
        },
      },
    );
  }

  dictionaryUpdate(params = {}, t) {
    const {
      table_name, col_name, para_key, para_value,
    } = params;
    const {
      old_table_name, old_col_name, old_para_key, old_para_value,
    } = params;
    return commonDao.SysParaInfo(this.info).nativeUpdate(
      {
        table_name,
        col_name,
        para_key,
        para_value,
      },
      {
        where: {
          table_name: old_table_name,
          col_name: old_col_name,
          para_key: old_para_key,
          para_value: old_para_value,
        },
        transaction: t,
      },
    );
  }
  cooperatorInfoQueryOne(params = {}) {
    const { fund_org_code, asset_org_code } = params;
    return combinationDao.AssetFund(this.info).querySingleInfo({ fund_org_code, asset_org_code });
  }
  assetAccountDelete(params = {}, t = null) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    if (_.isEmpty(fund_org_code) || _.isEmpty(asset_org_code) || _.isEmpty(account_purpose)) {
      throw new Error('error');
    }
    return assetDao
      .AssetAccount(this.info)
      .nativeDelete({
        where: { fund_org_code, asset_org_code, account_purpose },
        transaction: t,
      })
      .catch((e) => {
        throw new Error('资产方账号删除失败');
      });
  }
  fundAccountDelete(params = {}, t = null) {
    const { fund_org_code, asset_org_code, account_purpose } = params;
    if (_.isEmpty(fund_org_code) || _.isEmpty(asset_org_code) || _.isEmpty(account_purpose)) {
      throw new Error('error');
    }
    return fundDao
      .FundAccount(this.info)
      .nativeDelete({
        where: { fund_org_code, asset_org_code, account_purpose },
        transaction: t,
      })
      .catch((e) => {
        throw new Error('资金方账号删除失败');
      });
  }
  cooperatorInfoDelete(params = {}, t = null) {
    const { asset_org_code, fund_org_code } = params;
    if (_.isEmpty(asset_org_code) || _.isEmpty(fund_org_code)) {
      throw new Error('error');
    }
    return combinationDao
      .AssetFund(this.info)
      .nativeDelete({
        where: { asset_org_code, fund_org_code },
        transaction: t,
      })
      .catch((e) => {
        throw new Error('资金方账号删除失败');
      });
  }

  notAddRelationAssetOrgQuery(params = {}) {
    const { org_code } = params;
    return userDao.User(this.info).notAddRelationAssetOrgQuery({ org_code });
  }
  notAddRelationFundOrgQuery(params = {}) {
    const { org_code } = params;
    return userDao.User(this.info).notAddRelationFundOrgQuery({ org_code });
  }
  addedRelationAssetOrgQuery(params = {}) {
    const { org_code } = params;
    return userDao.User(this.info).addedRelationAssetOrgQuery({ org_code });
  }
  addedRelationFundOrgQuery(params = {}) {
    const { org_code } = params;
    return userDao.User(this.info).addedRelationFundOrgQuery({ org_code });
  }
  cooperatorInfoSupplement() {
    return combinationDao.AssetFund(this.info).cooperatorInfoSupplement();
  }
}

module.exports = req => new Cooperator(req);
