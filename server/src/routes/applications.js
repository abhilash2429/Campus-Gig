const express = require("express");

const ctrl = require("../controllers/applicationController");
const { protect, requireApproved } = require("../middleware/auth");

const router = express.Router();

router.post("/gig/:gigId", protect, requireApproved, ctrl.applyToGig);
router.get("/gig/:gigId", protect, requireApproved, ctrl.getApplicantsForGig);
router.get("/my", protect, requireApproved, ctrl.getMyApplications);
router.get("/:id", protect, requireApproved, ctrl.getApplicationById);
router.put("/:id/select", protect, requireApproved, ctrl.selectApplicant);
router.put("/:id/deliver", protect, requireApproved, ctrl.submitDelivery);
router.put("/:id/review", protect, requireApproved, ctrl.reviewDelivery);

module.exports = router;

