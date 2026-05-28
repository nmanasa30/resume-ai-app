const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/summary", authMiddleware, async (req, res) => {
  try {
    const { name, skills, education, experience } = req.body;

    const skillList = skills?.split(",").map(s => s.trim()).filter(Boolean) || [];
    const topSkills = skillList.slice(0, 3).join(", ");
    const firstName = name?.split(" ")[0] || "I";

    const summaries = [
      `${firstName} is a dedicated professional skilled in ${topSkills || "various technologies"} with a strong foundation in ${education || "computer science"}. ${experience ? "Experienced in " + experience.slice(0, 80) + "." : "Passionate about building impactful solutions and continuously growing in the field."}`,
      `Motivated ${education || "graduate"} with hands-on expertise in ${topSkills || "modern technologies"} and a passion for creating efficient, user-friendly applications. Proven ability to deliver high-quality work through ${experience ? "internships and real-world projects" : "academic projects and self-learning"}.`,
      `Results-driven developer proficient in ${topSkills || "web technologies"} seeking to leverage strong technical skills and ${education || "academic background"} to contribute to innovative projects. Committed to writing clean, maintainable code and delivering excellent user experiences.`,
    ];

    const summary = summaries[Math.floor(Math.random() * summaries.length)];
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Error generating summary.", error: err.message });
  }
});

module.exports = router;
