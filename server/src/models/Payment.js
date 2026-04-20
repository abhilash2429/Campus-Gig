const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
    amount: { type: Number, required: true, min: 0 },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "paid", "payout_requested", "payout_approved", "payout_done"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

module.exports = mongoose.model("Payment", PaymentSchema);

