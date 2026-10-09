import { backend, bearer, unwrap, type Schemas } from "$lib/api/backend";

export type CliSessionInfo = Schemas["CliSessionInfoResponse"];
export type ApproveCliSessionDto = Schemas["ApproveCliSessionBody"];

export function getCliSessionInfo(jwtToken: string, sessionId: string) {
  return unwrap(
    backend.GET("/auth/cli-flow/sessions/{sessionId}", {
      params: { path: { sessionId } },
      headers: bearer(jwtToken),
    }),
    "Could not load session.",
  );
}

export function approveCliSession(
  jwtToken: string,
  sessionId: string,
  body: ApproveCliSessionDto,
) {
  return unwrap(
    backend.POST("/auth/cli-flow/sessions/{sessionId}/approve", {
      params: { path: { sessionId } },
      headers: bearer(jwtToken),
      body,
    }),
    "approve failed",
  );
}
