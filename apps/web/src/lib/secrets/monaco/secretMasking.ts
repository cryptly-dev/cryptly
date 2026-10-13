import type * as Monaco from "monaco-editor";
import { toast } from "svelte-sonner";
import type { ProjectRevealOn } from "$lib/auth/domain/project-settings";
import { parseEnv, peek, type EnvDoc } from "$lib/secrets/env-doc";

/**
 * Masking for the .env editor. A masked value is not in the Monaco model at all: its line ends
 * right after `KEY=` and a zero-width tracking decoration ("anchor") marks where the value
 * goes, with a fixed mask injected there (the peek, or 8 bullets in Hidden mode). The page
 * therefore never holds a masked value, its length or its line count. Revealing (caret or
 * hover in Peek mode, or typing a new value) puts the text back into the model.
 *
 * The editor stands for `real`, the plain text: the model with every hidden value put back.
 * Undo/redo work on `real` snapshots, because the model is rewritten as values hide and show.
 */

type Editor = Monaco.editor.IStandaloneCodeEditor;
type Model = Monaco.editor.ITextModel;
/** The runtime model has `changeDecorations`; the public typings omit it. */
type DecoratableModel = Model & {
  changeDecorations(
    fn: (accessor: {
      changeDecoration(id: string, range: Monaco.IRange): void;
    }) => void,
  ): void;
};

const TOOLTIP = "Click to copy";
const HIDDEN_HINT =
  "Values are hidden in this project. Edit them in the table view.";

