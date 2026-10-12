import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import { BookOpen, FileText, Star, ArrowRight } from "lucide-react";
import Spinner from "../../../common/Spinner";
import flashcardService from "../../service/flashcardService";

const FlashcardListpage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
        setSets(response.data || []);
      } catch (error) {
        toast.error(error?.error || "Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  const totalCards = sets.reduce((sum, s) => sum + s.cards.length, 0);

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-medium tracking-tight text-slate-900">
          My Flashcards
        </h1>
        <p className="text-sm text-slate-500">
          {sets.length > 0
            ? `${sets.length} set${sets.length > 1 ? "s" : ""} · ${totalCards} cards`
            : "Review and study your flashcard sets"}
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
            <BookOpen size={30} className="text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No flashcards yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Open a document and generate flashcards from the Flashcards tab.
          </p>
          <Link
            to="/documents"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Go to Documents
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sets.map((set) => {
            const reviewed = set.cards.filter((c) => c.ReviewCount > 0).length;
            const starred = set.cards.filter((c) => c.isStarred).length;
            const progress = set.cards.length
              ? Math.round((reviewed / set.cards.length) * 100)
              : 0;
            const doc = set.documentID;

            return (
              <Link
                key={set._id}
                to={doc?._id ? `/documents/${doc._id}/flashcards` : "/documents"}
                className="group flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                    <BookOpen size={22} className="text-purple-500" />
                  </div>
                  {starred > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {starred}
                    </span>
                  )}
                </div>

                <h3
                  className="mt-4 flex items-center gap-1.5 truncate text-base font-semibold text-gray-900"
                  title={doc?.title}
                >
                  <FileText size={16} className="shrink-0 text-gray-400" />
                  <span className="truncate">{doc?.title || "Deleted document"}</span>
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {set.cards.length} cards · {moment(set.createdAt).fromNow()}
                </p>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                    <span>Reviewed</span>
                    <span>
                      {reviewed}/{set.cards.length}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardListpage;
