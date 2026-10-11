import type { RequestHandler } from "./$types";

// First-party proxy for Logdash web events. Fixed upstream URL, so it cannot act as an open proxy.
const UPSTREAM = "https://api.logdash.io/web_events";
const SITE_ID = "6acbf37df07d59985c0f7a20";
const MAX_BODY_BYTES = 32 * 1024;
const MAX_EVENTS = 20;

// Dynamic routes (see src/routes) whose IDs must not reach analytics.
const PATH_TEMPLATES: [RegExp, string][] = [
  [/^\/app\/project\/[^/]+/, "/app/project/:id"],
  [/^\/invite\/[^/]+/, "/invite/:id"],
];

function templatePath(path: string): string {
  for (const [pattern, template] of PATH_TEMPLATES) {
    if (pattern.test(path)) return path.replace(pattern, template);
  }
  return path;
}

function reply(status: number): Response {
  return new Response(null, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply(415);
  }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return reply(413);
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return reply(413);
  }

  let batch: { siteId?: unknown; events?: unknown };
  try {
    batch = JSON.parse(body);
  } catch {
    return reply(400);
  }
  if (typeof batch !== "object" || batch === null) return reply(400);
  if (batch.siteId !== SITE_ID) return reply(403);
  if (!Array.isArray(batch.events) || batch.events.length === 0) {
    return reply(400);
  }
  if (batch.events.length > MAX_EVENTS) return reply(413);

  for (const event of batch.events) {
    if (typeof event?.path === "string") event.path = templatePath(event.path);
  }

  // Only these headers go upstream: never cookies, authorization or any ingest key.
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-logdash-client-ip": getClientAddress(),
  };
  const origin = request.headers.get("origin");
  if (origin) headers.origin = origin;
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers["user-agent"] = userAgent;

  const upstream = await fetch(UPSTREAM, {
    method: "POST",
    headers,
    body: JSON.stringify(batch),
  }).catch(() => null);
  if (!upstream) return reply(502);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "text/plain",
      "cache-control": "no-store",
    },
  });
};
