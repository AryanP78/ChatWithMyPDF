import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import documentService from "../../service/documentService";
import { formatFileSize } from "../../utils/formatFileSize";

const MAX_SIZE = 10 * 1024 * 1024; // matches backend multer limit

const UploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setTitle("");
    setDragging(false);
    onClose();
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && handleClose();
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!isOpen) return null;

  const selectFile = (selected) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (selected.size > MAX_SIZE) {
      toast.error("File is larger than 10 MB");
      return;
    }
    setFile(selected);
    if (!title) setTitle(selected.name.replace(/\.pdf$/i, ""));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", title.trim());

    setUploading(true);
    try {
      const response = await documentService.uploadDocument(formData);
      if (response.data?.status === "failed") {
        toast.error("Uploaded, but we couldn't read text from this PDF");
      } else {
        toast.success("Document uploaded successfully!");
      }
      onUploaded(response.data);
      setFile(null);
      setTitle("");
      onClose();
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="upload-title" className="text-xl font-semibold text-gray-900">
              Upload Document
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a PDF to generate flashcards, quizzes and chat.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {file ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
                <FileText size={20} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={uploading}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-600"
                aria-label="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragging
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
              }`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <UploadCloud size={24} className="text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Click to upload <span className="font-normal text-gray-500">or drag and drop</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF only, up to 10 MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              selectFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <div>
            <label
              htmlFor="doc-title"
              className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-700"
            >
              Title
            </label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React JS Study Guide"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Processing…
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
