import Editor, { loader } from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";

const TOOLTIP_DEFAULT_TEXT = "Click to copy";
const BULLET = "\u2022";

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

interface MonacoSelectionLike {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
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

    const key = text.substring(0, eqIdx).trim();
    // Only treat conventional env-style UPPERCASE keys as having secret values.
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue;

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

/**
 * String-based clone of `getValueRanges` that does NOT need a Monaco model.
 * Required so we can pre-mask the initial `value` synchronously, before
 * Monaco mounts, ensuring plaintext never appears in the DOM.
 *
 * MUST stay in lockstep with `getValueRanges`. There is a dev-mode runtime
 * assertion (see `assertParserParity`) that compares the two.
 */
function parseValueRangesFromString(text: string): ValueRange[] {
  const lines = text.split("\n");
  const ranges: ValueRange[] = [];

  let inQuote: string | null = null;
  let current: { startLine: number; startCol: number } | null = null;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lineIdx + 1;
    const lineText = lines[lineIdx];

    if (inQuote) {
      for (let i = 0; i < lineText.length; i++) {
        if (inQuote === '"' && lineText[i] === "\\") {
          i++;
          continue;
        }
        if (lineText[i] === inQuote) {
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
      continue;
    }

    const trimmed = lineText.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const eqIdx = lineText.indexOf("=");
    if (eqIdx === -1) continue;

    const key = lineText.substring(0, eqIdx).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue;

    const afterEq = lineText.substring(eqIdx + 1);
    if (afterEq.length === 0) continue;

    const valueStartCol = eqIdx + 2;
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
        endCol: lineText.length + 1,
      });
    }
  }

  if (inQuote && current) {
    const lastLine = lines.length;
    ranges.push({
      ...current,
      endLine: lastLine,
      endCol: lines[lastLine - 1].length + 1,
    });
  }

  return ranges;
}

/**
 * Convert (line, col) 1-based positions into a flat string offset against
 * a `\n`-joined text buffer. Mirrors how Monaco offsets work for the model
 * we use (we ignore CRLF — Monaco normalizes on paste).
 */
function lineColToOffset(
  lineLengths: number[],
  line: number,
  col: number
): number {
  let offset = 0;
  for (let i = 0; i < line - 1; i++) {
    offset += lineLengths[i] + 1;
  }
  return offset + (col - 1);
}

function bulletsForSubstring(s: string): string {
  return s.replace(/[^\n]/g, BULLET);
}

interface MaskEntry {
  range: ValueRange;
  original: string;
}

interface MaskResult {
  masked: string;
  entries: MaskEntry[];
}

/**
 * Parse `text`, then replace each value range with same-width bullet
 * placeholders (preserving newlines inside multiline quoted values).
 * Returns the masked string AND the per-range originals so callers can
 * stash them keyed by decoration id after the editor mounts.
 */
function maskText(text: string): MaskResult {
  const ranges = parseValueRangesFromString(text);
  if (ranges.length === 0) {
    return { masked: text, entries: [] };
  }

  const lines = text.split("\n");
  const lineLengths = lines.map((l) => l.length);

  const sorted = [...ranges].sort((a, b) => {
    if (a.startLine !== b.startLine) return a.startLine - b.startLine;
    return a.startCol - b.startCol;
  });

  const out: string[] = [];
  const entries: MaskEntry[] = [];
  let cursor = 0;

  for (const r of sorted) {
    const start = lineColToOffset(lineLengths, r.startLine, r.startCol);
    const end = lineColToOffset(lineLengths, r.endLine, r.endCol);
    if (start < cursor) continue; // shouldn't happen with valid ranges
    out.push(text.slice(cursor, start));
    const original = text.slice(start, end);
    out.push(bulletsForSubstring(original));
    entries.push({ range: r, original });
    cursor = end;
  }
  out.push(text.slice(cursor));

  return { masked: out.join(""), entries };
}

/**
 * Walk the tracking decorations sorted by start offset, splice in real values
 * for collapsed ranges, leave model text in place for ranges whose decoration
 * id is in `expandedIds` (the user is currently looking at / editing the real
 * value). O(L + R).
 */
function assembleRealText(
  model: any,
  decorationToReal: Map<string, string>,
  expandedIds: Set<string>,
  monaco: any
): string {
  if (!model || decorationToReal.size === 0) {
    return model?.getValue() ?? "";
  }

  const fullText = model.getValue();
  const lines = fullText.split("\n");
  const lineLengths = lines.map((l: string) => l.length);

  type Entry = { id: string; start: number; end: number };
  const entries: Entry[] = [];

  for (const id of decorationToReal.keys()) {
    if (expandedIds.has(id)) continue;
    const range = model.getDecorationRange(id);
    if (!range) continue;
    if (
      range.startLineNumber === range.endLineNumber &&
      range.startColumn === range.endColumn
    ) {
      continue;
    }
    const start = lineColToOffset(
      lineLengths,
      range.startLineNumber,
      range.startColumn
    );
    const end = lineColToOffset(
      lineLengths,
      range.endLineNumber,
      range.endColumn
    );
    entries.push({ id, start, end });
  }

  entries.sort((a, b) => a.start - b.start);

  const out: string[] = [];
  let cursor = 0;
  for (const e of entries) {
    // Overlap or zero-advance guard: any decoration whose start is at or
    // before the current cursor would either duplicate or rewind output.
    if (e.start < cursor) continue;
    out.push(fullText.slice(cursor, e.start));
    out.push(decorationToReal.get(e.id) ?? fullText.slice(e.start, e.end));
    cursor = e.end;
  }
  out.push(fullText.slice(cursor));

  return out.join("");
  // `monaco` arg kept for forward-compat / possible Range allocations.
  void monaco;
}

