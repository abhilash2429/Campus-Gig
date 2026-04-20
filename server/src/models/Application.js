const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverNote: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "selected", "rejected"],
      default: "applied",
    },
    deliveryFileUrl: { type: String, default: null },
    deliveryNote: { type: String, default: null },
    deliverySubmittedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

ApplicationSchema.index({ gigId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);

