import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Spinner from "../../../common/Spinner";
import quizService from "../../service/quizService";

const difficultyStyles = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-red-50 text-red-600",
};

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: option }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        if (response.data.completedAt) {
          navigate(`/quizzes/${quizId}/results`, { replace: true });
          return;
        }
        setQuiz(response.data);
      } catch (error) {
        toast.error(error?.error || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  if (loading) return <Spinner />;

  if (!quiz) {
    return (
      <div className="px-4 py-16 text-center sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900">Quiz not found</h2>
        <Link
          to="/documents"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
    );
  }

  const total = quiz.questions.length;
  const question = quiz.questions[current];
  const answeredCount = Object.keys(answers).length;
  const isLast = current === total - 1;

  const selectAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [current]: option }));
  };

  const handleSubmit = async () => {
    const unanswered = total - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`,
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([index, selectedAnswer]) => ({
        questionIndex: Number(index),
        selectedAnswer,
      }));
      await quizService.submitQuiz(quizId, payload);
      toast.success("Quiz submitted!");
      navigate(`/quizzes/${quizId}/results`, { replace: true });
    } catch (error) {
      toast.error(error?.error || "Failed to submit quiz");
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/documents/${quiz.documentID}`}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Document
        </Link>
        <h1 className="mb-6 text-2xl font-medium tracking-tight text-slate-900">
          {quiz.title}
        </h1>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-gray-700">
              Question {current + 1} of {total}
            </span>
            <span className="text-gray-500">{answeredCount} answered</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <span
            className={`inline-block rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${difficultyStyles[question.difficulty] || difficultyStyles.medium}`}
          >
            {question.difficulty}
          </span>
          <h2 className="mt-4 text-lg font-semibold leading-relaxed text-gray-900">
            {question.question}
          </h2>

          <div className="mt-6 space-y-3" role="radiogroup">
            {question.options.map((option, i) => {
              const selected = answers[current] === option;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => selectAnswer(option)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left text-sm transition-all ${
                    selected
                      ? "border-emerald-400 bg-emerald-50/60 text-gray-900"
                      : "border-gray-200 text-gray-700 hover:border-emerald-200 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                      selected
                        ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {selected && <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrent((c) => c - 1)}
            disabled={current === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="hidden flex-wrap justify-center gap-1.5 sm:flex">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to question ${i + 1}`}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                  i === current
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                    : answers[i] !== undefined
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {submitting ? "Submitting…" : "Submit Quiz"}
            </button>
          ) : (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg"
            >
              Next
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;
