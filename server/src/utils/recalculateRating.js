const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const User = require("../models/User");

const recalculateRating = async (userId) => {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const [agg] = await Rating.aggregate([
    { $match: { toUserId: uid } },
    { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$score" } } },
  ]);

  const count = agg?.count ?? 0;
  const average = count > 0 ? agg.avg : 0;

  await User.findByIdAndUpdate(userId, {
    "ratings.average": Number(Number(average).toFixed(2)),
    "ratings.count": count,
  });
};

module.exports = recalculateRating;
