/**
 * @author robin
 * @file authWithButton4Get
 * @date 2018-04-10 11:32
 */

const _ = require("lodash");
module.exports = target => (req, res, next) => {
  if (_.isNil(req.session) || !req.session.profile) {
    return res.status(404).send('未登录，无权下载')
  }
  let valid = false
  if(Array.isArray(target)){
    let authTarget = target.find(r=> (req.session._button && req.session._button.includes(r)))
    valid = !_.isNil(authTarget)
  } else if (Array.isArray(req.session._button) && target) {
    valid = req.session._button.includes(target)
  }
  if(!valid){
    return res.status(403).send("您无权访问当前资源，请联系管理员");
  }
  next();
};