interface Span {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

/** A value and whatever follows it on its last line (`"…" # note`), in 1-based coordinates. */
function valueSpan(doc: EnvDoc, index: number): Span | null {
  const s = doc.secrets[index];
  if (!`${s.raw}${s.tail}`.trim()) return null;
  return {
    startLineNumber: s.start + 1,
    startColumn: s.valueCol + 1,
    endLineNumber: s.end + 1,
    endColumn: doc.lines[s.end].length + 1,
  };
}

/** `text` with every value removed, plus where each one was and what it was. */
function hideAll(text: string) {
  const doc = parseEnv(text);
  const lines: string[] = [];
  const slots: { line: number; column: number; text: string }[] = [];
  const at = new Map(doc.secrets.map((s, i) => [s.start, i]));
  for (let i = 0; i < doc.lines.length; i++) {
    const index = at.get(i);
    const span = index === undefined ? null : valueSpan(doc, index);
    if (index === undefined || !span) {
      lines.push(doc.lines[i]);
      continue;
    }
    const s = doc.secrets[index];
    const first = doc.lines[i];
    lines.push(first.slice(0, s.valueCol));
    slots.push({
      line: lines.length,
      column: s.valueCol + 1,
      text: [
        first.slice(s.valueCol),
        ...doc.lines.slice(i + 1, s.end + 1),
      ].join(doc.eol),
    });
    i = s.end;
  }
  return { masked: lines.join(doc.eol), slots, eol: doc.eol };
}

/** The value as the app uses it (quotes stripped, escapes resolved). */
function decode(valueText: string): string {
  return parseEnv(`K=${valueText}`).secrets[0]?.value ?? "";
}

function touches(sel: Monaco.Selection, r: Span): boolean {
  const before =
    sel.startLineNumber < r.endLineNumber ||
    (sel.startLineNumber === r.endLineNumber && sel.startColumn <= r.endColumn);
  const after =
    sel.endLineNumber > r.startLineNumber ||
    (sel.endLineNumber === r.startLineNumber && sel.endColumn >= r.startColumn);
  return before && after;
}

export function createSecretMasking({
  value,
  onChange,
  revealOn,
}: {
  value: string;
  onChange: (value: string) => void;
  revealOn: ProjectRevealOn;
}) {
  const plain = revealOn === "always";
  // Peek mode shows a value while the caret is in it or the pointer is on its line.
  const reveals = revealOn === "hover";

  let editor: Editor | null = null;
  let monaco: typeof Monaco | null = null;
  let emit = onChange;
  let real = value;
  let lastEmitted = value;

  const tracked = new Set<string>();
  /** Text of each hidden value, by anchor decoration. */
  const hidden = new Map<string, string>();
  /** Values currently in the model (revealed or being typed). */
  const shown = new Set<string>();
  /** Values typed in this session: shown while the caret is in them, in every mode. */
  const fresh = new Set<string>();
  let hoverId: string | null = null;
  let internal = 0;
  let masks: Monaco.editor.IEditorDecorationsCollection | null = null;
  let flashes: Monaco.editor.IEditorDecorationsCollection | null = null;
  let tooltip: HTMLDivElement | null = null;
  let tooltipTimer: number | null = null;
  let zoneIds: string[] = [];
  const zones = new Map<string, { text: () => string; pill: HTMLElement }>();
  /** Anchor offsets before the next user edit, to tell deleted values apart. */
  let anchorsBefore = new Map<string, { offset: number; lineStart: number }>();
  let past: string[] = [];
  let future: string[] = [];
  let lastEditAt = 0;
  const disposers: (() => void)[] = [];

  const maskedInitialValue = plain ? value : hideAll(value).masked;

  const model = () => editor?.getModel() ?? null;
  const rangeOf = (id: string) => model()?.getDecorationRange(id) ?? null;
  const isEmpty = (r: Span) =>
    r.startLineNumber === r.endLineNumber && r.startColumn === r.endColumn;

  function quietly(fn: () => void) {
    internal++;
    try {
      fn();
    } finally {
      internal--;
    }
  }

  function setRange(id: string, range: Span) {
    (model() as DecoratableModel | null)?.changeDecorations((a) =>
      a.changeDecoration(id, range),
    );
  }

  function track(range: Span): string {
    const [id] = editor!.deltaDecorations(
      [],
      [
        {
          range,
          options: {
            stickiness:
              monaco!.editor.TrackedRangeStickiness
                .AlwaysGrowsWhenTypingAtEdges,
          },
        },
      ],
    );
    tracked.add(id);
    return id;
  }

  function untrack(id: string) {
    editor?.deltaDecorations([id], []);
    tracked.delete(id);
    hidden.delete(id);
    shown.delete(id);
    fresh.delete(id);
    if (hoverId === id) hoverId = null;
  }

  /** The plain text: the model with every hidden value put back. */
  function assemble(from?: Span): string {
    const m = model();
    if (!m) return real;
    const start = from
      ? m.getOffsetAt({
          lineNumber: from.startLineNumber,
          column: from.startColumn,
        })
      : 0;
    const end = from
      ? m.getOffsetAt({
          lineNumber: from.endLineNumber,
          column: from.endColumn,
        })
      : m.getValueLength();
    let text = m.getValue().slice(start, end);
    const inside: { offset: number; text: string }[] = [];
    for (const [id, t] of hidden) {
      const r = rangeOf(id);
      const offset = r ? m.getOffsetAt(r.getStartPosition()) - start : -1;
      if (offset >= 0 && offset <= end - start)
        inside.push({ offset, text: t });
    }
    // Back to front, so earlier offsets stay valid.
    for (const x of inside.sort((a, b) => b.offset - a.offset))
      text = text.slice(0, x.offset) + x.text + text.slice(x.offset);
    return text;
  }

  /** Puts a hidden value back into the model. */
  function show(id: string) {
    const m = model();
    const r = rangeOf(id);
    const text = hidden.get(id);
    if (!m || !r || text === undefined) return;
    const pos = r.getStartPosition();
    quietly(() =>
      m.applyEdits([
        {
          range: monaco!.Range.fromPositions(pos),
          text,
          forceMoveMarkers: false,
        },
      ]),
    );
    const end = m.getPositionAt(m.getOffsetAt(pos) + text.length);
    setRange(id, monaco!.Range.fromPositions(pos, end));
    hidden.delete(id);
    shown.add(id);
  }

  /** Takes a value out of the model again, re-reading where it starts and ends. */
  function hide(id: string) {
    const m = model();
    const r = rangeOf(id);
    if (!m || !r) return untrack(id);
    const doc = parseEnv(m.getValue());
    const index = doc.secrets.findIndex(
      (s) => s.start + 1 === r.startLineNumber,
    );
    const span = index < 0 ? null : valueSpan(doc, index);
    // No longer a value (e.g. its `=` was deleted): the text stays as typed.
    if (!span) return untrack(id);
    const text = m.getValueInRange(span);
    quietly(() => m.applyEdits([{ range: span, text: "" }]));
    setRange(
      id,
      monaco!.Range.fromPositions({
        lineNumber: span.startLineNumber,
        column: span.startColumn,
      }),
    );
    hidden.set(id, text);
    shown.delete(id);
    fresh.delete(id);
  }

  function refreshMasks() {
    if (!editor || !monaco) return;
    const decorations: Monaco.editor.IModelDeltaDecoration[] = [];
    for (const [id, text] of hidden) {
      const r = rangeOf(id);
      if (!r) continue;
      const p = reveals ? peek(decode(text)) : null;
      decorations.push({
        range: monaco.Range.fromPositions(r.getStartPosition()),
        options: {
          showIfCollapsed: true,
          before: {
            content: p ? `${p.head}••••••${p.tail}` : "••••••••",
            inlineClassName: `secret-mask secret-mask-${p?.head.length ?? 0}`,
            cursorStops: monaco.editor.InjectedTextCursorStops.Left,
          },
        },
      });
    }
    if (!masks) masks = editor.createDecorationsCollection(decorations);
    else masks.set(decorations);
  }

  /** Shows exactly the values the caret is in (and the hovered one), hides the rest. */
  function syncShown() {
    if (!editor) return;
    const selections = editor.getSelections() ?? [];
    const want = new Set<string>();
    for (const id of tracked) {
      if (!reveals && !fresh.has(id)) continue;
      const r = rangeOf(id);
      if (r && selections.some((sel) => touches(sel, r))) want.add(id);
    }
    if (reveals && hoverId && tracked.has(hoverId)) want.add(hoverId);
    for (const id of [...shown]) if (!want.has(id)) hide(id);
    for (const id of want) if (!shown.has(id)) show(id);
    refreshMasks();
    snapshotAnchors();
  }

  function snapshotAnchors() {
    const m = model();
    anchorsBefore = new Map();
    if (!m) return;
    for (const id of hidden.keys()) {
      const r = rangeOf(id);
      if (!r) continue;
      anchorsBefore.set(id, {
        offset: m.getOffsetAt(r.getStartPosition()),
        lineStart: m.getOffsetAt({ lineNumber: r.startLineNumber, column: 1 }),
      });
    }
  }

  /** Shows `text` from scratch: everything hidden, nothing shown. */
  function render(text: string) {
    const m = model();
    if (!editor || !monaco || !m) return;
    const view = editor.saveViewState();
    const { masked, slots, eol } = hideAll(text);
    for (const id of [...tracked]) untrack(id);
    quietly(() => {
      m.setValue(masked);
      m.setEOL(
        eol === "\r\n"
          ? monaco!.editor.EndOfLineSequence.CRLF
          : monaco!.editor.EndOfLineSequence.LF,
      );
    });
    for (const slot of slots) {
      const id = track(
        monaco.Range.fromPositions({
          lineNumber: slot.line,
          column: slot.column,
        }),
      );
      hidden.set(id, slot.text);
    }
    real = text;
    if (view) editor.restoreViewState(view);
    syncShown();
    refreshZones();
  }

  /** After a user edit: drop deleted values, pick up typed ones, keep the rest in place. */
  function reconcile(
    changes: readonly Monaco.editor.IModelContentChange[],
  ): boolean {
    const m = model();
    if (!editor || !monaco || !m) return true;

    // A value goes away with its line: the edit covered its key and its anchor.
    for (const [id, a] of anchorsBefore) {
      if (!hidden.has(id)) continue;
      const deleted = changes.some(
        (c) =>
          c.rangeLength > 0 &&
          c.rangeOffset <= a.lineStart &&
          c.rangeOffset + c.rangeLength >= a.offset,
      );
      if (deleted) untrack(id);
    }

    // A hidden value is valid only at the very end of a `KEY=` line.
    let doc = parseEnv(m.getValue());
    for (const id of [...hidden.keys()]) {
      const r = rangeOf(id);
      if (!r) {
        untrack(id);
        continue;
      }
      const s = doc.secrets.find((x) => x.start + 1 === r.startLineNumber);
      const ok =
        s &&
        s.valueCol + 1 === r.startColumn &&
        r.startColumn === m.getLineMaxColumn(r.startLineNumber);
      if (ok) {
        if (!isEmpty(r))
          setRange(id, monaco.Range.fromPositions(r.getStartPosition()));
        continue;
      }
      // Text was typed or joined onto a hidden value. Peek mode reveals it in place; Hidden
      // mode never reveals, so the edit is undone.
      if (!reveals) return false;
      show(id);
      doc = parseEnv(m.getValue());
    }

    // Shown values follow their line; typed values start being tracked.
    const claimed = new Set<number>();
    for (const id of [...shown]) {
      const r = rangeOf(id);
      const index = r
        ? doc.secrets.findIndex((s) => s.start + 1 === r.startLineNumber)
        : -1;
      const span = index < 0 ? null : valueSpan(doc, index);
      if (!span || claimed.has(index)) {
        untrack(id);
        continue;
      }
      claimed.add(index);
      setRange(id, span);
    }
    const anchored = new Set(
      [...hidden.keys()].map((id) => rangeOf(id)?.startLineNumber),
    );
    doc.secrets.forEach((s, index) => {
      const span = valueSpan(doc, index);
      if (!span || claimed.has(index) || anchored.has(s.start + 1)) return;
      const id = track(span);
      shown.add(id);
      fresh.add(id);
    });

    syncShown();
    refreshZones();
    return true;
  }

  function commit(next: string) {
    if (next === real) return;
    const now = Date.now();
    if (now - lastEditAt > 600 || !past.length) past.push(real);
    if (past.length > 200) past.shift();
    future = [];
    lastEditAt = now;
    real = next;
    lastEmitted = next;
    emit(next);
  }

  function travel(from: string[], to: string[]) {
    const next = from.pop();
    if (next === undefined) return;
    to.push(real);
    render(next);
    lastEmitted = next;
    lastEditAt = 0;
    emit(next);
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = "none";
  }

  function showTooltip(id: string, text = TOOLTIP) {
    const r = rangeOf(id);
    const dom = editor?.getDomNode();
    if (!editor || !r || !dom) return;
    const pos = editor.getScrolledVisiblePosition(r.getStartPosition());
    if (!pos) return;
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "secret-tooltip";
      dom.appendChild(tooltip);
    }
    tooltip.textContent = text;
    tooltip.classList.toggle("copied", text !== TOOLTIP);
    tooltip.style.display = "";
    tooltip.style.transform = `translate3d(${pos.left}px, ${pos.top}px, 0) translateY(-100%) translateY(-6px)`;
  }

