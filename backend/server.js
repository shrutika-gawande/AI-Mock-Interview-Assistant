import Interview from "./models/Interview.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import mongoose from "mongoose";

dotenv.config();

/* ------------------ DATABASE CONNECTION ------------------ */

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
}

/* ------------------ APP SETUP ------------------ */

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ------------------ GENERATE QUESTION ------------------ */

app.post("/interview/question", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You are an interview question generator. Respond with only the raw question text.",
        },
        {
          role: "user",
          content: `Generate one technical interview question on ${topic}. Only return the question itself.`,
        },
      ],
    });

    const question = response.choices[0].message.content.trim();

    res.json({ question });
  } catch (error) {
    console.error("🔥 Question API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------ EVALUATE ANSWER ------------------ */

app.post("/interview/evaluate", async (req, res) => {
  const { topic, question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: "Question and Answer are required" });
  }

  try {
    console.log("✅ Evaluate route hit");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `
You are a technical interview evaluator.

Return feedback in this EXACT format:

Score: <number>/10

Strengths:
• <point 1>
• <point 2>

Improvements:
• <point 1>
• <point 2>

Correct Answer:
<3-4 line ideal answer>

Do NOT add any extra text.
Do NOT say "Sure".
Do NOT add explanations outside this format.
`,
        },
        {
          role: "user",
          content: `
Question: ${question}

Candidate Answer: ${answer}

Evaluate this answer.
`,
        },
      ],
    });

    const feedback = response.choices[0].message.content.trim();

    // Send response FIRST (so DB failure doesn't break user experience)
    res.json({ feedback });

    // Save to DB safely (non-blocking)
    try {
      const newInterview = new Interview({
        topic,
        question,
        answer,
        feedback,
      });

      await newInterview.save();
      console.log("✅ Interview saved to DB");
    } catch (dbError) {
      console.error("⚠️ Mongo Save Error:", dbError);
    }
  } catch (error) {
    console.error("🔥 Evaluate API Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});

/* ------------------ START SERVER ------------------ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});