const mongoose = require("mongoose");

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    emailDomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    designatedAdminEmail: { type: String, required: true, lowercase: true, trim: true },
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

module.exports = mongoose.model("College", CollegeSchema);

