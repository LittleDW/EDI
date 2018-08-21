var {getConnectionQ,getWriteConnectionQ} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue,moment} = require("../util"), router = Router();

/**
 * 作者：张俊杰
 * 模块：余额统计表
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("balance_statistics")){
    res.json({success:false, message:"您没有调用余额统计表页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let {
      startDate,
      endDate,
      orgType,
    } = req.body
    let assetOrgCode, fundOrgCode
    const session = req.session.profile
    let params = {startDate, endDate}
    if (session.user_type === 1) {
      assetOrgCode = session.org_code
      params['assetOrgCode'] = assetOrgCode
    } else if (session.user_type === 2) {
      fundOrgCode = session.org_code
      params['fundOrgCode'] = fundOrgCode
    }
    params = getMySQLFieldValue({...params,...req.session.subUserDataRestriction})
    let user_type = session.user_type
    let [[monthList]] = yield [Query.call(connection, user_type === 3 ? (orgType ==='fund_org_code' ? sqls.balanceFundStatisticsMonthAdmin : sqls.balanceAssetStatisticsMonthAdmin) : (user_type === 1 ? sqls.balanceAssetStatisticsMonth : sqls.balanceFundStatisticsMonth), params)]
    startDate = moment(startDate, 'YYYY-MM').format('YYYY-MM-DD')
    endDate = moment(endDate, 'YYYY-MM').add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD')
    let [[dayList]] = yield [Query.call(connection, user_type === 3 ? (orgType ==='fund_org_code' ? sqls.balanceFundStatisticsDayAdmin : sqls.balanceAssetStatisticsDayAdmin) : (user_type === 1 ? sqls.balanceAssetStatisticsDay : sqls.balanceFundStatisticsDay), Object.assign(params, getMySQLFieldValue({startDate, endDate})))]
    startDate = moment().subtract(1, 'month').format('YYYY-MM-DD')
    endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
    let [[balanceList]] = yield [Query.call(connection, user_type === 3 ? (orgType ==='fund_org_code' ? sqls.balanceFundStatisticsBalanceAdmin : sqls.balanceAssetStatisticsBalanceAdmin) : (user_type === 2 ? sqls.balanceFundStatisticsBalance : sqls.balanceAssetStatisticsBalance), Object.assign(params, getMySQLFieldValue({startDate, endDate})))]
    if (!monthList || !monthList[0]) {
      throw new Error("无记录")
    }
    if (!dayList || !dayList[0]) {
      throw new Error("无记录")
    }
    if (!balanceList || !balanceList[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      monthList,
      dayList,
      balanceList,
    })
    return monthList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/searchTab4', (req, res) => {
  if(req.session.profile.user_type !== 3){
    res.json({success:false, message:"您没有调用余额统计表页面余额统计接口的权限"})
    return
  }
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    const {
      assetList,
      fundList,
    } = req.body
    const assetSql = !assetList ? '' : `AND org_code IN ( ${assetList.split(',').map(item => '\'' + item + '\'').join(',')} )`
    const fundSql = !fundList ? '' : `AND org_code IN ( ${fundList.split(',').map(item => '\'' + item + '\'').join(',')} )`
    let [balaStaList] = yield Query.call(connection, sqls.balanceStatisticsTab4.replace('__ASSETLIST__', assetSql).replace('__FUNDLIST__', fundSql),getMySQLFieldValue(req.session.subUserDataRestriction) || {
      asset_data_restriction:'',
      fund_data_restriction:'',
    })
    if (!balaStaList || !balaStaList[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      balaStaList
    })
    return balaStaList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
})


module.exports = router
