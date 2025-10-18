import axios from "axios";

export interface Device {
  deviceId: string;
  deviceName?: string;
  lastActivityDate: string;
}

export class DeviceFlowApi {
  public static async ping(
    token: string,
    deviceId: string,
    deviceName?: string
  ): Promise<void> {
    await axios.post(
      "/auth/device-flow/ping",
      { deviceId, deviceName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  public static async getDevices(token: string): Promise<Device[]> {
    const response = await axios.get("/auth/device-flow/devices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.devices;
  }
}
