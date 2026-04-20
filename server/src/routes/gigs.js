const express = require("express");

const {
  createGig,
  deleteGig,
  getGigById,
  getGigs,
  updateGig,
} = require("../controllers/gigController");
const { protect, requireApproved } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireApproved, createGig);
router.get("/", protect, requireApproved, getGigs);
router.get("/:id", protect, requireApproved, getGigById);
router.put("/:id", protect, requireApproved, updateGig);
router.delete("/:id", protect, requireApproved, deleteGig);

module.exports = router;

