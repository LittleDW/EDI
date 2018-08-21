/*
 * @Author zhangjunjie
 * @File userManagement.js
 * @Created Date 2018-05-10 16-22
 * @Last Modified: 2018-05-10 16-27
 * @Modified By: zhangjunjie
 */

const router = require("express").Router();

const { asynclize } = require("../util");
const {
  authWithButton,
} = require('../middlewares');

const { userManagement } = require("../controllers");

router.post("/search", asynclize(userManagement.search));
router.post(
  "/update",
  authWithButton("user_management_auth"),
  asynclize(userManagement.update)
);
router.post(
  "/create",
  authWithButton("user_management_create"),
  asynclize(userManagement.create)
);
router.post(
  "/delete",
  authWithButton("user_management_delete"),
  asynclize(userManagement.delete)
);
router.post(
  "/authSearch",
  asynclize(userManagement.authSearch)
);
router.post(
  "/auth",
  authWithButton("user_management_auth"),
  asynclize(userManagement.auth)
);
router.post(
  "/userAttributeFind",
  asynclize(userManagement.userAttributeFind)
);
router.post(
  "/userAttributeUpdate",
  asynclize(userManagement.userAttributeUpdate)
);

module.exports = router;
