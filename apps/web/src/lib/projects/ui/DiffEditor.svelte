<script lang="ts">
  import { onMount } from "svelte";
  import type * as Monaco from "monaco-editor";

  /**
   * Read-only line diff (`+`/`-`/` ` prefixed lines) whose values are already shown per the
   * project's Values setting (`envDiff`). Colors come from the design tokens through scoped CSS,
   * not a Monaco theme: Monaco has one global theme, shared with the Secrets editor that stays
   * mounted on other tabs.
   */
  let { value }: { value: string } = $props();

  let host = $state<HTMLDivElement | null>(null);
  let monacoApi: typeof Monaco | null = null;
  let editorInstance: Monaco.editor.IStandaloneCodeEditor | null = null;
  let model: Monaco.editor.ITextModel | null = null;
  let decorations: Monaco.editor.IEditorDecorationsCollection | null = null;

  /** Tone each line by its diff prefix and dim the masks. */
  function decorate(text: string) {
    if (!monacoApi || !decorations) return;
    const { Range } = monacoApi;
    const items: Monaco.editor.IModelDeltaDecoration[] = [];
    text.split("\n").forEach((line, index) => {
      const n = index + 1;
      const kind = line[0] === "+" ? "add" : line[0] === "-" ? "del" : "ctx";
      items.push({
        range: new Range(n, 1, n, line.length + 1),
        options: {
          isWholeLine: true,
          className: `cr-line-${kind}`,
          marginClassName: `cr-line-${kind}`,
          inlineClassName: `cr-text-${kind}`,
        },
      });
      for (const run of line.matchAll(/•+/g)) {
        items.push({
          range: new Range(n, run.index + 1, n, run.index + run[0].length + 1),
          options: { inlineClassName: "cr-text-mask" },
        });
      }
    });
    decorations.set(items);
  }

  function sync(text: string) {
    if (!model || model.getValue() === text) return;
    model.setValue(text);
    decorate(text);
    editorInstance?.setScrollTop(0);
  }

  onMount(() => {
    let cancelled = false;

    void (async () => {
      const { default: monaco } = await import("$lib/secrets/monaco/monaco");
      if (cancelled || !host) return;

      monacoApi = monaco;
      model = monaco.editor.createModel(value, "plaintext");
      editorInstance = monaco.editor.create(host, {
        model,
        readOnly: true,
        domReadOnly: true,
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        lineNumbers: "off",
        guides: { indentation: false },
        renderWhitespace: "none",
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 4,
        fontFamily: "'Geist Mono Variable', ui-monospace, monospace",
        fontSize: 12.5,
        lineHeight: 20,
        fontLigatures: false,
        automaticLayout: true,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        occurrencesHighlight: "off",
        selectionHighlight: false,
        renderLineHighlight: "none",
        contextmenu: false,
        cursorStyle: "line-thin",
        cursorBlinking: "solid",
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
        padding: { top: 6, bottom: 6 },
      });
      decorations = editorInstance.createDecorationsCollection();
      decorate(value);
      void document.fonts.ready.then(() => monaco.editor.remeasureFonts());

      const dom = editorInstance.getDomNode();
      if (dom) {
        dom.style.userSelect = "none";
        dom.style.webkitUserSelect = "none";
      }
      const blur = () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      };
      editorInstance.onDidFocusEditorText(blur);
      editorInstance.onDidFocusEditorWidget(blur);
    })();

    return () => {
      cancelled = true;
      decorations?.clear();
      editorInstance?.dispose();
      model?.dispose();
      editorInstance = null;
      model = null;
      decorations = null;
    };
  });

  $effect(() => {
    sync(value);
  });
</script>

<div bind:this={host} class="ph-no-capture cr-diff h-full w-full"></div>

<style>
  .cr-diff :global(.monaco-editor) {
    --vscode-editor-background: var(--s100);
    --vscode-editorGutter-background: var(--s100);
    --vscode-editor-foreground: var(--fg2);
    --vscode-editorCursor-foreground: transparent;
    --vscode-editor-selectionBackground: color-mix(
      in oklab,
      var(--fg) 14%,
      transparent
    );
    --vscode-editor-inactiveSelectionBackground: color-mix(
      in oklab,
      var(--fg) 10%,
      transparent
    );
    --vscode-scrollbarSlider-background: color-mix(
      in oklab,
      var(--fg) 12%,
      transparent
    );
    --vscode-scrollbarSlider-hoverBackground: color-mix(
      in oklab,
      var(--fg) 20%,
      transparent
    );
    --vscode-scrollbarSlider-activeBackground: color-mix(
      in oklab,
      var(--fg) 28%,
      transparent
    );
    --vscode-focusBorder: transparent;
    outline: none;
  }
  .cr-diff :global(.cr-line-add) {
    background: color-mix(in oklab, var(--success) 9%, transparent);
  }
  .cr-diff :global(.cr-line-del) {
    background: color-mix(in oklab, var(--danger) 9%, transparent);
  }
  .cr-diff :global(.cr-text-add) {
    color: color-mix(in oklab, var(--success) 70%, var(--fg));
  }
  .cr-diff :global(.cr-text-del) {
    color: color-mix(in oklab, var(--danger) 70%, var(--fg));
  }
  .cr-diff :global(.cr-text-ctx) {
    color: var(--fg3);
  }
  .cr-diff :global(.cr-text-mask) {
    color: var(--faint);
  }
</style>
