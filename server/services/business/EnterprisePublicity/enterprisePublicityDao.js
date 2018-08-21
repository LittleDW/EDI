/**
 * @author robin
 * @file enterprisePublicityDao
 * @date 2018-04-18 11:46
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order, Enterprise, Publicity } = dao;
const sequelize = require('sequelize');

class EnterprisePublicityDao extends Super {
  count(params = {}) {
    const {
      start_date, end_date, task_name, page_index, org_code,
    } = params;
    return Publicity.EnterpriseInformation(this.info).count(
      {
        start_date, end_date, task_name, org_code,
      },
      page_index,
    );
  }

  query(params = {}) {
    const {
      start_date, end_date, task_name, page_index, org_code,
    } = params;
    return Publicity.EnterpriseInformation(this.info).query(
      {
        start_date, end_date, task_name, org_code,
      },
      page_index,
    );
  }
  queryAll(params = {}) {
    const {
      org_code, task_name, start_date, end_date,
    } = params;
    return Publicity.EnterpriseInformation(this.info).queryAll(
      {
        org_code, task_name, start_date, end_date,
      },
    );
  }
  orderQuery(params = {}) {
    const {
      asset_order_no, order_no, fund_org_code, asset_org_code,
    } = params;
    return Enterprise.EnterpriseOrder(this.info).corpOrdersForPublicity({
      asset_order_no,
      order_no,
      fund_org_code,
      asset_org_code,
    });
  }
  publicityQuery(params = {}) {
    const { task_name, org_code } = params;
    return Publicity.EnterpriseInformation(this.info).publicityQuery({ task_name, org_code });
  }
  publicityDetailQuery(params = {}) {
    const { task_name, company_name, org_code } = params;
    return Publicity.EnterpriseInformationDetail(this.info).count({
      task_name,
      company_name,
      org_code,
    });
  }
  createPublicity(params = {},transaction) {
    const {
      task_name, org_code, task_status, total_count,
    } = params;
    return Publicity.EnterpriseInformation(this.info).nativeCreate({
      task_name,
      org_code,
      task_status,
      total_count,
      task_createtime: sequelize.fn('NOW'),
    },{transaction});
  }
  createPublicityDetail(params = {},transaction) {
    const {
      task_name, org_code, company_name, task_status,
    } = params;
    return Publicity.EnterpriseInformationDetail(this.info).nativeCreate({
      task_name,
      org_code,
      company_name,
      task_status,
    },{transaction});
  }
  updatePublicity(params = {},transaction) {
    const {
      task_name, org_code, task_status, total_count,
    } = params;
    return Publicity.EnterpriseInformation(this.info).nativeUpdate({
      task_name,
      org_code,
      task_status,
      total_count,
    },{transaction});
  }
  updatePublicityDetail(params = {},transaction) {
    const {
      task_name, org_code, company_name, task_status,
    } = params;
    return Publicity.EnterpriseInformationDetail(this.info).nativeUpdate({
      task_name,
      org_code,
      company_name,
      task_status,
    },{transaction});
  }
}

module.exports = req => new EnterprisePublicityDao(req);
