const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

const rateLimit = require("express-rate-limit");

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests
  message: "Too many registration attempts. Please try again later."
});

router.post("/register", registerLimiter, auth.register);
router.get("/verify-email", auth.verifyEmail);
router.post("/login", auth.login);
router.post("/resend-verification", auth.resendVerification);
router.get("/verification-status", auth.checkVerificationStatus);

module.exports = router;