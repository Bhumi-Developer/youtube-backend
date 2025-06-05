const express = require('express');
const router = express.Router();
const registerUser = require("../controllers/user.controller")
const upload = require('../middlewares/multer')
const loginUser = require("../controllers/user.controller");
const logoutUser = require("../controllers/user.controller");
const verifyJWT = require('../middlewares/auth');

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)

module.exports = router;
