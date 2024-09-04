const express = require("express");
const { register, login, logout, updatePassword, updateProfile, deleteMyProfile, myProfile, getUserProfile, getAllUsers, forgotPassword, resetPassword, verifyEmail, contactUs, joinWishlist } = require("../controllers/user");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(isAuthenticated, logout);

router.route("/update/password").post(isAuthenticated, updatePassword);

router.route("/update/profile").post(isAuthenticated, updateProfile);

router.route("/delete/me").delete(isAuthenticated, deleteMyProfile);

router.route("/me").get(isAuthenticated,myProfile);

router.route("/user/:id").get(isAuthenticated,getUserProfile);

router.route("/users").get(isAuthenticated,getAllUsers);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").post(resetPassword);

router.route("/verify/email/:token").get(verifyEmail);

router.route("/contactUs").get(contactUs);

router.route("/contactUs").post(contactUs);

router.route("/joinWishlist").get(joinWishlist);

router.route("/joinWishlist").post(joinWishlist);

module.exports = router;
