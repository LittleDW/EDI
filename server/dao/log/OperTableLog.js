const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;

const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');

// "operTableLogCount": "select count(*) as total from t_oper_table_log as o left join t_user as u on o.create_user_id = u.user_id where 1=1 and o.oper_time >= :?oper_time_start and o.oper_time <= :?oper_time_end and u.user_name like :?user_name and o.from_table like :?table_name",
// "operTableLogQuery": "select DATE_FORMAT(o.oper_time, '%Y-%m-%d %H:%i:%s') as oper_time, o.oper_id as oper_id, o.from_table as from_table, o.action_type as action_type, o.oper_log as oper_log, o.from_org_code as from_org_code, case ifnull(us.user_name,'') when '' then u.user_name else concat(u.user_name,':',us.user_name) end as user_name from t_oper_table_log as o left join t_user as u on o.create_user_id = u.user_id left join t_sub_user as us on o.sub_user_id = us.sub_user_id where  1=1 and o.oper_time >= :?oper_time_start and o.oper_time <= :?oper_time_end and u.user_name like :?user_name and o.from_table like :?table_name order by oper_time desc limit :?page_index,10",
// "operTableLogUpdate": "INSERT INTO t_oper_table_log set from_table=:?from_table, from_org_code=:?from_org_code, create_user_id=:?create_user_id, sub_user_id=:?sub_user_id, action_type=:?action_type, oper_log=:?oper_log, oper_time=now(), rx_insertTime=now(), rx_updateTime=now()",

class OperTableLog extends Model {
  count(params = {}) {
    const where = {};
    const associations = {};
    _.assign(
      where,
      this.durationGenerator(params, where, 'oper_time', 'oper_time_start', 'oper_time_end'),
    );
    if (!_.isEmpty(params.user_name)) {
      _.assign(associations, { user_name: { [Op.like]: params.user_name } });
    }
    if (!_.isEmpty(params.table_name)) {
      _.assign(where, { from_table: { [Op.like]: params.table_name } });
    }
    return this.dao.count({
      include: [{ model: this.db.t_user, require: true, where: associations }],
      where,
    });
  }
  query(params = {}, page_index = 1) {
    return sequelizeDB.query(
      `
      SELECT
        DATE_FORMAT( o.oper_time, '%Y-%m-%d %H:%i:%s' ) AS oper_time,
        o.oper_id AS oper_id,
        o.from_table AS from_table,
        o.action_type AS action_type,
        o.oper_log AS oper_log,
        o.from_org_code AS from_org_code,
      CASE
          ifnull( us.user_name, '' )
          WHEN '' THEN
          u.user_name ELSE concat( u.user_name, ':', us.user_name )
        END AS user_name
      FROM
        t_oper_table_log AS o
        LEFT JOIN t_user AS u ON o.create_user_id = u.user_id
        LEFT JOIN t_sub_user AS us ON o.sub_user_id = us.sub_user_id
      WHERE
        1 = 1
        ${_.isEmpty(params.oper_time_start) ? '' : `AND o.oper_time >= '${params.oper_time_start}'`}
        ${_.isEmpty(params.oper_time_end) ? '' : `AND o.oper_time <= '${params.oper_time_end}'`}
        ${_.isEmpty(params.user_name) ? '' : `AND u.user_name LIKE '%${params.user_name}%'`}
        ${_.isEmpty(params.table_name) ? '' : `AND o.from_table = '${params.table_name}'`}
      ORDER BY
        oper_time DESC
        LIMIT ${page_index},
        10
      `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }
}

module.exports = (info, accessList = []) => new OperTableLog('t_oper_table_log', info, accessList);
