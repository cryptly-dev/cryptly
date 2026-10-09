import { backend, bearer, unwrap } from "$lib/api/backend";

export interface DeviceItem {
  deviceId: string;
  deviceName?: string;
  lastActivityDate: string;
}

export class DeviceFlowApi {
  static sendMessage(
    jwtToken: string,
    role: "requester" | "approver",
    message: Record<string, unknown>,
    targetDeviceId: string,
  ) {
    return unwrap(
      backend.POST("/auth/device-flow/send-message", {
        params: { query: { role } },
        headers: bearer(jwtToken),
        body: { deviceId: targetDeviceId, message },
      }),
      "Failed to send device-flow message",
    );
  }
}
