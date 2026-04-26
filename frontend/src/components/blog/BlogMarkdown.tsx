import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogMarkdownProps {
  content: string;
  className?: string;
}

const NAMED_WIDTHS: Record<string, string> = {
  small: "240px",
  medium: "480px",
  large: "720px",
  full: "100%",
};

function parseImageSpec(alt: string | undefined): {
  alt: string;
  width?: string;
  height?: string;
  isFullWidth: boolean;
} {
  if (!alt) return { alt: "", isFullWidth: true };
  const pipe = alt.lastIndexOf("|");
  if (pipe === -1) return { alt, isFullWidth: true };
  const spec = alt.slice(pipe + 1).trim().toLowerCase();
  const cleanAlt = alt.slice(0, pipe).trim();
  if (!spec) return { alt: cleanAlt, isFullWidth: true };

  if (spec in NAMED_WIDTHS) {
    const width = NAMED_WIDTHS[spec];
    return { alt: cleanAlt, width, isFullWidth: spec === "full" };
  }

  const dims = spec.match(/^(\d+)(?:x(\d+))?$/);
  if (dims) {
    return {
      alt: cleanAlt,
      width: `${dims[1]}px`,
      height: dims[2] ? `${dims[2]}px` : undefined,
      isFullWidth: false,
    };
  }

  return { alt, isFullWidth: true };
}

export function BlogMarkdown({ content, className }: BlogMarkdownProps) {
  return (
    <div className={`blog-prose ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mt-10 mb-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mt-10 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mt-8 mb-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[17px] leading-8 text-neutral-300 my-5">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-300 transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-5 space-y-2 text-[17px] text-neutral-300 marker:text-neutral-600">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-5 space-y-2 text-[17px] text-neutral-300 marker:text-neutral-500">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-8">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-neutral-700 pl-5 my-6 text-neutral-400 italic">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const text = Array.isArray(children)
              ? children.join("")
              : String(children ?? "");
            const isBlock =
              !!className?.startsWith("language-") || text.includes("\n");
            if (!isBlock) {
              return (
                <code
                  className="rounded-[4px] bg-neutral-800/80 px-1.5 py-0.5 text-[0.9em] text-neutral-100 font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`${className ?? ""} font-mono text-sm text-neutral-200 bg-transparent p-0`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/80 p-4 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0 [&_code]:rounded-none [&_code]:text-neutral-200">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-10 border-neutral-800" />,
          img: ({ src, alt }) => {
            const parsed = parseImageSpec(alt);
            const style: CSSProperties = {};
            if (parsed.width) style.width = parsed.width;
            if (parsed.height) style.height = parsed.height;
            if (parsed.width && !parsed.isFullWidth) style.maxWidth = "100%";
            return (
              <img
                src={src}
                alt={parsed.alt}
                style={style}
                className={`my-8 rounded-xl border border-neutral-800 shadow-xl${
                  parsed.isFullWidth ? " w-full" : ""
                }`}
              />
            );
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-neutral-800 bg-neutral-900/60 px-4 py-2 text-left font-medium text-neutral-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-neutral-900 px-4 py-2 text-neutral-300">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-neutral-200">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
