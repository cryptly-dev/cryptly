import axios from "axios";
import { defaultApiUrl } from "../config/paths.js";

export type CliSessionStatus = "pending" | "approved" | "consumed";

export interface StartSessionResult {
  sessionId: string;
  approveUrl: string;
  expiresAt: number;
}

export interface PollResult {
  status: CliSessionStatus;
  jwt?: string;
  refreshToken?: string;
  wrappedKey?: string;
  encryptedPrivateKey?: string;
  userId?: string;
}

export class CliFlowApi {
  public static async startSession(params: {
    tempPublicKey: string;
    deviceName: string;
  }): Promise<StartSessionResult> {
    const response = await axios.post<StartSessionResult>(
      `${defaultApiUrl()}/auth/cli-flow/sessions`,
      params,
      { timeout: 30_000 },
    );
    return response.data;
  }

  public static async poll(sessionId: string): Promise<PollResult> {
    const response = await axios.get<PollResult>(
      `${defaultApiUrl()}/auth/cli-flow/sessions/${sessionId}/poll`,
      { timeout: 30_000 },
    );
    return response.data;
  }
}
