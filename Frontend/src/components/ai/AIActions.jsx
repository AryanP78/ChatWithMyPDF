import React, { useState } from "react";
import { FileText, Lightbulb, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import aiService from "../../service/aiService";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ButtonSpinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
);

const AIActions = ({ documentId }) => {
  const [loadingAction, setLoadingAction] = useState(null);
  const [concept, setConcept] = useState("");
  const [result, setResult] = useState(null); // { title, content }

  const handleSummary = async () => {
    setLoadingAction("summary");
    try {
      const summary = await aiService.generateSummary(documentId);
      setResult({ title: "Document Summary", content: summary });
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to generate summary");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setLoadingAction("explain");
    try {
      const response = await aiService.explainConcept(documentId, concept.trim());
      setResult({
        title: `Explanation: ${response.data.concept}`,
        content: response.data.explanation,
      });
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to explain concept");
    } finally {
      setLoadingAction(null);
    }
  };

  const busy = loadingAction !== null;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <FileText size={22} className="text-blue-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Generate Summary</h3>
          <p className="mt-1 flex-1 text-sm text-gray-500">
            Get an exam-ready overview of the key concepts, definitions and
            formulas in this document.
          </p>
          <button
            onClick={handleSummary}
            disabled={busy}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "summary" ? <ButtonSpinner /> : <Sparkles size={16} />}
            {loadingAction === "summary" ? "Summarizing…" : "Summarize"}
          </button>
        </div>

        <form
          onSubmit={handleExplain}
          className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <Lightbulb size={22} className="text-amber-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Explain a Concept</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a topic and get a simple, step-by-step explanation.
          </p>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g. Virtual DOM"
            disabled={busy}
            className="mt-4 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={busy || !concept.trim()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "explain" ? <ButtonSpinner /> : <Sparkles size={16} />}
            {loadingAction === "explain" ? "Explaining…" : "Explain"}
          </button>
        </form>
      </div>

      {result && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Sparkles size={18} className="text-emerald-500" />
              {result.title}
            </h3>
            <button
              onClick={() => setResult(null)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close result"
            >
              <X size={18} />
            </button>
          </div>
          <MarkdownRenderer content={result.content} />
        </div>
      )}
    </div>
  );
};

export default AIActions;
