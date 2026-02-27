import { useState } from "react";
import axios from "axios";
import './App.css';


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
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
    <div className="min-h-screen main-bg flex items-center justify-center p-6">
      <div className="card-container">

        {/* Header */}
        <div className="card-header">
          <div className="card-icon">🤖</div>
          <h1 className="card-title">AI Mock Interview Assistant</h1>
          <p className="card-subtitle">Practice. Learn. Get Hired.</p>
        </div>

        {/* Topic Selector */}
        <div className="topic-section">
          <label className="input-label">Select Topic</label>
          <div className="topic-row">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="topic-select"
            >
              <option value="DSA">DSA</option>
              <option value="OOP">OOP</option>
              <option value="DBMS">DBMS</option>
              <option value="OS">OS</option>
            </select>

            <button
              onClick={generateQuestion}
              className="generate-btn"
              disabled={loading}
            >
              {loading ? "⏳ Loading..." : "⚡ Generate Question"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box">
            ⚠️ {error}
          </div>
        )}

        {/* Question */}
        {question && (
          <div className="question-box">
            <p className="question-label">Question:</p>
            <p className="question-text">{question}</p>
          </div>
        )}

        {/* Answer */}
        {question && (
          <div className="answer-section">
            <label className="input-label">✍️ Your Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="answer-textarea"
            />
          </div>
        )}

        {/* Submit */}
        {question && (
          <button
            onClick={submitAnswer}
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "⏳ Evaluating..." : "🚀 Submit Answer"}
          </button>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="feedback-box">
            <p className="feedback-label">🧠 AI Feedback</p>
            <p className="feedback-text">{feedback}</p>
          </div>
        )}

        <p className="card-footer">
          MERN + OpenAI • {API.defaults.baseURL}
        </p>
      </div>
    </div>
  );
}
