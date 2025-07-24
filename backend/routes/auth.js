const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/verify-otp").post(authController.verifyOtp);
router.route("/resend-otp").post(authController.resendOtp);

module.exports = router;