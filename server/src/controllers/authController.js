const admin = require("../config/firebase");
const asyncHandler = require("../utils/asyncHandler");
const College = require("../models/College");
const User = require("../models/User");

const stripSensitiveUserFields = (user) => {
  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.firebaseUid;
  return plain;
};

const validateClientRegistration = async ({
  affiliationType,
  organizationName,
  targetCollegeId,
  idProofUrl,
  idProofLabel,
}) => {
  if (!targetCollegeId) {
    return {
      error: {
        status: 400,
        message: "Clients must choose the college they want to post gigs to.",
        code: "CLIENT_TARGET_COLLEGE_REQUIRED",
      },
    };
  }

  if (!affiliationType || !["college", "company"].includes(affiliationType)) {
    return {
      error: {
        status: 400,
        message: "Clients must specify whether they belong to a college or a company.",
        code: "CLIENT_AFFILIATION_REQUIRED",
      },
    };
  }

  if (!organizationName || !organizationName.trim()) {
    return {
      error: {
        status: 400,
        message: "Clients must provide their college or company name.",
        code: "CLIENT_ORGANIZATION_REQUIRED",
      },
    };
  }

  if (!idProofUrl || !idProofUrl.trim()) {
    return {
      error: {
        status: 400,
        message: "Clients must provide an ID proof link before approval.",
        code: "CLIENT_ID_PROOF_REQUIRED",
      },
    };
  }

  const targetCollege = await College.findById(targetCollegeId);
  if (!targetCollege) {
    return {
      error: {
        status: 404,
        message: "Selected target college was not found.",
        code: "CLIENT_TARGET_COLLEGE_NOT_FOUND",
      },
    };
  }

  return {
    clientFields: {
      collegeId: targetCollege._id,
      approvalStatus: "pending",
      clientProfile: {
        affiliationType,
        organizationName: organizationName.trim(),
        targetCollegeId: targetCollege._id,
        idProofUrl: idProofUrl.trim(),
        idProofLabel: (idProofLabel || `${affiliationType} ID proof`).trim(),
      },
    },
  };
};

exports.register = asyncHandler(async (req, res) => {
  const {
    name,
    role,
    affiliationType,
    organizationName,
    targetCollegeId,
    idProofUrl,
    idProofLabel,
  } = req.body;
  const authHeader = req.headers.authorization;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!admin.apps.length) {
    return res.status(500).json({ message: "Firebase Admin SDK is not configured" });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(token);
  } catch (_error) {
    return res.status(401).json({ message: "Invalid Firebase token" });
  }

  const { uid, email } = decoded;
  if (!email) {
    return res.status(400).json({ message: "Authenticated Firebase user does not include an email address" });
  }

  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split("@")[1];

  const existing = await User.findOne({
    $or: [{ firebaseUid: uid }, { email: emailLower }],
  }).select("+firebaseUid");

  if (existing) {
    return res.status(409).json({ message: "User already registered" });
  }

  if (
    process.env.SUPER_ADMIN_EMAIL &&
    emailLower === process.env.SUPER_ADMIN_EMAIL.toLowerCase().trim()
  ) {
    const user = await User.create({
      firebaseUid: uid,
      name: name.trim(),
      email: emailLower,
      role: "super_admin",
      approvalStatus: "approved",
    });

    return res.status(201).json(stripSensitiveUserFields(user));
  }

  const college = await College.findOne({ emailDomain: domain });

  if (!college) {
    if (role === "student" || role === "faculty") {
      return res.status(400).json({
        message: "Your college is not onboarded yet. Use a registered college domain or ask your college admin to create the college first.",
        code: "COLLEGE_NOT_ONBOARDED",
      });
    }

    if (role === "client") {
      const { error, clientFields } = await validateClientRegistration({
        affiliationType,
        organizationName,
        targetCollegeId,
        idProofUrl,
        idProofLabel,
      });

      if (error) {
        return res.status(error.status).json({
          message: error.message,
          code: error.code,
        });
      }

      const user = await User.create({
        firebaseUid: uid,
        name: name.trim(),
        email: emailLower,
        role: "client",
        ...clientFields,
      });

      return res.status(201).json(stripSensitiveUserFields(user));
    }

    const user = await User.create({
      firebaseUid: uid,
      name: name.trim(),
      email: emailLower,
      role: "client",
      approvalStatus: "pending",
    });

    return res.status(201).json(stripSensitiveUserFields(user));
  }

  if (college.designatedAdminEmail === emailLower && !college.adminUserId) {
    const user = await User.create({
      firebaseUid: uid,
      name: name.trim(),
      email: emailLower,
      role: "college_admin",
      collegeId: college._id,
      approvalStatus: "approved",
    });

    college.adminUserId = user._id;
    await college.save();

    return res.status(201).json(stripSensitiveUserFields(user));
  }

  if (role === "client") {
    const { error, clientFields } = await validateClientRegistration({
      affiliationType,
      organizationName,
      targetCollegeId,
      idProofUrl,
      idProofLabel,
    });

    if (error) {
      return res.status(error.status).json({
        message: error.message,
        code: error.code,
      });
    }

    const user = await User.create({
      firebaseUid: uid,
      name: name.trim(),
      email: emailLower,
      role: "client",
      ...clientFields,
    });

    return res.status(201).json(stripSensitiveUserFields(user));
  }

  const normalizedRole = role === "faculty" ? "faculty" : "student";

  const user = await User.create({
    firebaseUid: uid,
    name: name.trim(),
    email: emailLower,
    role: normalizedRole,
    collegeId: college._id,
    approvalStatus: "pending",
  });

  return res.status(201).json(stripSensitiveUserFields(user));
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});
