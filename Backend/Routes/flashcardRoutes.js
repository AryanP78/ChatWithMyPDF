import express from "express";
import {
  getFlashcards,
  getAllFlashcards,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcard,
} from "../controllers/flashcardController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getAllFlashcards);
router.get("/:documentId", protect, getFlashcards);
router.put("/:cardId/review", protect, reviewFlashcard);
router.put("/:cardId/star", protect, toggleStarFlashcard);
router.delete("/:id", protect, deleteFlashcard);

export default router;