  function idOnLine(line: number): string | null {
    for (const id of tracked) {
      const r = rangeOf(id);
      if (r && line >= r.startLineNumber && line <= r.endLineNumber) return id;
    }
    return null;
  }

  function flash(range: Span) {
    if (!editor) return;
    const d = [{ range, options: { inlineClassName: "secret-copied" } }];
    if (!flashes) flashes = editor.createDecorationsCollection(d);
    else flashes.set(d);
    window.setTimeout(() => flashes?.clear(), 1500);
  }

  function copyValue(id: string) {
    const r = rangeOf(id);
    const m = model();
    if (!r || !m) return;
    const text = hidden.get(id) ?? m.getValueInRange(r);
    void navigator.clipboard?.writeText(decode(text)).catch(() => {});
    if (!isEmpty(r)) flash(r);
    showTooltip(id, "Copied!");
    if (tooltipTimer !== null) window.clearTimeout(tooltipTimer);
    tooltipTimer = window.setTimeout(() => {
      tooltipTimer = null;
      if (hoverId === id || idOnLine(r.startLineNumber) === id) showTooltip(id);
    }, 1200);
  }

  /** "Copy whole group" above every group with two or more values. */
  function refreshZones() {
    const m = model();
    if (!editor || !m) return;
    const groups = parseEnv(m.getValue()).groups.filter(
      (g) => g.secrets.length >= 2,
    );
    editor.changeViewZones((accessor) => {
      for (const id of zoneIds) accessor.removeZone(id);
      zoneIds = [];
      zones.clear();
      for (const g of groups) {
        const node = document.createElement("div");
        node.className = "secret-group-zone";
        const pill = document.createElement("span");
        pill.className = "secret-group-pill";
        pill.textContent = "Copy whole group";
        node.appendChild(pill);
        const id = accessor.addZone({
          afterLineNumber: g.start,
          heightInPx: 22,
          domNode: node,
          suppressMouseDown: true,
        });
        const span: Span = {
          startLineNumber: g.start + 1,
          startColumn: 1,
          endLineNumber: g.end + 1,
          endColumn: m.getLineMaxColumn(g.end + 1),
        };
        zoneIds.push(id);
        zones.set(id, {
          pill,
          text: () => {
            flash(span);
            return assemble(span);
          },
        });
      }
    });
  }

