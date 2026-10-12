import type * as Monaco from "monaco-editor";

let registered = false;

export function registerDotenvLanguage(monaco: typeof Monaco): void {
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
        [/^\s*(?:export\s+)?[a-zA-Z_][a-zA-Z0-9_.-]*(?=\s*=)/, "variable"],
        [/=/, "delimiter"],
        [/"(?:[^"\\]|\\.)*"/, "string"],
        [/'(?:[^'\\]|\\.)*'/, "string"],
        [/./, ""],
      ],
    },
  });
}
