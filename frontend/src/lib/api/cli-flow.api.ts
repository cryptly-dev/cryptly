import axios from "axios";

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

export class CliFlowApi {
  public static async getSessionInfo(
    jwtToken: string,
    sessionId: string
  ): Promise<CliSessionInfo> {
    const response = await axios.get<CliSessionInfo>(
      `/auth/cli-flow/sessions/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${jwtToken}` },
      }
    );
    return response.data;
  }

  public static async approveSession(
    jwtToken: string,
    sessionId: string,
    body: ApproveCliSessionDto
  ): Promise<void> {
    await axios.post(`/auth/cli-flow/sessions/${sessionId}/approve`, body, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  }
}
