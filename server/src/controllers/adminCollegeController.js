const Gig = require("../models/Gig");
const Payment = require("../models/Payment");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getCollegeScope = (req) => {
  if (req.user.role === "college_admin") {
    return req.user.collegeId?._id?.toString() || null;
  }

  return req.query.collegeId || null;
};

exports.getPendingUsers = asyncHandler(async (req, res) => {
  const collegeScope = getCollegeScope(req);
  const filter = { approvalStatus: "pending" };

  if (collegeScope) {
    filter.collegeId = collegeScope;
  }

  const users = await User.find(filter)
    .select("name email role approvalStatus createdAt collegeId clientProfile")
    .populate("collegeId", "name emailDomain")
    .populate("clientProfile.targetCollegeId", "name emailDomain")
    .sort({ createdAt: -1 });

  res.json(users);
});

exports.reviewUser = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "action must be approve or reject" });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (
    req.user.role === "college_admin" &&
    user.collegeId?.toString() !== req.user.collegeId?._id?.toString()
  ) {
    return res.status(403).json({ message: "User not in your college" });
  }

  user.approvalStatus = action === "approve" ? "approved" : "rejected";
  user.approvalNote = action === "reject" ? reason || "Rejected by college admin" : "";
  await user.save();

  res.json(user);
});

exports.getPendingGigs = asyncHandler(async (req, res) => {
  const collegeScope = getCollegeScope(req);
  const filter = { status: "pending_approval" };

  if (collegeScope) {
    filter.collegeId = collegeScope;
  }

  const gigs = await Gig.find(filter)
    .populate("postedBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(gigs);
});

exports.reviewGig = asyncHandler(async (req, res) => {
  const { action } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "action must be approve or reject" });
  }

  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  if (
    req.user.role === "college_admin" &&
    gig.collegeId.toString() !== req.user.collegeId?._id?.toString()
  ) {
    return res.status(403).json({ message: "Gig not in your college" });
  }

  gig.status = action === "approve" ? "open" : "rejected";
  await gig.save();

  res.json(gig);
});

exports.getPendingPayouts = asyncHandler(async (req, res) => {
  const collegeScope = getCollegeScope(req);
  const filter = { status: "payout_requested" };

  if (collegeScope) {
    filter.collegeId = collegeScope;
  }

  const payments = await Payment.find(filter)
    .populate("gigId", "title")
    .populate("studentId", "name email")
    .populate("clientId", "name email")
    .sort({ createdAt: -1 });

  res.json(payments);
});

exports.approvePayout = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (
    req.user.role === "college_admin" &&
    payment.collegeId.toString() !== req.user.collegeId?._id?.toString()
  ) {
    return res.status(403).json({ message: "Payment not in your college" });
  }

  if (payment.status !== "payout_requested") {
    return res.status(400).json({ message: "No payout pending for this payment" });
  }

  payment.status = "payout_approved";
  await payment.save();

  payment.status = "payout_done";
  await payment.save();

  res.json({ message: "Payout approved and marked done (sandbox)", payment });
});
