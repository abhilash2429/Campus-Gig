const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const express = require("express");

const connectDb = require("./config/db");
const adminCollegeRoutes = require("./routes/adminCollege");
const adminSuperRoutes = require("./routes/adminSuper");
const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const gigRoutes = require("./routes/gigs");
const paymentRoutes = require("./routes/payments");
const portfolioRoutes = require("./routes/portfolio");
const publicRoutes = require("./routes/public");
const ratingRoutes = require("./routes/ratings");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "campus-gig-server" });
});

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/admin/college", adminCollegeRoutes);
app.use("/api/admin/super", adminSuperRoutes);
app.use("/api/public", publicRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ message });
});

const start = async () => {
  try {
    await connectDb();
    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
      console.log(`Campus GIG API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

module.exports = app;