  function copyZone(id: string) {
    const zone = zones.get(id);
    if (!zone) return;
    void navigator.clipboard?.writeText(zone.text()).catch(() => {});
    zone.pill.classList.add("copied");
    zone.pill.textContent = "Copied!";
    window.setTimeout(() => {
      zone.pill.classList.remove("copied");
      zone.pill.textContent = "Copy whole group";
    }, 1200);
  }

  function handleEditorMount(e: Editor, m: typeof Monaco) {
    editor = e;
    monaco = m;
    if (plain) {
      const sub = e.onDidChangeModelContent(() => {
        if (internal) return;
        const next = e.getValue();
        lastEmitted = next;
        real = next;
        emit(next);
      });
      disposers.push(() => sub.dispose());
      return;
    }

    render(value);
    e.updateOptions({ emptySelectionClipboard: false, dragAndDrop: false });

    // The model is rewritten as values hide and show, so undo works on plain-text snapshots.
    const { KeyMod, KeyCode } = m;
    e.addCommand(KeyMod.CtrlCmd | KeyCode.KeyZ, () => travel(past, future));
    e.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyZ, () =>
      travel(future, past),
    );
    e.addCommand(KeyMod.CtrlCmd | KeyCode.KeyY, () => travel(future, past));

    const zoneOf = (t: Monaco.editor.IMouseTarget) =>
      t.type === m.editor.MouseTargetType.CONTENT_VIEW_ZONE
        ? t.detail.viewZoneId
        : undefined;

