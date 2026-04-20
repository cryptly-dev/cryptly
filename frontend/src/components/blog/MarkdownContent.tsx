import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

interface MarkdownContentProps {
  markdown: string;
  className?: string;
}

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="mt-8 mb-4 text-3xl font-semibold tracking-tight text-neutral-100 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mt-8 mb-3 text-2xl font-semibold text-neutral-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-6 mb-2 text-xl font-medium text-neutral-100" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 leading-relaxed text-neutral-300" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6 text-neutral-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-4 border-l-2 border-neutral-600 pl-4 italic text-neutral-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: ReactNode }) => {
    if (inline) {
      return (
        <code
          className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-sm text-amber-100/90"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn("block font-mono text-sm text-neutral-200", className)} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-200" {...props}>
      {children}
    </pre>
  ),
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt ?? ""}
      className="my-6 max-h-[480px] max-w-full rounded-lg border border-neutral-800 object-contain"
      loading="lazy"
      {...props}
    />
  ),
  hr: (p) => <hr className="my-8 border-neutral-800" {...p} />,
  table: ({ children, ...props }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse border border-neutral-800 text-sm text-neutral-300" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-left font-medium" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-neutral-800 px-3 py-2" {...props}>
      {children}
    </td>
  ),
};

export function MarkdownContent({ markdown, className }: MarkdownContentProps) {
  return (
    <div className={cn("text-[15px]", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
