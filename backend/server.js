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
    console.log("Evaluate route hit");
    console.log("Answer length:", answer?.length);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an interview evaluator." },
        { role: "user", content: `Question: ${question}\nAnswer: ${answer}` }
      ]
    });

    console.log("OpenAI success");

    const feedback = response.choices[0].message.content;

    res.json({ feedback });

  } catch (error) {
    console.error("🔥 FULL OPENAI ERROR:");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      error: error.message,
      type: error.name
    });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));