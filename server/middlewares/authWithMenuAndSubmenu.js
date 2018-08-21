/*
 * File: authWithMenuAndSubmenu.js
 * File Created: Friday, 23rd March 2018 4:25:17 pm
 * Author: Osborn (zhangcheng@rongcapital.cn)
 * -----
 * Last Modified: Fri Mar 30 2018
 * Modified By: Osborn
 */

const _ = require('lodash');
module.exports = (menuType, target, errorMessage) => (req, res, next) => {
  const menu = req.session[menuType];
  if (_.isEmpty(menu)) {
    return res.json({ success: false, message: errorMessage });
  }
  if (_.isArray(target)) {
    const condition = _.filter(target, t => _.includes(menu, t));
    if (condition.length === 0) {
      return res.json({ success: false, message: errorMessage });
    }
  } else if (!menu.includes(target)) {
    return res.json({ success: false, message: errorMessage });
  }
  next();
};
