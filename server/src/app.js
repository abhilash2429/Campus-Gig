require("dotenv").config();

/**
 * Fail fast with readable messages (Render logs stop at "Exited with status 1"
 * if an error is thrown deep in the require graph).
 */
const failBoot = (message) => {
  console.error("[campus-gig-api]", message);
  process.exit(1);
};

const isProduction = process.env.NODE_ENV === "production";
const clientUrlRaw = process.env.CLIENT_URL?.trim();

if (isProduction && !clientUrlRaw) {
  failBoot(
    "CLIENT_URL is required when NODE_ENV=production. Set it in Render → Environment to your Vercel URL (e.g. https://your-app.vercel.app).",
  );
}

const requiredEnv = [
  "MONGO_URI",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]?.trim()) {
    failBoot(
      `Missing required environment variable: ${key}. Copy values from your local server/.env into Render → Environment (this app does not use JWT_SECRET).`,
    );
  }
}

const cors = require("cors");
const express = require("express");

const connectDb = require("./config/db");
const adminCollegeRoutes = require("./routes/adminCollege");
const adminSuperRoutes = require("./routes/adminSuper");
const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const gigRoutes = require("./routes/gigs");
const { apiLimiter } = require("./middleware/rateLimits");
const paymentRoutes = require("./routes/payments");
const portfolioRoutes = require("./routes/portfolio");
const publicRoutes = require("./routes/public");
const ratingRoutes = require("./routes/ratings");

/** Exact browser origins allowed when NODE_ENV=production (comma-separated). */
const corsAllowList = clientUrlRaw
  ? clientUrlRaw.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

/** Demo / previews: allow any https://*.vercel.app when CLIENT_URL alone is not enough. */
const corsAllowVercel =
  process.env.CORS_ALLOW_VERCEL === "true" || process.env.CORS_ALLOW_VERCEL === "1";

const app = express();

const corsOptions =
  !isProduction || corsAllowList.length === 0
    ? { origin: true, credentials: true }
    : {
        credentials: true,
        origin(origin, callback) {
          if (!origin) {
            return callback(null, true);
          }
          if (corsAllowList.includes(origin)) {
            return callback(null, true);
          }
          if (corsAllowVercel) {
            try {
              const { hostname, protocol } = new URL(origin);
              if (protocol === "https:" && hostname.endsWith(".vercel.app")) {
                return callback(null, true);
              }
            } catch {
              /* ignore */
            }
          }
          console.warn("[cors] blocked origin:", origin, "| allowed:", corsAllowList);
          return callback(null, false);
        },
      };

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

app.use("/api", apiLimiter);

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

  if (err.name === "CastError") {
    return res.status(404).json({ message: "Invalid or unknown resource id" });
  }

  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ message });
});

const start = async () => {
  if (process.env.PORT) {
    console.log("[campus-gig-api] PORT from environment:", process.env.PORT);
  }

  try {
    await connectDb();
  } catch (error) {
    console.error("[campus-gig-api] MongoDB connection failed:", error.message);
    if (
      /timed out|ECONNREFUSED|ENOTFOUND|IP|whitelist|network|TLS/i.test(String(error.message)) ||
      /Server selection timed out/i.test(String(error.message))
    ) {
      console.error(
        "[campus-gig-api] Hint: MongoDB Atlas → Network Access → add 0.0.0.0/0 (or Render’s egress) so cloud hosts can connect.",
      );
    }
    process.exit(1);
    return;
  }

  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "0.0.0.0";

  app.listen(port, host, () => {
    console.log(`Campus GIG API listening on http://${host}:${port}`);
  });
};

if (require.main === module) {
  start();
}

module.exports = app;
