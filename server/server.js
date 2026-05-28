require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000" ,   "https://resumeap.netlify.app"],
  credentials: true,
}));
app.use(express.json());

const authRoutes    = require("./routes/authRoutes");
const resumeRoutes  = require("./routes/resumeRoutes");
const aiRoutes      = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/auth",    authRoutes);
app.use("/api/resume",  resumeRoutes);
app.use("/api/ai",      aiRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => res.send("API running"));

app.delete("/api/deleteusers", async (req, res) => {
  const User = require("./models/User");
  await User.deleteMany({});
  res.json({ message: "All users deleted" });
});

console.log("Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err.message));
