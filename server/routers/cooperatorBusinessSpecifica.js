/*
 * Created by Osborn on Fri Mar 09 2018
 */

const ropAPI = require('../ropAPI');
const { Router } = require('../util');
const router = Router();

router.use((req, res, next) => {
  if (!req.session._submenu.includes('cooperator_business_specifica')) {
    res.json({ success: false, message: '您没有调用合作方管理业务端口的权限' });
    return;
  }
  next();
});

router.post('/search', (req, res, next) => {
  const { pageIndex = 1 } = req.body;
  let { assetOrgCode = '' } = req.body;
  const PAGE_COUNT = 10;
  assetOrgCode =
    req.session.profile.user_type === 3
      ? assetOrgCode
      : req.session.profile.org_code;
  if (!assetOrgCode) {
    return res.json({
      success: false,
      message: '发生异常',
    });
  }
  if(req.session.subUserDataRestriction){
    let {assetDataRestriction} = req.session.subUserDataRestriction
    if(!assetDataRestriction.includes(assetOrgCode)){
      return res.json({success: false, message: '查无此资产方权限',});
    }
  }
  return ropAPI(
    'ruixue.edi.asset.business.specifica.get',
    {
      asset_org_code: assetOrgCode,
    },
    null,
    true
  )
    .then(apiResult => {
      if (apiResult.success) {
        let data = apiResult.data.fundbusinessspecificinfos.fundbusinessspecificinfo;
        if(req.session.subUserDataRestriction){
          let {fundDataRestriction} = req.session.subUserDataRestriction
          data = data.filter(r=> fundDataRestriction.includes(r.fund_org_code))
        }
        res.json({
          data: data.slice(
            (pageIndex - 1) * PAGE_COUNT,
            (pageIndex - 1) * PAGE_COUNT + PAGE_COUNT
          ),
          success: true,
          total: data.length,
        });
      } else {
        res.json(Object.assign(apiResult, { message: apiResult.data._reason }));
      }
    })
    .catch(e => {
      res.json({
        success: false,
        message: (e && e.message) || e || '发生异常',
      });
    });
});

module.exports = router;