/**
 * Given an assembled real-text buffer and a Monaco selection (which is in
 * model coordinates), return the slice of the real buffer that corresponds
 * to that selection. Used by the clipboard intercept.
 *
 * IMPORTANT: this assumes lengths-of-lines in the assembled text equal the
 * model line lengths for collapsed ranges (true: bullets are same width)
 * AND for expanded ranges (true: model already holds the real text). So
 * model line/col coordinates map 1:1 to real-text offsets.
 */
function sliceRealByMonacoRange(
  realText: string,
  sel: MonacoSelectionLike
): string {
  const lines = realText.split("\n");
  const lineLengths = lines.map((l) => l.length);
  const start = lineColToOffset(lineLengths, sel.startLineNumber, sel.startColumn);
  const end = lineColToOffset(lineLengths, sel.endLineNumber, sel.endColumn);
  return realText.slice(start, end);
}

/**
 * Dev-only sanity check: confirm `parseValueRangesFromString` agrees with
 * `getValueRanges` for the given model. Catches drift between the two
 * implementations early. No-op in production.
 */
function assertParserParity(model: any): void {
  if (!import.meta.env?.DEV) return;
  try {
    const fromModel = getValueRanges(model);
    const fromString = parseValueRangesFromString(model.getValue());
    if (fromModel.length !== fromString.length) {
      console.warn(
        "[BaseFileEditor] parser parity mismatch: lengths differ",
        { fromModel, fromString }
      );
      return;
    }
    for (let i = 0; i < fromModel.length; i++) {
      if (!rangesEqual(fromModel[i], fromString[i])) {
        console.warn("[BaseFileEditor] parser parity mismatch at index", i, {
          fromModel: fromModel[i],
          fromString: fromString[i],
        });
        return;
      }
    }
  } catch (err) {
    console.warn("[BaseFileEditor] parser parity check failed", err);
  }
}

function posInRange(
  pos: { lineNumber: number; column: number },
  r: ValueRange
): boolean {
  if (pos.lineNumber < r.startLine || pos.lineNumber > r.endLine) return false;
  if (pos.lineNumber === r.startLine && pos.column < r.startCol) return false;
  if (pos.lineNumber === r.endLine && pos.column >= r.endCol) return false;
  return true;
}

function selectionTouchesRange(
  sel: MonacoSelectionLike,
  r: ValueRange
): boolean {
  // Compare selection start <= range end AND selection end >= range start.
  const selStartBeforeOrAtRangeEnd =
    sel.startLineNumber < r.endLine ||
    (sel.startLineNumber === r.endLine && sel.startColumn <= r.endCol);
  const selEndAfterOrAtRangeStart =
    sel.endLineNumber > r.startLine ||
    (sel.endLineNumber === r.startLine && sel.endColumn >= r.startCol);
  return selStartBeforeOrAtRangeEnd && selEndAfterOrAtRangeStart;
}

function rangesEqual(a: ValueRange, b: ValueRange): boolean {
  return (
    a.startLine === b.startLine &&
    a.startCol === b.startCol &&
    a.endLine === b.endLine &&
    a.endCol === b.endCol
  );
}

interface ValueGroup {
  startLine: number;
  endLine: number;
  ranges: ValueRange[];
}

/** Group = max run of non-blank lines containing ≥1 KEY=VALUE pair, bounded by blank lines or file edges. */
function getValueGroups(model: any, ranges: ValueRange[]): ValueGroup[] {
  const lineCount = model.getLineCount();
  const linesWithValues = new Set<number>();
  for (const r of ranges) {
    for (let l = r.startLine; l <= r.endLine; l++) linesWithValues.add(l);
  }

  const groups: ValueGroup[] = [];
  let blockStart: number | null = null;
  let blockEnd = 0;
  let blockHasValue = false;

  const flush = () => {
    if (blockStart !== null && blockHasValue) {
      const start = blockStart;
      const end = blockEnd;
      groups.push({
        startLine: start,
        endLine: end,
        ranges: ranges.filter((r) => r.startLine >= start && r.endLine <= end),
      });
    }
    blockStart = null;
    blockHasValue = false;
  };

  for (let line = 1; line <= lineCount; line++) {
    const text = model.getLineContent(line);
    if (text.trim() === "") {
      flush();
      continue;
    }
    if (blockStart === null) blockStart = line;
    blockEnd = line;
    if (linesWithValues.has(line)) blockHasValue = true;
  }
  flush();

  return groups;
}

function stripQuotes(text: string): string {
  if (text.length < 2) return text;
  const first = text[0];
  const last = text[text.length - 1];
  if ((first === '"' || first === "'") && first === last) {
    return text.slice(1, -1);
  }
  return text;
}

// ── CSS injection ─────────────────────────────────────────

