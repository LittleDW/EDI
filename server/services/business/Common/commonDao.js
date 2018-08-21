/**
 * @author robin
 * @file commonDao
 * @date 2018-03-30 13:28
 */
const Super = require('../super');
const dao = require('../../../dao');
const sequelize = require('sequelize');
const {Common, Combination, Asset, Fund, Role, User, Log} = dao;

class CommonDao extends Super {
  relatedOrgs(params = {}) {
    const {org_code} = params;
    return Combination
      .AssetFund(this.info)
      .relatedOrgs({org_code});
  }

  getAssetAccount(params = {}) {
    const {asset_org_code,fund_org_code} = params;
    return Asset
      .AssetAccount(this.info)
      .getAssetAccount({asset_org_code,fund_org_code});
  }

  getFundAccount(params = {}) {
    const {asset_org_code,fund_org_code} = params;
    return Fund
      .FundAccount(this.info)
      .getFundAccount({asset_org_code,fund_org_code});
  }

  dictionary(params = {}) {
    const {table_name,col_name} = params;
    return Common
      .SysParaInfo(this.info)
      .query({table_name,col_name});
  }

  userMenu(params = {}) {
    const {user_id} = params;
    return Role
      .RoleUser(this.info)
      .userMenu({user_id});
  }
  subuserMenu(params = {}) {
    const {sub_user_id} = params;
    return Role
      .RoleUser(this.info)
      .subuserMenu({sub_user_id});
  }
  deadline(params = {}) {
    const {user_id} = params;
    return Common
      .Deadline(this.info)
      .query({user_id});
  }

  getAllWeekAndDate(params = {}) {
    return Common
      .WeekAndDate.week(this.info)
      .query();
  }
  getNextWeek(params = {}) {
    return Common
      .WeekAndDate.date(this.info)
      .queryNextWeek();
  }
  checkUserInfoIntegrity(params = {}) {
    const {asset_org_code,fund_org_code} = params;
    return User
      .UserAttribute(this.info)
      .checkUserInfoIntegrity({asset_org_code,fund_org_code});
  }

  login(params = {}) {
    const {user_account,password} = params;
    return User
      .User(this.info)
      .login({user_account,password});
  }

  subuserLogin(params = {}) {
    const {user_id, user_account,password} = params;
    return User
      .SubUser(this.info)
      .login({user_id, user_account,password});
  }

  loginLogCount(params = {}) {
    const {login_time_start, login_time_end, user_name,user_type} = params;
    return Log
      .LoginLog(this.info)
      .logCount( {login_time_start, login_time_end, user_name,user_type});
  }

  loginLogQuery(params = {}) {
    const {login_time_start, login_time_end, user_name,user_type, page_index} = params;
    return Log
      .LoginLog(this.info)
      .query({login_time_start, login_time_end, user_name,user_type}, page_index);
  }
  createLoginLog(params = {}) {
    const {user_id, login_type, login_ip, login_proxy_ip, login_host_name, login_mac_address, login_browser,
      login_system, create_user_id, sub_user_id} = params;
    const dao = Log.LoginLog(this.info)
    return dao
      .create({user_id, login_type, login_ip, login_proxy_ip, login_host_name, login_mac_address, login_browser,
        login_system, create_user_id, sub_user_id}
      );
  }
  financeOperLogQuery(params = {}) {
    const {from_table, from_table_key} = params;
    return Log
      .OperLog(this.info)
      .search({from_table, from_table_key});
  }
  operLogQuery(params = {}) {
    const {from_table, from_table_key, action_type, page_index} = params;
    return Log
      .OperLog(this.info)
      .operLogModalQuery({from_table, from_table_key, action_type}, page_index);
  }
  operLogCombinedQuery(params = {}) {
    const {from_table_collection, page_index} = params;
    if(!Array.isArray(from_table_collection) || (from_table_collection.length === 0)){
      throw new Error("并集日志查询")
    }
    return Log
      .OperLog(this.info)
      .operLogModalCombinedQuery(from_table_collection, page_index);
  }
  dataRestriction(params = {}) {
    const {sub_user_id, user_type} = params;
    return User
      .SubUserDataFunc(this.info)
      .nativeQuery({ where: { sub_user_id, user_type } });
  }

  createTableExportingLog(params = {}) {
    const {from_table, from_org_code, create_user_id, sub_user_id, total, params:param, action_type} = params;
    const dao = Log.OperTableLog(this.info)
    let chineseTableName = dao.db[from_table].options.chineseTableName
    return dao
      .nativeCreate({
        from_table, from_org_code, create_user_id, sub_user_id, action_type,
        oper_log: `动作：导出 ${chineseTableName} ${total}条, 导出参数 ${JSON.stringify(param)}`,
        oper_time:sequelize.fn('NOW'),
        rx_insertTime: sequelize.fn('NOW'),
        rx_updateTime: sequelize.fn('NOW'),
      },{ hooks: false},);
  }

  simplyLogIt(params = {}){
    const {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, params:param, action_type} = params;
    const dao = Log.OperTableLog(this.info)
    let chineseTableName = dao.db[from_table].options.chineseTableName
    return dao.nativeCreate(
        {
          action_type,
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id,
          oper_log: `动作：${action_type}, 操作表 ${chineseTableName}, 参数 ${JSON.stringify(param)}`,
          oper_time:sequelize.fn('NOW'),
          rx_insertTime: sequelize.fn('NOW'),
          rx_updateTime: sequelize.fn('NOW'),
        },
        { hooks: false},
      )
  }

  simplyLogTable(params = {}) {
    const {from_table, from_org_code, create_user_id, sub_user_id, total, params:param, action_type} = params;
    const dao = Log.OperTableLog(this.info)
    let chineseTableName = dao.db[from_table].options.chineseTableName
    return dao
      .nativeCreate({
        from_table:`[${from_table}]`, from_org_code, create_user_id, sub_user_id, action_type,
        oper_log: `动作：${action_type}, 操作表 ${chineseTableName}，数量${total}条, 参数 ${JSON.stringify(param)}`,
        oper_time:sequelize.fn('NOW'),
        rx_insertTime: sequelize.fn('NOW'),
        rx_updateTime: sequelize.fn('NOW'),
      },{ hooks: false},);
  }
}

module.exports = req => new CommonDao(req);
