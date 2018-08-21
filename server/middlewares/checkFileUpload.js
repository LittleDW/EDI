/**
 * @author robin
 * @file checkFileUpload
 * @date 2018-04-10 15:34
 */

const _ = require("lodash");
const { upload } = require("../util");

module.exports = (req, res, next) => {
  if (!req.files || !req.files.length) {
    res.json({success: false, message: "请上传文件"});
    return;
  }
  next();
};
