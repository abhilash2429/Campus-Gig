const mongoose = require("mongoose");

const PortfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    fileUrl: { type: String, default: "" },
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig" },
    addedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, select: false },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ["student", "client", "faculty", "college_admin", "super_admin"],
      required: true,
    },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", default: null },
    clientProfile: {
      affiliationType: {
        type: String,
        enum: ["college", "company"],
        default: null,
      },
      organizationName: { type: String, trim: true, default: "" },
      targetCollegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", default: null },
      idProofUrl: { type: String, default: "" },
      idProofLabel: { type: String, trim: true, default: "" },
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalNote: { type: String, default: "" },
    portfolioItems: [PortfolioItemSchema],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

module.exports = mongoose.model("User", UserSchema);
