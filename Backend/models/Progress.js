import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    quizzesTaken: {
      type: Number,
      default: 0,
    },
    totalQuizScore: {
      type: Number,
      default: 0,
    },
    flashcardsReviewed: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

progressSchema.statics.recordQuizCompletion = function (userID, score) {
  return this.findOneAndUpdate(
    { userID },
    {
      $inc: { quizzesTaken: 1, totalQuizScore: score },
      $set: { lastActivityAt: new Date() },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
};

progressSchema.statics.recordFlashcardReview = function (userID) {
  return this.findOneAndUpdate(
    { userID },
    {
      $inc: { flashcardsReviewed: 1 },
      $set: { lastActivityAt: new Date() },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
};

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
