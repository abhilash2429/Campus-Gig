const College = require("../models/College");
const Gig = require("../models/Gig");
const Payment = require("../models/Payment");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.createCollege = asyncHandler(async (req, res) => {
  const { name, emailDomain, designatedAdminEmail } = req.body;

  const domainLower = emailDomain.toLowerCase().trim();
  const adminEmailLower = designatedAdminEmail.toLowerCase().trim();

  const existing = await College.findOne({ emailDomain: domainLower });
  if (existing) {
    return res.status(409).json({ message: "Domain already registered" });
  }

  const college = await College.create({
    name: name.trim(),
    emailDomain: domainLower,
    designatedAdminEmail: adminEmailLower,
  });

  res.status(201).json(college);
});

exports.getAllColleges = asyncHandler(async (_req, res) => {
  const colleges = await College.find()
    .populate("adminUserId", "name email approvalStatus")
    .sort({ name: 1 });

  res.json(colleges);
});

exports.getPublicColleges = asyncHandler(async (_req, res) => {
  const colleges = await College.find().select("name emailDomain").sort({ name: 1 });
  res.json(colleges);
});

exports.updateCollege = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    return res.status(404).json({ message: "College not found" });
  }

  const { name, emailDomain, designatedAdminEmail } = req.body;

  if (name) {
    college.name = name.trim();
  }

  if (emailDomain) {
    const normalizedDomain = emailDomain.toLowerCase().trim();
    const conflict = await College.findOne({
      emailDomain: normalizedDomain,
      _id: { $ne: college._id },
    });

    if (conflict) {
      return res.status(409).json({ message: "Another college already uses that domain" });
    }

    college.emailDomain = normalizedDomain;
  }

  if (designatedAdminEmail) {
    const newAdminEmail = designatedAdminEmail.toLowerCase().trim();

    if (college.adminUserId) {
      const prev = await User.findById(college.adminUserId);
      const restoreRole =
        prev?.preCollegeAdminRole && ["student", "faculty"].includes(prev.preCollegeAdminRole)
          ? prev.preCollegeAdminRole
          : "student";
      await User.findByIdAndUpdate(college.adminUserId, {
        role: restoreRole,
        preCollegeAdminRole: null,
        approvalStatus: "approved",
      });
      college.adminUserId = null;
    }

    college.designatedAdminEmail = newAdminEmail;

    const existingUser = await User.findOne({ email: newAdminEmail });
    if (existingUser) {
      existingUser.preCollegeAdminRole = ["student", "faculty"].includes(existingUser.role)
        ? existingUser.role
        : "student";
      existingUser.role = "college_admin";
      existingUser.approvalStatus = "approved";
      existingUser.collegeId = college._id;
      await existingUser.save();
      college.adminUserId = existingUser._id;
    }
  }

  await college.save();
  res.json(college);
});

exports.getCollegeStats = asyncHandler(async (_req, res) => {
  const [colleges, usersByCollege, gigsByCollege, paymentByCollege, totalUsers, totalGigs, totalVolume] =
    await Promise.all([
      College.find().select("name"),
      User.aggregate([{ $group: { _id: "$collegeId", count: { $sum: 1 } } }]),
      Gig.aggregate([{ $group: { _id: "$collegeId", count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: "payout_done" } },
        { $group: { _id: "$collegeId", total: { $sum: "$amount" } } },
      ]),
      User.countDocuments(),
      Gig.countDocuments(),
      Payment.aggregate([
        { $match: { status: "payout_done" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  const byCollegeMap = new Map();

  colleges.forEach((college) => {
    byCollegeMap.set(college._id.toString(), {
      collegeId: college._id,
      name: college.name,
      users: 0,
      gigs: 0,
      payoutVolume: 0,
    });
  });

  usersByCollege.forEach((entry) => {
    const key = entry._id?.toString();
    if (key && byCollegeMap.has(key)) {
      byCollegeMap.get(key).users = entry.count;
    }
  });

  gigsByCollege.forEach((entry) => {
    const key = entry._id?.toString();
    if (key && byCollegeMap.has(key)) {
      byCollegeMap.get(key).gigs = entry.count;
    }
  });

  paymentByCollege.forEach((entry) => {
    const key = entry._id?.toString();
    if (key && byCollegeMap.has(key)) {
      byCollegeMap.get(key).payoutVolume = entry.total;
    }
  });

  res.json({
    totals: {
      colleges: colleges.length,
      users: totalUsers,
      gigs: totalGigs,
      payoutVolume: totalVolume[0]?.total || 0,
    },
    byCollege: Array.from(byCollegeMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
  });
});

