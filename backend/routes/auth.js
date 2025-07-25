const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/verify-otp").post(authController.verifyOtp);
router.route("/resend-otp").post(authController.resendOtp);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/verify-forgot-otp").post(authController.verifyForgotOtp);
router.route("/reset-password").post(authController.resetPassword);

module.exports = router;