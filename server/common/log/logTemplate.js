/*
 * @Author Osborn
 * @File template.js
 * @Created Date 2018-04-26 10-44
 * @Last Modified: 2018-04-26 10-44
 * @Modified By: Osborn
 */

const _ = require('lodash');

module.exports = {
  update: {
    default: (actionText = '', data = []) =>
      `修改内容：${actionText} ${data
        .map((d) => {
          if (d.name.indexOf('密码') > -1) {
            return '修改了密码';
          }
          d.previousData = _.isNull(d.previousData) ? '空' : d.previousData;
          d.nextData = _.isNull(d.nextData) ? '空' : d.nextData;
          return `${d.name} 由 ${d.previousData} 改变为 ${d.nextData}`;
        })
        .join(' ,')}`,
    operator: (actionText = '', data = []) => `操作人：${data.map((d) => d.nextData)}`,
    dictionary: (actionText, data = []) =>
      `修改内容：更新词条 ${data.map((d) => d.nextData).join(',')}`,
  },
  delete: {
    default: (actionText = '', data = []) => `删除内容：${actionText} ${data.map((d) => `${d.name} : ${d.nextData}`).join(' ,')}`,
    dictionary: (actionText, data = []) =>
      `修改内容：删除词条 ${data.map((d) => d.nextData).join(',')}`,
  },
  create: {
    default: (actionText = '', data = []) =>
      `新建内容: ${actionText} ${data
        .map((d) => {
          d.nextData = _.isNull(d.nextData) ? '空' : d.nextData;
          return `${d.name} 为 ${d.nextData}`;
        })
        .join(' ,')}`,
    dictionary: (actionText, data = []) =>
      `修改内容：增加词条 ${data.map((d) => d.nextData).join(',')}`,
  },
};
