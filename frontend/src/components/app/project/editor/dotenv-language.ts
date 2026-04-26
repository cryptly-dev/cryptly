let registered = false;

export function registerDotenvLanguage(monaco: any): void {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: "dotenv" });

  // Single-state grammar: every line tokenizes independently, with no
  // cross-line state. This avoids the classic Monarch footgun where a
  // stuck `value` / string state silently kills syntax highlighting for
  // every subsequent line the moment a quote appears.
  monaco.languages.setMonarchTokensProvider("dotenv", {
    tokenizer: {
      root: [
        [/#.*$/, "comment"],
        [/^[a-zA-Z_][a-zA-Z0-9_.]*(?=\s*=)/, "variable"],
        [/=/, "delimiter"],
        [/"(?:[^"\\]|\\.)*"/, "string"],
        [/'(?:[^'\\]|\\.)*'/, "string"],
        [/./, ""],
      ],
    },
  });

  monaco.editor.defineTheme("dotenvTheme", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "variable", foreground: "509DDA" },
      { token: "delimiter", foreground: "CCCCCC" },
      { token: "identifier", foreground: "CCCCCC" },
      { token: "string", foreground: "CCCCCC" },
      { token: "string.escape", foreground: "D7BA7D" },
      { token: "comment", foreground: "545C66", fontStyle: "italic" },
    ],
    colors: {
      "editor.foreground": "#CCCCCC",
      "editor.background": "#000000",
      "editor.lineHighlightBackground": "#0a0a0a",
      focusBorder: "#00000000",
    },
  });
}
