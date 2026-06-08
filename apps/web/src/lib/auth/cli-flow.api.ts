import { publicEnv } from "$lib/shared/env/public-env";

export type CliSessionStatus = "pending" | "approved" | "consumed";

export interface CliSessionInfo {
  sessionId: string;
  deviceName: string;
  status: CliSessionStatus;
  expiresAt: number;
  tempPublicKey: string;
}

export interface ApproveCliSessionDto {
  wrappedKey: string;
  encryptedPrivateKey: string;
}

export class CliFlowRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "CliFlowRequestError";
  }
}

function apiBase(): string {
  return publicEnv.apiUrl.replace(/\/$/, "");
}

export async function getCliSessionInfo(
  jwtToken: string,
  sessionId: string,
): Promise<CliSessionInfo> {
  const res = await fetch(
    `${apiBase()}/auth/cli-flow/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${jwtToken}` } },
  );
  if (res.status === 404) {
    throw new CliFlowRequestError("not found", 404);
  }
  if (!res.ok) {
    throw new CliFlowRequestError("failed", res.status);
  }
  return (await res.json()) as CliSessionInfo;
}

export async function approveCliSession(
  jwtToken: string,
  sessionId: string,
  body: ApproveCliSessionDto,
): Promise<void> {
  const res = await fetch(
    `${apiBase()}/auth/cli-flow/sessions/${encodeURIComponent(sessionId)}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new CliFlowRequestError("approve failed", res.status);
  }
}
