import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/auth-store.js", () => ({
  readAuthState: vi.fn(async () => ({
    userId: "user-1",
    refreshToken: "refresh-0",
    userPrivateKey: "private-key",
    createdAt: "2026-01-01T00:00:00.000Z",
  })),
  writeAuthState: vi.fn(async () => {}),
}));

const { createAuthedClient } = await import("../src/api/client.js");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createAuthedClient", () => {
  it("refreshes the JWT on 401 and replays the request with its body", async () => {
    const projectRequests: Array<{ auth: string | null; body: string }> = [];
    let refreshes = 0;
    vi.stubGlobal("fetch", async (request: Request) => {
      if (request.url.endsWith("/auth/refresh")) {
        refreshes += 1;
        return Response.json(
          { token: `jwt-${refreshes}`, refreshToken: `refresh-${refreshes}` },
          { status: 201 },
        );
      }
      const auth = request.headers.get("authorization");
      projectRequests.push({ auth, body: await request.text() });
      return Response.json({}, { status: auth === "Bearer jwt-1" ? 401 : 200 });
    });

    const client = await createAuthedClient();
    const { response } = await client.PATCH("/projects/{projectId}", {
      params: { path: { projectId: "project-1" } },
      body: { encryptedSecrets: "ciphertext" },
    });

    expect(response.status).toBe(200);
    expect(projectRequests).toEqual([
      { auth: "Bearer jwt-1", body: '{"encryptedSecrets":"ciphertext"}' },
      { auth: "Bearer jwt-2", body: '{"encryptedSecrets":"ciphertext"}' },
    ]);
  });
});
