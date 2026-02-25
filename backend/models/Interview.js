import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  topic: String,
  question: String,
  answer: String,
  feedback: String,
  score: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Interview", interviewSchema);