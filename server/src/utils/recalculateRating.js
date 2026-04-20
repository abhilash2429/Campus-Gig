const Rating = require("../models/Rating");
const User = require("../models/User");

const recalculateRating = async (userId) => {
  const ratings = await Rating.find({ toUserId: userId });
  const count = ratings.length;
  const average = count > 0 ? ratings.reduce((sum, rating) => sum + rating.score, 0) / count : 0;

  await User.findByIdAndUpdate(userId, {
    "ratings.average": Number(average.toFixed(2)),
    "ratings.count": count,
  });
};

module.exports = recalculateRating;
