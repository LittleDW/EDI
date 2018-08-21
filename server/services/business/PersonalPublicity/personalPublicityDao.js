/**
 * @author robin
 * @file personalPublicity
 * @date 2018-04-26 16:37
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Order, Publicity } = dao;
const sequelize = require('sequelize');

class EnterprisePublicityDao extends Super {
  count(params = {}) {
    const {
      start_date, end_date, task_name, org_code,
    } = params;
    return Publicity.PersonalInformation(this.info).count({
      start_date,
      end_date,
      task_name,
      org_code,
    });
  }

  query(params = {}) {
    const {
      org_code, task_name, start_date, end_date, page_index,
    } = params;
    return Publicity.PersonalInformation(this.info).query(
      {
        org_code, task_name, start_date, end_date,
      },
      page_index,
    );
  }
  queryAll(params = {}) {
    const {
      org_code, task_name, start_date, end_date,
    } = params;
    return Publicity.PersonalInformation(this.info).queryAll(
      {
        org_code, task_name, start_date, end_date,
      },
    );
  }
  orderQuery(params = {}) {
    const {
      asset_order_no,
      order_no,
      borrow_name,
      borrow_certificate_no,
      borrow_phone,
      borrow_card_no,
      asset_org_code,
      fund_org_code,
    } = params;
    return Order.Order(this.info).publicityQuery({
      asset_order_no,
      order_no,
      borrow_name,
      borrow_certificate_no,
      borrow_phone,
      borrow_card_no,
      asset_org_code,
      fund_org_code,
    });
  }

  publicityQuery(params = {}) {
    const { task_name, org_code } = params;
    return Publicity.PersonalInformation(this.info).publicityQuery({ task_name, org_code });
  }
  publicityDetailQuery(params = {}) {
    const { task_name, company_name, org_code } = params;
    return Publicity.PersonalInformationDetail(this.info).count({
      task_name,
      company_name,
      org_code,
    });
  }
  createPublicity(params = {},transaction) {
    const {
      task_name, org_code, task_status, total_count,
    } = params;
    return Publicity.PersonalInformation(this.info).nativeCreate({
      task_name,
      org_code,
      task_status,
      total_count,
      task_createtime: sequelize.fn('NOW'),
    },{transaction});
  }
  createPublicityDetail(params = {},transaction) {
    const {
      org_code,
      task_name,
      task_status,
      borrow_name,
      borrow_certificate_no,
      borrow_phone,
      borrow_card_no,
      order_no,
      asset_order_no,
    } = params;
    return Publicity.PersonalInformationDetail(this.info).nativeCreate({
      org_code,
      task_name,
      task_status,
      borrow_name,
      borrow_certificate_no,
      borrow_phone,
      borrow_card_no,
      order_no,
      asset_order_no,
    },{transaction});
  }
  updatePublicity(params = {},transaction) {
    const {
      task_name, org_code, task_status, total_count,
    } = params;
    return Publicity.PersonalInformation(this.info).nativeUpdate({
      task_name,
      org_code,
      task_status,
      total_count,
    },{transaction});
  }
  updatePublicityDetail(params = {},transaction) {
    const {
      org_code,
      task_name,
      task_status,
      borrow_name,
      borrow_certificate_no,
      borrow_phone,
      borrow_card_no,
      order_no,
      asset_order_no,
    } = params;
    return Publicity.PersonalInformationDetail(this.info).nativeUpdate({
      org_code,
      task_name,
      task_status,
      borrow_name,
      borrow_certificate_no,
      borrow_phone,
      borrow_card_no,
      order_no,
      asset_order_no,
    },{transaction});
  }
  /* org_code=:?org_code, task_name=:?task_name, task_status=:?task_status, borrow_name = :?borrow_name, borrow_certificate_no = :?borrow_certificate_no, borrow_phone = :?borrow_phone, borrow_card_no = :?borrow_card_no , order_no=:?order_no, asset_order_no=:?asset_order_no
  orderQuery(params = {}) {
    const {asset_order_no, order_no, fund_org_code, asset_org_code} = params;
    return Enterprise
      .EnterpriseOrder(this.info)
      .corpOrdersForPublicity({asset_order_no, order_no, fund_org_code, asset_org_code});
  }
  publicityQuery(params = {}) {
    const {task_name,org_code} = params;
    return Publicity
      .EnterpriseInformation(this.info)
      .count({task_name,org_code});
  }
  publicityDetailQuery(params = {}) {
    const {task_name,company_name,org_code} = params;
    return Publicity
      .EnterpriseInformationDetail(this.info)
      .count({task_name,company_name,org_code});
  }
  createPublicity(params = {}) {
    const {task_name,org_code,task_status,total_count} = params;
    return Publicity
      .EnterpriseInformation(this.info)
      .nativeCreate({task_name,org_code,task_status,total_count});
  }
  createPublicityDetail(params = {}) {
    const {task_name,org_code,company_name,task_status } = params;
    return Publicity
      .EnterpriseInformationDetail(this.info)
      .count({task_name,org_code,company_name,task_status});
  } */
}

module.exports = req => new EnterprisePublicityDao(req);
