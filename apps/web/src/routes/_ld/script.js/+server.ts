import type { RequestHandler } from "./$types";

// First-party proxy for the Logdash tracker, so it loads from our origin. Fixed upstream URL.
const UPSTREAM = "https://logdash.io/sdk/web.js";

export const GET: RequestHandler = async () => {
  // A fresh request: browser cookies and authorization headers never go upstream.
  const upstream = await fetch(UPSTREAM).catch(() => null);
  if (!upstream?.ok) {
    return new Response(null, {
      status: 502,
      headers: { "cache-control": "no-store" },
    });
  }
  return new Response(await upstream.text(), {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    },
  });
};
