/**
 * @author robin
 * @file role
 * @date 2018-04-26 11:27
 */
const router = require("express").Router();

const { authWithButton,authWithButtonForGet,checkFileUpload } = require("../middlewares");

const { asynclize, upload } = require("../util");
const { role } = require("../controllers");

router.post('/search',  asynclize(role.search));
router.post("/create", authWithButton('role_management_create'), asynclize(role.create));
router.post("/update", authWithButton('role_management_update'), asynclize(role.update));
router.post("/delete", authWithButton('role_management_delete'), asynclize(role.deleteCtrl));
router.post("/funcSearch", asynclize(role.funcSearch));
router.post("/funcUpdate", authWithButton('role_management_func'), asynclize(role.funcUpdate));
router.post("/userAdd", authWithButton('role_management_user'), asynclize(role.userAdd));
router.post("/userDelete", authWithButton('role_management_user'), asynclize(role.userDelete));
router.post("/userSearch", asynclize(role.userSearch));

module.exports = router;
