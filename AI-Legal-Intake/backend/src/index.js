// backend/src/index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import intakeRoutes from "./routes/intake.js";
import ticketRoutes from "./routes/tickets.js";
import profileRoutes from "./routes/profile.js";

// Load .env file first before anything else
dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────
// Tells the backend which frontend URLs are allowed to talk to it
app.use(cors({
  origin: [
    "http://localhost:5173",         // Vite default port
    "http://localhost:5174",
    "http://localhost:8080",         // Vite alternate port
    "http://192.168.1.8:5173",       // Your local network
    "http://192.168.1.8:5174",       // Your local network alternate
    "https://legal-triage-eta.vercel.app", // Live Vercel frontend
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ── Body Parser ───────────────────────────────────────
// Lets express read JSON sent from the frontend
app.use(express.json());

// ── Routes ────────────────────────────────────────────
// All intake form submissions → /api/intake
app.use("/api/intake", intakeRoutes);

// All ticket operations → /api/tickets
app.use("/api/tickets", ticketRoutes);

// All profile operations → /api/profile
app.use("/api/profile", profileRoutes);

// ── Health Check ──────────────────────────────────────
// Visit http://localhost:3001 to confirm backend is running
app.get("/", (req, res) => {
  res.json({ status: "✅ Backend is running!" });
});

// ── Global Error Handler ──────────────────────────────
// Catches any unhandled errors and returns a clean response
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// ── Start Server ──────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`   SUPABASE_URL = ${process.env.SUPABASE_URL ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`   SUPABASE_SERVICE_KEY = ${process.env.SUPABASE_SERVICE_KEY ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`   AI_SERVICE_URL = ${process.env.AI_SERVICE_URL || "http://localhost:8000 (default)"}`);
});