import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
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
    cards: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          required: true,
        },
        lastReviewed: {
          type: Date,
          default: null,
        },
        ReviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

//index for faster queries
flashcardSchema.index({ userID: 1, documentID: 1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;
