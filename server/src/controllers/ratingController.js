const Payment = require("../models/Payment");
const Rating = require("../models/Rating");
const asyncHandler = require("../utils/asyncHandler");
const recalculateRating = require("../utils/recalculateRating");

const RATING_ELIGIBLE_PAYMENT_STATUSES = ["payout_requested", "payout_approved", "payout_done"];

exports.submitRating = asyncHandler(async (req, res) => {
  const { gigId, toUserId, score, review } = req.body;

  if (!Number.isFinite(Number(score)) || Number(score) < 1 || Number(score) > 5) {
    return res.status(400).json({ message: "Score must be a number between 1 and 5" });
  }

  const payment = await Payment.findOne({
    gigId,
    status: { $in: RATING_ELIGIBLE_PAYMENT_STATUSES },
  });

  if (!payment) {
    return res.status(400).json({ message: "Rating is only allowed after payment is confirmed" });
  }

  let direction;
  let expectedRecipient;

  if (payment.studentId.toString() === req.user._id.toString()) {
    direction = "student_to_client";
    expectedRecipient = payment.clientId.toString();
  } else if (payment.clientId.toString() === req.user._id.toString()) {
    direction = "client_to_student";
    expectedRecipient = payment.studentId.toString();
  } else {
    return res.status(403).json({ message: "You were not part of this gig" });
  }

  if (expectedRecipient !== toUserId) {
    return res.status(400).json({ message: "Ratings must target the opposite party from the completed gig" });
  }

  try {
    const rating = await Rating.create({
      gigId,
      fromUserId: req.user._id,
      toUserId,
      direction,
      score,
      review,
    });

    await recalculateRating(toUserId);
    return res.status(201).json(rating);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already rated this gig" });
    }

    throw error;
  }
});

exports.getRatingsForUser = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ toUserId: req.params.userId })
    .populate("fromUserId", "name role")
    .sort({ createdAt: -1 });

  res.json(ratings);
});

