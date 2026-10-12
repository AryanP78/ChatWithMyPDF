import Progress from "../models/Progress.js";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

// @desc    Get overall progress summary for the logged-in user
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ userID: req.user._id });

    if (!progress) {
      progress = await Progress.create({ userID: req.user._id });
    }

    const documentsUploaded = await Document.countDocuments({
      userID: req.user._id,
    });

    const averageQuizScore =
      progress.quizzesTaken > 0
        ? Math.round(progress.totalQuizScore / progress.quizzesTaken)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        documentsUploaded,
        quizzesTaken: progress.quizzesTaken,
        averageQuizScore,
        flashcardsReviewed: progress.flashcardsReviewed,
        lastActivityAt: progress.lastActivityAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Count consecutive days (ending today or yesterday) that have activity
const computeStreak = (dates) => {
  const days = new Set(dates.map((d) => new Date(d).toDateString()));
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

// @desc    Get user learning statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const userID = req.user._id;

    const [documents, flashcardSets, quizzes] = await Promise.all([
      Document.find({ userID })
        .select("title status fileSize createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Flashcard.find({ userID }).populate("documentID", "title").lean(),
      Quiz.find({ userID })
        .select("title score completedAt createdAt documentID questions")
        .populate("documentID", "title")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Flashcard statistics
    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;
    const reviewDates = [];

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      set.cards.forEach((c) => {
        if (c.ReviewCount > 0) reviewedFlashcards++;
        if (c.isStarred) starredFlashcards++;
        if (c.lastReviewed) reviewDates.push(c.lastReviewed);
      });
    });

    // Quiz statistics
    const completed = quizzes
      .filter((q) => q.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    const averageScore =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, quiz) => sum + quiz.score, 0) /
              completed.length,
          )
        : 0;

    const recentScores = completed
      .slice(0, 6)
      .reverse()
      .map((q) => ({
        quizId: q._id,
        title: q.title,
        score: q.score,
        completedAt: q.completedAt,
      }));

    const pendingQuizzes = quizzes
      .filter((q) => !q.completedAt)
      .slice(0, 3)
      .map((q) => ({
        quizId: q._id,
        title: q.title,
        documentTitle: q.documentID?.title,
        totalQuestions: q.questions.length,
        createdAt: q.createdAt,
      }));

    // Activity feed across documents, flashcards and quizzes
    const activity = [
      ...documents.map((d) => ({
        type: "document_uploaded",
        title: d.title,
        link: `/documents/${d._id}`,
        date: d.createdAt,
      })),
      ...flashcardSets.map((f) => ({
        type: "flashcards_generated",
        title: f.documentID?.title || "Deleted document",
        detail: `${f.cards.length} cards`,
        link: f.documentID ? `/documents/${f.documentID._id}/flashcards` : null,
        date: f.createdAt,
      })),
      ...quizzes.map((q) => ({
        type: "quiz_generated",
        title: q.title,
        detail: `${q.questions.length} questions`,
        link: `/quizzes/${q._id}`,
        date: q.createdAt,
      })),
      ...completed.map((q) => ({
        type: "quiz_completed",
        title: q.title,
        detail: `Scored ${q.score}%`,
        link: `/quizzes/${q._id}/results`,
        date: q.completedAt,
      })),
    ];

    const recentActivity = activity
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    const studyStreak = computeStreak([
      ...activity.map((a) => a.date),
      ...reviewDates,
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDocuments: documents.length,
        totalFlashcardSets: flashcardSets.length,
        totalFlashcards,
        reviewedFlashcards,
        starredFlashcards,
        totalQuizzes: quizzes.length,
        completedQuizzes: completed.length,
        averageScore,
        studyStreak,
        recentScores,
        pendingQuizzes,
        recentDocuments: documents.slice(0, 4),
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
