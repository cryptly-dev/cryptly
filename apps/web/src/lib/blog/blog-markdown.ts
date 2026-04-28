import DOMPurify from "dompurify";
import { marked } from "marked";

const NAMED_WIDTHS: Record<string, string> = {
  small: "240px",
  medium: "480px",
  large: "720px",
  full: "100%",
};

export function parseImageSpec(alt: string | undefined): {
  alt: string;
  width?: string;
  height?: string;
  isFullWidth: boolean;
  center: boolean;
  flat: boolean;
} {
  const empty = { alt: "", isFullWidth: true, center: false, flat: false };
  if (!alt) return empty;
  const pipe = alt.indexOf("|");
  if (pipe === -1) return { ...empty, alt, isFullWidth: true };
  const cleanAlt = alt.slice(0, pipe).trim();
  const tokens = alt
    .slice(pipe + 1)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return { ...empty, alt: cleanAlt };

  let width: string | undefined;
  let height: string | undefined;
  let isFullWidth = true;
  let center = false;
  let flat = false;
  let unknown = false;

  for (const token of tokens) {
    if (token in NAMED_WIDTHS) {
      width = NAMED_WIDTHS[token]!;
      isFullWidth = token === "full";
      continue;
    }
    const dims = token.match(/^(\d+)(?:x(\d+))?$/);
    if (dims) {
      width = `${dims[1]}px`;
      height = dims[2] ? `${dims[2]}px` : undefined;
      isFullWidth = false;
      continue;
    }
    if (token === "center") {
      center = true;
      continue;
    }
    if (token === "flat" || token === "sharp" || token === "square") {
      flat = true;
      continue;
    }
    unknown = true;
  }

  if (unknown && width === undefined && !center && !flat) {
    return { ...empty, alt, isFullWidth: true };
  }
  return { alt: cleanAlt, width, height, isFullWidth, center, flat };
}

marked.setOptions({ gfm: true, breaks: false });

marked.use({
  renderer: {
    image(token) {
      const href = token.href;
      const text = token.text;
      if (!href) return text;
      const parsed = parseImageSpec(text);
      const style: string[] = [];
      if (parsed.width) style.push(`width:${parsed.width}`);
      if (parsed.height) style.push(`height:${parsed.height}`);
      if (parsed.width && !parsed.isFullWidth) style.push("max-width:100%");
      const classes = [
        "my-8",
        "border",
        "border-neutral-800",
        "shadow-xl",
        parsed.flat ? "rounded-none" : "rounded-xl",
        parsed.isFullWidth ? "w-full" : "",
        parsed.center ? "mx-auto block" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const safeHref = DOMPurify.sanitize(href, {
        ALLOWED_URI_REGEXP:
          /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      });
      return `<img src="${safeHref}" alt="${escapeAttr(parsed.alt)}" class="${classes}"${style.length ? ` style="${style.join(";")}"` : ""} />`;
    },
    link(token) {
      const href = token.href;
      const text = token.text;
      if (!href) return text;
      const safeHref = DOMPurify.sanitize(href, {
        ALLOWED_URI_REGEXP:
          /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      });
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    },
  },
});

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderBlogMarkdown(markdown: string): string {
  const raw = (marked.parse(markdown, { async: false }) as string)
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["class", "style", "target", "rel"],
  });
}
