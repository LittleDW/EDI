/**
 * @Author zhangjunjie
 * @Date 2018/4/12 14:36
 * @Description: fundSetting Controller
*/

const fundSetting = require('../../services').business.fundSetting;

const search = async(req, res) => {
  const {fundList} = await fundSetting.search(req)
  return res.json({success: true, fundList})
}

const searchHis = async (req, res) => {
  const {total, hisList} = await fundSetting.searchHis(req)
  return res.json({success: true, total, hisList})
}

const update = async (req, res) => {
  const {success} = await fundSetting.update(req)
  return res.json({success: true})
}

module.exports = {
  search,
  searchHis,
  update,
}
