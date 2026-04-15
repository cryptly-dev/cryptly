import Editor, { loader } from "@monaco-editor/react";
import { useCallback, useEffect, useRef } from "react";

interface BaseFileEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  fontSize?: number;
  padding?: { top: number; bottom: number };
  lineNumbersMinChars?: number;
  readOnly?: boolean;
}

// ── Value range parser ────────────────────────────────────

interface ValueRange {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

function getValueRanges(model: any): ValueRange[] {
  const lineCount = model.getLineCount();
  const ranges: ValueRange[] = [];

  let inQuote: string | null = null;
  let current: { startLine: number; startCol: number } | null = null;

  for (let line = 1; line <= lineCount; line++) {
    const text = model.getLineContent(line);

    // Continuing a multiline quoted string
    if (inQuote) {
      for (let i = 0; i < text.length; i++) {
        if (inQuote === '"' && text[i] === "\\") {
          i++;
          continue;
        }
        if (text[i] === inQuote) {
          ranges.push({
            ...current!,
            endLine: line,
            endCol: i + 2,
          });
          inQuote = null;
          current = null;
          break;
        }
      }
      // Still inside multiline string — range continues
      continue;
    }

    const trimmed = text.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const eqIdx = text.indexOf("=");
    if (eqIdx === -1) continue;

    const afterEq = text.substring(eqIdx + 1);
    if (afterEq.length === 0) continue;

    const valueStartCol = eqIdx + 2; // 1-based column
    const firstChar = afterEq[0];

    if (firstChar === '"' || firstChar === "'") {
      let closed = false;
      for (let i = 1; i < afterEq.length; i++) {
        if (firstChar === '"' && afterEq[i] === "\\") {
          i++;
          continue;
        }
        if (afterEq[i] === firstChar) {
          ranges.push({
            startLine: line,
            startCol: valueStartCol,
            endLine: line,
            endCol: eqIdx + 1 + i + 2,
          });
          closed = true;
          break;
        }
      }
      if (!closed) {
        inQuote = firstChar;
        current = { startLine: line, startCol: valueStartCol };
      }
    } else {
      ranges.push({
        startLine: line,
        startCol: valueStartCol,
        endLine: line,
        endCol: text.length + 1,
      });
    }
  }

  // Unclosed string at EOF
  if (inQuote && current) {
    const lastLine = lineCount;
    ranges.push({
      ...current,
      endLine: lastLine,
      endCol: model.getLineContent(lastLine).length + 1,
    });
  }

  return ranges;
}

function rangeIsRevealed(r: ValueRange, revealed: Set<number>): boolean {
  for (let l = r.startLine; l <= r.endLine; l++) {
    if (revealed.has(l)) return true;
  }
  return false;
}

/** Monaco replaces inline decoration nodes on update, so `transition` rarely runs; use one-shot keyframes on class change. */
function secretInlineClass(
  r: ValueRange,
  revealed: Set<number>,
  revealedBefore: Set<number>
): string {
  const on = rangeIsRevealed(r, revealed);
  const wasOn = rangeIsRevealed(r, revealedBefore);
  if (on === wasOn) return on ? "secret-revealed" : "secret-blurred";
  return on ? "secret-reveal-anim" : "secret-hide-anim";
}

// ── CSS injection ─────────────────────────────────────────

let cssInjected = false;
function injectBlurCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes cryptly-secret-reveal {
      from { filter: blur(5px); }
      to { filter: blur(0); }
    }
    @keyframes cryptly-secret-hide {
      from { filter: blur(0); }
      to { filter: blur(5px); }
    }
    .secret-blurred {
      filter: blur(5px);
    }
    .secret-revealed {
      filter: blur(0);
    }
    .secret-reveal-anim {
      animation: cryptly-secret-reveal 0.22s ease-out forwards;
    }
    .secret-hide-anim {
      animation: cryptly-secret-hide 0.2s ease-out forwards;
    }
    @media (prefers-reduced-motion: reduce) {
      .secret-reveal-anim,
      .secret-hide-anim {
        animation: none;
      }
      .secret-reveal-anim { filter: blur(0); }
      .secret-hide-anim { filter: blur(5px); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────

export function BaseFileEditor({
  value,
  onChange,
  height = "55vh",
  fontSize = 14,
  padding = { top: 16, bottom: 8 },
  lineNumbersMinChars,
  readOnly = false,
}: BaseFileEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any>(null);
  const revealedLinesRef = useRef<Set<number>>(new Set());
  /** Revealed lines last applied to decorations — used to pick reveal/hide keyframe classes vs static. */
  const lastAppliedRevealedRef = useRef<Set<number>>(new Set());
  /** Phones / touch-primary UAs report `hover: none`; skip pointer-hover reveal (use caret/tap only). */
  const hoverRevealEnabledRef = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    const sync = () => {
      hoverRevealEnabledRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: "dotenv" });

      monaco.languages.setMonarchTokensProvider("dotenv", {
        tokenizer: {
          root: [
            [/#.*$/, "comment"],
            [/^[a-zA-Z_][a-zA-Z0-9_.]*(?=\s*=)/, "variable"],
            [/=/, "delimiter", "@value"],
            [/./, ""],
          ],
          value: [
            [/#.*$/, "comment", "@pop"],
            [/"/, "string", "@doubleQuoteString"],
            [/'/, "string", "@singleQuoteString"],
            [/.*$/, "string", "@pop"],
          ],
          doubleQuoteString: [
            [/\\./, "string.escape"],
            [/"/, "string", "@pop"],
            [/./, "string"],
          ],
          singleQuoteString: [
            [/\\./, "string.escape"],
            [/'/, "string", "@pop"],
            [/./, "string"],
          ],
        },
      });

      monaco.editor.defineTheme("dotenvTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "variable", foreground: "D4AF37" },
          { token: "delimiter", foreground: "666666" },
          { token: "string", foreground: "A3A3A3" },
          { token: "string.escape", foreground: "D4AF37" },
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        ],
        colors: {
          "editor.background": "#000000",
          "editor.lineHighlightBackground": "#0a0a0a",
          focusBorder: "#00000000",
        },
      });
    });
  }, []);

  const applyBlurDecorations = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const monacoInstance = monacoRef.current;
    if (!monacoInstance) return;

    const ranges = getValueRanges(model);
    const revealed = revealedLinesRef.current;
    const revealedBefore = lastAppliedRevealedRef.current;

    const decorations = ranges.map((r) => ({
      range: new monacoInstance.Range(
        r.startLine,
        r.startCol,
        r.endLine,
        r.endCol
      ),
      options: {
        inlineClassName: secretInlineClass(r, revealed, revealedBefore),
      },
    }));

    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection(decorations);
    } else {
      decorationsRef.current.set(decorations);
    }

    lastAppliedRevealedRef.current = new Set(revealed);
  }, []);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      injectBlurCSS();

      // Initial decorations
      applyBlurDecorations();

      // Update on content change (snap blur state — no reveal/hide animation while typing)
      editor.onDidChangeModelContent(() => {
        lastAppliedRevealedRef.current = new Set(revealedLinesRef.current);
        applyBlurDecorations();
      });

      // Mouse hover — reveal hovered line and one line above/below (PC / fine-pointer hover only)
      editor.onMouseMove((e: any) => {
        if (!hoverRevealEnabledRef.current) return;

        const line = e.target?.position?.lineNumber;
        const model = editor.getModel();
        const lineCount = model?.getLineCount() ?? 0;
        const prev = revealedLinesRef.current;
        const next = new Set<number>();

        if (line && lineCount > 0) {
          next.add(line);
          if (line > 1) next.add(line - 1);
          if (line < lineCount) next.add(line + 1);
        }

        // Only re-render if set changed
        if (
          prev.size !== next.size ||
          [...prev].some((l) => !next.has(l))
        ) {
          revealedLinesRef.current = next;
          applyBlurDecorations();
        }
      });

      // Cursor position — reveal cursor line and neighbors (keyboard navigation)
      editor.onDidChangeCursorPosition((e: any) => {
        const line = e.position.lineNumber;
        const model = editor.getModel();
        const lineCount = model?.getLineCount() ?? 0;
        const next = new Set<number>();
        if (lineCount > 0) {
          next.add(line);
          if (line > 1) next.add(line - 1);
          if (line < lineCount) next.add(line + 1);
        }
        revealedLinesRef.current = next;
        applyBlurDecorations();
      });

      // Re-blur everything when mouse leaves the editor
      const domNode = editor.getDomNode();
      if (domNode) {
        domNode.addEventListener("mouseleave", () => {
          if (!hoverRevealEnabledRef.current) return;

          // Keep cursor line (+ neighbors) revealed if editor is focused
          const cursorLine = editor.getPosition()?.lineNumber;
          const model = editor.getModel();
          const lineCount = model?.getLineCount() ?? 0;
          if (editor.hasTextFocus() && cursorLine && lineCount > 0) {
            const next = new Set<number>();
            next.add(cursorLine);
            if (cursorLine > 1) next.add(cursorLine - 1);
            if (cursorLine < lineCount) next.add(cursorLine + 1);
            revealedLinesRef.current = next;
          } else {
            revealedLinesRef.current = new Set();
          }
          applyBlurDecorations();
        });
      }
  }, [applyBlurDecorations]);

  const editorOptions = {
    minimap: { enabled: false },
    wordWrap: "on" as const,
    scrollBeyondLastLine: true,
    lineNumbers: "on" as const,
    fontSize,
    automaticLayout: true,
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    occurrencesHighlight: "off" as const,
    selectionHighlight: false,
    renderLineHighlight: "none" as const,
    padding,
    readOnly,
    readOnlyMessage: { value: "Read-only access" },
    ...(lineNumbersMinChars && { lineNumbersMinChars }),
  };

  return (
    <Editor
      className="ph-no-capture"
      height={height}
      language="dotenv"
      theme="dotenvTheme"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={editorOptions}
      loading={null}
      onMount={handleEditorMount}
    />
  );
}
