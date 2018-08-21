/**
 * @Author zhangjunjie
 * @Date 2018/4/17 16:41
 * @Description: 结算方式 settleMethod Controller
 */

const { settleMethod } = require('../../services').business;
const { parsingStream } = require('../../services').business.common;

const search = async (req, res) => {
  const { methodList } = await settleMethod.search(req);
  return res.json({
    success: true,
    methodList,
  });
};

const update = async (req, res) => {
  await parsingStream(settleMethod.update, req);
  return res.json({
    success: true,
  });
};
module.exports = {
  search,
  update,
};
