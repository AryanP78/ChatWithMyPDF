import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, BrainCircuit, User } from "lucide-react";
import toast from "react-hot-toast";
import aiService from "../../service/aiService";
import Spinner from "../../../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const suggestions = [
  "Summarize the key points",
  "Explain the main concept simply",
  "What should I focus on for exams?",
];

const ChatInterface = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await aiService.getChatHistory(documentId);
        setMessages(response.data?.messages || []);
      } catch (error) {
        // 404 just means no conversation yet
        if (error?.statusCode !== 404) {
          toast.error(error?.error || "Failed to load chat history");
        }
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [documentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const question = text.trim();
    if (!question || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);
    try {
      const response = await aiService.chat(documentId, question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.answer },
      ]);
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to get an answer");
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-[65vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {loadingHistory ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <Sparkles size={26} className="text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Ask anything about this document
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Answers are grounded in your PDF.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  message.role === "user"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                }`}
              >
                {message.role === "user" ? <User size={16} /> : <BrainCircuit size={16} />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "rounded-tr-sm bg-gradient-to-r from-emerald-400 to-teal-500 text-sm text-white"
                    : "rounded-tl-sm bg-gray-50"
                }`}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <BrainCircuit size={16} />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-50 px-4 py-3">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 border-t border-gray-100 p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document…"
          disabled={sending}
          className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