    const subs = [
      e.onDidChangeModelContent((event) => {
        if (internal) return;
        if (reconcile(event.changes)) {
          commit(assemble());
          return;
        }
        // Hidden mode: the edit touched a hidden value. Put the text back as it was.
        const before = real;
        queueMicrotask(() => render(before));
        toast(HIDDEN_HINT, { id: "secrets-hidden-edit" });
      }),
      e.onDidChangeCursorSelection(() => {
        if (!internal) syncShown();
      }),
      e.onMouseMove((event) => {
        const dom = e.getDomNode();
        const zone = zoneOf(event.target);
        if (zone) {
          dom?.classList.toggle("secret-group-zone-hover", zones.has(zone));
          hideTooltip();
          return;
        }
        dom?.classList.remove("secret-group-zone-hover");
        const line = event.target.position?.lineNumber;
        const id = line ? idOnLine(line) : null;
        if (!id) {
          hideTooltip();
          if (hoverId) {
            hoverId = null;
            syncShown();
          }
          return;
        }
        showTooltip(id);
        // Multi-line values reveal on click only: showing them would move the lines under
        // the pointer.
        const r = rangeOf(id);
        const oneLine =
          r?.startLineNumber === r?.endLineNumber &&
          !hidden.get(id)?.includes("\n");
        const next = reveals && oneLine ? id : null;
        if (hoverId !== next) {
          hoverId = next;
          syncShown();
        }
      }),
      e.onMouseLeave(() => {
        hideTooltip();
        e.getDomNode()?.classList.remove("secret-group-zone-hover");
        if (hoverId) {
          hoverId = null;
          syncShown();
        }
      }),
    ];

