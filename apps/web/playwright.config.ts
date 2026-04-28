import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "pnpm start",
        url: process.env.SVELTE_URL ?? "http://127.0.0.1:9090",
        reuseExistingServer: true,
        timeout: 120_000,
      },
  use: {
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  },
});
