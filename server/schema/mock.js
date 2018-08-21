//const Sequelize = require('sequelize');
//const {Op} = require('sequelize');
process.env.NODE_ENV = 'development';
// const userAttribute = require('../dao/userAttribute');
// const fundAPI = require('../dao/fundAPI');
// const assetFund = require('../dao/common/assetFund')();
//  const user = require('../dao/user/User')();
const ediPayEmail = require('../dao/edi/ediPayEmail')();
// //const ediPayBill = require('../dao/edi/ediPayBill')();
// const ediPayEmail = require('../dao/edi/EdiPayEmail')();
// // const orderVoucher = require('../dao/order/orderVoucher');
// // const enterpriseOrder = require('../dao/enterprise/enterpriseOrder');
// // const order = require('../dao/order/order');
// const AssetApi = require('../dao/asset/AssetApi');
const Finance = require('../dao/finance/FinanceDayStatistics')()
/*
Finance.balanceStatisticsDayAdminSearch({
  org_type: 'fund_org_code',
  start_date: '2017-02-01',
  end_date: '2018-02-28'
}).then(result => {
  console.log(result)
})*/

//  "userAttributeManagement_Query": "select ifnull(org_code,'') as org_code,ifnull(partner_nature,'') as partner_nature,ifnull(is_debt_exchange,0) as is_debt_exchange,repayment_mode,ifnull(is_deadline_favor,0) as is_deadline_favor,product_deadline,supervise_bank,(select ifnull(api_url,'') from t_fund_api where fund_org_code=t_user_attribute.org_code and api_type='04') as api_url FROM t_user_attribute where 1=1 and org_code like :?org_code and partner_nature = :?partner_nature and is_debt_exchange = :?is_debt_exchange order by org_code,partner_nature limit :?page_index,10",
/*userAttribute.query(null, 0).then(function (result) {
  console.log(result)
});*/

// "userAttributeManagement_Count": "select count(1) as total FROM t_user_attribute where 1=1 and org_code like :?org_code  and partner_nature = :?partner_nature and is_debt_exchange = :?is_debt_exchange",
/*
userAttribute.count(null).then(function (result) {
  console.log(result)
});
*/

// "UserAttributeFundApiUrlCheck": "select 1 from t_fund_api  where 1=1 and fund_org_code=:?fund_org_code and api_type='04'",
/*
fundAPI.check(null).then(function (result) {
  console.log(result)
});
*/

// "UserAttributeFundApiUrlUpdate": "update t_fund_api set api_url=:?api_url where 1=1 and fund_org_code=:?fund_org_code and api_type='04'",
/*fundAPI.updateAPIURL({api_url:"125", fund_org_code:"F1502001"}).then(function (result) {
  console.log(result)
});*/

/*assetFund.relatedOrgs({ org_code: 'A1501001' }).then(function(result) {
  console.log(result.length);
  console.log([...result]);
});*/

/*userAttribute.freePatternQueryAll({user_id:"F1502002"}).then((result)=>{
  console.log(result)
})*/

/*user.freePatternQuery({org_code:"F1502002"}).then((result)=>{
  console.log(result)
})*/

/*
user.freePatternCount({org_code:"F1502002"}).then((result)=>{
  console.log(result)
})
*/

setTimeout(()=>{
  ediPayEmail.query({org_code:"A1501001"}).then((result)=>{
    console.log(result)
  })
},5000)

/*ediPayBill.query({org_code:"A1501001"}).then((result)=>{
  console.log(result[0].get("platform_use_rate"))
})*/

// order.orders().then(r => {
//   console.log(r);
// });
/*fundSupply.queryWeekly().then(result => {
  console.log(result);
});*/
/*user.managePreCount({
  org_code:'A1501001',
  user_account: 'lnlaurence2'
}).then(result => {
  console.log(result);
});*/

/*ediPayEmail.add({org_code:"A1501001", email:"shiqifeng2014@gmail.com"}).then(result=>{
  console.log(result)
})*/
/*ediPayBill.exportQuery({org_code:"A1501001"}).then((result)=>{
  console.log(result)
})*/
/*user.freePatternQuery().then(result=>{
  console.log(result)
})*/

// financeServiceSettlement.pagingSearch({year:"2017",month:"12"}).then(result=>{
//   console.log(result)
// })

// AssetApi.query({
//   asset_org_code: 'A1501001'
// }).then(result => {
//   console.log(result)
// })

/*assetFund.settleMethodSearch().then(result=>{
  console.log(result)
})*/
