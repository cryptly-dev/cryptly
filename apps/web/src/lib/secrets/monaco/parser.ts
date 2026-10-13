import { parseEnv } from "$lib/secrets/env-doc";

/** 1-based line/column coordinates of a value, quotes included. */
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

/** Keys the GitHub push picks up. */
const PUSHED_KEY = /^[A-Z_][A-Z0-9_]*$/;

/**
 * Value ranges for the GitHub push and the ⌘K search, read by the same parser as the table
 * and the .env view (`env-doc.ts`), so they all agree on where a value starts and ends (an
 * unclosed quote, for one, is a one-line value). `KEY=` with nothing after it has no range.
 */
export function parseValueRangesFromString(
  text: string,
  keyPattern = PUSHED_KEY,
): ParsedSecret[] {
  const doc = parseEnv(text);
  return doc.secrets
    .filter((s) => s.raw !== "" && keyPattern.test(s.key))
    .map((s) => ({
      key: s.key,
      closed: true,
      range: {
        startLine: s.start + 1,
        startCol: s.valueCol + 1,
        endLine: s.end + 1,
        endCol: doc.lines[s.end].length - s.tail.length + 1,
      },
    }));
}

/** 1-based (line, col) to an offset in the `\n`-joined text with these line lengths. */
export function lineColToOffset(
  lineLengths: number[],
  line: number,
  col: number,
): number {
  let offset = 0;
  for (let i = 0; i < line - 1; i++) {
    offset += lineLengths[i] + 1;
  }
  return offset + (col - 1);
}
