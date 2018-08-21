const Sequelize = require('sequelize');
const dbconfig = require('../../config/configure.json')[process.env.NODE_ENV].db;
const { logger } = require('../util');
const hooks = require('../common/hooks');

const { read: readDB, write: writeDB } = dbconfig;

const sequelizeDB = new Sequelize(null, null, null, {
  dialect: 'mysql',
  timezone: '+08:00',
  pool: {
    max: readDB.connectionLimit,
    min: 0,
    acquire: 600000,
    idle: 600000,
  },
  dialectOptions: {
    requestTimeout: 600000,
  },
  replication: {
    read: { ...readDB, username: readDB.user },
    write: { ...writeDB, username: writeDB.user },
  },
  logging: (str) => logger.info(str.replace(/\s*\n\s*/g, ' ')),
  define: {
    timestamps: false,
    hooks,
  },
  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  // operatorsAliases: false
});
sequelizeDB.options.logging = sequelizeDB.options.logging.bind(sequelizeDB);
// let writeSequelizeDB = sequelizeDB
const db = {
  t_asset_account: require('./t_asset_account')(sequelizeDB, Sequelize),
  t_asset_api: require('./t_asset_api')(sequelizeDB, Sequelize),
  t_asset_day_plan: require('./t_asset_day_plan')(sequelizeDB, Sequelize),
  t_asset_deadline_day_plan: require('./t_asset_deadline_day_plan')(sequelizeDB, Sequelize),
  t_asset_fund: require('./t_asset_fund')(sequelizeDB, Sequelize),
  t_asset_fund_day_match: require('./t_asset_fund_day_match')(sequelizeDB, Sequelize),
  t_asset_fund_deadline_fee: require('./t_asset_fund_deadline_fee')(sequelizeDB, Sequelize),
  t_asset_fund_deadline_stcok: require('./t_asset_fund_deadline_stcok')(sequelizeDB, Sequelize),
  t_asset_fund_fee: require('./t_asset_fund_fee')(sequelizeDB, Sequelize),
  t_asset_week_plan: require('./t_asset_week_plan')(sequelizeDB, Sequelize),
  t_date: require('./t_date')(sequelizeDB, Sequelize),
  t_deadline: require('./t_deadline')(sequelizeDB, Sequelize),
  t_edi_order_raise_report: require('./t_edi_order_raise_report')(sequelizeDB, Sequelize),
  t_edi_order_total_report: require('./t_edi_order_total_report')(sequelizeDB, Sequelize),
  t_edi_pay_bill: require('./t_edi_pay_bill')(sequelizeDB, Sequelize),
  t_edi_pay_detail: require('./t_edi_pay_detail')(sequelizeDB, Sequelize),
  t_edi_pay_email: require('./t_edi_pay_email')(sequelizeDB, Sequelize),
  t_enterprise_asset_credit: require('./t_enterprise_asset_credit')(sequelizeDB, Sequelize),
  t_enterprise_credit_credit: require('./t_enterprise_credit_credit')(sequelizeDB, Sequelize),
  t_enterprise_credit_voucher: require('./t_enterprise_credit_voucher')(sequelizeDB, Sequelize),
  t_enterprise_fund_credit: require('./t_enterprise_fund_credit')(sequelizeDB, Sequelize),
  t_enterprise_order: require('./t_enterprise_order')(sequelizeDB, Sequelize),
  t_finance_asset_day_statistics: require('./t_finance_asset_day_statistics')(
    sequelizeDB,
    Sequelize,
  ),
  t_finance_asset_income_outgo_list: require('./t_finance_asset_income_outgo_list')(
    sequelizeDB,
    Sequelize,
  ),
  t_finance_asset_month_statistics: require('./t_finance_asset_month_statistics')(
    sequelizeDB,
    Sequelize,
  ),
  t_finance_asset_repayment_plan: require('./t_finance_asset_repayment_plan')(
    sequelizeDB,
    Sequelize,
  ),
  t_finance_day_statistics: require('./t_finance_day_statistics')(sequelizeDB, Sequelize),
  t_finance_fund_day_statistics: require('./t_finance_fund_day_statistics')(sequelizeDB, Sequelize),
  t_finance_fund_income_outgo_list: require('./t_finance_fund_income_outgo_list')(
    sequelizeDB,
    Sequelize,
  ),
  t_finance_fund_month_statistics: require('./t_finance_fund_month_statistics')(
    sequelizeDB,
    Sequelize,
  ),
  t_finance_fund_repayment_plan: require('./t_finance_fund_repayment_plan')(sequelizeDB, Sequelize),
  t_finance_loan: require('./t_finance_loan')(sequelizeDB, Sequelize),
  t_finance_loan_detail: require('./t_finance_loan_detail')(sequelizeDB, Sequelize),
  t_finance_loan_repayment_plan: require('./t_finance_loan_repayment_plan')(sequelizeDB, Sequelize),
  t_finance_month_statistics: require('./t_finance_month_statistics')(sequelizeDB, Sequelize),
  t_finance_repayment: require('./t_finance_repayment')(sequelizeDB, Sequelize),
  t_finance_repayment_detail: require('./t_finance_repayment_detail')(sequelizeDB, Sequelize),
  t_finance_repayment_plan: require('./t_finance_repayment_plan')(sequelizeDB, Sequelize),
  t_finance_service_settlement: require('./t_finance_service_settlement')(sequelizeDB, Sequelize),
  t_finance_service_settlement_detail: require('./t_finance_service_settlement_detail')(
    sequelizeDB,
    Sequelize,
  ),
  t_finance_target: require('./t_finance_target')(sequelizeDB, Sequelize),
  t_func: require('./t_func')(sequelizeDB, Sequelize),
  t_fund_account: require('./t_fund_account')(sequelizeDB, Sequelize),
  t_fund_api: require('./t_fund_api')(sequelizeDB, Sequelize),
  t_fund_borrow_account: require('./t_fund_borrow_account')(sequelizeDB, Sequelize),
  t_fund_day_plan: require('./t_fund_day_plan')(sequelizeDB, Sequelize),
  t_fund_deadline_day_plan: require('./t_fund_deadline_day_plan')(sequelizeDB, Sequelize),
  t_fund_week_plan: require('./t_fund_week_plan')(sequelizeDB, Sequelize),
  t_login_log: require('./t_login_log')(sequelizeDB, Sequelize),
  t_oper_log: require('./t_oper_log')(sequelizeDB, Sequelize),
  t_oper_table_log: require('./t_oper_table_log')(sequelizeDB, Sequelize),
  t_order: require('./t_order')(sequelizeDB, Sequelize),
  t_order_account: require('./t_order_account')(sequelizeDB, Sequelize),
  t_order_advance: require('./t_order_advance')(sequelizeDB, Sequelize),
  t_order_contract: require('./t_order_contract')(sequelizeDB, Sequelize),
  t_order_credit: require('./t_order_credit')(sequelizeDB, Sequelize),
  t_order_match_info: require('./t_order_match_info')(sequelizeDB, Sequelize),
  t_order_payment: require('./t_order_payment')(sequelizeDB, Sequelize),
  t_order_repayment: require('./t_order_repayment')(sequelizeDB, Sequelize),
  t_order_service: require('./t_order_service')(sequelizeDB, Sequelize),
  t_order_voucher: require('./t_order_voucher')(sequelizeDB, Sequelize),
  t_org_mode: require('./t_org_mode')(sequelizeDB, Sequelize),
  t_repayment: require('./t_repayment')(sequelizeDB, Sequelize),
  t_resource_crawler_config: require('./t_resource_crawler_config')(sequelizeDB, Sequelize),
  t_role: require('./t_role')(sequelizeDB, Sequelize),
  t_role_func: require('./t_role_func')(sequelizeDB, Sequelize),
  t_role_user: require('./t_role_user')(sequelizeDB, Sequelize),
  t_signature_statistics: require('./t_signature_statistics')(sequelizeDB, Sequelize),
  t_sub_user: require('./t_sub_user')(sequelizeDB, Sequelize),
  t_sys_para_info: require('./t_sys_para_info')(sequelizeDB, Sequelize),
  t_task_enterprise_pi_craw: require('./t_task_enterprise_pi_craw')(sequelizeDB, Sequelize),
  t_task_enterprise_pi_craw_detail: require('./t_task_enterprise_pi_craw_detail')(
    sequelizeDB,
    Sequelize,
  ),
  t_template_pi_craw: require('./t_template_pi_craw')(sequelizeDB, Sequelize),
  t_template_pi_craw_details: require('./t_template_pi_craw_details')(sequelizeDB, Sequelize),
  t_user: require('./t_user')(sequelizeDB, Sequelize),
  t_user_attribute: require('./t_user_attribute')(sequelizeDB, Sequelize),
  t_user_func: require('./t_user_func')(sequelizeDB, Sequelize),
  t_week: require('./t_week')(sequelizeDB, Sequelize),
  t_task_person_pi_craw: require('./t_task_person_pi_craw')(sequelizeDB, Sequelize),
  t_task_person_pi_craw_detail: require('./t_task_person_pi_craw_detail')(sequelizeDB, Sequelize),
  t_sub_user_data_func: require('./t_sub_user_data_func')(sequelizeDB, Sequelize),
  t_after_repayment_day_statistics: require('./t_after_repayment_day_statistics')(
    sequelizeDB,
    Sequelize,
  ),
  t_after_repayment_month_statistics: require('./t_after_repayment_month_statistics')(
    sequelizeDB,
    Sequelize,
  ),
  t_after_repayment_order_detail: require('./t_after_repayment_order_detail')(
    sequelizeDB,
    Sequelize,
  ),
  t_after_repayment_order: require('./t_after_repayment_order')(sequelizeDB, Sequelize),
  t_order_withdraw: require('./t_order_withdraw')(sequelizeDB, Sequelize),
};

