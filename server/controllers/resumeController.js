const Resume = require("../models/Resume");

// GET /api/resume/all — get all resumes for logged-in user
const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// GET /api/resume/:id — get single resume
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// POST /api/resume — create new resume
const createResume = async (req, res) => {
  try {
    const { name, email, phone, link, skills, education, experience, projects, summary, style, atsScore } = req.body;

    const title = name ? `${name}'s Resume` : "Untitled Resume";

    const resume = await Resume.create({
      user: req.user.id,
      name, email, phone, link, skills,
      education, experience, projects,
      summary, style, atsScore, title,
    });

    res.status(201).json({ message: "Resume saved successfully!", resume });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// PUT /api/resume/:id — update existing resume
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found." });

    const fields = ["name","email","phone","link","skills","education","experience","projects","summary","style","atsScore"];
    fields.forEach((f) => { if (req.body[f] !== undefined) resume[f] = req.body[f]; });

    if (req.body.name) resume.title = `${req.body.name}'s Resume`;

    await resume.save();
    res.json({ message: "Resume updated!", resume });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// DELETE /api/resume/:id — delete resume
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    res.json({ message: "Resume deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

module.exports = { getAllResumes, getResume, createResume, updateResume, deleteResume };