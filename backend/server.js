import Interview from "./models/Interview.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/interview/question", async (req, res) => {
  const { topic } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an interview question generator. Respond with only the raw question text."
        },
        {
          role: "user",
          content: `Generate one technical interview question on ${topic}. Only return the question itself.`
        }
      ]
    });

    res.json({ question: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "OpenAI error" });
  }
});

app.post("/interview/evaluate", async (req, res) => {
  const { topic, question, answer } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
`
  },
  {
    role: "user",
    content: `
Question: ${question}

Candidate Answer: ${answer}

Evaluate this answer.
`
  }
]
    });

    const feedback = response.choices[0].message.content.trim();

    // SAVE TO DATABASE HERE
    const newInterview = new Interview({
      topic,
      question,
      answer,
      feedback
    });

    await newInterview.save();

    res.json({ feedback });
    
  } catch (error) {
    res.status(500).json({ error: "OpenAI error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));