// Monaco is bundled with the app, never fetched from a CDN at runtime: it runs
// in the page that holds decrypted secrets and the unwrapped private key.
// Import this module lazily (`await import(...)`) so it stays out of the main chunk.
import "monaco-editor/esm/vs/editor/edcore.main.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = { getWorker: () => new EditorWorker() };

export default monaco;
