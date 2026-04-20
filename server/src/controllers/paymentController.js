const crypto = require("crypto");
const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const { autoAddPortfolioItem } = require("./portfolioController");
const Gig = require("../models/Gig");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = asyncHandler(async (req, res) => {
  const { gigId } = req.body;

  const gig = await Gig.findById(gigId);
  if (!gig || gig.status !== "pending_delivery") {
    return res.status(400).json({ message: "Gig not in pending_delivery state" });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not gig owner" });
  }

  const existingPayment = await Payment.findOne({ gigId: gig._id });
  if (existingPayment && existingPayment.status !== "pending") {
    return res.status(409).json({ message: "Payment flow already started for this gig" });
  }

  const order = await razorpay.orders.create({
    amount: gig.budget * 100,
    currency: "INR",
    receipt: `receipt_${gig._id}`,
  });

  let payment = existingPayment;
  if (payment) {
    payment.razorpayOrderId = order.id;
    payment.amount = gig.budget;
    await payment.save();
  } else {
    payment = await Payment.create({
      gigId: gig._id,
      clientId: req.user._id,
      studentId: gig.selectedApplicantId,
      collegeId: gig.collegeId,
      amount: gig.budget,
      razorpayOrderId: order.id,
      status: "pending",
    });
  }

  res.json({ order, paymentId: payment._id });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, gigId } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment signature verification failed" });
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  if (payment.clientId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You cannot verify another client's payment" });
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.status = "payout_requested";
  await payment.save();

  const gig = await Gig.findById(gigId);
  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  gig.status = "completed";
  await gig.save();

  await autoAddPortfolioItem(gig._id, payment.studentId);

  res.json({
    message: "Payment verified. Gig completed. Payout request created.",
    payment,
  });
});

exports.getPaymentsForCollege = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "college_admin") {
    filter.collegeId = req.user.collegeId?._id;
  } else if (req.query.collegeId) {
    filter.collegeId = req.query.collegeId;
  }

  const payments = await Payment.find(filter)
    .populate("gigId", "title")
    .populate("clientId", "name email")
    .populate("studentId", "name email")
    .sort({ createdAt: -1 });

  res.json(payments);
});
