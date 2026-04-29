const express = require("express");

const {
  createOrder,
  getPaymentsForCollege,
  verifyPayment,
} = require("../controllers/paymentController");
const { protect, requireApproved } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");
const { paymentLimiter } = require("../middleware/rateLimits");

const router = express.Router();

router.post("/create-order", paymentLimiter, protect, requireApproved, createOrder);
router.post("/verify", paymentLimiter, protect, requireApproved, verifyPayment);
router.get(
  "/college",
  protect,
  requireApproved,
  allowRoles("college_admin", "super_admin"),
  getPaymentsForCollege,
);

module.exports = router;
