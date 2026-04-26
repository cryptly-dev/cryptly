import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  shims: false,
  sourcemap: true,
  banner: { js: "#!/usr/bin/env node" },
  outExtension: () => ({ js: ".js" }),
});
