// Reveal-on reactivity: `BaseFileEditor` itself is a stable outer
// component that keys an internal stateful subtree on `revealOn`.
// When the setting changes, the entire inner subtree (Monaco editor + the
// `useSecretMasking` hook state) unmounts and remounts, guaranteeing a
// clean tear-down + re-initialization without any per-ref bookkeeping.
import Editor, { loader } from "@monaco-editor/react";
import { useEffect } from "react";
import type { ProjectRevealOn } from "@/lib/project-settings";
import { registerDotenvLanguage } from "./editor/dotenv-language";
import { injectMaskingCSS } from "./editor/masking-css";
import { useSecretMasking } from "./editor/useSecretMasking";

interface BaseFileEditorProps {
  value: string;
  onChange: (value: string) => void;
  revealOn: ProjectRevealOn;
  height?: string;
  fontSize?: number;
  padding?: { top: number; bottom: number };
  lineNumbersMinChars?: number;
  readOnly?: boolean;
}

export function BaseFileEditor(props: BaseFileEditorProps) {
  return <BaseFileEditorInner key={props.revealOn} {...props} />;
}

function BaseFileEditorInner({
  value,
  onChange,
  revealOn,
  height = "55vh",
  fontSize = 14,
  padding = { top: 16, bottom: 80 },
  lineNumbersMinChars,
  readOnly = false,
}: BaseFileEditorProps) {
  useEffect(() => {
    loader.init().then((monaco) => {
      registerDotenvLanguage(monaco);
    });
  }, []);

  const { maskedInitialValue, handleEditorMount } = useSecretMasking({
    value,
    onChange,
    revealOn,
  });

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
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    wordBasedSuggestions: "off" as const,
    parameterHints: { enabled: false },
    tabCompletion: "off" as const,
    snippetSuggestions: "none" as const,
    ...(lineNumbersMinChars && { lineNumbersMinChars }),
  };

  injectMaskingCSS();

  return (
    <Editor
      className="ph-no-capture"
      height={height}
      language="dotenv"
      theme="dotenvTheme"
      defaultValue={maskedInitialValue}
      options={editorOptions}
      loading={null}
      onMount={handleEditorMount}
    />
  );
}