/** left join */
db.t_login_log.belongsTo(db.t_user, { foreignKey: 'user_id' });
db.t_user.hasMany(db.t_login_log, { foreignKey: 'user_id' });

db.t_login_log.belongsTo(db.t_sub_user, { foreignKey: 'sub_user_id' });
db.t_sub_user.hasMany(db.t_login_log, { foreignKey: 'sub_user_id' });

db.t_oper_table_log.belongsTo(db.t_user, { foreignKey: 'create_user_id' });
db.t_user.hasMany(db.t_oper_table_log, { foreignKey: 'user_id' });

db.t_oper_table_log.belongsTo(db.t_sub_user, { foreignKey: 'sub_user_id' });
db.t_sub_user.hasMany(db.t_oper_table_log, { foreignKey: 'sub_user_id' });

db.t_oper_log.belongsTo(db.t_user, {
  foreignKey: 'create_user_id',
  sourceKey: 'user_id',
});
db.t_oper_log.belongsTo(db.t_user, {
  foreignKey: 'create_user_id',
  sourceKey: 'user_id',
  as: 'sub_user',
});
db.t_user.hasMany(db.t_oper_log, {
  foreignKey: 'create_user_id',
  sourceKey: 'user_id',
});

db.t_oper_log.belongsTo(db.t_sub_user, { foreignKey: 'sub_user_id' });
db.t_sub_user.hasMany(db.t_oper_log, { foreignKey: 'sub_user_id' });

