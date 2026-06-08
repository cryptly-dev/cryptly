import { lineColToOffset, type MonacoSelectionLike } from "./parser";

/**
 * Walk the tracking decorations sorted by start offset, splice in real values
 * for collapsed ranges, leave model text in place for ranges whose decoration
 * id is in `expandedIds` (the user is currently looking at / editing the real
 * value). O(L + R).
 */
export function assembleRealText(
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
    if (e.start < cursor) continue;
    out.push(fullText.slice(cursor, e.start));
    out.push(decorationToReal.get(e.id) ?? fullText.slice(e.start, e.end));
    cursor = e.end;
  }
  out.push(fullText.slice(cursor));

  return out.join("");
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
export function sliceRealByMonacoRange(
  realText: string,
  sel: MonacoSelectionLike
): string {
  const lines = realText.split("\n");
  const lineLengths = lines.map((l) => l.length);
  const start = lineColToOffset(
    lineLengths,
    sel.startLineNumber,
    sel.startColumn
  );
  const end = lineColToOffset(lineLengths, sel.endLineNumber, sel.endColumn);
  return realText.slice(start, end);
}
