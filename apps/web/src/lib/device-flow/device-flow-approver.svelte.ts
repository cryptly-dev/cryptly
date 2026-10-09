import { EventSource } from "eventsource";
import { publicEnv } from "$lib/shared/env/public-env";
import { auth } from "$lib/stores/auth.svelte";
import { keyAuth } from "$lib/stores/key.svelte";
import { getDeviceId, getDeviceName } from "$lib/utils";
import { DeviceFlowApi } from "./device-flow.api";

let connection: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let subscriberDepth = 0;

export const deviceFlowApprover = $state({
  lastMessage: null as Record<string, unknown> | null,
});

function closeConnection() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  connection?.close();
  connection = null;
}

function openStream() {
  const jwt = auth.jwtToken;
  if (!jwt || !keyAuth.hasMasterKey || connection) return;

  const deviceId = getDeviceId();
  const apiBase = publicEnv.apiUrl.replace(/\/$/, "");
  const url = `${apiBase}/auth/device-flow/messages?role=approver&deviceId=${encodeURIComponent(
    deviceId,
  )}&deviceName=${encodeURIComponent(getDeviceName())}`;

  const es = new EventSource(url, {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${jwt}`,
        },
      }),
  });

  es.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data as string) as Record<
        string,
        unknown
      >;
      if (message.type === "request") {
        deviceFlowApprover.lastMessage = message;
      }
    } catch {
      // ignore
    }
  };

  es.onerror = () => {
    es.close();
    connection = null;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (subscriberDepth > 0 && auth.jwtToken && keyAuth.hasMasterKey) {
        openStream();
      }
    }, 3000);
  };

  connection = es;
}

export function subscribeApproverStream(): () => void {
  subscriberDepth++;
  closeConnection();
  openStream();
  return () => {
    subscriberDepth = Math.max(0, subscriberDepth - 1);
    if (subscriberDepth === 0) {
      closeConnection();
      deviceFlowApprover.lastMessage = null;
    }
  };
}

export function clearApproverMessage() {
  deviceFlowApprover.lastMessage = null;
}

export async function sendApproverResponse(
  targetDeviceId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const jwt = auth.jwtToken;
  if (!jwt) return;
  await DeviceFlowApi.sendMessage(jwt, "approver", payload, targetDeviceId);
}
