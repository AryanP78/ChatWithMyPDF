import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import { BrainCircuit, Sparkles, Trash2, Play, Trophy } from "lucide-react";
import aiService from "../../service/aiService";
import quizService from "../../service/quizService";
import Spinner from "../../../common/Spinner";

const QuizManager = ({ documentId }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizService.getQuizzesForDocument(documentId);
        setQuizzes(response.data || []);
      } catch (error) {
        toast.error(error?.error || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [documentId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await aiService.generateQuiz(documentId, { numQuestions });
      setQuizzes((prev) => [response.data, ...prev]);
      toast.success("Quiz generated!");
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;
    try {
      await quizService.deleteQuiz(quiz._id);
      setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
      toast.success("Quiz deleted");
    } catch (error) {
      toast.error(error?.error || "Failed to delete quiz");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Generate a Quiz</h3>
          <p className="mt-1 text-sm text-gray-500">
            Test yourself with AI-generated multiple-choice questions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            disabled={generating}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-400"
            aria-label="Number of questions"
          >
            {[5, 10, 15].map((n) => (
              <option key={n} value={n}>
                {n} questions
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Sparkles size={16} />
            )}
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <BrainCircuit size={26} className="text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No quizzes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate a quiz to check your understanding.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const completed = Boolean(quiz.completedAt);
            return (
              <div
                key={quiz._id}
                className="group flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                    <BrainCircuit size={20} className="text-emerald-500" />
                  </div>
                  {completed ? (
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      Score: {quiz.score}%
                    </span>
                  ) : (
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                      Not started
                    </span>
                  )}
                </div>
                <h4 className="mt-4 line-clamp-2 text-base font-semibold text-gray-900">
                  {quiz.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  {quiz.questions.length} questions · {moment(quiz.createdAt).fromNow()}
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate(
                        completed ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`,
                      )
                    }
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      completed
                        ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                        : "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200 hover:shadow-lg"
                    }`}
                  >
                    {completed ? <Trophy size={16} /> : <Play size={16} />}
                    {completed ? "View Results" : "Start Quiz"}
                  </button>
                  <button
                    onClick={() => handleDelete(quiz)}
                    className="rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${quiz.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizManager;
