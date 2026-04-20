const asyncHandler = require("../utils/asyncHandler");
const Gig = require("../models/Gig");

exports.createGig = asyncHandler(async (req, res) => {
  const { title, description, category, budget, deadline, targetCollegeId } = req.body;

  const collegeId = req.user.collegeId ? req.user.collegeId._id : targetCollegeId;

  if (!collegeId) {
    return res.status(400).json({ message: "External clients must specify a targetCollegeId" });
  }

  const gigData = {
    postedBy: req.user._id,
    collegeId,
    title,
    description,
    category,
    budget,
    deadline,
    status: "pending_approval",
  };

  const gig = await Gig.create(gigData);
  return res.status(201).json(gig);
});

exports.getGigs = asyncHandler(async (req, res) => {
  const { category, status } = req.query;
  const filter = {};

  if (req.user.role === "student") {
    filter.collegeId = req.user.collegeId?._id;
    filter.status = "open";
  }

  if (["client", "faculty"].includes(req.user.role)) {
    filter.postedBy = req.user._id;
    if (status) {
      filter.status = status;
    }
  }

  if (req.user.role === "college_admin") {
    filter.collegeId = req.user.collegeId?._id;
    if (status) {
      filter.status = status;
    }
  }

  if (req.user.role === "super_admin" && status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  const gigs = await Gig.find(filter)
    .populate("postedBy", "name email role ratings")
    .populate("collegeId", "name emailDomain")
    .sort({ createdAt: -1 });

  res.json(gigs);
});

exports.getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id)
    .populate("postedBy", "name email role ratings")
    .populate("selectedApplicantId", "name email ratings portfolioItems")
    .populate("collegeId", "name emailDomain");

  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  if (req.user.role === "student" && req.user.collegeId && gig.collegeId?._id.toString() !== req.user.collegeId._id.toString()) {
    return res.status(403).json({ message: "You cannot access gigs outside your college" });
  }

  if (
    ["client", "faculty"].includes(req.user.role) &&
    gig.postedBy?._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: "You can only access your own gigs" });
  }

  res.json(gig);
});

exports.updateGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not gig owner" });
  }

  if (!["pending_approval", "open"].includes(gig.status)) {
    return res.status(400).json({ message: "Cannot edit gig after applications begin" });
  }

  const allowed = ["title", "description", "category", "budget", "deadline"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      gig[field] = req.body[field];
    }
  });

  await gig.save();
  res.json(gig);
});

exports.deleteGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not gig owner" });
  }

  if (!["pending_approval", "open"].includes(gig.status)) {
    return res.status(400).json({ message: "Cannot delete an active gig" });
  }

  await gig.deleteOne();
  res.json({ message: "Gig deleted" });
});
