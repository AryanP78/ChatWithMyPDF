import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          required: true,
        },
      },
    ],
    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    correctAnswers: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

//index for faster qeueries
quizSchema.index({ userID: 1, documentID: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