    let down: {
      line: number;
      column: number;
      at: number;
      zone?: string;
    } | null = null;
    subs.push(
      e.onMouseDown((event) => {
        const zone = zoneOf(event.target);
        const pos = event.target.position;
        down = zone
          ? { line: 0, column: 0, at: Date.now(), zone }
          : pos
            ? { line: pos.lineNumber, column: pos.column, at: Date.now() }
            : null;
      }),
      e.onMouseUp((event) => {
        const start = down;
        down = null;
        if (!start || Date.now() - start.at > 300) return;
        if (start.zone) {
          if (zoneOf(event.target) === start.zone) copyZone(start.zone);
          return;
        }
        const pos = event.target.position;
        if (
          !pos ||
          pos.lineNumber !== start.line ||
          pos.column !== start.column
        )
          return;
        const id = idOnLine(pos.lineNumber);
        const r = id ? rangeOf(id) : null;
        // Clicking the value (not its key) copies it.
        if (
          id &&
          r &&
          (pos.lineNumber > r.startLineNumber || pos.column >= r.startColumn)
        )
          copyValue(id);
      }),
    );
    disposers.push(() => subs.forEach((s) => s.dispose()));

    // Hidden values are not in the model, so copy and cut put them back in. Capture phase,
    // before Monaco's own handler on its textarea writes the model text.
    const dom = e.getDomNode();
    const onCopy = (event: ClipboardEvent, cut: boolean) => {
      const sel = e.getSelection();
      if (!sel || sel.isEmpty() || !event.clipboardData) return;
      event.clipboardData.setData("text/plain", assemble(sel));
      event.preventDefault();
      event.stopPropagation();
      if (cut && !e.getOption(m.editor.EditorOption.readOnly))
        e.executeEdits("cut", [{ range: sel, text: "" }]);
    };
    const copy = (event: ClipboardEvent) => onCopy(event, false);
    const cut = (event: ClipboardEvent) => onCopy(event, true);
    dom?.addEventListener("copy", copy, true);
    dom?.addEventListener("cut", cut, true);
    disposers.push(() => {
      dom?.removeEventListener("copy", copy, true);
      dom?.removeEventListener("cut", cut, true);
    });
  }

  function syncExternalValue(next: string) {
    if (next === lastEmitted || next === real) return;
    lastEmitted = next;
    if (plain) {
      const m = model();
      real = next;
      if (m && m.getValue() !== next) quietly(() => m.setValue(next));
      return;
    }
    past = [];
    future = [];
    render(next);
  }

  return {
    maskedInitialValue,
    handleEditorMount,
    syncExternalValue,
    setOnChange(next: (value: string) => void) {
      emit = next;
    },
    dispose() {
      disposers.forEach((d) => d());
      tooltip?.remove();
      tooltip = null;
      if (tooltipTimer !== null) window.clearTimeout(tooltipTimer);
    },
  };
}
