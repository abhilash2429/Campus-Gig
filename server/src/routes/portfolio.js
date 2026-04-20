const express = require("express");

const { getPortfolio, updatePortfolioItem } = require("../controllers/portfolioController");
const { protect, requireApproved } = require("../middleware/auth");

const router = express.Router();

router.get("/:userId", protect, requireApproved, getPortfolio);
router.put("/item/:itemId", protect, requireApproved, updatePortfolioItem);

module.exports = router;

