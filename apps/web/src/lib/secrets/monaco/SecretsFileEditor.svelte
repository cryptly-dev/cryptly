<script lang="ts">
  import { onMount } from 'svelte';
  import loader from '@monaco-editor/loader';
  import type { ProjectRevealOn } from '$lib/auth/domain/project-settings';
  import { registerDotenvLanguage } from './dotenv-language';
  import { injectMaskingCSS } from './masking-css';
  import { createSecretMasking } from './secretMasking';

  let {
    value,
    onChange,
    revealOn,
    height = '55vh',
    fontSize = 14,
    padding = { top: 16, bottom: 80 },
    lineNumbersMinChars = undefined,
    readOnly = false
  }: {
    value: string;
    onChange: (v: string) => void;
    revealOn: ProjectRevealOn;
    height?: string;
    fontSize?: number;
    padding?: { top: number; bottom: number };
    lineNumbersMinChars?: number;
    readOnly?: boolean;
  } = $props();

  let host = $state<HTMLDivElement | null>(null);
  let masking = $state<ReturnType<typeof createSecretMasking> | null>(null);
  let editorInstance: any = null;

  onMount(() => {
    injectMaskingCSS();
    let cancelled = false;

    void (async () => {
      const monaco = await loader.init();
      if (cancelled || !host) {
        return;
      }

      registerDotenvLanguage(monaco);

      const m = createSecretMasking({ value, onChange, revealOn });
      masking = m;

      editorInstance = monaco.editor.create(host, {
        value: m.maskedInitialValue,
        language: 'dotenv',
        theme: 'dotenvTheme',
        minimap: { enabled: false },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        fontSize,
        automaticLayout: true,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        occurrencesHighlight: 'off',
        selectionHighlight: false,
        renderLineHighlight: 'none',
        links: false,
        padding,
        readOnly,
        readOnlyMessage: { value: 'Read-only access' },
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: 'off',
        parameterHints: { enabled: false },
        tabCompletion: 'off',
        snippetSuggestions: 'none',
        ...(lineNumbersMinChars != null ? { lineNumbersMinChars } : {})
      });

      m.handleEditorMount(editorInstance, monaco);
      m.syncExternalValue(value, revealOn);
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
    masking?.syncExternalValue(value, revealOn);
  });
</script>

<div bind:this={host} class="ph-no-capture w-full overflow-hidden rounded-md border border-border" style:height></div>
