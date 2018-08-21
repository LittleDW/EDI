/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-04-18 15-03
 * @Last Modified: 2018-04-18 15-03
 * @Modified By: Osborn
 */

const ropAPI = require('../../services/rop/ropAPI');
const { AccessControl } = require('../../common/accessControl');

const PAGE_COUNT = 10;
const ROP_API_NAME = 'ruixue.edi.asset.business.specifica.get';

const search = async (req, res, next) => {
  const { pageIndex = 1 } = req.body;
  let { assetOrgCode = '' } = req.body;
  assetOrgCode = req.session.profile.user_type === 3 ? assetOrgCode : req.session.profile.org_code;
  if (!assetOrgCode) {
    return res.json({
      success: false,
      message: '发生异常',
    });
  }

  // accessControl
  assetOrgCode = AccessControl.accessControlParamsFilter(req, 'asset_org_code', assetOrgCode);

  const apiResult = await ropAPI(
    ROP_API_NAME,
    {
      asset_org_code: assetOrgCode,
    },
    null,
    true,
  );
  if (apiResult.success) {
    const data = apiResult.data.fundbusinessspecificinfos.fundbusinessspecificinfo;
    return res.json({
      data: data.slice((pageIndex - 1) * PAGE_COUNT, (pageIndex - 1) * PAGE_COUNT + PAGE_COUNT),
      success: true,
      total: data.length,
    });
  }
  return res.json(Object.assign(apiResult, { message: apiResult.data._reason }));
};

module.exports = {
  search,
};
