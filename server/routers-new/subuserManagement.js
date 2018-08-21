/*
 * File subuserManagement.js
 * File Created: 2018-05-22 Tuesday, 03:45:43
 * Author: zhangjunjie (zhangjunjie@rongcapital.cn)
 * -----
 * Last Modified: 2018-05-22 Tuesday, 04:47:48
 * Modified By: zhangjunjie (zhangjunjie@rongcapital.cn>)
 * -----
 */

const router = require("express").Router();

const { asynclize } = require("../util");
const { authWithButton } = require("../middlewares");

const { subuserManagement } = require("../controllers");

router.post("/search", asynclize(subuserManagement.search));
router.post(
  "/getRestriction",
  authWithButton("sub_user_management_restrict"),
  asynclize(subuserManagement.getRestriction)
);
router.post(
  "/updateRestriction",
  authWithButton("sub_user_management_restrict"),
  asynclize(subuserManagement.updateRestriction)
);
router.post(
  "/create",
  authWithButton("sub_user_management_create"),
  asynclize(subuserManagement.create)
);
router.post(
  "/update",
  authWithButton("sub_user_management_update"),
  asynclize(subuserManagement.update)
);
router.post(
  "/delete",
  authWithButton("sub_user_management_delete"),
  asynclize(subuserManagement.delete)
);
router.post("/authSearch", asynclize(subuserManagement.authSearch));
router.post("/auth", asynclize(subuserManagement.auth));
router.post("/roleSearch", asynclize(subuserManagement.roleSearch));

module.exports = router;
