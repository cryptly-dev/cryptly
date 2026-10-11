import { expect, test } from "@playwright/test";

// Requests the /_ld proxy must reject before anything reaches Logdash.
const APP = process.env.SVELTE_URL ?? "http://127.0.0.1:9090";
const EVENTS = `${APP}/_ld/events`;
const SITE_ID = "6acbf37df07d59985c0f7a20";

const event = { name: "pageview", path: "/" };
const json = { "content-type": "application/json" };

test("serves the tracker script as JavaScript", async ({ request }) => {
  const res = await request.get(`${APP}/_ld/script.js`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/javascript");
  expect(res.headers()["cache-control"]).toContain("public");
});

test("rejects non-JSON bodies", async ({ request }) => {
  const res = await request.post(EVENTS, {
    headers: { "content-type": "text/plain" },
    data: JSON.stringify({ siteId: SITE_ID, events: [event] }),
  });
  expect(res.status()).toBe(415);
});

test("rejects bodies over 32 KB", async ({ request }) => {
  const res = await request.post(EVENTS, {
    headers: json,
    data: JSON.stringify({
      siteId: SITE_ID,
      events: [{ ...event, pad: "x".repeat(33 * 1024) }],
    }),
  });
  expect(res.status()).toBe(413);
});

test("rejects batches over 20 events", async ({ request }) => {
  const res = await request.post(EVENTS, {
    headers: json,
    data: JSON.stringify({
      siteId: SITE_ID,
      events: Array.from({ length: 21 }, () => event),
    }),
  });
  expect(res.status()).toBe(413);
});

test("rejects other site IDs", async ({ request }) => {
  const res = await request.post(EVENTS, {
    headers: json,
    data: JSON.stringify({ siteId: "0".repeat(24), events: [event] }),
  });
  expect(res.status()).toBe(403);
});

test("rejects malformed JSON and empty batches", async ({ request }) => {
  const malformed = await request.post(EVENTS, { headers: json, data: "{" });
  expect(malformed.status()).toBe(400);
  const empty = await request.post(EVENTS, {
    headers: json,
    data: JSON.stringify({ siteId: SITE_ID, events: [] }),
  });
  expect(empty.status()).toBe(400);
  expect(empty.headers()["cache-control"]).toBe("no-store");
});
