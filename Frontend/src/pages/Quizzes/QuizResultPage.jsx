import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Trophy,
  Lightbulb,
} from "lucide-react";
import Spinner from "../../../common/Spinner";
import quizService from "../../service/quizService";

const scoreMessage = (score) => {
  if (score >= 90) return "Outstanding work!";
  if (score >= 70) return "Great job!";
  if (score >= 50) return "Good effort — keep practicing.";
  return "Keep studying, you'll get there!";
};

const ScoreRing = ({ score }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-gray-900">{score}%</span>
        <span className="text-xs text-gray-500">Score</span>
      </div>
    </div>
  );
};

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await quizService.getQuizResults(quizId);
        setResults(response.data);
      } catch (error) {
        toast.error(error?.error || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  if (loading) return <Spinner />;

  if (!results) {
    return (
      <div className="px-4 py-16 text-center sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900">Results not available</h2>
        <Link
          to={`/quizzes/${quizId}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
        >
          Take the quiz
        </Link>
      </div>
    );
  }

  const { title, document, score, totalQuestions, correctAnswers, completedAt, questions } =
    results;
  const skipped = questions.filter((q) => q.selectedAnswer === null).length;
  const incorrect = totalQuestions - correctAnswers - skipped;

  const stats = [
    { label: "Correct", value: correctAnswers, className: "bg-emerald-50 text-emerald-600" },
    { label: "Incorrect", value: incorrect, className: "bg-red-50 text-red-600" },
    { label: "Skipped", value: skipped, className: "bg-gray-100 text-gray-600" },
  ];

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to={document?._id ? `/documents/${document._id}` : "/documents"}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to {document?.title || "Documents"}
        </Link>

        {/* Summary */}
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:flex-row sm:p-8 sm:text-left">
          <ScoreRing score={score} />
          <div className="flex-1">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Trophy size={20} className="text-amber-500" />
              <h1 className="text-xl font-semibold text-gray-900">{scoreMessage(score)}</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {title} · completed {moment(completedAt).fromNow()}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {stats.map(({ label, value, className }) => (
                <span key={label} className={`rounded-xl px-3 py-1.5 text-sm font-medium ${className}`}>
                  {value} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Review */}
        <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Review Answers</h2>
        <div className="space-y-4">
          {questions.map((q, index) => {
            const status =
              q.selectedAnswer === null ? "skipped" : q.isCorrect ? "correct" : "incorrect";
            const StatusIcon =
              status === "correct" ? CheckCircle2 : status === "incorrect" ? XCircle : MinusCircle;
            const statusColor =
              status === "correct"
                ? "text-emerald-500"
                : status === "incorrect"
                  ? "text-red-500"
                  : "text-gray-400";

            return (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <StatusIcon size={22} className={`mt-0.5 shrink-0 ${statusColor}`} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Question {index + 1}
                      {status === "skipped" && " · Skipped"}
                    </p>
                    <h3 className="mt-1 font-medium leading-relaxed text-gray-900">{q.question}</h3>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {q.options.map((option, i) => {
                    const isCorrectOption = option === q.correctAnswer;
                    const isSelected = option === q.selectedAnswer;
                    let style = "border-gray-100 text-gray-600";
                    if (isCorrectOption) style = "border-emerald-200 bg-emerald-50 text-emerald-800";
                    else if (isSelected) style = "border-red-200 bg-red-50 text-red-700";

                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${style}`}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                        <span className="flex-1">{option}</span>
                        {isCorrectOption && (
                          <span className="text-xs font-semibold text-emerald-600">Correct answer</span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="text-xs font-semibold text-red-600">Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-4 flex gap-3 rounded-xl bg-amber-50/70 p-4 text-sm text-gray-700">
                    <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-500" />
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
