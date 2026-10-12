import Quiz from "../models/Quiz.js";
import Progress from "../models/Progress.js";

//@desc get all quizzes for a document
// @route   GET /api/quiz/:documentId
// @access  Private
export const getQuizzes = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const quizzes = await Quiz.find({ documentID: documentId, userID: req.user._id })
      .select("-questions.correctAnswer -questions.explanation")
      .populate("documentID", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

//@desc get a quiz by id
// @route   GET /api/quiz/quiz/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }
    // Don't reveal answers until the quiz has been submitted
    const data = quiz.toObject();
    if (!quiz.completedAt) {
      data.questions = data.questions.map(
        ({ correctAnswer, explanation, ...question }) => question,
      );
    }

    res.status(200).json({
      success: true,
      data,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc submit a quiz
// @route POST /api/quiz/:id/submit
// @access Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Please provide answers array",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz is already completed",
        statusCode: 400,
      });
    }

    // Process answers
    let correctCount = 0;
    const userAnswers = [];

    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      if (questionIndex >= 0 && questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];

        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        userAnswers.push({
          questionIndex,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    // Calculate score
    const totalQuestions = quiz.questions.length;

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    // Update quiz
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.correctAnswers = correctCount;
    quiz.completedAt = new Date();

    await quiz.save();

    await Progress.recordQuizCompletion(req.user._id, score);

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        quizId: quiz._id,
        totalQuestions,
        correctAnswers: correctCount,
        score,
        completedAt: quiz.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc get quiz results
// @route GET /api/quiz/:id/results
// @access Private
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userID: req.user._id,
    }).populate("documentID", "title fileName");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz has not been completed yet",
        statusCode: 400,
      });
    }

    const totalQuestions = quiz.questions.length;

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        title: quiz.title,
        document: quiz.documentID,
        totalQuestions,
        correctAnswers: quiz.correctAnswers,
        score: quiz.score,
        completedAt: quiz.completedAt,
        answers: quiz.userAnswers,
        // Per-question breakdown for the results page
        questions: quiz.questions.map((question, index) => {
          const answer = quiz.userAnswers.find(
            (a) => a.questionIndex === index,
          );
          return {
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            selectedAnswer: answer?.selectedAnswer ?? null,
            isCorrect: answer?.isCorrect ?? false,
          };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc delete a quiz
// @route DELETE /api/quiz/:id
// @access Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
