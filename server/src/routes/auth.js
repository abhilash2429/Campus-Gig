const express = require("express");

const { getMe, register } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.get("/me", protect, getMe);

module.exports = router;

