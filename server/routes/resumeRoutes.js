const express = require("express");
const router = express.Router();
const {
  getAllResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
} = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes are protected
router.get("/all", authMiddleware, getAllResumes);
router.get("/:id", authMiddleware, getResume);
router.post("/", authMiddleware, createResume);
router.put("/:id", authMiddleware, updateResume);
router.delete("/:id", authMiddleware, deleteResume);

module.exports = router;