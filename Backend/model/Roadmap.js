import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    estimatedHours: {
      type: Number,
      default: 40,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#5B5FED",
    },
    nodes: {
      type: Array,
      default: [],
    },
    quiz: {
      type: Object,
      default: { questions: [] },
    },
    rawResponse: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;
