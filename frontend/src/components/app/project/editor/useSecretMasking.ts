import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectRevealOn } from "@/lib/project-settings";
import { assembleRealText, sliceRealByMonacoRange } from "./assembler";
import {
  assertParserParity,
  bulletsForSubstring,
  getValueGroups,
  getValueRanges,
  maskText,
  posInRange,
  selectionTouchesRange,
  stripQuotes,
  type MaskResult,
  type ParsedSecret,
  type ValueGroup,
  type ValueRange,
} from "./parser";

const TOOLTIP_DEFAULT_TEXT = "Click to copy";

interface UseSecretMaskingArgs {
  value: string;
  onChange: (value: string) => void;
  revealOn: ProjectRevealOn;
}

interface UseSecretMaskingResult {
  maskedInitialValue: string;
  handleEditorMount: (editor: any, monaco: any) => void;
}

export function useSecretMasking({
  value,
  onChange,
  revealOn,
}: UseSecretMaskingArgs): UseSecretMaskingResult {
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

  const hoverRevealedDecIdRef = useRef<string | null>(null);
  const caretRevealedDecIdsRef = useRef<Set<string>>(new Set());

  const trackingDecorationIdsRef = useRef<Set<string>>(new Set());
  const decorationToRealRef = useRef<Map<string, string>>(new Map());

  // Pre-edit offset snapshot per tracking decoration. Refreshed after every
  // internal edit (ingest, expand/collapse, mask-after-typing, drift
  // reconcile, initial mount) so that the NEXT user-driven keystroke's
  // change events can be mapped onto the right slot inside each stored real
  // value.
  const decorationPreEditOffsetsRef = useRef<
    Map<string, { start: number; length: number }>
  >(new Map());

  // Re-entrancy counter. depth > 0 means "this content change is ours".
  const internalEditDepthRef = useRef(0);

  const lastParentValueRef = useRef<string>(value);

  const pendingInitialMaskRef = useRef<MaskResult | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const lastEmittedValueRef = useRef<string>(value);

  const revealOnRef = useRef<ProjectRevealOn>(revealOn);
  revealOnRef.current = revealOn;

  // Pre-mount masking: synchronously mask `value` BEFORE Monaco mounts,
  // so plaintext never enters the DOM, not even for one frame.
  const [maskedInitialValue] = useState(() => {
    if (revealOn === "always") {
      pendingInitialMaskRef.current = null;
      lastParentValueRef.current = value;
      return value;
    }
    const result = maskText(value);
    pendingInitialMaskRef.current = result;
    lastParentValueRef.current = value;
    return result.masked;
  });

  const tooltipResetTimerRef = useRef<number | null>(null);

  const getExpandedIds = useCallback((): Set<string> => {
    const ids = new Set<string>(caretRevealedDecIdsRef.current);
    if (hoverRevealedDecIdRef.current) ids.add(hoverRevealedDecIdRef.current);
    return ids;
  }, []);

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

  const withInternalEdit = useCallback(<T>(fn: () => T): T => {
    internalEditDepthRef.current++;
    try {
      return fn();
    } finally {
      internalEditDepthRef.current--;
    }
  }, []);

  const snapshotDecorationOffsets = useCallback(() => {
    const model = editorRef.current?.getModel();
    const snap = decorationPreEditOffsetsRef.current;
    snap.clear();
    if (!model) return;
    for (const decId of trackingDecorationIdsRef.current) {
      const range = model.getDecorationRange(decId);
      if (!range) continue;
      const start = model.getOffsetAt({
        lineNumber: range.startLineNumber,
        column: range.startColumn,
      });
      const end = model.getOffsetAt({
        lineNumber: range.endLineNumber,
        column: range.endColumn,
      });
      snap.set(decId, { start, length: end - start });
    }
  }, []);

  const applyTypingChangesToReal = useCallback(
    (
      model: any,
      changes: Array<{
        rangeOffset: number;
        rangeLength: number;
        text: string;
      }>,
    ) => {
      const editor = editorRef.current;
      if (!editor || !model || changes.length === 0) return;
      const snap = decorationPreEditOffsetsRef.current;
      if (snap.size === 0) return;
      const expanded = getExpandedIds();

      const touched = new Map<
        string,
        Array<{ offsetWithin: number; rangeLength: number; text: string }>
      >();
      for (const [decId, { start: decStart, length: decLen }] of snap) {
        if (expanded.has(decId)) continue;
        const decEnd = decStart + decLen;
        const relevant: Array<{
          offsetWithin: number;
          rangeLength: number;
          text: string;
        }> = [];
        for (const ch of changes) {
          const chStart = ch.rangeOffset;
          const chEnd = ch.rangeOffset + ch.rangeLength;
          if (chStart >= decStart && chEnd <= decEnd) {
            relevant.push({
              offsetWithin: chStart - decStart,
              rangeLength: ch.rangeLength,
              text: ch.text,
            });
          }
        }
        if (relevant.length > 0) touched.set(decId, relevant);
      }

      if (touched.size === 0) return;

      for (const [decId, decChanges] of touched) {
        const oldReal = decorationToRealRef.current.get(decId) ?? "";
        decChanges.sort((a, b) => b.offsetWithin - a.offsetWithin);
        let newReal = oldReal;
        for (const ch of decChanges) {
          newReal =
            newReal.slice(0, ch.offsetWithin) +
            ch.text +
            newReal.slice(ch.offsetWithin + ch.rangeLength);
        }
        decorationToRealRef.current.set(decId, newReal);
      }

      withInternalEdit(() => {
        const maskEdits: Array<{ range: unknown; text: string }> = [];
        for (const decId of touched.keys()) {
          const postRange = model.getDecorationRange(decId);
          if (!postRange) continue;
          const real = decorationToRealRef.current.get(decId) ?? "";
          const expectedBullets = bulletsForSubstring(real);
          const currentText = model.getValueInRange(postRange);
          if (currentText === expectedBullets) continue;
          maskEdits.push({ range: postRange, text: expectedBullets });
        }
        if (maskEdits.length > 0) {
          editor.executeEdits("mask-after-typing", maskEdits);
        }
      });
    },
    [getExpandedIds, withInternalEdit],
  );

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
      if (current.length !== real.length) return;
      withInternalEdit(() => {
        editor.executeEdits("mask-expand", [
          {
            range,
            text: real,
          },
        ]);
      });
      snapshotDecorationOffsets();
    },
    [snapshotDecorationOffsets, withInternalEdit],
  );

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
      snapshotDecorationOffsets();
    },
    [snapshotDecorationOffsets, withInternalEdit],
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

  const flashCopied = useCallback((rangesToFlash: Array<{ range: any }>) => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    if (!editor || !monacoInstance || rangesToFlash.length === 0) return;

    // `secret-copied` is ONLY the green-flash animation (no bullet overlay).
    // We intentionally don't stack `secret-masked` here: the underlying
    // mask decoration already paints bullets for collapsed values, and
    // for group-copy flashes this range covers whole lines including
    // keys — masking those would briefly turn key names into dots.
    const decorations = rangesToFlash.map((entry) => ({
      range: entry.range,
      options: {
        inlineClassName: "secret-copied",
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
  }, []);

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
    [flashCopied],
  );

  const copyGroup = useCallback(
    (group: ValueGroup, pill: HTMLElement) => {
      const editor = editorRef.current;
      const monacoInstance = monacoRef.current;
      if (!editor || !monacoInstance) return;
      const model = editor.getModel();
      if (!model) return;

      const realFile = assembleRealText(
        model,
        decorationToRealRef.current,
        getExpandedIds(),
        monacoInstance,
      );
      const realLines = realFile.split("\n");
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

      flashCopied([
        {
          range: new monacoInstance.Range(
            group.startLine,
            1,
            group.endLine,
            model.getLineMaxColumn(group.endLine),
          ),
        },
      ]);
    },
    [flashCopied, getExpandedIds],
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

  const recomputeInFlightRef = useRef(false);

  const recomputeCaretReveals = useCallback(() => {
    // tight: never reveal via caret; yolo: hook not wired.
    if (revealOnRef.current !== "hover") return;
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

  const findOverlappingTrackingDecoration = useCallback(
    (model: any, parsedRange: ValueRange): string | null => {
      for (const decId of trackingDecorationIdsRef.current) {
        const r = model.getDecorationRange(decId);
        if (!r) continue;
        if (
          r.startLineNumber === r.endLineNumber &&
          r.startColumn === r.endColumn
        ) {
          continue;
        }
        if (
          r.startLineNumber > parsedRange.endLine ||
          r.endLineNumber < parsedRange.startLine
        ) {
          continue;
        }
        return decId;
      }
      return null;
    },
    [],
  );

  const applySecretDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monacoInstance || !model) return;

    assertParserParity(model);

    const parsed = getValueRanges(model);
    const expanded = getExpandedIds();

    const toIngest: ParsedSecret[] = [];
    for (const pr of parsed) {
      const existing = findOverlappingTrackingDecoration(model, pr.range);
      if (existing == null) toIngest.push(pr);
    }

    if (toIngest.length > 0) {
      const ingestPlan: Array<{
        range: ValueRange;
        original: string;
        key: string;
      }> = [];
      for (const pr of toIngest) {
        const r = pr.range;
        const monacoRange = new monacoInstance.Range(
          r.startLine,
          r.startCol,
          r.endLine,
          r.endCol,
        );
        const original = model.getValueInRange(monacoRange);
        ingestPlan.push({ range: r, original, key: pr.key });
      }

      withInternalEdit(() => {
        const edits = ingestPlan.map(({ range, original }) => ({
          range: new monacoInstance.Range(
            range.startLine,
            range.startCol,
            range.endLine,
            range.endCol,
          ),
          text: bulletsForSubstring(original),
        }));
        editor.executeEdits("mask-ingest", edits);

        const newDecs = ingestPlan.map(({ range }) => ({
          range: new monacoInstance.Range(
            range.startLine,
            range.startCol,
            range.endLine,
            range.endCol,
          ),
          options: {
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                ?.AlwaysGrowsWhenTypingAtEdges ?? 0,
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

    const driftEdits: Array<{
      range: ReturnType<typeof monacoInstance.Range>;
      text: string;
    }> = [];
    const driftUpdates: Array<{
      decId: string;
      real: string;
      range: ReturnType<typeof monacoInstance.Range>;
    }> = [];
    for (const pr of parsed) {
      if (!pr.closed) continue;
      const decId = findOverlappingTrackingDecoration(model, pr.range);
      if (decId == null) continue;
      if (expanded.has(decId)) continue;
      const parsedRange = new monacoInstance.Range(
        pr.range.startLine,
        pr.range.startCol,
        pr.range.endLine,
        pr.range.endCol,
      );
      const curr = model.getValueInRange(parsedRange);
      if (curr.length === 0) continue;
      let pure = true;
      for (let i = 0; i < curr.length; i++) {
        const c = curr.charCodeAt(i);
        if (c !== 0x2022 && c !== 0x0a) {
          pure = false;
          break;
        }
      }
      if (pure) continue;
      const storedReal = decorationToRealRef.current.get(decId);
      const newReal =
        storedReal != null && storedReal.length === curr.length
          ? storedReal
          : curr;
      driftUpdates.push({ decId, real: newReal, range: parsedRange });
      driftEdits.push({
        range: parsedRange,
        text: bulletsForSubstring(newReal),
      });
    }
    if (driftEdits.length > 0) {
      withInternalEdit(() => {
        editor.executeEdits("mask-drift-reconcile", driftEdits);
        model.changeDecorations((accessor: unknown) => {
          const a = accessor as {
            changeDecoration: (
              id: string,
              newRange: ReturnType<typeof monacoInstance.Range>,
            ) => void;
          };
          for (const { decId, range } of driftUpdates) {
            a.changeDecoration(decId, range);
          }
        });
      });
      for (const { decId, real } of driftUpdates) {
        decorationToRealRef.current.set(decId, real);
      }
    }

    // Range sync: snap every tracked decoration's range back to the
    // parser's canonical range for the value it covers. `AlwaysGrows`
    // stickiness will happily extend a decoration across a newline (e.g.
    // user hits Enter at the end of an unquoted value) — without this
    // step the decoration stays inflated and caret-reveal keeps thinking
    // the caret is still inside the value (because the inflated `endCol`
    // reaches wherever the caret went), so it never collapses back to
    // bullets.
    //
    // Expanded decorations are synced too: we only touch the range, not
    // the model text. For a collapsed decoration we also trim the stored
    // real to match the new length (typical excess is a trailing `\n`);
    // for an expanded decoration the model holds plaintext, so we take
    // the parsed text directly as the new real when lengths differ.
    const rangeSyncUpdates: Array<{
      decId: string;
      newRange: ReturnType<typeof monacoInstance.Range>;
      newReal: string;
    }> = [];
    for (const pr of parsed) {
      if (!pr.closed) continue;
      const decId = findOverlappingTrackingDecoration(model, pr.range);
      if (decId == null) continue;
      const decRange = model.getDecorationRange(decId);
      if (!decRange) continue;
      if (
        decRange.startLineNumber === pr.range.startLine &&
        decRange.startColumn === pr.range.startCol &&
        decRange.endLineNumber === pr.range.endLine &&
        decRange.endColumn === pr.range.endCol
      ) {
        continue;
      }
      const pRange = new monacoInstance.Range(
        pr.range.startLine,
        pr.range.startCol,
        pr.range.endLine,
        pr.range.endCol,
      );
      const parsedText = model.getValueInRange(pRange);
      const storedReal = decorationToRealRef.current.get(decId) ?? "";
      const isExpanded = expanded.has(decId);
      let newReal: string;
      if (isExpanded) {
        // Model holds the live value — trust it.
        newReal = parsedText;
      } else if (storedReal.length === parsedText.length) {
        newReal = storedReal;
      } else if (storedReal.length > parsedText.length) {
        // Trim trailing overflow (typical case: an inserted `\n`).
        newReal = storedReal.slice(0, parsedText.length);
      } else {
        // Stored is shorter than parsed: fall back to model text.
        newReal = parsedText;
      }
      rangeSyncUpdates.push({ decId, newRange: pRange, newReal });
    }
    if (rangeSyncUpdates.length > 0) {
      model.changeDecorations((accessor: unknown) => {
        const a = accessor as {
          changeDecoration: (
            id: string,
            newRange: ReturnType<typeof monacoInstance.Range>,
          ) => void;
        };
        for (const { decId, newRange } of rangeSyncUpdates) {
          a.changeDecoration(decId, newRange);
        }
      });
      for (const { decId, newReal } of rangeSyncUpdates) {
        decorationToRealRef.current.set(decId, newReal);
      }
    }

    const decHasParsedOverlap = (r: {
      startLineNumber: number;
      endLineNumber: number;
    }): boolean => {
      for (const pr of parsed) {
        if (r.startLineNumber > pr.range.endLine) continue;
        if (r.endLineNumber < pr.range.startLine) continue;
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
        r.startLineNumber === r.endLineNumber && r.startColumn === r.endColumn;
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

    snapshotDecorationOffsets();
  }, [
    applyGroupZones,
    findOverlappingTrackingDecoration,
    getExpandedIds,
    recomputeCaretReveals,
    refreshMaskDecorations,
    snapshotDecorationOffsets,
    withInternalEdit,
  ]);

  const revealDecoration = useCallback(
    (decId: string) => {
      // tight / yolo never hover-reveal.
      if (revealOnRef.current !== "hover") return;
      if (hoverRevealedDecIdRef.current === decId) return;
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
    ],
  );

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
    [],
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

  const buildRealText = useCallback((): string => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    const model = editor?.getModel();
    if (!model || !monacoInstance) return "";
    return assembleRealText(
      model,
      decorationToRealRef.current,
      getExpandedIds(),
      monacoInstance,
    );
  }, [getExpandedIds]);

  const handleEditorChange = useCallback(() => {
    if (internalEditDepthRef.current > 0) return;
    let out = buildRealText();
    out = out.replace(/\n*$/, "") + "\n";
    lastEmittedValueRef.current = out;
    onChangeRef.current(out);
  }, [buildRealText]);

  const handleYoloChange = useCallback(() => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!model) return;
    let out = model.getValue();
    out = out.replace(/\n*$/, "") + "\n";
    lastEmittedValueRef.current = out;
    onChangeRef.current(out);
  }, []);

  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      if (revealOn === "always") {
        // yolo: plain text editor. No masking, no decorations, no listeners
        // beyond forwarding content changes to the parent.
        editor.onDidChangeModelContent(() => {
          handleYoloChange();
        });
        return;
      }

      const initial = pendingInitialMaskRef.current;
      pendingInitialMaskRef.current = null;
      if (initial && initial.entries.length > 0) {
        const decs = initial.entries.map((entry) => ({
          range: new monaco.Range(
            entry.range.startLine,
            entry.range.startCol,
            entry.range.endLine,
            entry.range.endCol,
          ),
          options: {
            stickiness:
              monaco.editor.TrackedRangeStickiness
                ?.AlwaysGrowsWhenTypingAtEdges ?? 0,
          },
        }));
        const ids = editor.deltaDecorations([], decs);
        for (let i = 0; i < ids.length; i++) {
          trackingDecorationIdsRef.current.add(ids[i]);
          decorationToRealRef.current.set(ids[i], initial.entries[i].original);
        }
        editor.getModel()?.pushStackElement();
      }

      const model = editor.getModel();
      if (model) {
        const groups = getValueGroups(model, getValueRanges(model));
        applyGroupZones(groups);
      }
      refreshMaskDecorations();

      snapshotDecorationOffsets();

      editor.onDidChangeModelContent(
        (e: {
          changes?: Array<{
            rangeOffset: number;
            rangeLength: number;
            text: string;
          }>;
        }) => {
          if (internalEditDepthRef.current > 0) return;
          const m = editor.getModel();
          if (m && e?.changes) {
            applyTypingChangesToReal(m, e.changes);
          }
          applySecretDecorations();
          handleEditorChange();
        },
      );

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
        // `tight` keeps the tooltip ("Click to copy") but never reveals.
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
        withInternalEdit(() => {
          editor.executeEdits("clipboard-cut", [
            { range: sel, text: "", forceMoveMarkers: true },
          ]);
        });
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
      applyTypingChangesToReal,
      buildRealText,
      copyGroup,
      findDecorationAtPosition,
      findDecorationOnLine,
      flashCopiedDecorations,
      flashTooltipCopied,
      handleEditorChange,
      handleYoloChange,
      hideTooltip,
      recomputeCaretReveals,
      refreshMaskDecorations,
      revealDecoration,
      revealOn,
      showTooltipAtDecoration,
      snapshotDecorationOffsets,
      withInternalEdit,
    ],
  );

  // External `value` prop changes. If parent is just echoing what we sent,
  // do nothing. Otherwise tear down + re-mask wholesale.
  useEffect(() => {
    if (value === lastParentValueRef.current) return;
    if (value === lastEmittedValueRef.current) {
      lastParentValueRef.current = value;
      return;
    }
    lastParentValueRef.current = value;
    lastEmittedValueRef.current = value;

    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;

    if (revealOn === "always") {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;
      if (model.getValue() === value) return;
      withInternalEdit(() => {
        const fullRange = model.getFullModelRange();
        editor.executeEdits("external-value-reset", [
          { range: fullRange, text: value, forceMoveMarkers: true },
        ]);
        if (model.getValue() !== value) {
          model.setValue(value);
        }
        model.pushStackElement();
      });
      return;
    }

    if (!editor || !monacoInstance) {
      const result = maskText(value);
      pendingInitialMaskRef.current = result;
      return;
    }

    const model = editor.getModel();
    if (!model) return;

    hoverRevealedDecIdRef.current = null;
    caretRevealedDecIdsRef.current = new Set();

    const oldIds = Array.from(trackingDecorationIdsRef.current);
    if (oldIds.length > 0) {
      editor.deltaDecorations(oldIds, []);
    }
    trackingDecorationIdsRef.current.clear();
    decorationToRealRef.current.clear();

    const result = maskText(value);

    withInternalEdit(() => {
      const fullRange = model.getFullModelRange();
      editor.executeEdits("external-value-reset", [
        { range: fullRange, text: result.masked, forceMoveMarkers: true },
      ]);
      if (model.getValue() !== result.masked) {
        model.setValue(result.masked);
      }

      if (result.entries.length > 0) {
        const decs = result.entries.map((entry) => ({
          range: new monacoInstance.Range(
            entry.range.startLine,
            entry.range.startCol,
            entry.range.endLine,
            entry.range.endCol,
          ),
          options: {
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                ?.AlwaysGrowsWhenTypingAtEdges ?? 0,
          },
        }));
        const ids = editor.deltaDecorations([], decs);
        for (let i = 0; i < ids.length; i++) {
          trackingDecorationIdsRef.current.add(ids[i]);
          decorationToRealRef.current.set(ids[i], result.entries[i].original);
        }
      }

      model.pushStackElement();
    });

    refreshMaskDecorations();
    const groups = getValueGroups(model, getValueRanges(model));
    applyGroupZones(groups);
  }, [
    value,
    revealOn,
    applyGroupZones,
    refreshMaskDecorations,
    withInternalEdit,
  ]);

  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      clearGroupZones();
    };
  }, [clearGroupZones]);

  return { maskedInitialValue, handleEditorMount };
}
