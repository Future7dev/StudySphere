import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
      index: true,
    },
    roadmapSlug: {
      type: String,
      index: true,
    },
    topicProgress: {
      type: Map,
      of: String, // 'completed' | 'in-progress' | 'not-started'
      default: {},
    },
    completedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    quizScores: [
      {
        quizId: String,
        score: Number,
        correctCount: Number,
        totalQuestions: Number,
        passed: Boolean,
        takenAt: { type: Date, default: Date.now },
      },
    ],
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
