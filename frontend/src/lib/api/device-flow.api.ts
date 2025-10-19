import axios from "axios";

export interface Device {
  deviceId: string;
  deviceName?: string;
  lastActivityDate: string;
}

export class DeviceFlowApi {
  public static async sendMessage(
    token: string,
    role: "requester" | "approver",
    message: any,
    targetDeviceId: string
  ): Promise<void> {
    await axios.post(
      "/auth/device-flow/send-message",
      { deviceId: targetDeviceId, message },
      {
        params: { role },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}
