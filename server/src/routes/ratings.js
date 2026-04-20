const express = require("express");

const { getRatingsForUser, submitRating } = require("../controllers/ratingController");
const { protect, requireApproved } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireApproved, submitRating);
router.get("/user/:userId", protect, requireApproved, getRatingsForUser);

module.exports = router;

