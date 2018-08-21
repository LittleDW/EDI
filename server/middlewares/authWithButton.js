/*
 * @Author Osborn
 * @File authWithButton.js
 * @Date 2018-03-26 17-39
 */
const _ = require("lodash");
module.exports = target => (req, res, next) => {
  let valid = false
  if(Array.isArray(target)){
    let authTarget = target.find(r=> (req.session._button && req.session._button.includes(r)))
    valid = !_.isNil(authTarget)
  } else if (Array.isArray(req.session._button) && target) {
    valid = req.session._button.includes(target)
  }
  if(!valid){
    return res.json({success:false, message:"无权访问接口"})
  }
  next();
};
