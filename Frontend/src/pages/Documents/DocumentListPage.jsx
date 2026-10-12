import React, { useEffect, useState } from "react";
import { Plus, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../../common/Spinner";
import documentService from "../../service/documentService";
import DocumentCard from "../../components/documents/DocumentCard";
import UploadModal from "../../components/documents/UploadModal";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data || []);
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (document) => {
    if (
      !window.confirm(
        `Delete "${document.title}"? Its flashcards and quizzes will be deleted too.`,
      )
    ) {
      return;
    }
    try {
      await documentService.deleteDocument(document._id);
      setDocuments((docs) => docs.filter((d) => d._id !== document._id));
      toast.success("Document deleted");
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to delete document");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <FileText size={30} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No documents yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Upload your first PDF to start generating flashcards, quizzes and
            summaries.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Upload Document
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-medium tracking-tight text-slate-900">
            My Documents
          </h1>
          <p className="text-sm text-slate-500">
            Manage and organize your learning materials
          </p>
        </div>
        {documents.length > 0 && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Upload Document
          </button>
        )}
      </div>

      {renderContent()}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={fetchDocuments}
      />
    </div>
  );
};

export default DocumentListPage;
