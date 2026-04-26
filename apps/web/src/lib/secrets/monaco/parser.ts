const BULLET = "\u2022";

export interface ValueRange {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export interface ParsedSecret {
  range: ValueRange;
  key: string;
  closed: boolean;
}

export interface MonacoSelectionLike {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface MaskEntry {
  range: ValueRange;
  original: string;
  key: string;
}

export interface MaskResult {
  masked: string;
  entries: MaskEntry[];
}

export interface ValueGroup {
  startLine: number;
  endLine: number;
  ranges: ValueRange[];
}

export function getValueRanges(model: any): ParsedSecret[] {
  const lineCount = model.getLineCount();
  const ranges: ParsedSecret[] = [];

  let inQuote: string | null = null;
  let current: { startLine: number; startCol: number; key: string } | null =
    null;

  for (let line = 1; line <= lineCount; line++) {
    const text = model.getLineContent(line);

    if (inQuote) {
      for (let i = 0; i < text.length; i++) {
        if (inQuote === '"' && text[i] === "\\") {
          i++;
          continue;
        }
        if (text[i] === inQuote) {
          const { startLine, startCol, key } = current!;
          ranges.push({
            range: {
              startLine,
              startCol,
              endLine: line,
              endCol: i + 2,
            },
            key,
            closed: true,
          });
          inQuote = null;
          current = null;
          break;
        }
      }
      continue;
    }

    const trimmed = text.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const eqIdx = text.indexOf("=");
    if (eqIdx === -1) continue;

    const key = text.substring(0, eqIdx).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue;

    const afterEq = text.substring(eqIdx + 1);
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
            range: {
              startLine: line,
              startCol: valueStartCol,
              endLine: line,
              endCol: eqIdx + 1 + i + 2,
            },
            key,
            closed: true,
          });
          closed = true;
          break;
        }
      }
      if (!closed) {
        inQuote = firstChar;
        current = { startLine: line, startCol: valueStartCol, key };
      }
    } else {
      ranges.push({
        range: {
          startLine: line,
          startCol: valueStartCol,
          endLine: line,
          endCol: text.length + 1,
        },
        key,
        closed: true,
      });
    }
  }

  if (inQuote && current) {
    const lastLine = lineCount;
    const { startLine, startCol, key } = current;
    ranges.push({
      range: {
        startLine,
        startCol,
        endLine: lastLine,
        endCol: model.getLineContent(lastLine).length + 1,
      },
      key,
      closed: false,
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
export function parseValueRangesFromString(text: string): ParsedSecret[] {
  const lines = text.split("\n");
  const ranges: ParsedSecret[] = [];

  let inQuote: string | null = null;
  let current: { startLine: number; startCol: number; key: string } | null =
    null;

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
          const { startLine, startCol, key } = current!;
          ranges.push({
            range: {
              startLine,
              startCol,
              endLine: line,
              endCol: i + 2,
            },
            key,
            closed: true,
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
            range: {
              startLine: line,
              startCol: valueStartCol,
              endLine: line,
              endCol: eqIdx + 1 + i + 2,
            },
            key,
            closed: true,
          });
          closed = true;
          break;
        }
      }
      if (!closed) {
        inQuote = firstChar;
        current = { startLine: line, startCol: valueStartCol, key };
      }
    } else {
      ranges.push({
        range: {
          startLine: line,
          startCol: valueStartCol,
          endLine: line,
          endCol: lineText.length + 1,
        },
        key,
        closed: true,
      });
    }
  }

  if (inQuote && current) {
    const lastLine = lines.length;
    const { startLine, startCol, key } = current;
    ranges.push({
      range: {
        startLine,
        startCol,
        endLine: lastLine,
        endCol: lines[lastLine - 1].length + 1,
      },
      key,
      closed: false,
    });
  }

  return ranges;
}

/**
 * Convert (line, col) 1-based positions into a flat string offset against
 * a `\n`-joined text buffer. Mirrors how Monaco offsets work for the model
 * we use (we ignore CRLF — Monaco normalizes on paste).
 */
export function lineColToOffset(
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

export function bulletsForSubstring(s: string): string {
  return s.replace(/[^\n]/g, BULLET);
}

/**
 * Parse `text`, then replace each value range with same-width bullet
 * placeholders (preserving newlines inside multiline quoted values).
 * Returns the masked string AND the per-range originals so callers can
 * stash them keyed by decoration id after the editor mounts.
 */
export function maskText(text: string): MaskResult {
  const parsed = parseValueRangesFromString(text);
  if (parsed.length === 0) {
    return { masked: text, entries: [] };
  }

  const lines = text.split("\n");
  const lineLengths = lines.map((l) => l.length);

  const sorted = [...parsed].sort((a, b) => {
    if (a.range.startLine !== b.range.startLine)
      return a.range.startLine - b.range.startLine;
    return a.range.startCol - b.range.startCol;
  });

  const out: string[] = [];
  const entries: MaskEntry[] = [];
  let cursor = 0;

  for (const p of sorted) {
    const r = p.range;
    const start = lineColToOffset(lineLengths, r.startLine, r.startCol);
    const end = lineColToOffset(lineLengths, r.endLine, r.endCol);
    if (start < cursor) continue;
    out.push(text.slice(cursor, start));
    const original = text.slice(start, end);
    out.push(bulletsForSubstring(original));
    entries.push({ range: r, original, key: p.key });
    cursor = end;
  }
  out.push(text.slice(cursor));

  return { masked: out.join(""), entries };
}

/**
 * Dev-only sanity check: confirm `parseValueRangesFromString` agrees with
 * `getValueRanges` for the given model. Catches drift between the two
 * implementations early. No-op in production.
 */
export function assertParserParity(model: any): void {
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
      if (
        !rangesEqual(fromModel[i].range, fromString[i].range) ||
        fromModel[i].closed !== fromString[i].closed
      ) {
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

export function posInRange(
  pos: { lineNumber: number; column: number },
  r: ValueRange
): boolean {
  if (pos.lineNumber < r.startLine || pos.lineNumber > r.endLine) return false;
  if (pos.lineNumber === r.startLine && pos.column < r.startCol) return false;
  if (pos.lineNumber === r.endLine && pos.column >= r.endCol) return false;
  return true;
}

export function selectionTouchesRange(
  sel: MonacoSelectionLike,
  r: ValueRange
): boolean {
  const selStartBeforeOrAtRangeEnd =
    sel.startLineNumber < r.endLine ||
    (sel.startLineNumber === r.endLine && sel.startColumn <= r.endCol);
  const selEndAfterOrAtRangeStart =
    sel.endLineNumber > r.startLine ||
    (sel.endLineNumber === r.startLine && sel.endColumn >= r.startCol);
  return selStartBeforeOrAtRangeEnd && selEndAfterOrAtRangeStart;
}

export function rangesEqual(a: ValueRange, b: ValueRange): boolean {
  return (
    a.startLine === b.startLine &&
    a.startCol === b.startCol &&
    a.endLine === b.endLine &&
    a.endCol === b.endCol
  );
}

/** Group = max run of non-blank lines containing ≥1 KEY=VALUE pair, bounded by blank lines or file edges. */
export function getValueGroups(
  model: any,
  parsed: ParsedSecret[]
): ValueGroup[] {
  const lineCount = model.getLineCount();
  const ranges = parsed.map((p) => p.range);
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

export function stripQuotes(text: string): string {
  if (text.length < 2) return text;
  const first = text[0];
  const last = text[text.length - 1];
  if ((first === '"' || first === "'") && first === last) {
    return text.slice(1, -1);
  }
  return text;
}