db.t_oper_log.belongsTo(db.t_sys_para_info, {
  foreignKey: 'from_org_code',
  sourceKey: 'para_key',
});

db.t_asset_fund.belongsTo(db.t_user, {
  as: 'asset_user',
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_asset_fund.belongsTo(db.t_user, {
  as: 'fund_user',
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_asset_fund, {
  as: 'asset_relation',
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});
db.t_user.hasMany(db.t_asset_fund, {
  as: 'fund_relation',
  foreignKey: 'fund_org_code',
  sourceKey: 'org_code',
});

db.t_order.belongsTo(db.t_user, {
  as: 'asset_user',
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_order.belongsTo(db.t_user, {
  as: 'fund_user',
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_order, {
  as: 'asset_order',
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});
db.t_user.hasMany(db.t_order, {
  as: 'fund_order',
  foreignKey: 'fund_org_code',
  sourceKey: 'org_code',
});

db.t_order_voucher.belongsTo(db.t_order, { foreignKey: 'order_no' });
//db.t_order_voucher.belongsTo(db.t_order, { as:"t_order_vouchers",foreignKey: 'order_no' });

db.t_order.hasMany(db.t_order_voucher, { foreignKey: 'order_no' });
db.t_order.hasMany(db.t_order_voucher, { as:"t_order_order_vouchers",foreignKey: 'order_no' });

db.t_order_voucher.belongsTo(db.t_enterprise_order, { foreignKey: 'order_no' });
//db.t_order_voucher.belongsTo(db.t_enterprise_order, { as:"t_enterprise_order_vouchers",foreignKey: 'order_no' });

db.t_enterprise_order.hasMany(db.t_order_voucher, { foreignKey: 'order_no' });
db.t_enterprise_order.hasMany(db.t_order_voucher, { as:"t_enterprise_order_vouchers",foreignKey: 'order_no' });

db.t_enterprise_order.belongsTo(db.t_user, {
  as: 'asset_user',
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_enterprise_order.belongsTo(db.t_user, {
  as: 'fund_user',
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_enterprise_order, {
  as: 'asset_enterprise_order',
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});
db.t_user.hasMany(db.t_enterprise_order, {
  as: 'fund_enterprise_order',
  foreignKey: 'fund_org_code',
  sourceKey: 'org_code',
});

db.t_enterprise_credit_voucher.belongsTo(db.t_enterprise_asset_credit, {
  as: 'asset_org_code_credit',
  foreignKey: 'asset_org_code',
});
db.t_enterprise_credit_voucher.belongsTo(db.t_enterprise_asset_credit, {
  as: 'borrow_business_license_credit',
  foreignKey: 'borrow_business_license',
});

db.t_enterprise_asset_credit.belongsTo(db.t_user, {
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_enterprise_asset_credit, {
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});

db.t_asset_day_plan.belongsTo(db.t_asset_fund, {
  as: 'asset_relation',
  foreignKey: 'asset_org_code',
});
db.t_asset_day_plan.belongsTo(db.t_asset_fund, {
  as: 'fund_relation',
  foreignKey: 'fund_org_code',
});
db.t_asset_fund.hasMany(db.t_asset_day_plan, {
  as: 'asset_day_asset_plan',
  foreignKey: 'asset_org_code',
});
db.t_asset_fund.hasMany(db.t_asset_day_plan, {
  as: 'asset_day_fund__plan',
  foreignKey: 'fund_org_code',
});
db.t_asset_day_plan.belongsTo(db.t_date, {
  foreignKey: 'plan_date',
  targetKey: 'date',
});
db.t_date.hasMany(db.t_asset_day_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});

db.t_fund_day_plan.belongsTo(db.t_asset_fund, {
  as: 'asset_relation',
  foreignKey: 'asset_org_code',
});
db.t_fund_day_plan.belongsTo(db.t_asset_fund, {
  as: 'fund_relation',
  foreignKey: 'fund_org_code',
});
db.t_asset_fund.hasMany(db.t_fund_day_plan, {
  as: 'fund_day_asset_plan',
  foreignKey: 'asset_org_code',
});
db.t_asset_fund.hasMany(db.t_fund_day_plan, {
  as: 'fund_plan',
  foreignKey: 'fund_org_code',
});
db.t_fund_day_plan.belongsTo(db.t_date, {
  foreignKey: 'plan_date',
  targetKey: 'date',
});
db.t_date.hasMany(db.t_fund_day_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});

db.t_asset_deadline_day_plan.belongsTo(db.t_user, {
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_asset_deadline_day_plan, {
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});
db.t_asset_deadline_day_plan.belongsTo(db.t_date, {
  foreignKey: 'plan_date',
  targetKey: 'date',
});
db.t_date.hasMany(db.t_asset_deadline_day_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});
db.t_asset_deadline_day_plan.belongsTo(db.t_deadline, {
  foreignKey: 'deadline_id',
});
db.t_deadline.hasMany(db.t_asset_deadline_day_plan, {
  foreignKey: 'deadline_id',
});

db.t_fund_deadline_day_plan.belongsTo(db.t_user, {
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_fund_deadline_day_plan, {
  foreignKey: 'fund_org_code',
  sourceKey: 'org_code',
});
db.t_fund_deadline_day_plan.belongsTo(db.t_date, {
  foreignKey: 'plan_date',
  targetKey: 'date',
});
db.t_date.hasMany(db.t_fund_deadline_day_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});
db.t_fund_deadline_day_plan.belongsTo(db.t_deadline, {
  foreignKey: 'deadline_id',
});
db.t_deadline.hasMany(db.t_fund_deadline_day_plan, {
  foreignKey: 'deadline_id',
});

db.t_sub_user.belongsTo(db.t_user, { foreignKey: 'user_id' });
db.t_user.hasMany(db.t_sub_user, { foreignKey: 'user_id' });

db.t_func.belongsToMany(db.t_user, {
  through: db.t_user_func,
  foreignKey: 'func_id',
  targetKey: 'user_id',
});
db.t_user.belongsToMany(db.t_func, {
  through: db.t_user_func,
  foreignKey: 'user_id',
  targetKey: 'func_id',
});

db.t_func.belongsToMany(db.t_role, {
  through: db.t_role_func,
  foreignKey: 'func_id',
  targetKey: 'role_id',
});
db.t_role.belongsToMany(db.t_func, {
  through: db.t_role_func,
  foreignKey: 'role_id',
  targetKey: 'func_id',
});

db.t_finance_loan.belongsTo(db.t_user, {
  as: 'finance_loan_fund_org',
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_finance_loan, {
  as: 'finance_loan_fund_org',
  foreignKey: 'fund_org_code',
  sourceKey: 'org_code',
});

db.t_finance_loan.belongsTo(db.t_user, {
  as: 'finance_loan_asset_org',
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_finance_loan, {
  as: 'finance_loan_asset_org',
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});

db.t_asset_account.belongsTo(db.t_finance_repayment, {
  foreignKey: 'asset_org_code',
});
db.t_finance_repayment.hasMany(db.t_asset_account, {
  as: 'finance_repayment_asset',
  foreignKey: 'asset_org_code',
  sourceKey: 'asset_org_code',
  scope: { fund_org_code: { $col: 't_finance_repayment.fund_org_code' } },
});
// db.t_asset_account.belongsTo(db.t_finance_repayment, {foreignKey: 'fund_org_code',});
// db.t_finance_repayment.hasMany(db.t_asset_account, {foreignKey: 'fund_org_code',})
db.t_fund_account.belongsTo(db.t_finance_repayment, {
  foreignKey: 'asset_org_code',
});
db.t_finance_repayment.hasMany(db.t_fund_account, {
  as: 'finance_repayment_fund',
  foreignKey: 'asset_org_code',
  sourceKey: 'asset_org_code',
  scope: { fund_org_code: { $col: 't_finance_repayment.fund_org_code' } },
});
// db.t_fund_account.belongsTo(db.t_finance_repayment, {foreignKey: 'fund_org_code',});
// db.t_finance_repayment.hasMany(db.t_fund_account, {foreignKey: 'fund_org_code',})

db.t_asset_account.belongsTo(db.t_finance_service_settlement, {
  foreignKey: 'asset_org_code',
});
db.t_finance_service_settlement.hasMany(db.t_asset_account, {
  as: 'finance_service_settlement_asset',
  foreignKey: 'asset_org_code',
  sourceKey: 'asset_org_code',
  scope: {
    fund_org_code: { $col: 't_finance_service_settlement.fund_org_code' },
  },
});
/* db.t_asset_account.belongsTo(db.t_finance_service_settlement, {foreignKey: 'fund_org_code',});
db.t_finance_service_settlement.hasMany(db.t_asset_account, {foreignKey: 'fund_org_code',}) */
db.t_fund_account.belongsTo(db.t_finance_service_settlement, {
  foreignKey: 'asset_org_code',
});
db.t_finance_service_settlement.hasMany(db.t_fund_account, {
  as: 'finance_service_settlement_fund',
  foreignKey: 'asset_org_code',
  sourceKey: 'asset_org_code',
  scope: {
    fund_org_code: { $col: 't_finance_service_settlement.fund_org_code' },
  },
});
/* db.t_fund_account.belongsTo(db.t_finance_service_settlement, {foreignKey: 'fund_org_code',});
db.t_finance_service_settlement.hasMany(db.t_fund_account, {foreignKey: 'fund_org_code',}) */

db.t_asset_account.belongsTo(db.t_user, {
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_asset_account, {
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});
/*db.t_asset_account.belongsTo(db.t_user, {
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_asset_account, {
  foreignKey: 'fund_org_code',
  sourceKey: 'org_code',
});*/

/*db.t_fund_account.belongsTo(db.t_user, {
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_fund_account, {
  foreignKey: 'asset_org_code',
  sourceKey: 'org_code',
});*/
db.t_fund_account.belongsTo(db.t_user, {
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});
db.t_user.hasMany(db.t_fund_account, {
  foreignKey: 'fund_org_code',
  sourceKey: 'org_code',
});

/** inner join */
db.t_role_user.hasMany(db.t_role_func, { foreignKey: 'role_id' });
db.t_role_func.hasMany(db.t_role_user, { foreignKey: 'role_id' });

db.t_role_user.hasMany(db.t_user, { as: 't_user', foreignKey: 'user_id', sourceKey: 'user_id' });
db.t_user.hasMany(db.t_role_user, { foreignKey: 'user_id', sourceKey: 'user_id' });

db.t_func.hasMany(db.t_role_func, { foreignKey: 'func_id' });
db.t_role_func.hasMany(db.t_func, { foreignKey: 'func_id' });

db.t_func.hasMany(db.t_user_func, { foreignKey: 'func_id' });
db.t_user_func.hasMany(db.t_func, { foreignKey: 'func_id' });

db.t_enterprise_fund_credit.hasMany(db.t_enterprise_asset_credit, {
  as: 't_enterprise_asset_credit',
  foreignKey: 'asset_org_code',
  sourceKey: 'asset_org_code',
  scope: {
    borrow_business_license: {
      $col: 't_enterprise_fund_credit.borrow_business_license',
    },
  },
});
db.t_enterprise_fund_credit.hasMany(db.t_user, {
  foreignKey: 'org_code',
  sourceKey: 'asset_org_code',
});
db.t_enterprise_asset_credit.hasMany(db.t_enterprise_fund_credit, {
  foreignKey: 'asset_org_code',
  sourceKey: 'asset_org_code',
});
db.t_enterprise_fund_credit.hasMany(db.t_enterprise_asset_credit, {
  foreignKey: 'borrow_business_license',
  sourceKey: 'borrow_business_license',
  as: 't_enterprise_asset_credit_b',
});
db.t_enterprise_asset_credit.hasMany(db.t_enterprise_fund_credit, {
  foreignKey: 'borrow_business_license',
});

db.t_enterprise_credit_voucher.hasMany(db.t_enterprise_asset_credit, {
  foreignKey: 'asset_org_code',
});
db.t_enterprise_asset_credit.hasMany(db.t_enterprise_credit_voucher, {
  foreignKey: 'asset_org_code',
});
db.t_enterprise_credit_voucher.hasMany(db.t_enterprise_asset_credit, {
  foreignKey: 'borrow_business_license',
});
db.t_enterprise_asset_credit.hasMany(db.t_enterprise_credit_voucher, {
  foreignKey: 'borrow_business_license',
});
db.t_enterprise_credit_voucher.hasMany(db.t_enterprise_fund_credit, {
  foreignKey: 'asset_org_code',
});
db.t_enterprise_fund_credit.hasMany(db.t_enterprise_credit_voucher, {
  foreignKey: 'asset_org_code',
});
db.t_enterprise_credit_voucher.hasMany(db.t_enterprise_fund_credit, {
  foreignKey: 'borrow_business_license',
});
db.t_enterprise_fund_credit.hasMany(db.t_enterprise_credit_voucher, {
  foreignKey: 'borrow_business_license',
});

/*
db.t_asset_fund.hasMany(db.t_date,{constraints: false,});
db.t_date.hasMany(db.t_asset_fund,{constraints: false,});
*/

/* db.t_user.hasMany(db.t_date,{constraints: false,});
db.t_date.hasMany(db.t_user,{constraints: false,}); */

/* db.t_user.hasMany(db.t_deadline,{constraints: false,});
db.t_deadline.hasMany(db.t_user,{constraints: false,}); */

db.t_asset_week_plan.hasMany(db.t_date, {
  foreignKey: 'date',
  sourceKey: 'plan_date',
});
db.t_date.hasMany(db.t_asset_week_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});
db.t_fund_week_plan.hasMany(db.t_date, {
  foreignKey: 'date',
  sourceKey: 'plan_date',
});
db.t_date.hasMany(db.t_fund_week_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});

db.t_asset_deadline_day_plan.hasMany(db.t_date, {
  foreignKey: 'date',
  sourceKey: 'plan_date',
});
db.t_date.hasMany(db.t_asset_deadline_day_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});
db.t_fund_deadline_day_plan.hasMany(db.t_date, {
  foreignKey: 'date',
  sourceKey: 'plan_date',
});
db.t_date.hasMany(db.t_fund_deadline_day_plan, {
  foreignKey: 'plan_date',
  sourceKey: 'date',
});

db.t_week.hasMany(db.t_date, { foreignKey: 'year' });
db.t_date.hasMany(db.t_week, { foreignKey: 'year' });
db.t_week.hasMany(db.t_date, { foreignKey: 'week' });
db.t_date.hasMany(db.t_week, { foreignKey: 'week' });

db.t_asset_fund_deadline_fee.belongsTo(db.t_user, {
  as: 'asset_user',
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_asset_fund_deadline_fee.belongsTo(db.t_user, {
  as: 'fund_user',
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});

db.t_asset_fund_fee.hasMany(db.t_asset_fund, { foreignKey: 'asset_org_code' });
db.t_asset_fund.hasMany(db.t_asset_fund_fee, { foreignKey: 'asset_org_code' });
db.t_asset_fund_fee.hasMany(db.t_asset_fund, { foreignKey: 'fund_org_code' });
db.t_asset_fund.hasMany(db.t_asset_fund_fee, { foreignKey: 'fund_org_code' });
db.t_asset_fund_fee.belongsTo(db.t_asset_fund, {
  foreignKey: 'asset_org_code',
  targetKey: 'asset_org_code',
  as: 't_asset_fund',
  scope: {
    fund_org_code: {
      $col: 't_asset_fund_fee.fund_org_code',
    },
  },
});
db.t_asset_fund_fee.belongsTo(db.t_user, {
  as: 'asset_user',
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
});
db.t_asset_fund_fee.belongsTo(db.t_user, {
  as: 'fund_user',
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
});

db.t_edi_pay_bill.hasMany(db.t_user, { foreignKey: 'org_code' });
db.t_user.hasMany(db.t_edi_pay_bill, { foreignKey: 'org_code' });

db.t_edi_pay_detail.belongsTo(db.t_user, { foreignKey: 'org_code', targetKey: 'org_code' });
db.t_user.hasMany(db.t_edi_pay_detail, { foreignKey: 'org_code', targetKey: 'org_code' });

db.t_user_attribute.belongsTo(db.t_user, {
  foreignKey: 'user_id',
  targetKey: 'user_id',
});
db.t_user.hasOne(db.t_user_attribute, {
  foreignKey: 'user_id',
  sourceKey: 'user_id',
});

db.t_asset_fund_day_match.belongsTo(db.t_deadline, {
  foreignKey: 'deadline_id',
  targetKey: 'deadline_id',
  as: 't_deadline',
});
db.t_asset_fund_day_match.belongsTo(db.t_user, {
  foreignKey: 'asset_org_code',
  targetKey: 'org_code',
  as: 'asset_user',
});
db.t_asset_fund_day_match.belongsTo(db.t_user, {
  foreignKey: 'fund_org_code',
  targetKey: 'org_code',
  as: 'fund_user',
});
db.t_order_withdraw.belongsTo(db.t_order, {
  foreignKey: 'order_no',
});
db.t_order.belongsTo(db.t_fund_api, {
  foreignKey: 'fund_org_code',
});
db.t_order_withdraw.belongsTo(db.t_order_payment, {
  foreignKey: 'order_no',
});

db.t_after_repayment_order.hasMany(db.t_after_repayment_order_detail, {
  foreignKey: 'after_repayment_order_no',
});
db.t_after_repayment_order_detail.belongsTo(db.t_after_repayment_order, {
  foreignKey: 'after_repayment_order_no',
});

db.t_after_repayment_order.hasMany(db.t_asset_fund, {
  as: 't_asset_fund',
  foreignKey: 'asset_org_code',
  sourceKey: 'asset_org_code',
});
db.t_asset_fund.belongsTo(db.t_after_repayment_order, {
  as: 't_after_repayment_order',
  foreignKey: 'asset_org_code',
  targetKey: 'asset_org_code',
});

module.exports = {
  db,
  sequelizeDB,
  transaction: (promise) =>
    sequelizeDB
      .transaction()
      .then((t) => promise.then(() => t.commit()).catch((err) => t.rollback())),
};
