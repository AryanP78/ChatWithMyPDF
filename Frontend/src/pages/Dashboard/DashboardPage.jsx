import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Flame,
  Plus,
  Upload,
  Sparkles,
  Trophy,
  Play,
  ArrowRight,
  Activity,
  CheckCircle2,
} from "lucide-react";
import Spinner from "../../../common/Spinner";
import progressService from "../../service/progressService";
import { useAuth } from "../../Context/AuthContext";
import UploadModal from "../../components/documents/UploadModal";
import { formatFileSize } from "../../utils/formatFileSize";

const activityConfig = {
  document_uploaded: { icon: Upload, label: "Uploaded", className: "bg-blue-50 text-blue-500" },
  flashcards_generated: {
    icon: BookOpen,
    label: "Generated flashcards for",
    className: "bg-purple-50 text-purple-500",
  },
  quiz_generated: { icon: Sparkles, label: "Created quiz", className: "bg-amber-50 text-amber-500" },
  quiz_completed: { icon: Trophy, label: "Completed", className: "bg-emerald-50 text-emerald-500" },
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Card = ({ title, action, children, className = "" }) => (
  <div className={`min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
    {title && (
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, progress, iconClass }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon size={20} />
      </div>
    </div>
    {progress !== undefined ? (
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">{sub}</p>
      </div>
    ) : (
      <p className="mt-4 text-xs text-gray-500">{sub}</p>
    )}
  </div>
);

const ScoreChart = ({ scores }) => (
  <div className="flex h-40 items-end gap-3">
    {scores.map((s) => (
      <Link
        key={s.quizId}
        to={`/quizzes/${s.quizId}/results`}
        title={`${s.title}: ${s.score}%`}
        className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
      >
        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900">{s.score}%</span>
        <div
          className={`w-full max-w-[40px] rounded-t-lg transition-all group-hover:opacity-80 ${
            s.score >= 70
              ? "bg-gradient-to-t from-emerald-400 to-teal-400"
              : s.score >= 50
                ? "bg-gradient-to-t from-amber-300 to-amber-400"
                : "bg-gradient-to-t from-red-300 to-red-400"
          }`}
          style={{ height: `${Math.max(s.score, 4)}%` }}
        />
      </Link>
    ))}
  </div>
);

const GettingStarted = ({ onUpload }) => {
  const steps = [
    { icon: Upload, title: "Upload a PDF", text: "Add your notes, textbook chapters or slides." },
    { icon: Sparkles, title: "Chat & summarize", text: "Ask questions and get exam-ready summaries." },
    { icon: BrainCircuit, title: "Practice", text: "Generate flashcards and quizzes to test yourself." },
  ];
  return (
    <Card>
      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200">
          <Sparkles size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Let's get you started</h2>
        <p className="mt-1 text-sm text-gray-500">Three steps to turn any PDF into a study session.</p>
        <div className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="rounded-2xl bg-gray-50 p-5 text-left">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  {i + 1}
                </span>
                <Icon size={18} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="mt-1 text-xs text-gray-500">{text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onUpload}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Plus size={16} strokeWidth={2.5} />
          Upload your first PDF
        </button>
      </div>
    </Card>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await progressService.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <Spinner />;
  }

  const d = dashboardData || {};
  const firstName = user?.name?.split(" ")[0] || "there";
  const isNewUser = !d.totalDocuments;
  const reviewedPct = d.totalFlashcards
    ? Math.round((d.reviewedFlashcards / d.totalFlashcards) * 100)
    : 0;
  const completedPct = d.totalQuizzes
    ? Math.round((d.completedQuizzes / d.totalQuizzes) * 100)
    : 0;

  const stats = [
    {
      icon: FileText,
      label: "Documents",
      value: d.totalDocuments ?? 0,
      sub: d.recentDocuments?.[0]
        ? `Last upload ${moment(d.recentDocuments[0].createdAt).fromNow()}`
        : "No uploads yet",
      iconClass: "bg-blue-50 text-blue-500",
    },
    {
      icon: BookOpen,
      label: "Flashcards",
      value: d.totalFlashcards ?? 0,
      progress: reviewedPct,
      sub: `${d.reviewedFlashcards ?? 0} reviewed · ${d.starredFlashcards ?? 0} starred`,
      iconClass: "bg-purple-50 text-purple-500",
    },
    {
      icon: BrainCircuit,
      label: "Quizzes",
      value: d.totalQuizzes ?? 0,
      progress: completedPct,
      sub: `${d.completedQuizzes ?? 0} of ${d.totalQuizzes ?? 0} completed`,
      iconClass: "bg-amber-50 text-amber-500",
    },
    {
      icon: TrendingUp,
      label: "Average Score",
      value: `${d.averageScore ?? 0}%`,
      progress: d.averageScore ?? 0,
      sub: d.completedQuizzes ? "Across completed quizzes" : "Complete a quiz to see your score",
      iconClass: "bg-emerald-50 text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isNewUser
              ? "Welcome to AskMyPDF — upload a document to begin."
              : "Here's an overview of your learning progress."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {d.studyStreak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600">
              <Flame size={16} className="fill-orange-400 text-orange-500" />
              {d.studyStreak}-day streak
            </span>
          )}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus size={16} strokeWidth={2.5} />
            Upload PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {isNewUser ? (
        <GettingStarted onUpload={() => setIsUploadOpen(true)} />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent activity */}
            <Card title="Recent Activity" className="lg:col-span-2">
              {d.recentActivity?.length ? (
                <ol className="relative space-y-1">
                  {d.recentActivity.map((item, i) => {
                    const config = activityConfig[item.type];
                    const Icon = config.icon;
                    const content = (
                      <>
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.className}`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-gray-700">
                            {config.label}{" "}
                            <span className="font-semibold text-gray-900">{item.title}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.detail && `${item.detail} · `}
                            {moment(item.date).fromNow()}
                          </p>
                        </div>
                        {item.link && (
                          <ArrowRight
                            size={16}
                            className="shrink-0 text-gray-300 transition-colors group-hover:text-emerald-500"
                          />
                        )}
                      </>
                    );
                    return (
                      <li key={`${item.type}-${i}`}>
                        {item.link ? (
                          <Link
                            to={item.link}
                            className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 p-2">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="flex flex-col items-center py-8 text-center text-sm text-gray-500">
                  <Activity size={24} className="mb-2 text-gray-300" />
                  No activity yet
                </div>
              )}
            </Card>

            <div className="min-w-0 space-y-6">
              {/* Quiz performance */}
              <Card title="Quiz Performance">
                {d.recentScores?.length ? (
                  <>
                    <ScoreChart scores={d.recentScores} />
                    <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
                      Last {d.recentScores.length} quiz
                      {d.recentScores.length > 1 ? "zes" : ""} · click a bar to review
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center text-sm text-gray-500">
                    <Trophy size={24} className="mb-2 text-gray-300" />
                    Your recent quiz scores will appear here.
                  </div>
                )}
              </Card>

              {/* Up next */}
              <Card title="Up Next">
                {d.pendingQuizzes?.length ? (
                  <ul className="space-y-3">
                    {d.pendingQuizzes.map((q) => (
                      <li key={q.quizId}>
                        <Link
                          to={`/quizzes/${q.quizId}`}
                          className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                            <Play size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">{q.title}</p>
                            <p className="text-xs text-gray-500">{q.totalQuestions} questions</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 p-4 text-sm text-emerald-700">
                    <CheckCircle2 size={18} className="shrink-0" />
                    You're all caught up on quizzes.
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Recent documents */}
          <Card
            title="Recent Documents"
            action={
              <Link
                to="/documents"
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {d.recentDocuments.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/${doc._id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)} · {moment(doc.createdAt).fromNow()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </>
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={fetchDashboardData}
      />
    </div>
  );
};

export default DashboardPage;
