const admin = require("../config/firebase");
const College = require("../models/College");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

const protect = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!admin.apps.length) {
    return res.status(500).json({ message: "Firebase Admin SDK is not configured on the server" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decoded.uid }).select("+firebaseUid").populate("collegeId");

    // Bootstrap the super admin profile on first login if the Firebase account
    // exists but the MongoDB record has not been created yet.
    if (!user && decoded.email && process.env.SUPER_ADMIN_EMAIL) {
      const normalizedEmail = decoded.email.toLowerCase().trim();
      const normalizedSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL.toLowerCase().trim();

      if (normalizedEmail === normalizedSuperAdminEmail) {
        const existingEmailUser = await User.findOne({ email: normalizedEmail })
          .select("+firebaseUid")
          .populate("collegeId");

        if (existingEmailUser) {
          existingEmailUser.firebaseUid = decoded.uid;
          existingEmailUser.role = "super_admin";
          existingEmailUser.approvalStatus = "approved";
          await existingEmailUser.save();
          user = existingEmailUser;
        } else {
          user = await User.create({
            firebaseUid: decoded.uid,
            name: decoded.name || normalizedEmail.split("@")[0],
            email: normalizedEmail,
            role: "super_admin",
            approvalStatus: "approved",
          });

          user = await User.findById(user._id).select("+firebaseUid").populate("collegeId");
        }
      }
    }

    // Bootstrap designated college admin on first login when the Firebase account
    // exists but MongoDB has no user (e.g. they used Sign in only, or registration
    // failed before the college was onboarded).
    if (!user && decoded.email) {
      const normalizedEmail = decoded.email.toLowerCase().trim();
      const domain = normalizedEmail.split("@")[1];

      if (domain) {
        const college = await College.findOne({ emailDomain: domain });

        if (
          college &&
          college.designatedAdminEmail === normalizedEmail &&
          college.adminUserId == null
        ) {
          const candidate = await User.create({
            firebaseUid: decoded.uid,
            name: decoded.name || normalizedEmail.split("@")[0],
            email: normalizedEmail,
            role: "college_admin",
            collegeId: college._id,
            approvalStatus: "approved",
          });

          const claimed = await College.findOneAndUpdate(
            { _id: college._id, adminUserId: null },
            { $set: { adminUserId: candidate._id } },
            { new: true },
          );

          if (!claimed) {
            await User.deleteOne({ _id: candidate._id });
          } else {
            user = await User.findById(candidate._id).select("+firebaseUid").populate("collegeId");
          }
        }
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not registered in system" });
    }

    req.firebaseToken = decoded;
    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

const requireApproved = (req, res, next) => {
  if (req.user.approvalStatus !== "approved") {
    return res.status(403).json({
      message: `Account ${req.user.approvalStatus}`,
      approvalStatus: req.user.approvalStatus,
      approvalNote: req.user.approvalNote,
    });
  }

  next();
};

module.exports = { protect, requireApproved };
