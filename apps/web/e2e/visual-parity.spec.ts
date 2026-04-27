/**
 * Cross-app screenshot parity: React (Vite) vs SvelteKit.
 *
 * Prerequisite: both dev servers running with aligned public env, especially
 * `VITE_ALLOW_LOCAL_LOGIN` / `PUBLIC_ALLOW_LOCAL_LOGIN` so login UI matches.
 *
 *   REACT_URL=http://127.0.0.1:5173 SVELTE_URL=http://127.0.0.1:9090 pnpm exec playwright test
 */
import { expect, test } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const REACT = process.env.REACT_URL ?? "http://127.0.0.1:5173";
const SVELTE = process.env.SVELTE_URL ?? "http://127.0.0.1:9090";
const PROJECT_ID =
  process.env.PARITY_PROJECT_ID ?? "69e4efc7ed94cab2c9b88c9b";
const REACT_STORAGE_STATE = process.env.PARITY_REACT_STORAGE_STATE;
const SVELTE_STORAGE_STATE = process.env.PARITY_SVELTE_STORAGE_STATE;

test.beforeAll(async ({ request }, testInfo) => {
  const check = async (url: string) => {
    try {
      const res = await request.get(url, { timeout: 5000 });
      return res.ok();
    } catch {
      return false;
    }
  };
  const reactUp = await check(REACT);
  const svelteUp = await check(SVELTE);
  if (!reactUp || !svelteUp) {
    testInfo.skip(
      true,
      `Parity tests need both dev servers (React: ${reactUp}, Svelte: ${svelteUp}). ` +
        `Start frontend on 5173 and apps/web on 9090, then re-run pnpm test:parity.`,
    );
  }
});

/**
 * Maximum allowed mismatch ratio (0–1). Sub-pixel / font rasterization prevents
 * literal 0% across two bundles; tighten these as pages converge.
 */
const THRESHOLDS: Record<string, number> = {
  /** Landing: live stats + motion; raster noise ~0.03% */
  "/": 0.0005,
  "/blog": 0.0005,
  "/blog/new": 0.0002,
  "/app/login": 0.005,
  "/invite/parity-invite": 0.0002,
};

function mismatchRatio(a: Buffer, b: Buffer): number {
  const imgA = PNG.sync.read(a);
  const imgB = PNG.sync.read(b);
  const w = imgA.width;
  const h = imgA.height;
  if (w !== imgB.width || h !== imgB.height) {
    return 1;
  }
  const diff = Buffer.alloc(w * h * 4);
  const diffPx = pixelmatch(imgA.data, imgB.data, diff, w, h, {
    threshold: 0.12,
  });
  return diffPx / (w * h);
}

for (const route of Object.keys(THRESHOLDS)) {
  test(`screenshot parity ${route}`, async ({ browser }) => {
    const threshold = THRESHOLDS[route]!;
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      colorScheme: "dark",
    });

    const pReact = await ctx.newPage();
    await pReact.goto(`${REACT}${route}`, { waitUntil: "load" });
    await pReact.waitForTimeout(1200);
    const shotReact = await pReact.screenshot({ fullPage: true });

    const pSvelte = await ctx.newPage();
    await pSvelte.goto(`${SVELTE}${route}`, { waitUntil: "load" });
    await pSvelte.waitForTimeout(1200);
    const shotSvelte = await pSvelte.screenshot({ fullPage: true });

    await ctx.close();

    const ratio = mismatchRatio(shotReact, shotSvelte);
    expect(
      ratio,
      `Pixel mismatch ${(ratio * 100).toFixed(2)}% (allowed ${(threshold * 100).toFixed(2)}%) for ${route}. Align env and styles, or lower threshold as parity improves.`,
    ).toBeLessThanOrEqual(threshold);
  });
}

test("authenticated history tab visual parity", async ({ browser }, testInfo) => {
  if (!REACT_STORAGE_STATE || !SVELTE_STORAGE_STATE) {
    testInfo.skip(
      true,
      "History parity needs authenticated storage states. Provide PARITY_REACT_STORAGE_STATE and PARITY_SVELTE_STORAGE_STATE.",
    );
  }

  const route = `/app/project/${PROJECT_ID}`;
  const reactContext = await browser.newContext({
    storageState: REACT_STORAGE_STATE,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });
  const svelteContext = await browser.newContext({
    storageState: SVELTE_STORAGE_STATE,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });

  const reactPage = await reactContext.newPage();
  await reactPage.goto(`${REACT}${route}`, { waitUntil: "load" });
  await reactPage.getByRole("button", { name: "History" }).click();
  await expect(reactPage.getByPlaceholder("Search edits — author, email, diff content…")).toBeVisible();
  await reactPage.waitForTimeout(1200);

  const sveltePage = await svelteContext.newPage();
  await sveltePage.goto(`${SVELTE}${route}`, { waitUntil: "load" });
  await sveltePage.getByRole("button", { name: "History" }).click();
  await expect(sveltePage.getByPlaceholder("Search edits — author, email, diff content…")).toBeVisible();
  await sveltePage.waitForTimeout(1200);

  const reactShot = await reactPage.locator("main").screenshot();
  const svelteShot = await sveltePage.locator("main").screenshot();

  await reactContext.close();
  await svelteContext.close();

  const ratio = mismatchRatio(reactShot, svelteShot);
  expect(
    ratio,
    `History tab pixel mismatch ${(ratio * 100).toFixed(2)}% for ${route}.`,
  ).toBeLessThanOrEqual(0.03);
});