let cssInjected = false;
function injectMaskingCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    .secret-masked {
      color: transparent !important;
      background-image: radial-gradient(circle, #6e7681 1.5px, transparent 1.5px);
      background-size: 8.4px 100%;
      background-repeat: repeat-x;
      background-position: 2px center;
      border-radius: 3px;
      cursor: pointer;
    }
    .secret-masked::selection {
      background: rgba(100, 148, 237, 0.3);
    }
    .secret-group-zone-hover .view-line,
    .secret-group-zone-hover .view-lines,
    .secret-group-zone-hover .view-overlays,
    .secret-group-zone-hover .lines-content,
    .secret-group-zone-hover textarea {
      cursor: pointer !important;
    }
    .secret-copied {
      animation: secret-copied-flash 1.5s ease-out forwards;
    }
    @keyframes secret-copied-flash {
      0%, 20% {
        background-color: rgba(34, 197, 94, 0.15);
      }
      100% {
        background-color: transparent;
      }
    }
    .secret-tooltip {
      position: absolute;
      top: 0;
      left: 0;
      padding: 4px 8px;
      background: #1c2128;
      color: #adbac7;
      font-size: 12px;
      border-radius: 6px;
      border: 1px solid #373e47;
      pointer-events: none;
      white-space: nowrap;
      z-index: 100;
      will-change: transform;
    }
    .secret-tooltip.copied {
      background: #14271c;
      border-color: rgba(34, 197, 94, 0.55);
      color: #b6f0c2;
    }
    .secret-group-zone {
      display: flex;
      align-items: flex-end;
      height: 100%;
      padding: 0 0 2px 0;
      box-sizing: border-box;
      pointer-events: none;
    }
    .secret-group-pill {
      display: inline-block;
      color: #6e7681;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 10.5px;
      line-height: 1.2;
      text-decoration: underline;
      text-underline-offset: 2px;
      text-decoration-color: #4d5562;
      cursor: pointer;
      pointer-events: auto;
      user-select: none;
      transition: color 120ms ease, text-decoration-color 120ms ease;
    }
    .secret-group-pill:hover,
    .secret-group-pill.hover {
      color: #adbac7;
      text-decoration-color: #adbac7;
    }
    .secret-group-pill.copied {
      color: #b6f0c2;
      text-decoration-color: #b6f0c2;
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
  padding = { top: 16, bottom: 80 },
  lineNumbersMinChars,
  readOnly = false,
}: BaseFileEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any>(null);
  const flashDecorationsRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hoveredDecIdRef = useRef<string | null>(null);
  const groupZoneIdsRef = useRef<string[]>([]);
  const groupZoneMapRef = useRef<
    Map<string, { group: ValueGroup; pill: HTMLElement }>
  >(new Map());

  // Decoration IDs of secrets currently revealed by hover / by selection.
  // Plain `Set`s — no React state — because decoration IDs are opaque
  // refs that don't drive renders.
  const hoverRevealedDecIdRef = useRef<string | null>(null);
  const caretRevealedDecIdsRef = useRef<Set<string>>(new Set());

  // Tracking-decoration plumbing (G2). Decoration IDs are the stable handle;
  // the map holds the real plaintext keyed by decoration id.
  const trackingDecorationIdsRef = useRef<Set<string>>(new Set());
  const decorationToRealRef = useRef<Map<string, string>>(new Map());

  // Re-entrancy counter (G5). We treat depth > 0 as "this content change is
  // ours, not the user's", so onDidChangeContent can skip ingest + onChange.
  const internalEditDepthRef = useRef(0);

  // Tracks the last `value` the parent passed in. Used to distinguish between
  // a parent re-emitting our value (G7: ignore) vs. a fresh external change.
  const lastParentValueRef = useRef<string>(value);

  // Pre-mount mask result, drained inside handleEditorMount.
  const pendingInitialMaskRef = useRef<MaskResult | null>(null);

  // Always-fresh handle on the parent's onChange. The mount-time event
  // listeners capture this ref so they don't go stale across re-renders.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Tracks the last `out` we emitted to the parent. The external-value
  // useEffect bails when the incoming `value` equals this — prevents the
  // echo loop where parent synchronously feeds our emission back as the
  // next `value` prop on every keystroke.
  const lastEmittedValueRef = useRef<string>(value);

  // Pre-mount masking (G1): synchronously mask `value` BEFORE Monaco mounts,
  // so plaintext never enters the DOM, not even for one frame. Only honored
  // for the very first render — subsequent `value` prop changes go through
  // the dedicated useEffect below.
  const [maskedInitialValue] = useState(() => {
    const result = maskText(value);
    pendingInitialMaskRef.current = result;
    lastParentValueRef.current = value;
    return result.masked;
  });

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
            [/[^#]+/, "identifier", "@pop"],
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
          { token: "variable", foreground: "C9B287" },
          { token: "delimiter", foreground: "CCCCCC" },
          { token: "identifier", foreground: "CCCCCC" },
          { token: "string", foreground: "CCCCCC" },
          { token: "string.escape", foreground: "D7BA7D" },
          { token: "comment", foreground: "545C66", fontStyle: "italic" },
        ],
        colors: {
          "editor.foreground": "#CCCCCC",
          "editor.background": "#000000",
          "editor.lineHighlightBackground": "#0a0a0a",
          focusBorder: "#00000000",
        },
      });
    });
  }, []);

  const tooltipResetTimerRef = useRef<number | null>(null);

  // Set of decoration IDs that are currently "expanded" — i.e. the model
  // contains the real plaintext for that range, not bullets. Combination of
  // hover + caret reveals.
  const getExpandedIds = useCallback((): Set<string> => {
    const ids = new Set<string>(caretRevealedDecIdsRef.current);
    if (hoverRevealedDecIdRef.current) ids.add(hoverRevealedDecIdRef.current);
    return ids;
  }, []);

  // Repaint the visual `secret-masked` overlay (the dotted CSS texture) on
  // top of the bullets. Bullets are already in the model, so this is purely
  // cosmetic now — we keep it for visual continuity (G3 note).
  const refreshMaskDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monacoInstance || !model) return;

    const expanded = getExpandedIds();
    const decorations: Array<{ range: any; options: any }> = [];

    for (const decId of trackingDecorationIdsRef.current) {
      if (expanded.has(decId)) continue;
      const range = model.getDecorationRange(decId);
      if (!range) continue;
      if (
        range.startLineNumber === range.endLineNumber &&
        range.startColumn === range.endColumn
      ) {
        continue;
      }
      decorations.push({
        range,
        options: { inlineClassName: "secret-masked" },
      });
    }

    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection(decorations);
    } else {
      decorationsRef.current.set(decorations);
    }
  }, [getExpandedIds]);

  // Internal edit guard. Increments the depth counter, runs `fn`, then
  // decrements. Anything that mutates the model on our behalf (mask swap,
  // unmask swap, external value reset, cut handler) must go through this.
  const withInternalEdit = useCallback(<T,>(fn: () => T): T => {
    internalEditDepthRef.current++;
    try {
      return fn();
    } finally {
      internalEditDepthRef.current--;
    }
  }, []);

  // Replace the model text inside `decId`'s current range with the real
  // plaintext. Decoration is "sticky" — its range tracks the new text length
  // automatically. Same-width by construction, so range stays correct.
  const expandDecorationInModel = useCallback(
    (decId: string) => {
      const editor = editorRef.current;
      const monacoInstance = monacoRef.current;
      const model = editor?.getModel();
      if (!editor || !monacoInstance || !model) return;
      const real = decorationToRealRef.current.get(decId);
      if (real == null) return;
      const range = model.getDecorationRange(decId);
      if (!range) return;
      const current = model.getValueInRange(range);
      if (current === real) return;
      // Skip if lengths differ — that means the decoration's range no
      // longer matches the stored value (user edited boundary text), so
      // we'd corrupt the model. Caller can re-ingest later.
      if (current.length !== real.length) return;
      withInternalEdit(() => {
        editor.executeEdits("mask-expand", [
          {
            range,
            text: real,
          },
        ]);
      });
    },
    [withInternalEdit]
  );

  // Capture whatever the user typed inside the decoration while it was
  // expanded, then collapse back to bullets.
  const collapseDecorationInModel = useCallback(
    (decId: string) => {
      const editor = editorRef.current;
      const monacoInstance = monacoRef.current;
      const model = editor?.getModel();
      if (!editor || !monacoInstance || !model) return;
      const range = model.getDecorationRange(decId);
      if (!range) return;
      const current = model.getValueInRange(range);
      if (current.length === 0) return;
      // Persist potentially-edited real value back into the map.
      decorationToRealRef.current.set(decId, current);
      const bullets = bulletsForSubstring(current);
      if (current === bullets) return;
      withInternalEdit(() => {
        editor.executeEdits("mask-collapse", [
          {
            range,
            text: bullets,
          },
        ]);
      });
    },
    [withInternalEdit]
  );

  const hideTooltip = useCallback(() => {
    if (tooltipResetTimerRef.current !== null) {
      window.clearTimeout(tooltipResetTimerRef.current);
      tooltipResetTimerRef.current = null;
    }
    const tip = tooltipRef.current;
    if (tip && tip.style.display !== "none") {
      tip.style.display = "none";
    }
    hoveredDecIdRef.current = null;
    const revealedId = hoverRevealedDecIdRef.current;
    if (revealedId) {
      hoverRevealedDecIdRef.current = null;
      // Don't collapse if the caret is also keeping it revealed.
      if (!caretRevealedDecIdsRef.current.has(revealedId)) {
        collapseDecorationInModel(revealedId);
      }
      refreshMaskDecorations();
    }
  }, [collapseDecorationInModel, refreshMaskDecorations]);

  const showTooltipAtDecoration = useCallback((decId: string) => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!editor || !model) return;

    const range = model.getDecorationRange(decId);
    if (!range) return;

    const domNode = editor.getDomNode();
    if (!domNode) return;

    const visiblePos = editor.getScrolledVisiblePosition({
      lineNumber: range.startLineNumber,
      column: range.startColumn,
    });
    if (!visiblePos) return;

    let tip = tooltipRef.current;
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "secret-tooltip";
      tip.textContent = TOOLTIP_DEFAULT_TEXT;
      domNode.appendChild(tip);
      tooltipRef.current = tip;
    } else {
      if (tooltipResetTimerRef.current !== null) {
        window.clearTimeout(tooltipResetTimerRef.current);
        tooltipResetTimerRef.current = null;
      }
      if (tip.classList.contains("copied")) {
        tip.classList.remove("copied");
      }
      if (tip.textContent !== TOOLTIP_DEFAULT_TEXT) {
        tip.textContent = TOOLTIP_DEFAULT_TEXT;
      }
    }

    if (tip.style.display === "none") tip.style.display = "";
    tip.style.transform = `translate3d(${visiblePos.left}px, ${visiblePos.top}px, 0) translateY(-100%) translateY(-6px)`;
  }, []);

  const flashTooltipCopied = useCallback(() => {
    const tip = tooltipRef.current;
    if (!tip) return;
    if (tooltipResetTimerRef.current !== null) {
      window.clearTimeout(tooltipResetTimerRef.current);
    }
    tip.classList.add("copied");
    tip.textContent = "Copied!";
    tooltipResetTimerRef.current = window.setTimeout(() => {
      tooltipResetTimerRef.current = null;
      const t = tooltipRef.current;
      if (t) {
        t.classList.remove("copied");
        t.textContent = TOOLTIP_DEFAULT_TEXT;
      }
    }, 1200);
  }, []);

  // Flash a green-fade highlight over the given decoration IDs (or raw
  // monaco ranges, used for group-zone copies which span beyond a single
  // secret value).
  const flashCopied = useCallback(
    (rangesToFlash: Array<{ range: any }>) => {
      const editor = editorRef.current;
      const monacoInstance = monacoRef.current;
      if (!editor || !monacoInstance || rangesToFlash.length === 0) return;

      const decorations = rangesToFlash.map((entry) => ({
        range: entry.range,
        options: {
          inlineClassName: "secret-masked secret-copied",
        },
      }));

      if (!flashDecorationsRef.current) {
        flashDecorationsRef.current =
          editor.createDecorationsCollection(decorations);
      } else {
        flashDecorationsRef.current.set(decorations);
      }

      window.setTimeout(() => {
        if (flashDecorationsRef.current) {
          flashDecorationsRef.current.clear();
        }
      }, 1500);
    },
    []
  );

  const flashCopiedDecorations = useCallback(
    (decIds: string[]) => {
      const editor = editorRef.current;
      const model = editor?.getModel();
      if (!model) return;
      const items: Array<{ range: any }> = [];
      for (const id of decIds) {
        const r = model.getDecorationRange(id);
        if (r) items.push({ range: r });
      }
      flashCopied(items);
    },
    [flashCopied]
  );

  const copyGroup = useCallback(
    (group: ValueGroup, pill: HTMLElement) => {
      const editor = editorRef.current;
      const monacoInstance = monacoRef.current;
      if (!editor || !monacoInstance) return;
      const model = editor.getModel();
      if (!model) return;

      // Build the real text for the entire group via assembleRealText, then
      // slice out the lines belonging to this group. This way clipboard
      // contents never depend on whether the group is currently revealed.
      const realFile = assembleRealText(
        model,
        decorationToRealRef.current,
        getExpandedIds(),
        monacoInstance
      );
      const realLines = realFile.split("\n");
      // group.startLine / endLine are 1-based; arrays are 0-based.
      const text = realLines
        .slice(group.startLine - 1, group.endLine)
        .join("\n");

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }

      const original = pill.textContent;
      pill.classList.add("copied");
      pill.textContent = "Copied!";
      window.setTimeout(() => {
        if (pill.isConnected) {
          pill.classList.remove("copied");
          pill.textContent = original;
        }
      }, 1200);

      // Flash the whole group block — use a single multi-line monaco range.
      flashCopied([
        {
          range: new monacoInstance.Range(
            group.startLine,
            1,
            group.endLine,
            model.getLineMaxColumn(group.endLine)
          ),
        },
      ]);
    },
    [flashCopied, getExpandedIds]
  );

  const applyGroupZones = useCallback((groups: ValueGroup[]) => {
    const editor = editorRef.current;
    if (!editor) return;

    const groupsToShow = groups.filter((g) => g.ranges.length >= 2);

    editor.changeViewZones((accessor: any) => {
      for (const id of groupZoneIdsRef.current) {
        accessor.removeZone(id);
      }
      groupZoneIdsRef.current = [];
      groupZoneMapRef.current.clear();

      for (const group of groupsToShow) {
        const zoneNode = document.createElement("div");
        zoneNode.className = "secret-group-zone";

        const pill = document.createElement("span");
        pill.className = "secret-group-pill";
        pill.textContent = "Copy whole group";

        zoneNode.appendChild(pill);

        const id = accessor.addZone({
          afterLineNumber: group.startLine - 1,
          heightInPx: 22,
          domNode: zoneNode,
          suppressMouseDown: true,
        });
        groupZoneIdsRef.current.push(id);
        groupZoneMapRef.current.set(id, { group, pill });
      }
    });
  }, []);

  const clearGroupZones = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.changeViewZones((accessor: any) => {
      for (const id of groupZoneIdsRef.current) {
        accessor.removeZone(id);
      }
      groupZoneIdsRef.current = [];
      groupZoneMapRef.current.clear();
    });
  }, []);

  // Re-entrancy guard for `recomputeCaretReveals`. expand/collapse fire
  // executeEdits, which in turn can fire onDidChangeCursorSelection
  // synchronously — we must not recurse mid-diff.
  const recomputeInFlightRef = useRef(false);

  // Walk current selections, expand any tracking decoration that intersects
  // a selection, collapse the ones that no longer do.
  const recomputeCaretReveals = useCallback(() => {
    if (recomputeInFlightRef.current) return;
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!editor || !model) return;

    recomputeInFlightRef.current = true;
    try {
    const selections = editor.getSelections() ?? [];
    const next = new Set<string>();

    for (const decId of trackingDecorationIdsRef.current) {
      const range = model.getDecorationRange(decId);
      if (!range) continue;
      const rValueRange: ValueRange = {
        startLine: range.startLineNumber,
        startCol: range.startColumn,
        endLine: range.endLineNumber,
        endCol: range.endColumn,
      };
      for (const sel of selections) {
        if (selectionTouchesRange(sel, rValueRange)) {
          next.add(decId);
          break;
        }
      }
    }

    const prev = caretRevealedDecIdsRef.current;
    let unchanged = false;
    if (prev.size === next.size) {
      unchanged = true;
      for (const id of prev) {
        if (!next.has(id)) {
          unchanged = false;
          break;
        }
      }
    }

    if (!unchanged) {
      // Diff: collapse the ones leaving, expand the ones entering.
      const hoverId = hoverRevealedDecIdRef.current;
      for (const id of prev) {
        if (!next.has(id) && id !== hoverId) {
          collapseDecorationInModel(id);
        }
      }
      for (const id of next) {
        if (!prev.has(id)) {
          expandDecorationInModel(id);
        }
      }

      caretRevealedDecIdsRef.current = next;
      refreshMaskDecorations();
    }
    } finally {
      recomputeInFlightRef.current = false;
    }
  }, [
    collapseDecorationInModel,
    expandDecorationInModel,
    refreshMaskDecorations,
  ]);

  // Find a tracking decoration whose range overlaps the parsed value
  // range. Used by applySecretDecorations to decide whether to ingest a
  // newly-parsed range as a fresh secret. Overlap (rather than exact
  // start/end match) is forgiving toward decoration drift caused by
  // edits at boundaries.
  const findOverlappingTrackingDecoration = useCallback(
    (model: any, parsedRange: ValueRange): string | null => {
      for (const decId of trackingDecorationIdsRef.current) {
        const r = model.getDecorationRange(decId);
        if (!r) continue;
        // Empty decoration: skip.
        if (
          r.startLineNumber === r.endLineNumber &&
          r.startColumn === r.endColumn
        ) {
          continue;
        }
        // Line-level overlap.
        if (
          r.startLineNumber > parsedRange.endLine ||
          r.endLineNumber < parsedRange.startLine
        ) {
          continue;
        }
        // Column-level overlap on shared line(s). Since both ranges sit
        // on the value side of a `KEY=` line (or span quoted multilines),
        // any line-level overlap is enough.
        return decId;
      }
      return null;
    },
    []
  );

  // Re-scan the model for KEY=value lines, ingest any new ones (read real
  // text, push to map, replace with bullets), prune any tracking decoration
  // that no longer corresponds to a parsed value range. Called only on
  // user-driven content changes.
  const applySecretDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monacoInstance || !model) return;

    assertParserParity(model);

    const parsed = getValueRanges(model);
    const expanded = getExpandedIds();

    // Step 1: ingest any newly-discovered ranges that have no overlap with
    // an existing tracking decoration.
    const toIngest: ValueRange[] = [];
    for (const pr of parsed) {
      const existing = findOverlappingTrackingDecoration(model, pr);
      if (existing == null) toIngest.push(pr);
    }

    if (toIngest.length > 0) {
      // Read all originals BEFORE we start mutating the model, so offsets
      // we computed via `parsed` stay valid.
      const ingestPlan: Array<{ range: ValueRange; original: string }> = [];
      for (const r of toIngest) {
        const monacoRange = new monacoInstance.Range(
          r.startLine,
          r.startCol,
          r.endLine,
          r.endCol
        );
        const original = model.getValueInRange(monacoRange);
        ingestPlan.push({ range: r, original });
      }

      withInternalEdit(() => {
        // Issue all replacements in one edit so cursor / decorations only
        // shift once.
        const edits = ingestPlan.map(({ range, original }) => ({
          range: new monacoInstance.Range(
            range.startLine,
            range.startCol,
            range.endLine,
            range.endCol
          ),
          text: bulletsForSubstring(original),
        }));
        editor.executeEdits("mask-ingest", edits);

        // Now add tracking decorations for the bullet ranges. Same coords
        // — bullets are same width.
        const newDecs = ingestPlan.map(({ range }) => ({
          range: new monacoInstance.Range(
            range.startLine,
            range.startCol,
            range.endLine,
            range.endCol
          ),
          options: {
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                ?.NeverGrowsWhenTypingAtEdges ?? 1,
          },
        }));
        const newIds = editor.deltaDecorations([], newDecs);
        for (let i = 0; i < newIds.length; i++) {
          const id = newIds[i];
          trackingDecorationIdsRef.current.add(id);
          decorationToRealRef.current.set(id, ingestPlan[i].original);
        }
      });
    }

    // Step 2: prune tracking decorations that no longer overlap any parsed
    // value range AND aren't currently expanded (we leave expanded ranges
    // alone — the user is editing the real text there).
    const decHasParsedOverlap = (r: {
      startLineNumber: number;
      endLineNumber: number;
    }): boolean => {
      for (const pr of parsed) {
        if (r.startLineNumber > pr.endLine) continue;
        if (r.endLineNumber < pr.startLine) continue;
        return true;
      }
      return false;
    };

    const toDrop: string[] = [];
    for (const decId of trackingDecorationIdsRef.current) {
      if (expanded.has(decId)) continue;
      const r = model.getDecorationRange(decId);
      if (!r) {
        toDrop.push(decId);
        continue;
      }
      const empty =
        r.startLineNumber === r.endLineNumber &&
        r.startColumn === r.endColumn;
      if (empty || !decHasParsedOverlap(r)) {
        toDrop.push(decId);
      }
    }

    if (toDrop.length > 0) {
      editor.deltaDecorations(toDrop, []);
      for (const id of toDrop) {
        trackingDecorationIdsRef.current.delete(id);
        decorationToRealRef.current.delete(id);
      }
    }

    refreshMaskDecorations();
    recomputeCaretReveals();

    const groups = getValueGroups(model, parsed);
    applyGroupZones(groups);
  }, [
    applyGroupZones,
    findOverlappingTrackingDecoration,
    getExpandedIds,
    recomputeCaretReveals,
    refreshMaskDecorations,
    withInternalEdit,
  ]);

  const revealDecoration = useCallback(
    (decId: string) => {
      if (hoverRevealedDecIdRef.current === decId) return;
      // Collapse the previously hover-revealed one, if any (and not held
      // by the caret).
      const prev = hoverRevealedDecIdRef.current;
      if (prev && !caretRevealedDecIdsRef.current.has(prev)) {
        collapseDecorationInModel(prev);
      }
      hoverRevealedDecIdRef.current = decId;
      if (!caretRevealedDecIdsRef.current.has(decId)) {
        expandDecorationInModel(decId);
      }
      refreshMaskDecorations();
    },
    [
      collapseDecorationInModel,
      expandDecorationInModel,
      refreshMaskDecorations,
    ]
  );


  // Find the tracking decoration that contains this position, if any.
  const findDecorationAtPosition = useCallback(
    (pos: { lineNumber: number; column: number }): string | null => {
      const editor = editorRef.current;
      const model = editor?.getModel();
      if (!model) return null;
      for (const decId of trackingDecorationIdsRef.current) {
        const r = model.getDecorationRange(decId);
        if (!r) continue;
        const valueRange: ValueRange = {
          startLine: r.startLineNumber,
          startCol: r.startColumn,
          endLine: r.endLineNumber,
          endCol: r.endColumn,
        };
        if (posInRange(pos, valueRange)) return decId;
      }
      return null;
    },
    []
  );

  const findDecorationOnLine = useCallback((line: number): string | null => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!model) return null;
    for (const decId of trackingDecorationIdsRef.current) {
      const r = model.getDecorationRange(decId);
      if (!r) continue;
      if (line >= r.startLineNumber && line <= r.endLineNumber) return decId;
    }
    return null;
  }, []);

  // Build the real text for the entire file given the current model + map.
  // Used by clipboard intercept and onChange.
  const buildRealText = useCallback((): string => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    const model = editor?.getModel();
    if (!model || !monacoInstance) return "";
    return assembleRealText(
      model,
      decorationToRealRef.current,
      getExpandedIds(),
      monacoInstance
    );
  }, [getExpandedIds]);

  const handleEditorChange = useCallback(() => {
    if (internalEditDepthRef.current > 0) return;
    let out = buildRealText();
    out = out.replace(/\n*$/, "") + "\n";
    // Track the emission so the next `value` prop tick (parent echoes
    // our string straight back) is recognized as an echo and skipped.
    // NB: lastParentValueRef is intentionally NOT updated here — it only
    // moves when the useEffect actually rebuilds in response to parent.
    lastEmittedValueRef.current = out;
    onChangeRef.current(out);
  }, [buildRealText]);

  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      injectMaskingCSS();

      // Drain the pre-mount mask: create one tracking decoration per
      // entry, key the real values map by the returned decoration id.
      // NO model writes here — the model is already masked.
      const initial = pendingInitialMaskRef.current;
      pendingInitialMaskRef.current = null;
      if (initial && initial.entries.length > 0) {
        const decs = initial.entries.map((entry) => ({
          range: new monaco.Range(
            entry.range.startLine,
            entry.range.startCol,
            entry.range.endLine,
            entry.range.endCol
          ),
          options: {
            stickiness:
              monaco.editor.TrackedRangeStickiness
                ?.NeverGrowsWhenTypingAtEdges ?? 1,
          },
        }));
        const ids = editor.deltaDecorations([], decs);
        for (let i = 0; i < ids.length; i++) {
          trackingDecorationIdsRef.current.add(ids[i]);
          decorationToRealRef.current.set(ids[i], initial.entries[i].original);
        }
        // Seal the undo stack so the user's first Cmd+Z doesn't try to
        // reach back to "before mount".
        editor.getModel()?.pushStackElement();
      }

      // Initial paint of the cosmetic CSS overlay + group zones.
      const model = editor.getModel();
      if (model) {
        const groups = getValueGroups(model, getValueRanges(model));
        applyGroupZones(groups);
      }
      refreshMaskDecorations();

      editor.onDidChangeModelContent(() => {
        if (internalEditDepthRef.current > 0) return;
        applySecretDecorations();
        handleEditorChange();
      });

      const VIEW_ZONE_TARGET_TYPE =
        monaco.editor.MouseTargetType?.CONTENT_VIEW_ZONE ?? 8;
      const CONTENT_TEXT_TARGET_TYPE =
        monaco.editor.MouseTargetType?.CONTENT_TEXT ?? 6;

      let mouseDownInfo: {
        pos: { lineNumber: number; column: number };
        time: number;
      } | null = null;
      let mouseDownZoneId: string | null = null;

      editor.onMouseDown((e: any) => {
        if (e.target?.type === VIEW_ZONE_TARGET_TYPE) {
          mouseDownInfo = null;
          mouseDownZoneId = e.target.detail?.viewZoneId ?? null;
          return;
        }

        mouseDownZoneId = null;
        const pos = e.target?.position;
        if (!pos) {
          mouseDownInfo = null;
          return;
        }
        mouseDownInfo = { pos, time: Date.now() };
      });

      editor.onMouseUp((e: any) => {
        if (mouseDownZoneId !== null) {
          const downZoneId = mouseDownZoneId;
          mouseDownZoneId = null;
          if (
            e.target?.type === VIEW_ZONE_TARGET_TYPE &&
            e.target.detail?.viewZoneId === downZoneId
          ) {
            const entry = groupZoneMapRef.current.get(downZoneId);
            if (entry) copyGroup(entry.group, entry.pill);
          }
          return;
        }

        if (!mouseDownInfo) return;
        const downInfo = mouseDownInfo;
        mouseDownInfo = null;

        const pos = e.target?.position;
        if (!pos) return;

        const samePos =
          pos.lineNumber === downInfo.pos.lineNumber &&
          pos.column === downInfo.pos.column;
        const fast = Date.now() - downInfo.time < 300;

        if (!samePos || !fast) return;

        const decId = findDecorationAtPosition(pos);
        if (!decId) return;

        // Single-secret click-to-copy. Pull from the map directly so we
        // don't accidentally copy bullets when the secret is collapsed.
        const real = decorationToRealRef.current.get(decId);
        if (real == null) return;
        const toCopy = stripQuotes(real);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(toCopy).catch(() => {});
        }
        flashCopiedDecorations([decId]);
        flashTooltipCopied();
      });

      const editorDom = editor.getDomNode();
      let hoveredZoneId: string | null = null;
      editor.onMouseMove((e: any) => {
        const targetType = e.target?.type;

        if (targetType === VIEW_ZONE_TARGET_TYPE) {
          const zoneId: string | undefined = e.target.detail?.viewZoneId;
          if (zoneId && groupZoneMapRef.current.has(zoneId)) {
            if (zoneId !== hoveredZoneId) {
              if (hoveredZoneId) {
                groupZoneMapRef.current
                  .get(hoveredZoneId)
                  ?.pill.classList.remove("hover");
              }
              hoveredZoneId = zoneId;
              groupZoneMapRef.current.get(zoneId)?.pill.classList.add("hover");
              editorDom?.classList.add("secret-group-zone-hover");
            }
            hideTooltip();
            return;
          }
        }

        if (hoveredZoneId) {
          groupZoneMapRef.current
            .get(hoveredZoneId)
            ?.pill.classList.remove("hover");
          hoveredZoneId = null;
          editorDom?.classList.remove("secret-group-zone-hover");
        }

        if (targetType !== CONTENT_TEXT_TARGET_TYPE) {
          hideTooltip();
          return;
        }

        const pos = e.target?.position;
        if (!pos) {
          hideTooltip();
          return;
        }

        const decId = findDecorationOnLine(pos.lineNumber);
        if (!decId) {
          hideTooltip();
          return;
        }

        if (hoveredDecIdRef.current === decId) return;

        hoveredDecIdRef.current = decId;
        revealDecoration(decId);
        showTooltipAtDecoration(decId);
      });

      editor.onDidChangeCursorSelection(() => {
        recomputeCaretReveals();
      });

      editor.onDidScrollChange(() => {
        const id = hoveredDecIdRef.current;
        if (id) {
          showTooltipAtDecoration(id);
        } else if (
          tooltipRef.current &&
          tooltipRef.current.style.display !== "none"
        ) {
          tooltipRef.current.style.display = "none";
        }
      });

      const domNode = editor.getDomNode();
      if (domNode) {
        domNode.addEventListener("mouseleave", () => {
          hideTooltip();
          domNode.classList.remove("secret-group-zone-hover");
        });
      }

      // Clipboard intercept (G4). Substitutes the real-text slice
      // corresponding to the current selection. Fires regardless of
      // whether the selected ranges are currently revealed.
      const handleCopy = (e: ClipboardEvent) => {
        const sel = editor.getSelection();
        if (!sel || sel.isEmpty()) return;
        const realFile = buildRealText();
        const realSliced = sliceRealByMonacoRange(realFile, sel);
        if (e.clipboardData) {
          e.clipboardData.setData("text/plain", realSliced);
          e.preventDefault();
        }
      };

      const handleCut = (e: ClipboardEvent) => {
        const sel = editor.getSelection();
        const m = editor.getModel();
        if (!sel || sel.isEmpty() || !m) return;
        const realFile = buildRealText();
        const realSliced = sliceRealByMonacoRange(realFile, sel);
        if (e.clipboardData) {
          e.clipboardData.setData("text/plain", realSliced);
          e.preventDefault();
        }
        // Issue the deletion against the model. Decorations whose ranges
        // are fully consumed will collapse to empty and get pruned by
        // the next applySecretDecorations pass.
        withInternalEdit(() => {
          editor.executeEdits("clipboard-cut", [
            { range: sel, text: "", forceMoveMarkers: true },
          ]);
        });
        // Trigger a non-internal pass to ingest, prune, and emit.
        applySecretDecorations();
        handleEditorChange();
      };

      if (editorDom) {
        editorDom.addEventListener("copy", handleCopy as EventListener);
        editorDom.addEventListener("cut", handleCut as EventListener);
      }
    },
    [
      applyGroupZones,
      applySecretDecorations,
      buildRealText,
      copyGroup,
      findDecorationAtPosition,
      findDecorationOnLine,
      flashCopiedDecorations,
      flashTooltipCopied,
      handleEditorChange,
      hideTooltip,
      recomputeCaretReveals,
      refreshMaskDecorations,
      revealDecoration,
      showTooltipAtDecoration,
      withInternalEdit,
    ]
  );

  // External `value` prop changes (G7/G10). If parent is just echoing what
  // we sent (either as our last emission or as the previously-acknowledged
  // value), do nothing. Otherwise tear down + re-mask wholesale.
  useEffect(() => {
    if (value === lastParentValueRef.current) return;
    if (value === lastEmittedValueRef.current) {
      // Echo of our own emission. Mark it as the new acknowledged value so
      // the next prop tick that genuinely matches it is also skipped.
      lastParentValueRef.current = value;
      return;
    }
    lastParentValueRef.current = value;
    // Reset the emission baseline too. Without this, lastEmittedValueRef
    // can keep pointing at a string we emitted in a previous project
    // session; if a future external `value` (e.g. switching projects)
    // happens to equal that stale emission, the echo guard above would
    // trip and we'd silently skip the model reset, leaving the editor
    // showing the prior project's contents.
    lastEmittedValueRef.current = value;

    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    if (!editor || !monacoInstance) {
      // Not mounted yet — handleEditorMount will pick this up via the
      // initial pending mask. But we still need to update the seed.
      const result = maskText(value);
      pendingInitialMaskRef.current = result;
      return;
    }

    const model = editor.getModel();
    if (!model) return;

    // Drop any active reveals — we're about to wipe the model.
    hoverRevealedDecIdRef.current = null;
    caretRevealedDecIdsRef.current = new Set();

    // Drop all tracking decorations + map entries.
    const oldIds = Array.from(trackingDecorationIdsRef.current);
    if (oldIds.length > 0) {
      editor.deltaDecorations(oldIds, []);
    }
    trackingDecorationIdsRef.current.clear();
    decorationToRealRef.current.clear();

    // Re-seed.
    const result = maskText(value);

    withInternalEdit(() => {
      const fullRange = model.getFullModelRange();
      editor.executeEdits("external-value-reset", [
        { range: fullRange, text: result.masked, forceMoveMarkers: true },
      ]);

      if (result.entries.length > 0) {
        const decs = result.entries.map((entry) => ({
          range: new monacoInstance.Range(
            entry.range.startLine,
            entry.range.startCol,
            entry.range.endLine,
            entry.range.endCol
          ),
          options: {
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                ?.NeverGrowsWhenTypingAtEdges ?? 1,
          },
        }));
        const ids = editor.deltaDecorations([], decs);
        for (let i = 0; i < ids.length; i++) {
          trackingDecorationIdsRef.current.add(ids[i]);
          decorationToRealRef.current.set(
            ids[i],
            result.entries[i].original
          );
        }
      }

      model.pushStackElement();
    });

    refreshMaskDecorations();
    const groups = getValueGroups(model, getValueRanges(model));
    applyGroupZones(groups);
  }, [value, applyGroupZones, refreshMaskDecorations, withInternalEdit]);

  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      clearGroupZones();
    };
  }, [clearGroupZones]);

  const editorOptions = {
    minimap: { enabled: false },
    wordWrap: "on" as const,
    scrollBeyondLastLine: false,
    lineNumbers: "on" as const,
    fontSize,
    automaticLayout: true,
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    occurrencesHighlight: "off" as const,
    selectionHighlight: false,
    renderLineHighlight: "none" as const,
    links: false,
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
      defaultValue={maskedInitialValue}
      options={editorOptions}
      loading={null}
      onMount={handleEditorMount}
    />
  );
}
