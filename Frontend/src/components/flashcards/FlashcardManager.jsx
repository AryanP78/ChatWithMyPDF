import React, { useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import {
  BookOpen,
  Sparkles,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  RotateCcw,
} from "lucide-react";
import aiService from "../../service/aiService";
import flashcardService from "../../service/flashcardService";
import Spinner from "../../../common/Spinner";

const difficultyStyles = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-red-50 text-red-600",
};

const FlashcardViewer = ({ set, onBack, onCardUpdate }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = set.cards[index];

  const go = (delta) => {
    setFlipped(false);
    setIndex((i) => (i + delta + set.cards.length) % set.cards.length);
  };

  const handleFlip = async () => {
    const revealing = !flipped;
    setFlipped(revealing);
    if (revealing) {
      try {
        const response = await flashcardService.reviewFlashcard(card._id);
        onCardUpdate(set._id, response.data);
      } catch {
        // reviewing is best-effort; don't interrupt studying
      }
    }
  };

  const handleStar = async (e) => {
    e.stopPropagation();
    try {
      const response = await flashcardService.toggleStar(card._id);
      onCardUpdate(set._id, response.data);
    } catch (error) {
      toast.error(error?.error || "Failed to update card");
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to sets
      </button>

      <div className="mx-auto max-w-2xl">
        <div
          onClick={handleFlip}
          className="relative flex min-h-[280px] cursor-pointer flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-emerald-100/60"
        >
          <div className="flex items-center justify-between">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${difficultyStyles[card.difficulty] || difficultyStyles.medium}`}
            >
              {card.difficulty}
            </span>
            <button
              onClick={handleStar}
              className="rounded-lg p-1.5 hover:bg-gray-100"
              aria-label={card.isStarred ? "Unstar card" : "Star card"}
            >
              <Star
                size={20}
                className={card.isStarred ? "fill-amber-400 text-amber-400" : "text-gray-300"}
              />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {flipped ? "Answer" : "Question"}
            </p>
            <p
              className={`text-lg leading-relaxed ${flipped ? "text-emerald-700" : "font-medium text-gray-900"}`}
            >
              {flipped ? card.answer : card.question}
            </p>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <RotateCcw size={12} />
            Click card to {flipped ? "see question" : "reveal answer"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => go(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            aria-label="Previous card"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {index + 1} / {set.cards.length}
          </span>
          <button
            onClick={() => go(1)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            aria-label="Next card"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FlashcardManager = ({ documentId }) => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(10);
  const [activeSetId, setActiveSetId] = useState(null);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await flashcardService.getFlashcardsForDocument(documentId);
        setSets(response.data || []);
      } catch (error) {
        toast.error(error?.error || "Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, [documentId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await aiService.generateFlashcards(documentId, { count });
      setSets((prev) => [response.data, ...prev]);
      toast.success(`Generated ${response.data.cards.length} flashcards`);
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (set) => {
    if (!window.confirm(`Delete this set of ${set.cards.length} flashcards?`)) return;
    try {
      await flashcardService.deleteFlashcard(set._id);
      setSets((prev) => prev.filter((s) => s._id !== set._id));
      toast.success("Flashcard set deleted");
    } catch (error) {
      toast.error(error?.error || "Failed to delete flashcard set");
    }
  };

  const handleCardUpdate = (setId, updatedCard) => {
    setSets((prev) =>
      prev.map((s) =>
        s._id === setId
          ? { ...s, cards: s.cards.map((c) => (c._id === updatedCard._id ? updatedCard : c)) }
          : s,
      ),
    );
  };

  if (loading) return <Spinner />;

  const activeSet = sets.find((s) => s._id === activeSetId);
  if (activeSet) {
    return (
      <FlashcardViewer
        set={activeSet}
        onBack={() => setActiveSetId(null)}
        onCardUpdate={handleCardUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Generate Flashcards</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a new study set from this document with AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            disabled={generating}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-400"
            aria-label="Number of flashcards"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n} cards
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

      {sets.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
            <BookOpen size={26} className="text-purple-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No flashcards yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate your first set to start studying.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => {
            const reviewed = set.cards.filter((c) => c.ReviewCount > 0).length;
            const starred = set.cards.filter((c) => c.isStarred).length;
            const progress = set.cards.length
              ? Math.round((reviewed / set.cards.length) * 100)
              : 0;
            return (
              <div
                key={set._id}
                onClick={() => setActiveSetId(set._id)}
                className="group min-w-0 cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                    <BookOpen size={20} className="text-purple-500" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(set);
                    }}
                    className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                    aria-label="Delete flashcard set"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h4 className="mt-4 text-base font-semibold text-gray-900">
                  {set.cards.length} Flashcards
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Created {moment(set.createdAt).fromNow()}
                  {starred > 0 && ` · ${starred} starred`}
                </p>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                    <span>Reviewed</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardManager;
