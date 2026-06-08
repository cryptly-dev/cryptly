import { publicEnv } from "$lib/shared/env/public-env";

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, "");

export interface DeviceItem {
  deviceId: string;
  deviceName?: string;
  lastActivityDate: string;
}

export class DeviceFlowApi {
  static async sendMessage(
    jwtToken: string,
    role: "requester" | "approver",
    message: unknown,
    targetDeviceId: string,
  ): Promise<void> {
    const url = new URL(`${baseUrl()}/auth/device-flow/send-message`);
    url.searchParams.set("role", role);
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceId: targetDeviceId, message }),
    });
    if (!res.ok) {
      throw new Error("Failed to send device-flow message");
    }
  }
}
