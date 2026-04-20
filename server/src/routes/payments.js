const express = require("express");

const {
  createOrder,
  getPaymentsForCollege,
  verifyPayment,
} = require("../controllers/paymentController");
const { protect, requireApproved } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

const router = express.Router();

router.post("/create-order", protect, requireApproved, createOrder);
router.post("/verify", protect, requireApproved, verifyPayment);
router.get(
  "/college",
  protect,
  requireApproved,
  allowRoles("college_admin", "super_admin"),
  getPaymentsForCollege,
);

module.exports = router;
