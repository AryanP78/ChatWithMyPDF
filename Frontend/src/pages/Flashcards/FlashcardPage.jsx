import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import Spinner from "../../../common/Spinner";
import documentService from "../../service/documentService";
import FlashcardManager from "../../components/flashcards/FlashcardManager";

const FlashcardPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data?.document);
      } catch (error) {
        toast.error(error?.error || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  if (loading) return <Spinner />;

  return (
    <div className="px-4 py-8 sm:px-6">
      <Link
        to={document ? `/documents/${id}` : "/flashcards"}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        {document ? "Back to Document" : "Back to Flashcards"}
      </Link>

      {document ? (
        <>
          <h1 className="mb-2 text-2xl font-medium tracking-tight text-slate-900">
            {document.title}
          </h1>
          <p className="mb-6 text-sm text-slate-500">Flashcards</p>
          <FlashcardManager documentId={id} />
        </>
      ) : (
        <h2 className="text-lg font-semibold text-gray-900">Document not found</h2>
      )}
    </div>
  );
};

export default FlashcardPage;
