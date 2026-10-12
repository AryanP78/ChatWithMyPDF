import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Tailwind styles for markdown returned by Gemini
const components = {
  h1: (props) => <h1 className="mb-3 mt-5 text-xl font-semibold text-gray-900 first:mt-0" {...props} />,
  h2: (props) => <h2 className="mb-2 mt-4 text-lg font-semibold text-gray-900 first:mt-0" {...props} />,
  h3: (props) => <h3 className="mb-2 mt-3 text-base font-semibold text-gray-900 first:mt-0" {...props} />,
  p: (props) => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
  ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />,
  ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />,
  strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
  a: (props) => <a className="text-emerald-600 underline" target="_blank" rel="noreferrer" {...props} />,
  blockquote: (props) => (
    <blockquote className="mb-3 border-l-4 border-emerald-200 pl-4 italic text-gray-600" {...props} />
  ),
  hr: () => <hr className="my-4 border-gray-200" />,
  table: (props) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold" {...props} />,
  td: (props) => <td className="border border-gray-200 px-3 py-2" {...props} />,
  pre: (props) => (
    <pre className="mb-3 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-gray-100" {...props} />
  ),
  code: ({ className, children, ...props }) =>
    className ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.9em] text-emerald-700" {...props}>
        {children}
      </code>
    ),
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="text-sm text-gray-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
