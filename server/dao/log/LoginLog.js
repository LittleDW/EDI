const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;

const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

// "loginLog": "INSERT INTO t_login_log set user_id=:?user_id, login_time=now(), login_type=:?login_type, login_ip=:?login_ip, login_proxy_ip=:?login_proxy_ip, login_host_name=:?login_host_name, login_mac_address=:?login_mac_address, login_browser=:?login_browser, login_system=:?login_system, create_user_id=:?user_id, sub_user_id=:?sub_user_id, rx_insertTime=now()",
// "loginLogCount": "select count(*) as total from t_login_log as l left join t_user as u on l.user_id = u.user_id where  1=1 and l.login_time >= :?login_time_start and l.login_time <= :?login_time_end and u.user_name like :?user_name and u.user_type = :?user_type",
// "loginLogQuery": "select DATE_FORMAT(l.login_time, '%Y-%m-%d %H:%i:%s') as login_time, l.login_ip as login_ip, l.login_proxy_ip as login_proxy_ip, l.login_browser as login_browser, l.login_system as login_system, l.login_mac_address as login_mac_address, case ifnull(us.user_name,'') when '' then u.user_name else concat(u.user_name,':',us.user_name) end as user_name from t_login_log as l left join t_user as u on l.user_id = u.user_id left join t_sub_user as us on l.sub_user_id = us.sub_user_id where  1=1 and l.login_time >= :?login_time_start and l.login_time <= :?login_time_end and u.user_name like :?user_name and u.user_type = :?user_type order by login_time desc limit :?page_index,10",

class LoginLog extends Model {
  logCount(params = {}) {
    const where = {};
    const associations = {};
    _.assign(
      where,
      this.durationGenerator(params, where, 'login_time', 'login_time_start', 'login_time_end'),
    );
    if (!_.isEmpty(params.user_name)) {
      _.assign(associations, {
        user_name: {
          [Op.like]: `%${params.user_name}%`,
        },
      });
    }
    if (_.isNumber(params.user_type)) {
      _.assign(associations, {
        user_type: params.user_type,
      });
    }

    return this.dao.count({
      include: [
        {
          model: this.db.t_user,
          as: 't_user',
          required: true,
          where: associations,
        },
      ],
      where,
    });
  }
  query(params = {}, page_index = 0) {
    return sequelizeDB.query(
      `SELECT
        DATE_FORMAT( l.login_time, '%Y-%m-%d %H:%i:%s' ) AS login_time,
        l.login_ip AS login_ip,
        l.login_proxy_ip AS login_proxy_ip,
        l.login_browser AS login_browser,
        l.login_system AS login_system,
        l.login_mac_address AS login_mac_address,
      CASE
        ifnull( us.user_name, '' )
        WHEN '' THEN
        u.user_name ELSE concat( u.user_name, ':', us.user_name )
        END AS user_name
      FROM
        t_login_log AS l
        LEFT JOIN t_user AS u ON l.user_id = u.user_id
        LEFT JOIN t_sub_user AS us ON l.sub_user_id = us.sub_user_id
      WHERE
        1 = 1
        ${
  _.isEmpty(params.login_time_start)
    ? ''
    : `AND l.login_time >= '${params.login_time_start}'`
}
        ${_.isEmpty(params.login_time_end) ? '' : `AND l.login_time <= '${params.login_time_end}'`}
        ${_.isEmpty(params.user_name) ? '' : `AND u.user_name LIKE '%${params.user_name}%'`}
        ${!_.isNumber(params.user_type) ? '' : `AND u.user_type = '${params.user_type}'`}
      ORDER BY
        login_time DESC
        LIMIT ${page_index},
        10`,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  create(values = {}) {
    return this.nativeCreate({...values, login_time:sequelize.fn('NOW'),});
  }
}

// const loginLog = new LoginLog('t_login_log');
module.exports = (info, accessList = []) => new LoginLog('t_login_log', info, accessList);
