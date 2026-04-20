const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    direction: { type: String, enum: ["client_to_student", "student_to_client"], required: true },
    score: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

RatingSchema.index({ gigId: 1, fromUserId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", RatingSchema);

