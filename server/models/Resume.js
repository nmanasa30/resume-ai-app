const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    link: { type: String, default: "" },
    skills: { type: String, default: "" },
    education: { type: String, default: "" },
    experience: { type: String, default: "" },
    projects: { type: String, default: "" },
    summary: { type: String, default: "" },
    style: { type: String, default: "professional" },
    atsScore: { type: Number, default: 0 },
    title: { type: String, default: "Untitled Resume" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);