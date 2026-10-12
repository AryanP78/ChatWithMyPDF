import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FileText, BookOpen, BrainCircuit, Clock, Trash2 } from "lucide-react";
import { formatFileSize } from "../../utils/formatFileSize";

const statusStyles = {
  processing: "bg-amber-50 text-amber-600",
  failed: "bg-red-50 text-red-600",
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();
  const { _id, title, fileSize, flashcardsCount = 0, quizCount = 0, status, createdAt } =
    document;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      onClick={() => navigate(`/documents/${_id}`)}
      className="group relative flex min-w-0 cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/60"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-200">
          <FileText size={22} className="text-white" />
        </div>
        <button
          onClick={handleDelete}
          className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
          aria-label={`Delete ${title}`}
          title="Delete document"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h3 className="mt-4 truncate text-base font-semibold text-gray-900" title={title}>
        {title}
      </h3>
      <p className="mt-1 text-xs text-gray-500">{formatFileSize(fileSize)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600">
          <BookOpen size={14} />
          {flashcardsCount} Flashcards
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
          <BrainCircuit size={14} />
          {quizCount} Quizzes
        </span>
        {statusStyles[status] && (
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[status]}`}
          >
            {status}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-1.5 border-t border-gray-100 pt-4 text-xs text-gray-500">
        <Clock size={14} />
        Uploaded {moment(createdAt).fromNow()}
      </div>
    </div>
  );
};

export default DocumentCard;
