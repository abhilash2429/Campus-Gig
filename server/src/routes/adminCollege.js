const express = require("express");

const ctrl = require("../controllers/adminCollegeController");
const { protect, requireApproved } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

const router = express.Router();

const guard = [protect, requireApproved, allowRoles("college_admin", "super_admin")];

router.get("/pending-users", ...guard, ctrl.getPendingUsers);
router.put("/users/:id/review", ...guard, ctrl.reviewUser);
router.get("/pending-gigs", ...guard, ctrl.getPendingGigs);
router.put("/gigs/:id/review", ...guard, ctrl.reviewGig);
router.get("/pending-payouts", ...guard, ctrl.getPendingPayouts);
router.put("/payouts/:id/approve", ...guard, ctrl.approvePayout);

module.exports = router;

