import express from "express";
import {
  generateRoadmap,
  getAllRoadmaps,
  getRoadmapById,
  updateProgress,
  getRoadmapQuiz,
  submitQuiz,
  getDashboardSummary,
} from "../controllers/roadmapController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", optionalAuth, generateRoadmap);
router.get("/", optionalAuth, getAllRoadmaps);
router.get("/user/dashboard-summary", protect, getDashboardSummary);
router.get("/:id", optionalAuth, getRoadmapById);
router.patch("/:id/progress", protect, updateProgress);
router.get("/:id/quiz", optionalAuth, getRoadmapQuiz);
router.post("/:id/quiz/submit", optionalAuth, submitQuiz);

export default router;
