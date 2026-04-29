const mongoose = require("mongoose");
const Application = require("../models/Application");
const Gig = require("../models/Gig");
const asyncHandler = require("../utils/asyncHandler");
const { isFirebaseStorageDownloadUrl } = require("../utils/firebaseStorageUrl");

const parsePagination = (req) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

exports.applyToGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);

  if (!gig || gig.status !== "open") {
    return res.status(400).json({ message: "Gig not available for applications" });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Only students can apply" });
  }

  if (gig.postedBy.toString() === req.user._id.toString()) {
    return res.status(403).json({ message: "You cannot apply to your own gig" });
  }

  if (!req.user.collegeId || gig.collegeId.toString() !== req.user.collegeId._id.toString()) {
    return res.status(403).json({ message: "You can only apply to gigs within your college" });
  }

  const existing = await Application.findOne({ gigId: gig._id, studentId: req.user._id });
  if (existing) {
    return res.status(409).json({ message: "Already applied" });
  }

  const application = await Application.create({
    gigId: gig._id,
    studentId: req.user._id,
    coverNote: req.body.coverNote,
  });

  gig.applicantCount += 1;
  await gig.save();

  res.status(201).json(application);
});

exports.getApplicantsForGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);

  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not gig owner" });
  }

  const { limit, page, skip } = parsePagination(req);

  const filter = { gigId: gig._id };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("studentId", "name email ratings portfolioItems collegeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  res.json({ applications, total, page, limit });
});

exports.getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("gigId")
    .populate("studentId", "name email ratings portfolioItems");

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  const isApplicant = application.studentId?._id.toString() === req.user._id.toString();
  const isGigOwner = application.gigId?.postedBy.toString() === req.user._id.toString();
  const isAdmin =
    req.user.role === "college_admin" &&
    req.user.collegeId &&
    application.gigId?.collegeId.toString() === req.user.collegeId._id.toString();

  if (!isApplicant && !isGigOwner && !isAdmin && req.user.role !== "super_admin") {
    return res.status(403).json({ message: "You cannot access this application" });
  }

  res.json(application);
});

exports.selectApplicant = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let applicationId;
    let gigId;

    await session.withTransaction(async () => {
      const application = await Application.findById(req.params.id).session(session);
      if (!application) {
        const err = new Error("Application not found");
        err.statusCode = 404;
        throw err;
      }

      const gig = await Gig.findById(application.gigId).session(session);
      if (!gig) {
        const err = new Error("Gig not found");
        err.statusCode = 404;
        throw err;
      }

      if (gig.postedBy.toString() !== req.user._id.toString()) {
        const err = new Error("Not gig owner");
        err.statusCode = 403;
        throw err;
      }

      if (gig.status !== "open") {
        const err = new Error("Gig is not open for selection");
        err.statusCode = 400;
        throw err;
      }

      if (!["applied", "shortlisted"].includes(application.status)) {
        const err = new Error("This application cannot be selected");
        err.statusCode = 400;
        throw err;
      }

      await Application.updateMany(
        { gigId: gig._id, _id: { $ne: application._id } },
        { status: "rejected" },
        { session },
      );

      application.status = "selected";
      await application.save({ session });

      gig.status = "in_progress";
      gig.selectedApplicantId = application.studentId;
      await gig.save({ session });

      applicationId = application._id;
      gigId = gig._id;
    });

    const [application, gig] = await Promise.all([
      Application.findById(applicationId).populate("gigId"),
      Gig.findById(gigId),
    ]);

    res.json({ application, gig });
  } finally {
    await session.endSession();
  }
});

exports.submitDelivery = asyncHandler(async (req, res) => {
  const { deliveryFileUrl, deliveryNote } = req.body;

  if (!deliveryFileUrl || !isFirebaseStorageDownloadUrl(deliveryFileUrl)) {
    return res.status(400).json({ message: "Delivery file must be a valid Firebase Storage URL for this project" });
  }

  const application = await Application.findById(req.params.id).populate("gigId");

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (application.studentId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not the selected student" });
  }

  if (application.status !== "selected") {
    return res.status(400).json({ message: "Only the selected application can submit delivery" });
  }

  if (application.gigId.status !== "in_progress") {
    return res.status(400).json({ message: "Gig is not in progress" });
  }

  application.deliveryFileUrl = deliveryFileUrl;
  application.deliveryNote = deliveryNote;
  application.deliverySubmittedAt = new Date();
  await application.save();

  application.gigId.status = "pending_delivery";
  await application.gigId.save();

  res.json(application);
});

exports.reviewDelivery = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const application = await Application.findById(req.params.id).populate("gigId");

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  const gig = application.gigId;
  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not gig owner" });
  }

  if (gig.status !== "pending_delivery") {
    return res.status(400).json({ message: "No delivery pending review" });
  }

  if (action === "accept") {
    return res.json({ message: "Delivery accepted. Proceed to payment." });
  }

  if (action === "reject") {
    gig.status = "in_progress";
    gig.rejectionCount += 1;
    gig.disputeFlagged = gig.rejectionCount >= 3;

    application.deliveryFileUrl = null;
    application.deliveryNote = null;
    application.deliverySubmittedAt = null;

    await application.save();
    await gig.save();

    if (gig.disputeFlagged) {
      return res.json({
        message: "Delivery rejected. Dispute flagged to College Admin.",
        flagged: true,
      });
    }

    return res.json({
      message: "Delivery rejected. Student can resubmit.",
      flagged: false,
    });
  }

  return res.status(400).json({ message: "Invalid action. Use accept or reject." });
});

exports.getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ studentId: req.user._id })
    .populate("gigId")
    .sort({ createdAt: -1 });

  res.json(applications);
});
