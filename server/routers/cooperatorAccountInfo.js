/**
 * @author robin
 * @file cooperatorAccountInfo
 * @date 2018-04-17 10:04
 */
var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'),
  sqls = require("../../config/sqls.json"), ropAPI = require("../ropAPI"),
  {logger, promisify, co, Router, getMySQLFieldValue, propertyChangeLogger,uuidv4} = require("../util"),
  router = Router();

router.use((req, res, next) => {
  if(!req.session._submenu.includes("cooperator_account_info")){
    res.json({success:false, message:"您没有调用开户信息页面接口的权限"})
    return
  }
  next();
})

router.post('/accountInfo', (req, res, next) => {
  let {borrow_type, borrow_certificate_no, asset_org_code, fund_org_code, page_index} = getMySQLFieldValue(req.body),
    {user_type, org_code: myOrgCode} = req.session.profile
  if(isNaN(page_index)){
    page_index = 1
  }
  if(user_type === 1){
    asset_org_code = myOrgCode
  } else if(user_type === 2){
    fund_org_code = myOrgCode
  } else if(user_type === 4){
    res.json({success:false, message: "系统管理员无权操作"})
    return
  } else if (req.session.subUserDataRestriction && req.session.subUserDataRestriction.assetDataRestriction && !req.session.subUserDataRestriction.assetDataRestriction.includes(asset_org_code)) {
    res.json({success:false, message: "您无权查找该资产方数据"})
    return
  }

  let param = {borrow_type, borrow_certificate_no, fund_org_code, asset_org_code}
  return ropAPI("ruixue.edi.asset.account.info.get", param, null, true).then(result=>{
    if(result.success){
      let {borrowaccountinfos} = result.data, {borrowaccountinfo} = borrowaccountinfos, total = 0, rows = [];
      if(Array.isArray(borrowaccountinfo)){
        if(req.session.subUserDataRestriction){
          let {fundDataRestriction} = req.session.subUserDataRestriction
          borrowaccountinfo = borrowaccountinfo.filter(r=> fundDataRestriction.includes(r.fund_org_code))
        }
        total = borrowaccountinfo.length
        rows = borrowaccountinfo.splice((page_index - 1)*10,10).map(r=>({...param,...r}))
      }
      res.json({success: true, total, rows})
    } else {
      res.json({success:false, message: result.data && result.data._reason || "接口发生错误"})
    }
  })
});

module.exports = router
