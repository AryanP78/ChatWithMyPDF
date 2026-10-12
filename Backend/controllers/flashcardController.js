import Flashcard from "../models/Flashcard.js";
import Progress from "../models/Progress.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Get all flashcards for a user
// @route   GET /api/flashcards
// @access  Private
export const getAllFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({ userID: req.user._id })
      .populate("documentID", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

//@desc  get all flashcards for a document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getFlashcards = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const flashcards = await Flashcard.find({
      documentID: documentId,
      userID: req.user._id,
    });
    res.status(200).json({
      success: true,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

//@desc  mark flashcard as reviewed
// @route   PUT /api/flashcards/:cardId/review
// @access  Private
export const reviewFlashcard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const flashcardSet = await Flashcard.findOne({
      "cards._id": cardId,
      userID: req.user._id,
    });

    if (!flashcardSet) {
      return next(new AppError("Flashcard not found", 404));
    }

    const card = flashcardSet.cards.id(cardId);
    card.ReviewCount += 1;
    card.lastReviewed = new Date();

    await flashcardSet.save();

    await Progress.recordFlashcardReview(req.user._id);

    res.status(200).json({
      success: true,
      data: card,
      message: "Flashcard review status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc toggle star status of flashcard
// @route   PUT /api/flashcards/:cardId/star
// @access  Private
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const flashcardSet = await Flashcard.findOne({
      "cards._id": cardId,
      userID: req.user._id,
    });

    if (!flashcardSet) {
      return next(new AppError("Flashcard not found", 404));
    }

    const card = flashcardSet.cards.id(cardId);
    card.isStarred = !card.isStarred;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: card,
      message: "Flashcard star status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc delete flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const flashcard = await Flashcard.findOneAndDelete({
      _id: id,
      userID: req.user._id,
    });

    if (!flashcard) {
      return next(new AppError("Flashcard not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
