<script lang="ts">
  import { onMount } from 'svelte';
  import loader from '@monaco-editor/loader';

  type RevealOn = 'always' | 'hover' | 'never';

  let {
    value,
    revealedValue = value,
    revealOn = 'always'
  }: { value: string; revealedValue?: string; revealOn?: RevealOn } = $props();

  let host = $state<HTMLDivElement | null>(null);
  let editorInstance: any = null;
  let model: any = null;
  let activeRevealRangeIndex = $state<number | null>(null);

  let registered = false;
  const BULLET = '•';

  interface BulletRange {
    line: number;
    startCol: number;
    endCol: number;
  }

  interface MaskedSecretRange {
    line: number;
    startCol: number;
    endCol: number;
    startOffset: number;
    endOffset: number;
    hitRanges: BulletRange[];
  }

  function lineStartOffsets(lines: string[]): number[] {
    const offsets: number[] = [];
    let offset = 0;
    for (const line of lines) {
      offsets.push(offset);
      offset += line.length + 1;
    }
    return offsets;
  }

  function maskedSecretRangesFromValue(text: string): MaskedSecretRange[] {
    const ranges: MaskedSecretRange[] = [];
    const lines = text.split('\n');
    const offsets = lineStartOffsets(lines);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex]!;
      let colIndex = 0;
      while (colIndex < line.length) {
        if (line[colIndex] !== BULLET) {
          colIndex += 1;
          continue;
        }

        const start = colIndex;
        const hitRanges: BulletRange[] = [];
        let end = colIndex + 1;
        while (colIndex < line.length && (line[colIndex] === BULLET || line[colIndex] === ' ' || line[colIndex] === '\t')) {
          if (line[colIndex] === BULLET) {
            const hitStart = colIndex;
            while (colIndex < line.length && line[colIndex] === BULLET) {
              colIndex += 1;
            }
            hitRanges.push({
              line: lineIndex + 1,
              startCol: hitStart + 1,
              endCol: colIndex + 1
            });
            end = colIndex;
            continue;
          }
          colIndex += 1;
        }

        ranges.push({
          line: lineIndex + 1,
          startCol: start + 1,
          endCol: end + 1,
          startOffset: offsets[lineIndex]! + start,
          endOffset: offsets[lineIndex]! + end,
          hitRanges
        });
      }
    }
    return ranges;
  }

  const maskedSecretRanges = $derived(maskedSecretRangesFromValue(value));

  function visibleValue() {
    if (revealOn === 'always') return revealedValue;
    if (revealOn === 'hover' && activeRevealRangeIndex !== null) {
      const range = maskedSecretRanges[activeRevealRangeIndex];
      if (!range) return value;
      return `${value.slice(0, range.startOffset)}${revealedValue.slice(range.startOffset, range.endOffset)}${value.slice(range.endOffset)}`;
    }
    return value;
  }

  function syncModelValue() {
    if (!model) return;
    const nextValue = visibleValue();
    if (model.getValue() !== nextValue) {
      model.setValue(nextValue);
    }
  }

  function revealRangeIndexAtPosition(position: { lineNumber: number; column: number } | null | undefined) {
    if (!position) return null;
    const index = maskedSecretRanges.findIndex((range) =>
      range.hitRanges.some(
        (hitRange) =>
          hitRange.line === position.lineNumber &&
          position.column >= hitRange.startCol &&
          position.column < hitRange.endCol
      )
    );
    return index === -1 ? null : index;
  }

  function setActiveRevealRangeIndex(nextIndex: number | null) {
    if (activeRevealRangeIndex === nextIndex) return;
    activeRevealRangeIndex = nextIndex;
    syncModelValue();
  }

  function isPositionInsideActiveRevealRange(position: { lineNumber: number; column: number } | null | undefined) {
    if (!position || activeRevealRangeIndex === null) return false;
    const range = maskedSecretRanges[activeRevealRangeIndex];
    return Boolean(
      range &&
        range.line === position.lineNumber &&
        position.column >= range.startCol &&
        position.column < range.endCol
    );
  }

  function registerDiffLanguage(monaco: any) {
    if (registered) return;
    registered = true;

    monaco.languages.register({ id: 'diff' });
    monaco.languages.setMonarchTokensProvider('diff', {
      tokenizer: {
        root: [
          [/^\+(?!\+\+).*$/, 'addition'],
          [/^-(?!--).*$/, 'deletion'],
          [/^(@@).*?(@@)/, 'range'],
          [/^#.*$/, 'comment'],
          [/^.*$/, 'context']
        ]
      }
    });

    monaco.editor.defineTheme('diffTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'addition', foreground: '4ade80', background: '052e16' },
        { token: 'deletion', foreground: 'f87171', background: '450a0a' },
        { token: 'range', foreground: '60a5fa', fontStyle: 'bold' },
        { token: 'context', foreground: 'a3a3a3' },
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' }
      ],
      colors: {
        'editor.background': '#000000',
        'editor.lineHighlightBackground': '#0a0a0a',
        'editorLineNumber.foreground': '#525252',
        'editorLineNumber.activeForeground': '#a3a3a3',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#1a3a5a',
        focusBorder: '#00000000'
      }
    });
  }

  onMount(() => {
    let cancelled = false;

    void (async () => {
      const monaco = await loader.init();
      if (cancelled || !host) return;

      registerDiffLanguage(monaco);
      model = monaco.editor.createModel(visibleValue(), 'diff');
      editorInstance = monaco.editor.create(host, {
        model,
        language: 'diff',
        theme: 'diffTheme',
        readOnly: true,
        domReadOnly: true,
        minimap: { enabled: false },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        fontSize: 14,
        automaticLayout: true,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        occurrencesHighlight: 'off',
        selectionHighlight: false,
        renderLineHighlight: 'none',
        contextmenu: false,
        cursorStyle: 'line-thin',
        cursorBlinking: 'solid',
        padding: { top: 16, bottom: 8 }
      });

      const dom = editorInstance.getDomNode();
      if (dom) {
        dom.style.userSelect = 'none';
        dom.style.webkitUserSelect = 'none';
      }
      host.addEventListener('pointermove', (event) => {
        if (revealOn !== 'hover') {
          setActiveRevealRangeIndex(null);
          return;
        }
        const target = editorInstance?.getTargetAtClientPoint?.(event.clientX, event.clientY);
        const nextIndex =
          isPositionInsideActiveRevealRange(target?.position)
            ? activeRevealRangeIndex
            : revealRangeIndexAtPosition(target?.position);
        setActiveRevealRangeIndex(nextIndex);
      });
      host.addEventListener('pointerleave', () => {
        setActiveRevealRangeIndex(null);
      });
      editorInstance.onDidFocusEditorText(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      editorInstance.onDidFocusEditorWidget(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    })();

    return () => {
      cancelled = true;
      editorInstance?.dispose();
      model?.dispose();
      editorInstance = null;
      model = null;
    };
  });

  $effect(() => {
    syncModelValue();
  });
</script>

<div bind:this={host} class="ph-no-capture diff-editor-readonly h-full w-full"></div>
