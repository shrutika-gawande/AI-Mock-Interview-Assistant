import { useState } from "react";
import axios from "axios";
import './App.css';

// Use environment variable if available, fallback to relative API for preview
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 10000
});

export default function App() {
  const [topic, setTopic] = useState("DSA");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  const generateQuestion = async () => {
    try {
      setLoading(true);
      setError("");
      setFeedback("");

      const res = await API.post("/interview/question", { topic });
      setQuestion(res.data.question);
      setAnswer("");
      setFeedback("");
    } catch (err) {
      setError(
        "Unable to reach backend API. Make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/interview/evaluate", {
        topic,
        question,
        answer
      });

      setFeedback(res.data.feedback);
    } catch (err) {
      setError(
        "Failed to evaluate answer. Backend may be unreachable or CORS may be misconfigured."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">
          AI Mock Interview Assistant
        </h1>

        <div className="flex gap-3 justify-center">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="DSA">DSA</option>
            <option value="OOP">OOP</option>
            <option value="DBMS">DBMS</option>
            <option value="OS">OS</option>
          </select>

          <button
            onClick={generateQuestion}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Question"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {question && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="font-semibold">Question:</p>
            <p>{question}</p>
          </div>
        )}

        {question && (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full border rounded-lg p-3 min-h-30"
          />
        )}

        {question && (
          <button
            onClick={submitAnswer}
            className="w-full bg-green-600 text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Evaluating..." : "Submit Answer"}
          </button>
        )}

        {feedback && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg whitespace-pre-line">
            <p className="font-semibold">AI Feedback:</p>
            {feedback}
          </div>
        )}

        <p className="text-xs text-center text-gray-500">
          MERN + OpenAI • API base: {API.defaults.baseURL}
        </p>
      </div>
    </div>
  );
}
