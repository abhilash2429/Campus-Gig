const asyncHandler = require("../utils/asyncHandler");
const College = require("../models/College");
const Gig = require("../models/Gig");

const parsePagination = (req) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

exports.createGig = asyncHandler(async (req, res) => {
  if (!["client", "faculty", "college_admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only clients, faculty, or college admins can post gigs" });
  }

  const { title, description, category, budget, deadline, targetCollegeId } = req.body;

  const collegeId = req.user.collegeId ? req.user.collegeId._id : targetCollegeId;

  if (!collegeId) {
    return res.status(400).json({ message: "External clients must specify a targetCollegeId" });
  }

  const college = await College.findById(collegeId);
  if (!college) {
    return res.status(404).json({ message: "College not found" });
  }

  const gigData = {
    postedBy: req.user._id,
    collegeId: college._id,
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
  const { limit, page, skip } = parsePagination(req);
  const filter = {};

  if (req.user.role === "student") {
    if (!req.user.collegeId?._id) {
      return res.status(403).json({ message: "Your profile is not linked to a college" });
    }
    filter.collegeId = req.user.collegeId._id;
    filter.status = "open";
  }

  if (["client", "faculty"].includes(req.user.role)) {
    filter.postedBy = req.user._id;
    if (status) {
      filter.status = status;
    }
  }

  if (req.user.role === "college_admin") {
    if (!req.user.collegeId?._id) {
      return res.status(403).json({ message: "Your profile is not linked to a college" });
    }
    filter.collegeId = req.user.collegeId._id;
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

  const [gigs, total] = await Promise.all([
    Gig.find(filter)
      .populate("postedBy", "name email role ratings")
      .populate("collegeId", "name emailDomain")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Gig.countDocuments(filter),
  ]);

  res.json({ gigs, total, page, limit });
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
