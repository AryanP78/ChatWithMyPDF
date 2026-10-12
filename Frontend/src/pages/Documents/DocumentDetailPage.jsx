import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  BrainCircuit,
  AlertTriangle,
} from "lucide-react";
import Spinner from "../../../common/Spinner";
import documentService from "../../service/documentService";
import { BASE_URL } from "../../utils/apiPaths";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";
import AIActions from "../../components/ai/AIActions";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data?.document);
      } catch (error) {
        toast.error(error?.error || error?.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return (
      <div className="px-4 py-16 text-center sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900">Document not found</h2>
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

  const pdfUrl = `${BASE_URL}/uploads/documents/${document.fileName}`;
  const isReady = document.status === "ready";

  const notReady = (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      {document.status === "failed"
        ? "We couldn't read text from this PDF, so AI features aren't available for it. Try uploading a text-based (not scanned) PDF."
        : "This document is still being processed. AI features will be available once it's ready."}
    </div>
  );

  const tabs = [
    {
      name: "content",
      label: "Content",
      icon: FileText,
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <span className="text-sm font-medium text-gray-700">Document Viewer</span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <ExternalLink size={16} />
              Open in new tab
            </a>
          </div>
          <div className="bg-gray-100 p-2 sm:p-3">
            <iframe
              src={pdfUrl}
              title={document.title}
              className="h-[75vh] min-h-[500px] w-full rounded-lg border-0 bg-white"
            />
          </div>
        </div>
      ),
    },
    {
      name: "chat",
      label: "Chat",
      icon: MessageSquare,
      content: isReady ? <ChatInterface documentId={id} /> : notReady,
    },
    {
      name: "ai-actions",
      label: "AI Actions",
      icon: Sparkles,
      content: isReady ? <AIActions documentId={id} /> : notReady,
    },
    {
      name: "flashcards",
      label: "Flashcards",
      icon: BookOpen,
      content: isReady ? <FlashcardManager documentId={id} /> : notReady,
    },
    {
      name: "quizzes",
      label: "Quizzes",
      icon: BrainCircuit,
      content: isReady ? <QuizManager documentId={id} /> : notReady,
    },
  ];

  return (
    <div className="px-4 py-8 sm:px-6">
      <Link
        to="/documents"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Documents
      </Link>
      <h1 className="mb-6 text-2xl font-medium tracking-tight text-slate-900">
        {document.title}
      </h1>

      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DocumentDetailPage;
