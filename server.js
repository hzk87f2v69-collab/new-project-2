require("dotenv").config();

const path = require("path");
const express = require("express");
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
const { isDemoMode, isDatabaseConnected } = require("./utils/runtimeState");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${PORT}`;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);

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
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    databaseConnected: isDatabaseConnected(),
    demoMode: isDemoMode()
  });
});

// Serve inline SVG favicon to eliminate 404 on every page
app.get("/favicon.ico", (req, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="8" fill="#20c7ff"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial Black,sans-serif" font-weight="900" font-size="18" fill="#03111d">AF</text>
  </svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(svg);
});

// ── AI ENDPOINTS ──────────────────────────────────────────────
const { GoogleGenerativeAI } = require("@google/generative-ai");
const getGemini = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-2.5-flash" });
};

app.post("/api/ai/coach", express.json(), async (req, res) => {
  const model = getGemini();
  if (!model) return res.status(503).json({ error: "GEMINI_API_KEY not set in .env" });
  const { message, workoutContext } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });
  const prompt = `You are an expert personal fitness coach for Ace Fitness, an Indian premium fitness platform. Give concise, motivating, practical advice under 200 words. Use bullet points where helpful.\n\nUSER WORKOUT DATA:\n${workoutContext || "No data yet."}\n\nUSER: ${message}`;
  try {
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (e) {
    const msg = e.message || "";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("limit: 0"))
      return res.status(429).json({ error: "quota_exceeded" });
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/ai/diet", express.json(), async (req, res) => {
  const model = getGemini();
  if (!model) return res.status(503).json({ error: "GEMINI_API_KEY not set in .env" });
  const { goal, weight, height, age, activity, diet, allergies } = req.body;
  const prompt = `You are a certified sports nutritionist. Generate a 7-day Indian meal plan as valid JSON only (no markdown, no code fences).\nProfile: Goal=${goal}, Weight=${weight||"?"}kg, Height=${height||"?"}cm, Age=${age||"?"}, Activity=${activity||"Moderate"}, Diet=${diet||"None"}, Allergies=${allergies||"None"}.\nReturn exactly: {"calories":2200,"protein":160,"carbs":220,"fat":65,"days":[{"day":"Monday","meals":[{"name":"Breakfast","items":["item – cal"],"calories":490},{"name":"Lunch","items":[],"calories":650},{"name":"Snack","items":[],"calories":300},{"name":"Dinner","items":[],"calories":550}]}]} for all 7 days.`;
  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/^```[\w]*\n?/,"").replace(/```$/,"").trim();
    res.json(JSON.parse(text));
  } catch (e) {
    const msg = e.message || "";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("limit: 0"))
      return res.status(429).json({ error: "quota_exceeded" });
    res.status(500).json({ error: e.message });
  }
});
// ────────────────────────────────────────────────────────
app.get(["/", "/programs", "/auth", "/dashboard", "/profile", "/my-courses", "/player", "/contact", "/payment-success", "/workout-tracker", "/ai", "/find-gyms"], (req, res) => {
  // Normalize path: remove trailing slash except for root
  const cleanPath = req.path.length > 1 && req.path.endsWith("/") 
    ? req.path.slice(0, -1) 
    : req.path;

  const routeMap = {
    "/": "index.html",
    "/programs": "programs.html",
    "/auth": "auth.html",
    "/dashboard": "dashboard.html",
    "/profile": "profile.html",
    "/my-courses": "my-courses.html",
    "/player": "player.html",
    "/contact": "contact.html",
    "/payment-success": "payment-success.html",
    "/workout-tracker": "workout-tracker.html",
    "/ai": "ai.html",
    "/find-gyms": "map.html"
  };

  const fileName = routeMap[cleanPath];
  if (fileName) {
    res.sendFile(path.join(__dirname, "frontend", fileName));
  } else {
    res.status(404).sendFile(path.join(__dirname, "frontend", "index.html"));
  }
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  const dbConnection = await connectDB();
  if (dbConnection) {
    await seedTracks();
  } else {
    console.warn("Starting Ace Fitness in local demo mode without MongoDB.");
  }

  app.listen(PORT, () => {
    console.log(`Ace Fitness server running on http://${HOST}:${PORT}`);
  });
};

startServer();
