const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer')
const { registerUser, loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,updateDetails,updateUserAvatar,getUserChannelProfile,getWatchHistory} = require("../controllers/user.controller");

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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/update-details").patch(verifyJWT,updateDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

module.exports = router;
