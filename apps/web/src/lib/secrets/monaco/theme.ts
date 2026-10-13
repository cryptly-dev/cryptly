import type * as Monaco from "monaco-editor";

/** A design token (lib/appearance/theme.css) as the hex colour Monaco expects. */
function token(name: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  // Anything else (short hex, rgb(), oklch()) goes through canvas, which normalises to hex.
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#808080";
  ctx.fillStyle = raw;
  return ctx.fillStyle;
}

/**
 * Defines and applies the editor theme from the current tokens. Monaco has one global theme,
 * so call this on mount and again whenever the app theme or grey preset changes.
 */
export function applyEditorTheme(monaco: typeof Monaco, dark: boolean) {
  const name = dark ? "cryptly-dark" : "cryptly-light";
  const fg = (n: string) => token(n).slice(1);
  const clear = "#00000000";
  monaco.editor.defineTheme(name, {
    base: dark ? "vs-dark" : "vs",
    inherit: true,
    rules: [
      { token: "", foreground: fg("fg2") },
      { token: "variable", foreground: fg("fg") },
      { token: "delimiter", foreground: fg("faint") },
      { token: "string", foreground: fg("fg2") },
      { token: "comment", foreground: fg("fg3") },
    ],
    colors: {
      "editor.background": token("s100"),
      "editor.foreground": token("fg2"),
      "editorGutter.background": token("s100"),
      "editorLineNumber.foreground": token("faint"),
      "editorLineNumber.activeForeground": token("fg3"),
      "editorCursor.foreground": token("fg"),
      "editor.selectionBackground": token("s100-sel"),
      "editor.inactiveSelectionBackground": token("s100-hover"),
      "editor.lineHighlightBackground": clear,
      "editor.lineHighlightBorder": clear,
      "editorWidget.background": token("elev"),
      "editorWidget.border": token("elev-border"),
      "input.background": token("field"),
      "input.border": token("field-border"),
      focusBorder: clear,
      "scrollbar.shadow": clear,
      "scrollbarSlider.background": `${token("fg3")}33`,
      "scrollbarSlider.hoverBackground": `${token("fg3")}55`,
      "scrollbarSlider.activeBackground": `${token("fg3")}77`,
    },
  });
  monaco.editor.setTheme(name);
}
