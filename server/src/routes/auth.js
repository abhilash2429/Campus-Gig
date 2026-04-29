const express = require("express");

const { getMe, register } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { registerLimiter } = require("../middleware/rateLimits");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.get("/me", protect, getMe);

module.exports = router;

