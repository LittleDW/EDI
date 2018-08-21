/*
 * @Author Osborn
 * @File validates.js
 * @Date 2018-04-03 09-50
 */

const validateWithUserType = ( userType = 0, fields = {}) => {
  const { user_full_name, user_name, linkman, mobile, email} = fields;
  switch (userType) {
    case 1:
      if (!user_full_name) {
        throw new Error('资金方名称不能为空');
      } else if (!user_name) {
        throw new Error('资金方简称不能为空');
      } else if (!linkman) {
        throw new Error('资金方联系人不能为空');
      } else if (!mobile) {
        throw new Error('资金方联系方式不能为空');
      } else if (!email) {
        throw new Error('资金方联系邮箱不能为空');
      }
      break;
    case 2:
      if (!user_full_name) {
        throw new Error('资产方名称不能为空');
      } else if (!user_name) {
        throw new Error('资产方简称不能为空');
      } else if (!linkman) {
        throw new Error('资产方联系人不能为空');
      } else if (!mobile) {
        throw new Error('资产方联系方式不能为空');
      } else if (!email) {
        throw new Error('资产方联系邮箱不能为空');
      }
      break;
    default:
      if (!user_full_name) {
        throw new Error('名称不能为空');
      } else if (!user_name) {
        throw new Error('简称不能为空');
      } else if (!linkman) {
        throw new Error('联系人不能为空');
      } else if (!mobile) {
        throw new Error('联系方式不能为空');
      } else if (!email) {
        throw new Error('联系邮箱不能为空');
      }
  }
}

module.exports = {
  validateWithUserType,
}


