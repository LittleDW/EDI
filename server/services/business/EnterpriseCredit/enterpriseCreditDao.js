/**
 * @author robin
 * @file enterpriseCreditDao
 * @date 2018-04-13 17:07
 */
const Super = require('../super');
const dao = require('../../../dao');

const { Enterprise, Common } = dao;

class EnterpriseCreditDao extends Super {
  assetQuery(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      borrow_name,
      fund_credit_status,
      asset_credit_status,
      fund_org_code,
      asset_org_code,
      page_index,
    } = params;
    return Enterprise.EnterpriseAssetCredit(this.info, ['asset','admin']).corpAssetAuth(
      {
        borrow_date_start,
        borrow_date_end,
        min_fee,
        max_fee,
        borrow_name,
        fund_credit_status,
        asset_credit_status,
        fund_org_code,
        asset_org_code,
      },
      page_index,
    );
  }
  assetCount(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      borrow_name,
      fund_credit_status,
      asset_credit_status,
      fund_org_code,
      asset_org_code,
    } = params;
    return Enterprise.EnterpriseAssetCredit(this.info, ['asset','admin']).corpAssetAuthCount({
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      borrow_name,
      fund_credit_status,
      asset_credit_status,
      fund_org_code,
      asset_org_code,
    });
  }
  fundQuery(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      borrow_name,
      fund_credit_status,
      asset_credit_status,
      fund_org_code,
      asset_org_code,
      page_index,
    } = params;
    return Enterprise.EnterpriseFundCredit(this.info, ['fund']).corpFundAuth(
      {
        borrow_date_start,
        borrow_date_end,
        min_fee,
        max_fee,
        borrow_name,
        fund_credit_status,
        asset_credit_status,
        fund_org_code,
        asset_org_code,
      },
      page_index,
    );
  }
  fundCount(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      borrow_name,
      fund_credit_status,
      asset_credit_status,
      fund_org_code,
      asset_org_code,
    } = params;
    return Enterprise.EnterpriseFundCredit(this.info, ['fund']).corpFundAuthCount({
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      borrow_name,
      fund_credit_status,
      asset_credit_status,
      fund_org_code,
      asset_org_code,
    });
  }
  detail(params = {}) {
    const { fund_org_code, asset_org_code, borrow_business_license } = params;
    return Enterprise.EnterpriseFundCredit(this.info, ['asset','fund','admin']).corpAuthDetail({
      fund_org_code,
      asset_org_code,
      borrow_business_license,
    });
  }
  creditDetail(params = {}) {
    const { fund_org_code, asset_org_code, borrow_business_license } = params;
    return Enterprise.EnterpriseCreditCredit(this.info, ['asset','fund','admin']).corpAuthCredit({
      fund_org_code,
      asset_org_code,
      borrow_business_license,
    });
  }
  count(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      fund_credit_status,
      asset_credit_status,
      borrow_name,
      fund_org_code,
      asset_org_code,
    } = params;
    return Enterprise.EnterpriseAssetCredit(this.info, ['asset']).corpAssetAuthCount({
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      fund_credit_status,
      asset_credit_status,
      borrow_name,
      fund_org_code,
      asset_org_code,
    });
  }
  voucher(params = {}) {
    const { asset_org_code, borrow_business_license } = params;
    return Enterprise.EnterpriseCreditVoucher(this.info).corpAuthVoucher({
      asset_org_code,
      borrow_business_license,
    });
  }
  assetVoucher(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      fund_credit_status,
      asset_credit_status,
      borrow_name,
      fund_org_code,
      asset_org_code,
    } = params;
    return Enterprise.EnterpriseCreditVoucher(this.info, ['asset','admin']).filterCorpAuthAssetVoucher({
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      fund_credit_status,
      asset_credit_status,
      borrow_name,
      fund_org_code,
      asset_org_code,
    });
  }
  fundVoucher(params = {}) {
    const {
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      fund_credit_status,
      asset_credit_status,
      borrow_name,
      fund_org_code,
      asset_org_code,
    } = params;
    return Enterprise.EnterpriseCreditVoucher(this.info, ['fund']).filterCorpAuthFundVoucher({
      borrow_date_start,
      borrow_date_end,
      min_fee,
      max_fee,
      fund_credit_status,
      asset_credit_status,
      borrow_name,
      fund_org_code,
      asset_org_code,
    });
  }
}

module.exports = req => new EnterpriseCreditDao(req);
