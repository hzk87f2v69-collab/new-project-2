require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const connectDB = require("./utils/db");
const seedTracks = require("./utils/seedTracks");
const authRoutes = require("./routes/authRoutes");
const trackRoutes = require("./routes/trackRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${PORT}`;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP. Please try again shortly."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many auth attempts. Please wait before trying again."
  }
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "frontend")));

app.use("/api/auth", authRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get(["/", "/programs", "/auth", "/dashboard", "/player", "/contact", "/payment-success"], (req, res) => {
  const routeMap = {
    "/": "index.html",
    "/programs": "programs.html",
    "/auth": "auth.html",
    "/dashboard": "dashboard.html",
    "/player": "player.html",
    "/contact": "contact.html",
    "/payment-success": "payment-success.html"
  };

  res.sendFile(path.join(__dirname, "frontend", routeMap[req.path]));
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await seedTracks();

  app.listen(PORT, () => {
    console.log(`Ace Fitness server running on port ${PORT}`);
  });
};

startServer();
