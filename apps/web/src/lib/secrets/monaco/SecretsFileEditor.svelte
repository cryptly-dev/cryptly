<script lang="ts">
  import { onMount } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import type { ProjectRevealOn } from "$lib/auth/domain/project-settings";
  import { appearance } from "$lib/appearance/appearance.svelte";
  import { registerDotenvLanguage } from "./dotenv-language";
  import { injectMaskingCSS } from "./masking-css";
  import { createSecretMasking } from "./secretMasking";
  import { applyEditorTheme } from "./theme";

  let {
    value,
    onChange,
    revealOn,
    readOnly = false,
  }: {
    value: string;
    onChange: (v: string) => void;
    revealOn: ProjectRevealOn;
    readOnly?: boolean;
  } = $props();

  const FONT = '"Geist Mono Variable", ui-monospace, monospace';
  // 16px on phones keeps iOS from zooming into the editor.
  const mobile = new MediaQuery("(max-width: 767px)");

  let host = $state<HTMLDivElement | null>(null);
  let monacoApi = $state<typeof import("monaco-editor") | null>(null);
  let masking = $state<ReturnType<typeof createSecretMasking> | null>(null);
  let editorInstance:
    | import("monaco-editor").editor.IStandaloneCodeEditor
    | null = null;

  onMount(() => {
    injectMaskingCSS();
    let cancelled = false;

    void (async () => {
      const [{ default: monaco }] = await Promise.all([
        import("$lib/secrets/monaco/monaco"),
        // Monaco measures glyphs once; measure with Geist Mono, not the fallback.
        document.fonts.load(`12.5px ${FONT}`).catch(() => []),
      ]);
      if (cancelled || !host) return;

      registerDotenvLanguage(monaco);
      applyEditorTheme(monaco, appearance.resolved === "dark");

      const m = createSecretMasking({ value, onChange, revealOn });
      masking = m;

      editorInstance = monaco.editor.create(host, {
        value: m.maskedInitialValue,
        language: "dotenv",
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 12,
        glyphMargin: false,
        folding: false,
        fontFamily: FONT,
        fontLigatures: false,
        fontSize: mobile.current ? 16 : 12.5,
        lineHeight: mobile.current ? 24 : 20,
        automaticLayout: true,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        occurrencesHighlight: "off",
        selectionHighlight: false,
        renderLineHighlight: "none",
        links: false,
        padding: { top: 8, bottom: 8 },
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        readOnly,
        readOnlyMessage: { value: "Read-only access" },
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: "off",
        parameterHints: { enabled: false },
        tabCompletion: "off",
        snippetSuggestions: "none",
      });

      m.handleEditorMount(editorInstance, monaco);
      monacoApi = monaco;
    })();

    return () => {
      cancelled = true;
      masking?.dispose();
      masking = null;
      editorInstance?.dispose();
      editorInstance = null;
    };
  });

  $effect(() => {
    masking?.setOnChange(onChange);
  });

  $effect(() => {
    // Re-read the tokens whenever the theme or grey preset changes.
    const dark = appearance.resolved === "dark";
    void appearance.greys;
    if (monacoApi) applyEditorTheme(monacoApi, dark);
  });

  $effect(() => {
    if (!monacoApi) return;
    editorInstance?.updateOptions({
      readOnly,
      fontSize: mobile.current ? 16 : 12.5,
      lineHeight: mobile.current ? 24 : 20,
    });
  });

  $effect(() => {
    masking?.syncExternalValue(value);
  });
</script>

<div bind:this={host} class="ph-no-capture h-full w-full overflow-hidden"></div>
