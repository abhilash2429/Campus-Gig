const express = require("express");

const ctrl = require("../controllers/adminSuperController");
const { protect, requireApproved } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

const router = express.Router();

const guard = [protect, requireApproved, allowRoles("super_admin")];

router.post("/colleges", ...guard, ctrl.createCollege);
router.get("/colleges", ...guard, ctrl.getAllColleges);
router.put("/colleges/:id", ...guard, ctrl.updateCollege);
router.get("/stats", ...guard, ctrl.getCollegeStats);

module.exports = router;

