const mongoose = require("mongoose");

const GigSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending_approval", "open", "in_progress", "pending_delivery", "completed", "rejected"],
      default: "pending_approval",
    },
    applicantCount: { type: Number, default: 0 },
    selectedApplicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionCount: { type: Number, default: 0 },
    disputeFlagged: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

GigSchema.index({ collegeId: 1, status: 1 });
GigSchema.index({ postedBy: 1 });

module.exports = mongoose.model("Gig", GigSchema);

