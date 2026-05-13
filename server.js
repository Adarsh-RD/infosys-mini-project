// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(morgan("dev"));

// Serve Frontend Static Files
const path = require("path");
app.use(express.static(path.join(__dirname, "frontend")));

// Routes ✅ FINAL
const authRoutes = require("./backend/routes/authRoutes");
const linkRoutes = require("./backend/routes/linkRoutes");
const verifyRoutes = require("./backend/routes/verifyRoutes");
const unlinkRoutes = require("./backend/routes/unlinkRoutes");
const activityRoutes = require("./backend/routes/activityRoutes");
const consentRoutes = require("./backend/routes/consentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/link", linkRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/unlink", unlinkRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/consent", consentRoutes);

// Health check (important)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// DB
const MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/crossSystemDB";
mongoose.connect(MONGO)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
