import express from "express";
import {
  getProgress,
  getDashboard,
} from "../controllers/progressController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getProgress);
router.get("/dashboard", getDashboard);

export default router;
