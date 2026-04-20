const Application = require("../models/Application");
const Gig = require("../models/Gig");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const autoAddPortfolioItem = async (gigId, studentId) => {
  const [gig, application, user] = await Promise.all([
    Gig.findById(gigId),
    Application.findOne({ gigId, studentId, status: "selected" }),
    User.findById(studentId),
  ]);

  if (!gig || !application || !user || !application.deliveryFileUrl) {
    return;
  }

  const alreadyExists = user.portfolioItems.some((item) => item.gigId?.toString() === gig._id.toString());
  if (alreadyExists) {
    return;
  }

  user.portfolioItems.push({
    title: gig.title,
    description: gig.description,
    fileUrl: application.deliveryFileUrl,
    gigId: gig._id,
  });

  await user.save();
};

exports.autoAddPortfolioItem = autoAddPortfolioItem;

exports.updatePortfolioItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { title, description } = req.body;

  const user = await User.findById(req.user._id);
  const item = user?.portfolioItems.id(itemId);

  if (!item) {
    return res.status(404).json({ message: "Portfolio item not found" });
  }

  if (title !== undefined) {
    item.title = title;
  }

  if (description !== undefined) {
    item.description = description;
  }

  await user.save();
  res.json(item);
});

exports.getPortfolio = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("name ratings portfolioItems");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

