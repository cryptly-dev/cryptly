import Editor, { loader } from "@monaco-editor/react";
import { useCallback, useEffect, useRef } from "react";

const REVEAL_KEY_LABEL =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
    ? "\u2325"
    : "Alt";
const TOOLTIP_DEFAULT_TEXT = `Click to copy | Hold ${REVEAL_KEY_LABEL} to view`;
const TOOLTIP_REVEAL_TEXT = `Click to copy | Release ${REVEAL_KEY_LABEL} to hide`;

const RECENT_EDIT_REVEAL_MS = 1500;

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

const SENSITIVE_KEY_PATTERN =
  /(^|_)(SECRET|SECRETS|TOKEN|TOKENS|KEY|KEYS|PASSWORD|PASS|PWD|AUTH|AUTHORIZATION|CREDENTIAL|CREDENTIALS|PRIVATE|DSN|SALT|HASH|CERT|CERTIFICATE|SIGNATURE)($|_)/;

function isSensitiveKey(key: string): boolean {
  if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) return false;
  return SENSITIVE_KEY_PATTERN.test(key);
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
    if (!isSensitiveKey(key)) continue;

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

function posInRange(
  pos: { lineNumber: number; column: number },
  r: ValueRange
): boolean {
  if (pos.lineNumber < r.startLine || pos.lineNumber > r.endLine) return false;
  if (pos.lineNumber === r.startLine && pos.column < r.startCol) return false;
  if (pos.lineNumber === r.endLine && pos.column >= r.endCol) return false;
  return true;
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
        ranges: ranges.filter(
          (r) => r.startLine >= start && r.endLine <= end
        ),
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
  const secretRangesRef = useRef<ValueRange[]>([]);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hoveredRangeRef = useRef<ValueRange | null>(null);
  const groupZoneIdsRef = useRef<string[]>([]);
  const groupZoneMapRef = useRef<
    Map<string, { group: ValueGroup; pill: HTMLElement }>
  >(new Map());
  const revealKeyHeldRef = useRef<boolean>(false);
  const revealedRangeRef = useRef<ValueRange | null>(null);
  const keyHandlersCleanupRef = useRef<(() => void) | null>(null);
  const recentEditRangesRef = useRef<ValueRange[]>([]);
  const recentEditTimerRef = useRef<number | null>(null);

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
          { token: "variable", foreground: "509DDA" },
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

  const refreshMaskDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    if (!editor || !monacoInstance) return;

    const ranges = secretRangesRef.current;
    const revealed = revealedRangeRef.current;
    const recentEdits = recentEditRangesRef.current;

    const isRevealedByAlt = (r: ValueRange) =>
      !!revealed &&
      r.startLine === revealed.startLine &&
      r.startCol === revealed.startCol &&
      r.endLine === revealed.endLine &&
      r.endCol === revealed.endCol;

    const isRecentlyEdited = (r: ValueRange) =>
      recentEdits.some(
        (er) =>
          er.startLine === r.startLine &&
          er.startCol === r.startCol &&
          er.endLine === r.endLine &&
          er.endCol === r.endCol
      );

    const decorations = ranges
      .filter((r) => !isRevealedByAlt(r) && !isRecentlyEdited(r))
      .map((r) => ({
        range: new monacoInstance.Range(
          r.startLine,
          r.startCol,
          r.endLine,
          r.endCol
        ),
        options: {
          inlineClassName: "secret-masked",
        },
      }));

    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection(decorations);
    } else {
      decorationsRef.current.set(decorations);
    }
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipResetTimerRef.current !== null) {
      window.clearTimeout(tooltipResetTimerRef.current);
      tooltipResetTimerRef.current = null;
    }
    const tip = tooltipRef.current;
    if (tip && tip.style.display !== "none") {
      tip.style.display = "none";
    }
    hoveredRangeRef.current = null;
    if (revealedRangeRef.current) {
      revealedRangeRef.current = null;
      refreshMaskDecorations();
    }
  }, [refreshMaskDecorations]);

  const showTooltip = useCallback((range: ValueRange) => {
    const editor = editorRef.current;
    if (!editor) return;

    const domNode = editor.getDomNode();
    if (!domNode) return;

    const visiblePos = editor.getScrolledVisiblePosition({
      lineNumber: range.startLine,
      column: range.startCol,
    });
    if (!visiblePos) return;

    const desiredText = revealKeyHeldRef.current
      ? TOOLTIP_REVEAL_TEXT
      : TOOLTIP_DEFAULT_TEXT;

    let tip = tooltipRef.current;
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "secret-tooltip";
      tip.textContent = desiredText;
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
      if (tip.textContent !== desiredText) {
        tip.textContent = desiredText;
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
        t.textContent = revealKeyHeldRef.current
          ? TOOLTIP_REVEAL_TEXT
          : TOOLTIP_DEFAULT_TEXT;
      }
    }, 1200);
  }, []);

  const flashCopied = useCallback(
    (rangesToFlash: ValueRange[]) => {
      const editor = editorRef.current;
      const monacoInstance = monacoRef.current;
      if (!editor || !monacoInstance || rangesToFlash.length === 0) return;

      const decorations = rangesToFlash.map((range) => ({
        range: new monacoInstance.Range(
          range.startLine,
          range.startCol,
          range.endLine,
          range.endCol
        ),
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

  const copyGroup = useCallback(
    (group: ValueGroup, pill: HTMLElement) => {
      const editor = editorRef.current;
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const lines: string[] = [];
      for (let l = group.startLine; l <= group.endLine; l++) {
        lines.push(model.getLineContent(l));
      }
      const text = lines.join("\n");

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

      flashCopied(group.ranges);
    },
    [flashCopied]
  );

  const applyGroupZones = useCallback(
    (groups: ValueGroup[]) => {
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
    },
    []
  );

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

  const applySecretDecorations = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const ranges = getValueRanges(model);
    secretRangesRef.current = ranges;

    if (revealedRangeRef.current) {
      const revealed = revealedRangeRef.current;
      const stillExists = ranges.some(
        (r) =>
          r.startLine === revealed.startLine &&
          r.startCol === revealed.startCol &&
          r.endLine === revealed.endLine &&
          r.endCol === revealed.endCol
      );
      if (!stillExists) revealedRangeRef.current = null;
    }

    if (recentEditRangesRef.current.length > 0) {
      const filtered = recentEditRangesRef.current.filter((er) =>
        ranges.some(
          (r) =>
            r.startLine === er.startLine &&
            r.startCol === er.startCol &&
            r.endLine === er.endLine &&
            r.endCol === er.endCol
        )
      );
      if (filtered.length !== recentEditRangesRef.current.length) {
        recentEditRangesRef.current = filtered;
      }
    }

    refreshMaskDecorations();

    const groups = getValueGroups(model, ranges);
    applyGroupZones(groups);
  }, [applyGroupZones, refreshMaskDecorations]);

  const revealRange = useCallback(
    (range: ValueRange) => {
      const current = revealedRangeRef.current;
      if (
        current &&
        current.startLine === range.startLine &&
        current.startCol === range.startCol &&
        current.endLine === range.endLine &&
        current.endCol === range.endCol
      ) {
        return;
      }
      revealedRangeRef.current = range;
      refreshMaskDecorations();
    },
    [refreshMaskDecorations]
  );

  const unrevealRange = useCallback(() => {
    if (!revealedRangeRef.current) return;
    revealedRangeRef.current = null;
    refreshMaskDecorations();
  }, [refreshMaskDecorations]);

  const setTooltipText = useCallback((text: string) => {
    const tip = tooltipRef.current;
    if (!tip) return;
    if (tip.classList.contains("copied")) return;
    if (tip.textContent !== text) tip.textContent = text;
  }, []);

  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      injectMaskingCSS();

      applySecretDecorations();

      const computeChangeEnd = (change: {
        range: {
          startLineNumber: number;
          startColumn: number;
        };
        text: string;
      }) => {
        const text = change.text ?? "";
        const newlineIdx = text.lastIndexOf("\n");
        if (newlineIdx === -1) {
          return {
            line: change.range.startLineNumber,
            col: change.range.startColumn + text.length,
          };
        }
        const linesAdded = text.split("\n").length - 1;
        const lastLineLength = text.length - newlineIdx - 1;
        return {
          line: change.range.startLineNumber + linesAdded,
          col: lastLineLength + 1,
        };
      };

      const positionTouchesRange = (
        line: number,
        col: number,
        r: ValueRange
      ) => {
        if (line < r.startLine || line > r.endLine) return false;
        if (line === r.startLine && col < r.startCol) return false;
        if (line === r.endLine && col > r.endCol) return false;
        return true;
      };

      const scheduleRecentEditClear = () => {
        if (recentEditTimerRef.current !== null) {
          window.clearTimeout(recentEditTimerRef.current);
        }
        recentEditTimerRef.current = window.setTimeout(() => {
          recentEditTimerRef.current = null;
          recentEditRangesRef.current = [];
          refreshMaskDecorations();
        }, RECENT_EDIT_REVEAL_MS);
      };

      editor.onDidChangeModelContent((event: any) => {
        applySecretDecorations();

        const ranges = secretRangesRef.current;
        if (ranges.length === 0) {
          if (recentEditRangesRef.current.length > 0) {
            recentEditRangesRef.current = [];
            refreshMaskDecorations();
          }
          return;
        }

        const affected: ValueRange[] = [];
        const seen = new Set<string>();
        for (const change of event.changes ?? []) {
          const startLine = change.range.startLineNumber;
          const startCol = change.range.startColumn;
          const end = computeChangeEnd(change);
          for (const r of ranges) {
            if (
              positionTouchesRange(startLine, startCol, r) ||
              positionTouchesRange(end.line, end.col, r)
            ) {
              const key = `${r.startLine}:${r.startCol}:${r.endLine}:${r.endCol}`;
              if (!seen.has(key)) {
                seen.add(key);
                affected.push(r);
              }
            }
          }
        }

        if (affected.length > 0) {
          recentEditRangesRef.current = affected;
          refreshMaskDecorations();
          scheduleRecentEditClear();
        } else if (recentEditRangesRef.current.length > 0) {
          recentEditRangesRef.current = [];
          if (recentEditTimerRef.current !== null) {
            window.clearTimeout(recentEditTimerRef.current);
            recentEditTimerRef.current = null;
          }
          refreshMaskDecorations();
        }
      });

      const VIEW_ZONE_TARGET_TYPE =
        monaco.editor.MouseTargetType?.CONTENT_VIEW_ZONE ?? 8;

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

        const range = secretRangesRef.current.find((r) => posInRange(pos, r));
        if (!range) return;

        const model = editor.getModel();
        if (!model) return;

        const text = model.getValueInRange(
          new monaco.Range(
            range.startLine,
            range.startCol,
            range.endLine,
            range.endCol
          )
        );

        const toCopy = stripQuotes(text);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(toCopy).catch(() => {});
        }
        flashCopied([range]);
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
              groupZoneMapRef.current
                .get(zoneId)
                ?.pill.classList.add("hover");
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

        const pos = e.target?.position;
        if (!pos) {
          hideTooltip();
          return;
        }

        const range = secretRangesRef.current.find((r) => posInRange(pos, r));
        if (!range) {
          hideTooltip();
          return;
        }

        if (
          hoveredRangeRef.current &&
          hoveredRangeRef.current.startLine === range.startLine &&
          hoveredRangeRef.current.startCol === range.startCol
        ) {
          return;
        }

        hoveredRangeRef.current = range;
        if (revealKeyHeldRef.current) {
          revealRange(range);
        } else if (revealedRangeRef.current) {
          unrevealRange();
        }
        showTooltip(range);
      });

      editor.onDidScrollChange(() => {
        const r = hoveredRangeRef.current;
        if (r) {
          showTooltip(r);
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

      const isRevealKey = (event: KeyboardEvent) =>
        event.key === "Alt" || event.altKey;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isRevealKey(event)) return;
        if (revealKeyHeldRef.current) return;
        revealKeyHeldRef.current = true;
        const hovered = hoveredRangeRef.current;
        if (hovered) {
          revealRange(hovered);
          setTooltipText(TOOLTIP_REVEAL_TEXT);
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key !== "Alt" && event.altKey) return;
        if (!revealKeyHeldRef.current) return;
        revealKeyHeldRef.current = false;
        unrevealRange();
        if (hoveredRangeRef.current) {
          setTooltipText(TOOLTIP_DEFAULT_TEXT);
        }
      };

      const handleBlur = () => {
        if (!revealKeyHeldRef.current) return;
        revealKeyHeldRef.current = false;
        unrevealRange();
        if (hoveredRangeRef.current) {
          setTooltipText(TOOLTIP_DEFAULT_TEXT);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      window.addEventListener("blur", handleBlur);

      keyHandlersCleanupRef.current = () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("blur", handleBlur);
      };
    },
    [
      applySecretDecorations,
      flashCopied,
      flashTooltipCopied,
      hideTooltip,
      showTooltip,
      copyGroup,
      revealRange,
      unrevealRange,
      setTooltipText,
    ]
  );

  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      clearGroupZones();
      if (keyHandlersCleanupRef.current) {
        keyHandlersCleanupRef.current();
        keyHandlersCleanupRef.current = null;
      }
      if (recentEditTimerRef.current !== null) {
        window.clearTimeout(recentEditTimerRef.current);
        recentEditTimerRef.current = null;
      }
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
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={editorOptions}
      loading={null}
      onMount={handleEditorMount}
    />
  );
}
